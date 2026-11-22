import type { MenuNode } from './manual-menu';
import { categoryHasContent } from './availability';
import { encyclopediaCategories } from './catalogue';
import { carrierClassRoute } from './carrier-profile-model.mjs';
import { carrierProfiles } from './carrier-profiles';
import { carrierRoute, carriers } from './carriers';
import {
  airfieldCatalogue, aircraftContent, aircraftGroups, categoryRecords, ordnanceContent, ordnanceGroups,
  recordContent, recordRoute, sensorContent, sensorGroups, threatGroups, type EncyclopediaRecord,
} from './encyclopedia';

type Category = (typeof encyclopediaCategories)[number]['slug'];

const categoryGroups = {
  aircraft: { groups: aircraftGroups, groupOf: (record: EncyclopediaRecord) => aircraftContent(record).frontmatter.group },
  ordnance: { groups: ordnanceGroups, groupOf: (record: EncyclopediaRecord) => ordnanceContent(record).frontmatter.group },
  'radar-sensors': { groups: sensorGroups, groupOf: (record: EncyclopediaRecord) => sensorContent(record).frontmatter.group },
  'threat-systems': { groups: threatGroups, groupOf: (record: EncyclopediaRecord) => recordContent(record).frontmatter.group ?? 'sam' },
};

const byTitle = (a: MenuNode, b: MenuNode) => a.title.localeCompare(b.title, 'en');
const recordNode = (record: EncyclopediaRecord): MenuNode => ({
  id: record.id,
  title: record.title,
  href: recordRoute(record),
});
const group = (id: string, title: string, children: MenuNode[], href?: string): MenuNode => ({
  id, title, href, children: children.sort(byTitle),
});

function buildCategory(slug: Category): MenuNode[] {
  if (slug === 'locations') {
    const { theatres, maps, airfields } = airfieldCatalogue();
    return [
      group('ency-theatres', 'Theatres', theatres.map(({ record }) => recordNode(record)), 'encyclopedia/locations/theatres/'),
      group('ency-sim-maps', 'Sim Maps', maps.map(({ record }) => recordNode(record))),
      group('ency-airfields', 'Airfields', airfields.map(({ record }) => recordNode(record))),
    ].filter(({ children }) => children?.length);
  }

  if (slug === 'carriers') {
    return [
      group('ency-carrier-classes', 'Class Profiles', carrierProfiles.classes.map((profile) => ({
        id: profile.slug, title: profile.name, href: carrierClassRoute(profile),
      }))),
      group('ency-carrier-hulls', 'Ships', carriers.map((carrier) => ({
        id: carrier.slug, title: carrier.name, href: carrierRoute(carrier),
      }))),
    ].filter(({ children }) => children?.length);
  }

  const records = categoryRecords(slug);
  if (slug === 'terminology' || slug === 'reference-data') return records.map(recordNode).sort(byTitle);

  const { groups, groupOf } = categoryGroups[slug];
  const grouped = Map.groupBy(records, (record): string => groupOf(record));
  return groups.flatMap(({ slug: key, title }) => {
    const entries = grouped.get(key);
    return entries?.length ? [group(`ency-${slug}-${key}`, title, entries.map(recordNode))] : [];
  });
}

const categoryBranches = new Map<Category, MenuNode[]>();
export function encyclopediaBranch(slug: Category): MenuNode[] {
  const branch = categoryBranches.get(slug) ?? buildCategory(slug);
  categoryBranches.set(slug, branch);
  return branch;
}

export const encyclopediaCategoryId = (slug: Category) => `ency-${slug}`;

export function encyclopediaMenuFor(route: string): MenuNode[] {
  return encyclopediaCategories.map(({ slug, title }) => {
    const node = { id: encyclopediaCategoryId(slug), title, href: `encyclopedia/${slug}/` };
    if (!categoryHasContent(slug)) return { ...node, children: [] };
    if (route.startsWith(node.href)) return { ...node, children: encyclopediaBranch(slug) };
    return { ...node, lazy: `encyclopedia-menu/${slug}.json` };
  });
}
