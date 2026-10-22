import type { APIRoute } from 'astro';
import { reviewTrainers } from '../../../data/experiences';
import { serveAsset } from '../../../experiences/case-iii/serve';
export function getStaticPaths() {
  return reviewTrainers ? ['app', 'embed'].map(name => ({ params: { name } })) : [];
}
export const GET: APIRoute = ({ params }) => serveAsset(`${params.name}.js`);
