import assert from 'node:assert/strict';
import { dev } from 'astro';
const request = url => fetch(url, { signal: AbortSignal.timeout(15000) });

// HTTP integration check, not browser/layout/voice verification.
for (const base of ['/', '/oversweep/']) {
  const server = await dev({ base, server: { host: '127.0.0.1', port: 0 }, logLevel: 'silent' });
  try {
    const origin = `http://127.0.0.1:${server.address.port}`;
    const page = await request(`${origin}${base}manual/naval-operations/case-iii/`);
    assert.equal(page.status, 200);
    const pageHTML = await page.text();
    const source = pageHTML.match(/<iframe[^>]*src="([^"]+)"/)?.[1];
    assert(source, 'manual must embed the local trainer');
    const frame = await request(new URL(source, origin));
    if(frame.status !== 200) console.error((await frame.clone().text()).slice(0,2500));
    assert.equal(frame.status, 200, `trainer frame at ${source} must not render the 404 page`);
    const frameHTML = await frame.text();
    assert(frameHTML.includes('id="briefDialog"'), 'frame must contain trainer, not site shell');
    const assetBase = new URL(frameHTML.match(/<base href="([^"]+)"/)?.[1], frame.url);
    const scopeURL = new URL('../../manual/naval-operations/case-iii/#sources',assetBase);
    assert.equal(scopeURL.pathname,`${base}manual/naval-operations/case-iii/`);
    for (const asset of ['app.js', 'style.css', 'model.cjs', 'embed.js']) {
      const response = await request(new URL(asset, assetBase));
      if(response.status!==200) console.error({asset,base,frameURL:frame.url,assetURL:response.url,html:frameHTML.slice(0,500)});
      assert.equal(response.status, 200, `${asset} resolves relative to final frame URL`);
      assert.match(response.headers.get('content-type'), asset.endsWith('.css') ? /text\/css/ : /javascript/);
      assert(!(await response.text()).includes('Page not found'));
    }
    const unknown = await request(`${origin}${base}review/case-iii/not-an-asset.js`);
    assert.equal(unknown.status,404);
    console.log(`Case III development HTTP routes: PASS (${base})`);
  } finally {
    await server.stop();
  }
}
