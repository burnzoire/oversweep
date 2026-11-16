// Onion-skin review of a cockpit panel against its rectified reference.
// Usage:
//   node --experimental-strip-types --no-warnings scripts/cockpit-review.mjs <spec-module> <export> <rect.png> <out-prefix> [px-per-mm=10]
// Writes:
//   <out>-overlay.png  every component in red over the greyed reference (registration check)
//   <out>-side.png     reference | drawing
//   <out>-guide.png    drawing with the placement guide (pivots, ids, lamp rectangles)
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');

const [specPath, name, refPath, out, scaleArg] = process.argv.slice(2);
const { renderPanel } = await import(pathToFileURL(resolve('src/data/cockpit/render.ts')).href);
const spec = (await import(pathToFileURL(resolve(specPath)).href))[name];
const k = +(scaleArg ?? 10); // screen px per mm
const [cw, ch] = spec.canvas, W = Math.round(cw * k), H = Math.round(ch * k);
const buf = readFileSync(refPath);
const [rw, rh] = [buf.readUInt32BE(16), buf.readUInt32BE(20)];
const ref = `data:image/png;base64,${buf.toString('base64')}`;
// Reference pixels map to mm through the spec's own scale.
const refBox = (style = '') => `<div style="width:${W}px;height:${H}px;overflow:hidden;position:relative;flex:none"><img src="${ref}" style="position:absolute;left:0;top:0;width:${(rw / spec.source.pxPerMm) * k}px;height:${(rh / spec.source.pxPerMm) * k}px;${style}"></div>`;
const svg = (opts = {}) => renderPanel(spec, { state: spec.source.shown, ...opts }).replace('<svg ', `<svg width="${W}" height="${H}" `);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W * 2 + 24, height: H + 4 } });
const shot = async (html, file, width) => {
  await page.setContent(`<body style="margin:0;background:#777">${html}</body>`);
  await page.screenshot({ path: file, clip: { x: 0, y: 0, width, height: H } });
};
await shot(`<div style="position:relative;width:${W}px;height:${H}px">${refBox('filter:grayscale(1) brightness(1.25) contrast(.9)')}` +
  `<style>.ov svg [fill]:not([fill="none"]):not(text){fill:none!important}.ov svg text{fill:#ff1f1f}.ov svg{--panel-ink:#ff1f1f;--panel-paper:transparent}</style>` +
  `<div class="ov" style="position:absolute;inset:0;opacity:.85">${svg()}</div></div>`, `${out}-overlay.png`, W);
await shot(`<div style="display:flex;gap:24px">${refBox()}<div style="background:#fff">${svg()}</div></div>`, `${out}-side.png`, W * 2 + 24);
await shot(`<div style="background:#fff;width:${W}px">${svg({ guide: true })}</div>`, `${out}-guide.png`, W);
await browser.close();
