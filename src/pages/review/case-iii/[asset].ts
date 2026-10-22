import type { APIRoute } from 'astro';
import { resolve } from 'node:path';
import { readFile } from 'node:fs/promises';
import { reviewTrainers } from '../../../data/experiences';

const assets = ['index.html', 'app.js', 'style.css', 'model.cjs', 'embed.js'];
export function getStaticPaths() {
  return reviewTrainers ? assets.map(asset => ({ params: { asset } })) : [];
}
export const GET: APIRoute = async ({ params }) => {
  if (!reviewTrainers || !assets.includes(params.asset ?? '')) return new Response(null, { status: 404 });
  const asset = params.asset!;
  const file = resolve(process.cwd(), "src/experiences/case-iii", asset);
  const type = asset.endsWith('.html') ? 'text/html' : asset.endsWith('.css') ? 'text/css' : 'text/javascript';
  return new Response(await readFile(file, 'utf8'), { headers: { 'Content-Type': `${type}; charset=utf-8` } });
};
