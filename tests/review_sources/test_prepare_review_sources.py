import base64
import hashlib
import http.server
import importlib.util
import io
from pathlib import Path
import re
import shutil
import ssl
import subprocess
import tempfile
import threading
import unittest
from unittest.mock import patch, Mock, MagicMock
from urllib.request import Request

spec = importlib.util.spec_from_file_location('sources', Path(__file__).parents[2] / 'scripts/prepare_review_sources.py')
s = importlib.util.module_from_spec(spec)
spec.loader.exec_module(s)


class SourceSafety(unittest.TestCase):
    def test_rejects_unapproved_and_credential_urls(self):
        for url in ['http://murphysys.com/a.pdf', 'https://murphysys.com.evil/a',
                    'https://evil@murphysys.com/a', 'https://murphysys.com:443/a',
                    'https://127.0.0.1/a', 'https://murphysys.com/a#fragment']:
            with self.subTest(url=url), self.assertRaises(ValueError):
                s.validate_url(url, s.SOURCE_HOSTS)

    def test_redirects_cannot_escape_source_hosts_or_redirect_api_token(self):
        request = Request('https://murphysys.com/a')
        with self.assertRaises(ValueError):
            s.Redirects(s.SOURCE_HOSTS).redirect_request(request, None, 302, '', {}, 'https://evil.test/a')
        with self.assertRaises(ValueError):
            s.Redirects({'api.github.com'}, False).redirect_request(request, None, 302, '', {}, 'https://api.github.com/b')

    def test_enforces_declared_and_actual_byte_limits(self):
        for response in [Mock(headers={'Content-Length': str(s.MAX_BYTES + 1)}),
                         Mock(headers={}, read=Mock(return_value=b'x' * (s.MAX_BYTES + 1)))]:
            with self.assertRaises(ValueError):
                s.read_limited(response)

    def test_api_token_never_sent_to_source_and_api_does_not_redirect(self):
        opener = MagicMock()
        response = Mock(url='https://murphysys.com/a', headers={'Content-Type': 'text/plain'})
        response.read.return_value = b'public source'
        opener.open.return_value.__enter__.return_value = response
        with patch.object(s, 'build_opener', return_value=opener):
            s.fetch('https://murphysys.com/a')
            self.assertNotIn('Authorization', opener.open.call_args.args[0].headers)
            with self.assertRaises(ValueError):
                s.fetch('https://murphysys.com/a', token='secret')
            response.url = 'https://api.github.com/repos/o/r'
            s.fetch(response.url, token='secret')
            self.assertEqual(opener.open.call_args.args[0].headers['Authorization'], 'Bearer secret')

    def test_html_omits_active_content(self):
        text = s.source_text(b'<h1>Source</h1><script>bad()</script><style>bad</style><p>Text</p>', 'text/html')
        self.assertIn('Source', text)
        self.assertIn('Text', text)
        self.assertNotIn('bad', text)

    def test_pdf_failure_is_explicit_and_parser_never_uses_shell(self):
        with patch.object(s.subprocess, 'run', return_value=Mock(returncode=1)) as run:
            with self.assertRaisesRegex(ValueError, 'extraction failed'):
                s.pdf_pages('/tmp/none.pdf', 1, 2)
            self.assertEqual(run.call_args.args[0][:6], ['pdftotext', '-layout', '-f', '1', '-l', '2'])
            self.assertNotIn('shell', run.call_args.kwargs)
            self.assertEqual(run.call_args.kwargs['timeout'], s.PDF_TIMEOUT)
            self.assertEqual(set(run.call_args.kwargs['env']), {'PATH', 'LANG'})
            self.assertNotIn('GITHUB_TOKEN', run.call_args.kwargs['env'])
            self.assertEqual(run.call_args.kwargs['stderr'], s.subprocess.DEVNULL)

    def test_head_change_fails_closed(self):
        with patch.object(s, 'api_json', return_value={'head': {'sha': 'b' * 40}}):
            with self.assertRaisesRegex(ValueError, 'head changed'):
                s.collect('owner/repo', 1, 'a' * 40, 'token')

    def test_full_module_and_source_failures_are_preserved_as_data(self):
        head = 'a' * 40
        content = 'Entire module\nhttps://murphysys.com/a.pdf'
        calls = [
            {'head': {'sha': head}},
            [{'filename': 'src/pages/manual/module.astro', 'status': 'modified'}],
            {'encoding': 'base64', 'size': len(content), 'content': base64.b64encode(content.encode()).decode()},
            {'head': {'sha': head}},
        ]
        with patch.object(s, 'api_json', side_effect=calls), patch.object(s, 'fetch_source', side_effect=OSError('not readable')):
            text = s.collect('owner/repo', 1, head, 'token')
        self.assertIn(content, text)
        self.assertIn('SOURCE RETRIEVAL FAILURE', text)
        self.assertIn('UNTRUSTED DATA', text)

    def test_head_change_after_retrieval_fails_closed(self):
        calls = [{'head': {'sha': 'a' * 40}}, [], {'head': {'sha': 'b' * 40}}]
        with patch.object(s, 'api_json', side_effect=calls):
            with self.assertRaisesRegex(ValueError, 'head changed during'):
                s.collect('owner/repo', 1, 'a' * 40, 'token')

    def test_dispatch_resolves_head_without_expected_sha(self):
        calls = [{'head': {'sha': 'a' * 40}}, [], {'head': {'sha': 'a' * 40}}]
        with patch.object(s, 'api_json', side_effect=calls):
            text = s.collect('owner/repo', 1, '', 'token')
        self.assertIn('a' * 40, text)

    def test_relevant_file_limit_rejects_before_fetching_contents(self):
        entries = [{'filename': f'src/pages/{n}.astro', 'status': 'modified'}
                   for n in range(s.MAX_FILES + 1)]
        with patch.object(s, 'api_json', side_effect=[{'head': {'sha': 'a' * 40}}, entries]) as api:
            with self.assertRaisesRegex(ValueError, 'Too many relevant files'):
                s.collect('owner/repo', 1, 'a' * 40, 'token')
        self.assertEqual(api.call_count, 2)

    def test_each_file_has_its_own_budget(self):
        head = 'a' * 40
        big, small = 'x' * (s.MAX_FILE_CHARS + 1), 'second page survives'
        calls = [{'head': {'sha': head}},
                 [{'filename': f'src/pages/{n}.astro', 'status': 'modified'} for n in range(2)],
                 contents(big), contents(small), {'head': {'sha': head}}]
        with patch.object(s, 'api_json', side_effect=calls):
            text = s.collect('owner/repo', 1, head, 'token')
        self.assertIn(f'cut at {s.MAX_FILE_CHARS:,} of {s.MAX_FILE_CHARS + 1:,} characters · PR FILE DATA: src/pages/0.astro', text)
        self.assertIn('complete · PR FILE DATA: src/pages/1.astro', text)
        self.assertIn(small, text)

    def test_section_content_files_are_read_and_page_styles_are_dropped(self):
        head = 'a' * 40
        page = '<h1>Claim in markup</h1><style>.a { color: red; }</style><script>const key = "B";</script>'
        calls = [{'head': {'sha': head}},
                 [{'filename': 'docs/reviews/m.md', 'status': 'added'},
                  {'filename': 'content/bfm/01-lead.md', 'status': 'added'},
                  {'filename': 'content/bfm/style.css', 'status': 'added'},
                  {'filename': 'src/pages/m.astro', 'status': 'added'}],
                 contents(page), contents('Section prose'), contents('Evidence'), {'head': {'sha': head}}]
        with patch.object(s, 'api_json', side_effect=calls) as api:
            text = s.collect('owner/repo', 1, head, 'token')
        order = [call.args[1].split('?')[0] for call in api.call_args_list[2:5]]
        self.assertEqual(order, ['contents/src/pages/m.astro', 'contents/content/bfm/01-lead.md', 'contents/docs/reviews/m.md'])
        self.assertIn('Section prose', text)
        self.assertIn('Claim in markup', text)
        self.assertIn('const key = "B"', text)
        self.assertNotIn('color: red', text)
        self.assertIn('style block omitted', text)

    def test_duplicate_source_body_is_not_repeated_and_later_source_survives(self):
        head = 'a' * 40
        content = ('https://murphysys.com/a.html https://cnatra.navy.mil/a.html '
                   'https://navyaviation.tpub.com/general.html')
        calls = [{'head': {'sha': head}},
                 [{'filename': 'src/pages/module.astro', 'status': 'modified'}],
                 contents(content), {'head': {'sha': head}}]
        bodies = iter([b'unique primary body', b'unique primary body', b'later general source'])

        def download(url, directory):
            body = next(bodies)
            path = Path(directory) / hashlib.sha256(url.encode()).hexdigest()
            path.write_bytes(body)
            return path, hashlib.sha256(body).hexdigest(), len(body), 'text/plain', url
        with patch.object(s, 'api_json', side_effect=calls), patch.object(s, 'fetch_source', side_effect=download):
            text = s.collect('owner/repo', 1, head, 'token')
        self.assertEqual(text.count('unique primary body'), 1)
        self.assertIn('Duplicate body', text)
        self.assertIn('later general source', text)

    def review_comment(self, head):
        return {'user': {'login': 'github-actions[bot]'},
                'body': f'# Oversweep Aviation SME advisory review\n\n**Reviewed head:** `{head}`\n- **B1** · Medium · `src/pages/a.astro` · x'}

    def test_previous_review_includes_changes_since_its_head(self):
        old, new = 'a' * 40, 'b' * 40
        compare = {'status': 'ahead', 'files': [
            {'filename': 'src/pages/a.astro', 'status': 'modified', 'patch': '@@ -1 +1 @@\n-old\n+new'},
            {'filename': 'tests/a.test.mjs', 'status': 'modified', 'patch': 'secret test diff'}]}
        with patch.object(s, 'api_json', side_effect=[[self.review_comment(old)], compare]) as api:
            text = s.previous_review('owner/repo', 1, new, 'token')
        self.assertEqual(api.call_args.args[1], f'compare/{old}...{new}')
        self.assertIn('PREVIOUS SME REVIEW', text)
        self.assertIn('**B1**', text)
        self.assertIn('+new', text)
        self.assertNotIn('secret test diff', text)

    def test_previous_review_ignores_other_authors_and_handles_rewrites(self):
        forged = {'user': {'login': 'someone'}, 'body': self.review_comment('a' * 40)['body']}
        with patch.object(s, 'api_json', side_effect=[[forged]]):
            self.assertEqual(s.previous_review('owner/repo', 1, 'b' * 40, 'token'), '')
        with patch.object(s, 'api_json', side_effect=[[self.review_comment('a' * 40)], {'status': 'diverged'}]):
            self.assertIn('History was rewritten', s.previous_review('owner/repo', 1, 'b' * 40, 'token'))
        missing = OSError('HTTP Error 404: Not Found')
        with patch.object(s, 'api_json', side_effect=[[self.review_comment('a' * 40)], missing]):
            self.assertIn('could not be compared', s.previous_review('owner/repo', 1, 'b' * 40, 'token'))
        with patch.object(s, 'api_json', side_effect=[[self.review_comment('b' * 40)]]):
            self.assertIn('exact head', s.previous_review('owner/repo', 1, 'b' * 40, 'token'))

    def test_output_limit_reports_incomplete_content(self):
        records = [(f'PR FILE DATA: {n}', 'x' * s.MAX_FILE_CHARS, s.MAX_FILE_CHARS) for n in range(8)]
        text = s.render(records, 'a' * 40)
        self.assertLessEqual(len(text), s.MAX_OUTPUT)
        self.assertIn('omitted: packet budget exhausted · PR FILE DATA: 7', text)
        self.assertIn('complete · PR FILE DATA: 0', text)
        self.assertLess(text.index('## SOURCE COVERAGE'), text.index('## PR FILE DATA: 0'))

    def test_coverage_lists_failures_with_their_reason(self):
        text = s.render([('SOURCE RETRIEVAL FAILURE: https://www.cnatra.navy.mil/a.pdf', 'SSLCertVerificationError: x', None),
                         ('PR FILE DATA: a', 'fine', s.MAX_FILE_CHARS)], 'a' * 40)
        self.assertIn('1 of 2 records are cut, failed or omitted.', text)
        self.assertIn('- failed · SOURCE RETRIEVAL FAILURE: https://www.cnatra.navy.mil/a.pdf · SSLCertVerificationError: x', text)
        self.assertIn('All 1 records are complete.', s.render([('PR FILE DATA: a', 'fine', 10)], 'a' * 40))


