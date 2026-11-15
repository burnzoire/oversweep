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
const buf = readFileSync(refPath);
const ref = `data:image/png;base64,${buf.toString('base64')}`;
// Reference at its own pixel size (spec units = reference pixels), cropped to the panel.
const [rw, rh] = [buf.readUInt32BE(16), buf.readUInt32BE(20)];
const refImg = (style = '') => `<div style="width:${w * s}px;height:${h * s}px;overflow:hidden;position:relative;flex:none"><img src="${ref}" style="position:absolute;left:0;top:0;width:${rw * s}px;height:${rh * s}px;${style}"></div>`;
const rootAttrs = spec.parts.filter(p => p.kind === 'toggle' && p.stateAttr).map(p => ` data-${p.stateAttr}="${p.initial}"`).join('');
const svg = `<div data-panel-id="${spec.id}"${rootAttrs} style="display:inline-block">${renderPanelSvg(spec).replace('<svg ', `<svg width="${w * s}" height="${h * s}" `)}</div>`;
const page = await (await chromium.launch()).newPage({ viewport: { width: w * s * 2 + 20, height: h * s } });
const shot = async (html, file, width) => {
  await page.setContent(`<body style="margin:0;background:#888">${html}</body>`);
  await page.screenshot({ path: file, clip: { x: 0, y: 0, width, height: h * s } });
};
await shot(`<div style="position:relative;width:${w * s}px;height:${h * s}px"><style>.ov svg [fill="#fff"]{fill:none}.ov svg .lens{display:none}.ov svg{--panel-ink:#ff2a2a}</style><div style="position:absolute;inset:0">${refImg('filter:grayscale(1) brightness(1.3)')}</div><div class="ov" style="position:absolute;inset:0;opacity:.9">${svg}</div></div>`, `${out}-overlay.png`, w * s);
await shot(`<div style="display:flex;gap:20px">${refImg()}${svg}</div>`, `${out}-side.png`, w * s * 2 + 20);
process.exit(0);
