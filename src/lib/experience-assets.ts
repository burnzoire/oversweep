import { resolve } from 'node:path';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { includedExperiences } from '../data/experiences';

const types: Record<string, string> = {
  '.js': 'text/javascript; charset=utf-8',
  '.cjs': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
};

// An asset with a folder in its name is shared site code, read from that
// path under src/ (for example `lessons/shared/instruments.mjs`) and served
// at the same path under the frame, so its own relative imports still
// resolve. Any other asset lives in the experience's own folder.
export const isShared = (asset: string) => asset.includes('/');
const sharedRoots = ['lessons/', 'styles/'];

// Static paths for one asset extension across every included experience.
export function assetPaths(extension: string) {
  return includedExperiences.flatMap(e => e.assets
    .filter(asset => !isShared(asset) && asset.endsWith(extension))
    .map(asset => ({ params: { experience: e.slug, name: asset.slice(0, -extension.length) } })));
}
export function sharedAssetPaths(extension: string) {
  return includedExperiences.flatMap(e => e.assets
    .filter(asset => isShared(asset) && asset.endsWith(extension))
    .map(asset => ({ params: { experience: e.slug, path: asset.slice(0, -extension.length) } })));
}

const assetFile = (slug: string, asset: string) =>
  isShared(asset) ? resolve(process.cwd(), 'src', asset) : resolve(process.cwd(), 'src/experiences', slug, asset);

/**
 * Give every asset link in a frame a content hash (`app.js?v=1a2b3c4d`),
 * so a browser that cached the previous deploy (GitHub Pages allows ten
 * minutes) cannot pair a new page with an old script. Links in the HTML get
 * the query directly; an import map does the same for module imports,
 * which resolve to the bare URL. `base` is the frame's absolute path.
 */
export async function versionAssets(html: string, slug: string, assets: string[], base: string) {
  const hashes = new Map<string, string>();
  for (const asset of assets) {
    hashes.set(asset, createHash('sha256').update(await readFile(assetFile(slug, asset))).digest('hex').slice(0, 10));
  }
  const versioned = (asset: string) => `${asset}?v=${hashes.get(asset)}`;
  const imports = Object.fromEntries([...hashes.keys()].filter(a => /\.m?js$/.test(a)).map(a => [base + a, base + versioned(a)]));
  const map = `<script type="importmap">${JSON.stringify({ imports })}</script>`;
  return html
    .replace(/\b(href|src)="([^"?#]+)"/g, (whole, attr, url) => hashes.has(url) ? `${attr}="${versioned(url)}"` : whole)
    .replace(/(<base [^>]*>)/, `$1${map}`);
}

export async function serveAsset(slug: string | undefined, asset: string) {
  const experience = includedExperiences.find(e => e.slug === slug);
  const extension = asset.slice(asset.lastIndexOf('.'));
  if (!experience || !experience.assets.includes(asset) || !types[extension]) return new Response(null, { status: 404 });
  if (isShared(asset) && (asset.includes('..') || !sharedRoots.some(r => asset.startsWith(r)))) return new Response(null, { status: 404 });
  return new Response(await readFile(assetFile(experience.slug, asset), 'utf8'), { headers: { 'Content-Type': types[extension] } });
}
