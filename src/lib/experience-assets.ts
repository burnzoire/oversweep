import { resolve } from 'node:path';
import { readFile } from 'node:fs/promises';
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

export async function serveAsset(slug: string | undefined, asset: string) {
  const experience = includedExperiences.find(e => e.slug === slug);
  const extension = asset.slice(asset.lastIndexOf('.'));
  if (!experience || !experience.assets.includes(asset) || !types[extension]) return new Response(null, { status: 404 });
  if (isShared(asset) && (asset.includes('..') || !sharedRoots.some(r => asset.startsWith(r)))) return new Response(null, { status: 404 });
  const file = isShared(asset) ? resolve(process.cwd(), 'src', asset) : resolve(process.cwd(), 'src/experiences', experience.slug, asset);
  return new Response(await readFile(file, 'utf8'), { headers: { 'Content-Type': types[extension] } });
}