def contents(text):
    return {'encoding': 'base64', 'size': len(text), 'content': base64.b64encode(text.encode()).decode()}


def make_pdf(pages):
    """A minimal text PDF with one line per page, for Poppler-backed tests."""
    objects = ['<< /Type /Catalog /Pages 2 0 R >>', None, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>']
    kids = []
    for text in pages:
        stream = f'BT /F1 12 Tf 72 720 Td ({text}) Tj ET'
        objects.append(f'<< /Length {len(stream)} >>\nstream\n{stream}\nendstream')
        objects.append(f'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] '
                       f'/Resources << /Font << /F1 3 0 R >> >> /Contents {len(objects)} 0 R >>')
        kids.append(f'{len(objects)} 0 R')
    objects[1] = f'<< /Type /Pages /Kids [{" ".join(kids)}] /Count {len(kids)} >>'
    out, offsets = io.BytesIO(), []
    out.write(b'%PDF-1.4\n')
    for number, body in enumerate(objects, 1):
        offsets.append(out.tell())
        out.write(f'{number} 0 obj\n{body}\nendobj\n'.encode())
    xref = out.tell()
    out.write(f'xref\n0 {len(objects) + 1}\n0000000000 65535 f \n'.encode())
    out.write(''.join(f'{o:010d} 00000 n \n' for o in offsets).encode())
    out.write(f'trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\nstartxref\n{xref}\n%%EOF\n'.encode())
    return out.getvalue()


DOD_ROOT_SHA256 = {
    'DoD Root CA 3': 'b107b33f453e5510f68e513110c6f6944bacc263df0137f821c1b3c2f8f863d2',
    'DoD Root CA 4': '559a5189452b13f8233f0022363c06f26e3c517c1d4b77445035959df3244f74',
    'DoD Root CA 5': '1f4ede9dc2a241f6521bf518424acd49ebe84420e69daf5bac57af1f8ee294a9',
}


class DodTrust(unittest.TestCase):
    def test_embedded_roots_are_the_pinned_dod_roots(self):
        pems = re.findall(r'-----BEGIN CERTIFICATE-----.*?-----END CERTIFICATE-----', s.DOD_ROOT_CAS, re.S)
        digests = sorted(hashlib.sha256(ssl.PEM_cert_to_DER_cert(pem)).hexdigest() for pem in pems)
        self.assertEqual(digests, sorted(DOD_ROOT_SHA256.values()))

    def test_source_context_adds_dod_roots_and_keeps_verification(self):
        context = s.source_context()
        self.assertEqual(context.verify_mode, ssl.CERT_REQUIRED)
        self.assertTrue(context.check_hostname)
        names = {value for cert in context.get_ca_certs() for rdn in cert['subject'] for key, value in rdn if key == 'commonName'}
        self.assertTrue(set(DOD_ROOT_SHA256) <= names)

    def test_sources_use_the_dod_context_and_the_api_does_not(self):
        opener = MagicMock()
        response = Mock(url='https://www.cnatra.navy.mil/a.pdf', headers={'Content-Type': 'application/pdf'})
        response.read.side_effect = [b'%PDF-1.4 body', b'']
        opener.open.return_value.__enter__.return_value = response
        with tempfile.TemporaryDirectory() as directory, \
                patch.object(s, 'build_opener', return_value=opener) as build:
            s.fetch_source('https://www.cnatra.navy.mil/a.pdf', directory)
            handlers = build.call_args.args
            https = [h for h in handlers if isinstance(h, s.HTTPSHandler)]
            self.assertEqual(len(https), 1)
            self.assertEqual(https[0]._context.verify_mode, ssl.CERT_REQUIRED)
            self.assertNotIn('Authorization', opener.open.call_args.args[0].headers)
            response.url = 'https://api.github.com/repos/o/r'
            response.read.side_effect = None
            response.read.return_value = b'{}'
            s.fetch(response.url, token='secret')
            self.assertFalse(any(isinstance(h, s.HTTPSHandler) for h in build.call_args.args))

    @unittest.skipUnless(shutil.which('openssl'), 'openssl CLI needed to make a test certificate')
    def test_untrusted_certificate_is_rejected_by_the_source_context(self):
        with tempfile.TemporaryDirectory() as directory:
            key, cert = Path(directory) / 'key.pem', Path(directory) / 'cert.pem'
            subprocess.run(['openssl', 'req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-days', '1',
                            '-subj', '/CN=localhost', '-addext', 'subjectAltName=DNS:localhost',
                            '-keyout', str(key), '-out', str(cert)], check=True, capture_output=True)
            server = http.server.HTTPServer(('localhost', 0), http.server.BaseHTTPRequestHandler)
            tls = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
            tls.load_cert_chain(cert, key)
            server.socket = tls.wrap_socket(server.socket, server_side=True)
            thread = threading.Thread(target=server.handle_request, daemon=True)
            thread.start()
            try:
                import socket
                with socket.create_connection(('localhost', server.server_port), timeout=5) as raw:
                    with self.assertRaises(ssl.SSLCertVerificationError):
                        s.source_context().wrap_socket(raw, server_hostname='localhost')
            finally:
                server.server_close()


class Downloads(unittest.TestCase):
    def response(self, body, headers=None):
        stream = io.BytesIO(body)
        return Mock(headers=headers or {}, read=lambda n: stream.read(n))

    def test_pdfs_may_exceed_the_in_memory_limit_but_stay_bounded(self):
        body = b'%PDF-1.4\n' + b'x' * (s.MAX_BYTES + 10)
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'a'
            digest, size = s.read_to_file(self.response(body), path)
            self.assertEqual((digest, size), (hashlib.sha256(body).hexdigest(), len(body)))
            self.assertEqual(path.stat().st_size, len(body))
            with self.assertRaisesRegex(ValueError, 'byte limit'):
                s.read_to_file(self.response(b'<html>' + b'x' * s.MAX_BYTES), path)
            with self.assertRaisesRegex(ValueError, 'byte limit'):
                s.read_to_file(self.response(b'', {'Content-Length': str(s.MAX_PDF_BYTES + 1)}), path)
            with patch.object(s, 'MAX_PDF_BYTES', 20), self.assertRaisesRegex(ValueError, 'byte limit'):
                s.read_to_file(self.response(b'%PDF-' + b'x' * 30), path)

    def test_download_time_is_bounded(self):
        ticks = iter([0, s.DOWNLOAD_SECONDS + 1])
        with tempfile.TemporaryDirectory() as directory, self.assertRaisesRegex(ValueError, 'longer than'):
            s.read_to_file(self.response(b'%PDF-1.4'), Path(directory) / 'a', clock=lambda: next(ticks))


class CitedPages(unittest.TestCase):
    URL = 'https://www.cnatra.navy.mil/local/docs/pat-pubs/P-1289.pdf'

    def test_declarations_parse_pages_labels_and_hash(self):
        text = f"""Intro

```review-sources
source: {self.URL}
sha256: {'A' * 64}
pages: 52-59 (4-1 to 4-8); 60-83 (5-1 to 5-24), 90
source: https://evil.test/a.pdf
pages: 1
```
"""
        sources, errors = s.parse_declarations('docs/reviews/bfm.md', text)
        self.assertEqual(sources, [{'url': self.URL, 'sha256': 'a' * 64, 'file': 'docs/reviews/bfm.md',
                                    'ranges': [(52, 59, '4-1 to 4-8'), (60, 83, '5-1 to 5-24'), (90, 90, '')]}])
        self.assertTrue(any('evil.test' in e for e in errors))
        self.assertTrue(any('no valid source line' in e for e in errors))
        _, errors = s.parse_declarations('a.md', f'```review-sources\nsource: {self.URL}\npages: 9-3; x\n```\n')
        self.assertEqual(len(errors), 2)

    def test_long_ranges_are_split_into_bounded_records(self):
        chunks = list(s.page_chunks([(60, 83, '5-1 to 5-24')]))
        self.assertEqual([(a, b) for *_, a, b in chunks], [(60, 69), (70, 79), (80, 83)])

    def write(self, directory, pages):
        body = make_pdf(pages)
        path = Path(directory) / 'source'
        path.write_bytes(body)
        return path, hashlib.sha256(body).hexdigest(), len(body), 'application/pdf', self.URL

    def declaration(self, ranges, sha256=None):
        return {'url': self.URL, 'sha256': sha256, 'ranges': ranges, 'files': ['docs/reviews/bfm.md']}

    @unittest.skipUnless(shutil.which('pdftotext') and shutil.which('pdfinfo'), 'Poppler needed')
    def test_only_cited_pages_are_extracted_and_labelled(self):
        with tempfile.TemporaryDirectory() as directory:
            download = self.write(directory, [f'Body of physical page {n}' for n in range(1, 31)])
            records = s.source_records(self.URL, self.declaration([(4, 5, '4-4 to 4-5'), (12, 25, '5-3 to 5-16')]),
                                       download, {})
        text = s.render(records, 'a' * 40)
        self.assertEqual(len(records), 3)
        for n in [4, 5, 12, 21, 22, 25]:
            self.assertIn(f'[PDF physical page {n}]\nBody of physical page {n}', text)
        for n in [1, 3, 6, 11, 26]:
            self.assertNotIn(f'Body of physical page {n}\n', text)
        self.assertIn('Cited range: physical pages 12-25 (declared printed pages 5-3 to 5-16)', text)
        self.assertIn('physical pages 22-25', text)
        self.assertIn('PDF pages: 30', text)

    @unittest.skipUnless(shutil.which('pdftotext') and shutil.which('pdfinfo'), 'Poppler needed')
    def test_bad_ranges_hashes_and_page_limits_are_reported(self):
        with tempfile.TemporaryDirectory() as directory:
            download = self.write(directory, [f'Page {n}' for n in range(1, 4)])
            past = s.source_records(self.URL, self.declaration([(2, 9, '')]), download, {})
            self.assertTrue(past[0][0].startswith('SOURCE PAGES NOT EXTRACTED'))
            self.assertIn('past its end', past[0][1])
            mismatch = s.source_records(self.URL, self.declaration([(1, 1, '')], 'f' * 64), download, {})
            self.assertEqual(len(mismatch), 1)
            self.assertIn('SHA-256 mismatch', mismatch[0][1])
            ok = s.source_records(self.URL, self.declaration([(1, 1, '')], download[1]), download, {})
            self.assertIn('Page 1', ok[0][1])
            with patch.object(s, 'MAX_CITED_PAGES', 1):
                limited = s.source_records(self.URL, self.declaration([(1, 1, ''), (2, 3, '')]), download, {})
            self.assertIn('Page 1', limited[0][1])
            self.assertIn('page limit', limited[1][1])
            undeclared = s.source_records(self.URL, None, download, {})
            self.assertIn('No cited pages declared', undeclared[0][1])

    def test_declared_sources_are_fetched_first_with_their_pages(self):
        head = 'a' * 40
        page = 'Background https://faa.gov/other.html'
        evidence = f'```review-sources\nsource: {self.URL}\npages: 52-53 (4-4 to 4-5)\n```\n'
        calls = [{'head': {'sha': head}},
                 [{'filename': 'src/pages/bfm.astro', 'status': 'added'},
                  {'filename': 'docs/reviews/bfm.md', 'status': 'added'}],
                 contents(page), contents(evidence), {'head': {'sha': head}}]
        seen = []

        def records(url, declaration, download, _):
            seen.append((url, declaration and declaration['ranges']))
            return [(f'RETRIEVED SOURCE DATA: {url}', 'text', s.MAX_SOURCE_CHARS)]
        with patch.object(s, 'api_json', side_effect=calls), patch.object(s, 'fetch_source', return_value=None), \
                patch.object(s, 'source_records', side_effect=records):
            s.collect('owner/repo', 1, head, 'token')
        self.assertEqual(seen, [(self.URL, [(52, 53, '4-4 to 4-5')]), ('https://faa.gov/other.html', None)])

if __name__ == '__main__':
    unittest.main()
