import assert from 'node:assert/strict';
import { dev } from 'astro';
import { loadExperiences } from './check_experiences.mjs';
const request = url => fetch(url, { signal: AbortSignal.timeout(15000) });
const experiences = await loadExperiences();

// HTTP integration check for every registered experience, not browser/layout/voice verification.
for (const base of ['/', '/oversweep/']) {
  const server = await dev({ base, server: { host: '127.0.0.1', port: 0 }, logLevel: 'silent' });
  try {
    const origin = `http://127.0.0.1:${server.address.port}`;
    for (const e of experiences) {
      const route = `${base}manual/${e.subject}/${e.slug}/`;
      const page = await request(`${origin}${route}`);
      assert.equal(page.status, 200, route);
      const source = (await page.text()).match(/<iframe[^>]*src="([^"]+)"/)?.[1];
      assert(source, `${route} must embed the trainer frame`);
      const frame = await request(new URL(source, origin));
      assert.equal(frame.status, 200, `trainer frame at ${source} must not render the 404 page`);
      const frameHTML = await frame.text();
      assert(frameHTML.includes(`data-experience-id="${e.id}"`), 'frame must contain the registered trainer, not the site shell');
      const assetBase = new URL(frameHTML.match(/<base href="([^"]+)"/)?.[1], frame.url);
      for (const asset of e.assets) {
        const response = await request(new URL(asset, assetBase));
        assert.equal(response.status, 200, `${asset} resolves relative to final frame URL`);
        assert.match(response.headers.get('content-type'), asset.endsWith('.css') ? /text\/css/ : /javascript/);
        assert(!(await response.text()).includes('Page not found'));
      }
      assert.equal((await request(new URL('not-an-asset.js', assetBase))).status, 404);
      console.log(`Experience development HTTP routes: PASS (${e.slug}, ${base})`);
    }
  } finally {
    await server.stop();
  }
}
