import type { APIRoute } from 'astro';
import { assetPaths, serveAsset } from '../../../lib/experience-assets';
export const getStaticPaths = () => assetPaths('.css');
export const GET: APIRoute = ({ params }) => serveAsset(params.experience, `${params.name}.css`);
