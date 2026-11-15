// Usage: node --experimental-strip-types scripts/panel-overlay.mjs <spec-module> <export> <rectified-ref.png> <out-prefix>
// Writes <out>-overlay.png (drawing over the reference, 3x) and <out>-side.png (reference | drawing).
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');

const [specPath, name, refPath, out] = process.argv.slice(2);
const { renderPanelSvg } = await import(pathToFileURL(resolve('src/data/cockpit-panels/render.ts')).href);
const spec = (await import(pathToFileURL(resolve(specPath)).href))[name];
const [w, h] = spec.size, s = 3;
const ref = `data:image/png;base64,${readFileSync(refPath).toString('base64')}`;
const svg = renderPanelSvg(spec).replace('<svg ', `<svg width="${w * s}" height="${h * s}" `);
const page = await (await chromium.launch()).newPage({ viewport: { width: w * s * 2 + 20, height: h * s } });
const shot = async (html, file, width) => {
  await page.setContent(`<body style="margin:0;background:#888">${html}</body>`);
  await page.screenshot({ path: file, clip: { x: 0, y: 0, width, height: h * s } });
};
await shot(`<div style="position:relative;width:${w * s}px;height:${h * s}px"><style>.ov svg [fill="#fff"]{fill:none}.ov svg .lens{display:none}.ov svg{--panel-ink:#ff2a2a}</style><img src="${ref}" style="position:absolute;width:100%;height:100%;filter:grayscale(1) brightness(1.3)"><div class="ov" style="position:absolute;inset:0;opacity:.9">${svg}</div></div>`, `${out}-overlay.png`, w * s);
await shot(`<div style="display:flex;gap:20px"><img src="${ref}" style="width:${w * s}px;height:${h * s}px">${svg}</div>`, `${out}-side.png`, w * s * 2 + 20);
process.exit(0);
