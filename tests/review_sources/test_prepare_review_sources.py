import base64
import importlib.util
from pathlib import Path
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
                s.source_text(b'%PDF-1.0 broken', 'application/pdf')
            self.assertEqual(run.call_args.args[0][0], 'pdftotext')
            self.assertNotIn('shell', run.call_args.kwargs)
            self.assertEqual(run.call_args.kwargs['timeout'], s.TIMEOUT)
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
        with patch.object(s, 'api_json', side_effect=calls), patch.object(s, 'fetch', side_effect=OSError('not readable')):
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

    def test_input_budget_marks_truncated_and_unread_files_before_fetch(self):
        head = 'a' * 40
        content = 'x' * (s.MAX_OUTPUT // 3 + 1)
        calls = [{'head': {'sha': head}},
                 [{'filename': f'src/pages/{n}.astro', 'status': 'modified'} for n in range(2)],
                 {'encoding': 'base64', 'size': len(content), 'content': base64.b64encode(content.encode()).decode()},
                 {'head': {'sha': head}}]
        with patch.object(s, 'api_json', side_effect=calls) as api:
            text = s.collect('owner/repo', 1, head, 'token')
        self.assertEqual(api.call_count, 4)
        self.assertIn('TRUNCATED PR FILE', text)
        self.assertIn('UNREAD PR FILES', text)

    def test_duplicate_source_body_is_not_repeated_and_later_source_survives(self):
        head = 'a' * 40
        content = ('https://murphysys.com/a.pdf https://cnatra.navy.mil/a.pdf '
                   'https://navyaviation.tpub.com/general.html')
        calls = [{'head': {'sha': head}},
                 [{'filename': 'src/pages/module.astro', 'status': 'modified'}],
                 {'encoding': 'base64', 'size': len(content), 'content': base64.b64encode(content.encode()).decode()},
                 {'head': {'sha': head}}]
        responses = [(b'unique primary body', 'text/plain', 'https://murphysys.com/a.pdf'),
                     (b'unique primary body', 'text/plain', 'https://cnatra.navy.mil/a.pdf'),
                     (b'later general source', 'text/plain', 'https://navyaviation.tpub.com/general.html')]
        with patch.object(s, 'api_json', side_effect=calls), patch.object(s, 'fetch', side_effect=responses):
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
        with patch.object(s, 'api_json', side_effect=[[self.review_comment('b' * 40)]]):
            self.assertIn('exact head', s.previous_review('owner/repo', 1, 'b' * 40, 'token'))

    def test_output_limit_reports_incomplete_content(self):
        text = s.render([('test', 'x' * (s.MAX_OUTPUT + 1))], 'a' * 40)
        self.assertLessEqual(len(text), s.MAX_OUTPUT)
        self.assertIn('TRUNCATED', text)


if __name__ == '__main__':
    unittest.main()
