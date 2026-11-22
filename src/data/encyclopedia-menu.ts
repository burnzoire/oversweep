import type { MenuNode } from './manual-menu';
import { categoryHasContent } from './availability';
import { encyclopediaCategories } from './catalogue';
import { carrierEntryDate } from './carrier-model.mjs';
import { carrierClassRoute } from './carrier-profile-model.mjs';
import { classProfileFor } from './carrier-profiles';
import { carrierRoute, carriers } from './carriers';
import {
  airfieldCatalogue, aircraftContent, aircraftGroups, categoryRecords, ordnanceContent, ordnanceGroups,
  mapAirfieldAnchor, recordContent, recordRoute, sensorContent, sensorGroups, simAirfields, threatGroups,
  type EncyclopediaRecord,
} from './encyclopedia';

type Category = (typeof encyclopediaCategories)[number]['slug'];

const categoryGroups = {
  aircraft: { groups: aircraftGroups, groupOf: (record: EncyclopediaRecord) => aircraftContent(record).frontmatter.group },
  ordnance: { groups: ordnanceGroups, groupOf: (record: EncyclopediaRecord) => ordnanceContent(record).frontmatter.group },
  'radar-sensors': { groups: sensorGroups, groupOf: (record: EncyclopediaRecord) => sensorContent(record).frontmatter.group },
  'threat-systems': { groups: threatGroups, groupOf: (record: EncyclopediaRecord) => recordContent(record).frontmatter.group ?? 'sam' },
};

const byTitle = (a: MenuNode, b: MenuNode) => a.title.localeCompare(b.title, 'en');
const recordNode = (record: EncyclopediaRecord) => ({
  id: record.id,
  title: record.title,
  href: recordRoute(record),
});
const group = (id: string, title: string, children: MenuNode[], href?: string): MenuNode => ({
  id, title, href, children: children.sort(byTitle),
});

function locationBranch(): MenuNode[] {
  const { theatres, maps, airfields } = airfieldCatalogue();
  const fieldsByMap = new Map(maps.map((map) => [map, new Map<string, MenuNode>()]));
  const mappedRecords = new Set<EncyclopediaRecord>();

  for (const map of maps) {
    const fields = fieldsByMap.get(map)!;
    for (const { airfield, coverage } of map.airfields) {
      if (coverage.status !== 'represented') continue;
      const node = recordNode(airfield.record);
      fields.set(node.href, node);
      mappedRecords.add(airfield.record);
    }
  }

  for (const field of simAirfields()) {
    for (const { map, name } of field.maps) {
      const anchor = mapAirfieldAnchor(name);
      const node = field.record ? recordNode(field.record.record) : {
        id: anchor,
        title: name,
        href: `${recordRoute(map.record)}#${anchor}`,
      };
      fieldsByMap.get(map)!.set(node.href, node);
      if (field.record) mappedRecords.add(field.record.record);
    }
  }

  const otherAirfields = airfields.filter(({ record }) => !mappedRecords.has(record));
  const mapNode = (map: (typeof maps)[number], parent: string) => {
    const { id, href } = recordNode(map.record);
    return group(`${parent}-${id}`, map.data.name, [...fieldsByMap.get(map)!.values()], href);
  };

  const theatreNodes = theatres.map((theatre) => {
    const { id, title, href } = recordNode(theatre.record);
    const children = theatre.maps.map((map) => mapNode(map, id));
    const localAirfields = otherAirfields
      .filter((field) => field.theatres.some(({ record }) => record === theatre.record))
      .map(({ record }) => recordNode(record));
    if (localAirfields.length) children.push(group(`${id}-other-airfields`, 'Other airfields', localAirfields));
    return group(id, title, children, href);
  });

  const branch = [group('ency-theatres', 'Theatres', theatreNodes, 'encyclopedia/locations/theatres/')];
  const unassignedMaps = maps.filter((map) => !map.theatres.length).map((map) => mapNode(map, 'ency-locations'));
  const unassignedAirfields = otherAirfields.filter((field) => !field.theatres.length).map(({ record }) => recordNode(record));
  if (unassignedMaps.length) branch.push(group('ency-other-sim-maps', 'Other sim maps', unassignedMaps));
  if (unassignedAirfields.length) branch.push(group('ency-other-airfields', 'Other airfields', unassignedAirfields));
  return branch;
}

function buildCategory(slug: Category): MenuNode[] {
  if (slug === 'locations') return locationBranch();

  if (slug === 'carriers') {
    const classes = Map.groupBy(carriers, (carrier) => carrier.class);
    const byIntroduction = [...classes].map(([name, ships]) => ({
      name, ships,
      firstEntry: ships.map(carrierEntryDate).filter(Boolean).sort()[0] ?? '',
    })).sort((a, b) => b.firstEntry.localeCompare(a.firstEntry) || a.name.localeCompare(b.name, 'en'));
    return byIntroduction.map(({ name, ships }) => {
      const profile = classProfileFor(name);
      return group(`ency-carrier-class-${ships[0].slug}`, name, ships.map((carrier) => ({
        id: carrier.slug,
        title: carrier.hull ? `${carrier.name} (${carrier.hull})` : carrier.name,
        href: carrierRoute(carrier),
      })), profile ? carrierClassRoute(profile) : undefined);
    });
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
