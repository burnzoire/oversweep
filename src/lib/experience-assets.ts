import { resolve } from 'node:path';
import { readFile } from 'node:fs/promises';
import { includedExperiences } from '../data/experiences';

const types: Record<string, string> = {
  '.js': 'text/javascript; charset=utf-8',
  '.cjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
};

// Static paths for one asset extension across every included experience.
export function assetPaths(extension: string) {
  return includedExperiences.flatMap(e => e.assets
    .filter(asset => asset.endsWith(extension))
    .map(asset => ({ params: { experience: e.slug, name: asset.slice(0, -extension.length) } })));
}

export async function serveAsset(slug: string | undefined, asset: string) {
  const experience = includedExperiences.find(e => e.slug === slug);
  const extension = asset.slice(asset.lastIndexOf('.'));
  if (!experience || !experience.assets.includes(asset) || !types[extension]) return new Response(null, { status: 404 });
  return new Response(await readFile(resolve(process.cwd(), 'src/experiences', experience.slug, asset), 'utf8'), {
    headers: { 'Content-Type': types[extension] },
  });
}
