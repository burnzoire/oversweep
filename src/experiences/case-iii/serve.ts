import { resolve } from 'node:path';
import { readFile } from 'node:fs/promises';
import { reviewTrainers } from '../../data/experiences';
const assets = ['app.js', 'embed.js', 'style.css', 'model.cjs'];
export async function serveAsset(asset: string) {
  if (!reviewTrainers || !assets.includes(asset)) return new Response(null, { status: 404 });
  return new Response(await readFile(resolve(process.cwd(), 'src/experiences/case-iii', asset), 'utf8'), {
    headers: { 'Content-Type': asset.endsWith('.css') ? 'text/css; charset=utf-8' : 'text/javascript; charset=utf-8' },
  });
}
