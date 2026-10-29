import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { carrierClassRoute } from '../src/data/carrier-profile-model.mjs';

// Check built HTML, including citation fragments, so the shared renderer cannot
// silently lose claims, source anchors, member links or hull-specific histories.
export async function checkCarrierProfiles({ dist, profiles, carriers, base = '' }) {
  const problems = [];
  const read = (route) => readFile(path.join(dist, route, 'index.html'), 'utf8').catch((error) => { if (error.code === 'ENOENT') return null; throw error; });
  const index = await read('encyclopedia/carriers/');
  const checkPage = (html, label, classProfile, shipProfile) => {
    if (!html) { problems.push(`${label}: profile page is missing`); return; }
    if (!html.includes('Drafted') || !html.includes('not technically validated')) problems.push(`${label}: profile maturity is missing`);
    if (!html.includes(`data-class-profile="${classProfile.slug}"`)) problems.push(`${label}: shared class profile is missing`);
    if (shipProfile && !html.includes(`data-ship-profile="${shipProfile.carrier}"`)) problems.push(`${label}: ship history is missing`);
    const anchors = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
    if (anchors.length !== new Set(anchors).size) problems.push(`${label}: duplicate HTML ids`);
    for (const [, id] of html.matchAll(/href="#((?:class|history)-source-[^"]+)"/g)) if (!anchors.includes(id)) problems.push(`${label}: unresolved citation #${id}`);
    for (const [namespace, profile] of [['class', classProfile], ['history', shipProfile]]) {
      if (!profile) continue;
      for (const source of profile.sources) {
        const id = `${namespace}-source-${source.id}`;
        if (!anchors.includes(id)) problems.push(`${label}: source #${id} is missing`);
        if (!html.includes(`href="#${id}"`)) problems.push(`${label}: source #${id} has no claim citation`);
      }
    }
    if (!html.includes('/manual/naval-operations/ship-operations/')) problems.push(`${label}: Naval Operations ship link is missing`);
  };
  for (const profile of profiles.classes) {
    const route = carrierClassRoute(profile);
    const html = await read(route);
    checkPage(html, profile.slug, profile);
    if (!index?.includes(`href="${base}/${route}"`)) problems.push(`${profile.slug}: carrier index lacks class link`);
    for (const carrier of carriers.filter((carrier) => carrier.class === profile.registryClass)) {
      const hullRoute = `encyclopedia/carriers/${carrier.slug}/`;
      if (!html?.includes(`href="${base}/${hullRoute}"`)) problems.push(`${profile.slug}: missing member link ${carrier.slug}`);
      const hull = await read(hullRoute);
      const shipProfile = profiles.ships.find((ship) => ship.carrier === carrier.slug);
      if (!shipProfile) problems.push(`${carrier.slug}: ship history profile is missing`);
      checkPage(hull, carrier.slug, profile, shipProfile);
      if (!hull?.includes(`href="${base}/${route}"`)) problems.push(`${carrier.slug}: class profile link is missing`);
      if (!hull?.includes('id="carrier-sources"')) problems.push(`${carrier.slug}: original identity sources are missing`);
    }
  }
  return problems;
}
