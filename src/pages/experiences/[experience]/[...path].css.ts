import type { APIRoute } from 'astro';
import { serveAsset, sharedAssetPaths } from '../../../lib/experience-assets';
// Shared site code an experience lists in its assets (lessons/…, styles/…).
// The extension is in the file name so Astro treats the route as a file.
export const getStaticPaths = () => sharedAssetPaths('.css');
export const GET: APIRoute = ({ params }) => serveAsset(params.experience, `${params.path}.css`);
