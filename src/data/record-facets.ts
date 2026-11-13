// Facets for the encyclopedia list filters. Every filtered list uses the same
// FilterBar and record-filter script: each item carries `data-facet-<key>`
// (space-separated values) and `data-search`, and the bar offers one select
// per facet. Facet values are derived from record data here, so a new record
// is filtered without extra tagging. A facet with fewer than three values is
// not worth a control and is dropped.
import { aircraftEras, aircraftGroups, ordnanceGroups, sensorGroups, threatGroups, type AircraftData, type EncyclopediaRecord, type OrdnanceData, type SensorData, type ThreatData } from './encyclopedia';
import { purchaseSims } from './purchase.mjs';

export interface FacetOption { value: string; label: string; count: number }
export interface Facet { key: string; label: string; any?: string; options: FacetOption[] }
export type FacetValues = Record<string, string[]>;
export interface FilterItem { values: FacetValues; search: string; count?: string }

export const slug = (text: string) => text.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
// Search text matches with or without accents.
export const searchText = (parts: (string | undefined | null)[]) => {
  const text = parts.filter(Boolean).join(' | ').toLowerCase();
  return `${text} | ${text.normalize('NFD').replace(/\p{M}/gu, '')}`;
};
// Cited fields carry "[1]" markers and markdown links; keep the words only.
const plainText = (text = '') => text.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/\[\d+\]/g, '');

// Builds facets from the items' values. `order` fixes the option order and
// labels where the values come from a known list; otherwise options are sorted
// by label. Options no item has are left out.
export function buildFacets(items: { values: FacetValues }[], defs: { key: string; label: string; any?: string; order?: readonly { slug: string; title: string }[]; labels?: Record<string, string> }[]): Facet[] {
  return defs.map(({ key, label, any, order, labels }) => {
    const counts = new Map<string, number>();
    for (const item of items) for (const v of new Set(item.values[key] ?? [])) counts.set(v, (counts.get(v) ?? 0) + 1);
    const known = order ? order.map((o) => ({ value: o.slug, label: o.title })) : [...counts.keys()].map((v) => ({ value: v, label: labels?.[v] ?? v })).sort((a, b) => a.label.localeCompare(b.label, 'en'));
    const options = known.filter((o) => counts.has(o.value)).map((o) => ({ ...o, count: counts.get(o.value)! }));
    return { key, label, any, options };
  }).filter((f) => f.options.length >= 3);
}

// The data-* attributes RecordCard and table rows carry for the filter.
export const filterAttributes = (item: FilterItem) => ({
  'data-filter-item': '',
  'data-search': item.search,
  ...(item.count ? { 'data-filter-count': item.count } : {}),
  ...Object.fromEntries(Object.entries(item.values).map(([k, v]) => [`data-facet-${k}`, v.join(' ')])),
});

// Origin: the countries named before any note on builders or later users.
// "Soviet Union / Russia" and its variants are one value.
const nationLabels: Record<string, string> = {};
export function originNations(origin = ''): string[] {
  const head = plainText(origin).split(';')[0].replace(/\([^)]*\)/g, '').replace(/,? with (help|production) .*$/i, '');
  const names = head.split(/\s*(?:,|\/|\band\b)\s*/).map((n) => n.replace(/^(now|then)\s+/i, '').trim()).filter(Boolean);
  return [...new Set(names.map((name) => {
    const label = /^(soviet union|russia)$/i.test(name) ? 'Soviet Union or Russia' : /^west germany$/i.test(name) ? 'Germany' : name;
    nationLabels[slug(label)] = label;
    return slug(label);
  }))];
}
const originFacet = { key: 'origin', label: 'Origin', any: 'Any country', labels: nationLabels };

// Aircraft role, from the record's cited role text. An aircraft can have
// several: "Fighter-bomber" and "multirole" are both fighter and attack.
const aircraftRoles = [
  { slug: 'fighter', title: 'Fighter or interceptor', test: /fighter|interceptor|air superiority|multirole|multi-role combat/i },
  { slug: 'attack', title: 'Attack or strike', test: /attack|strike|fighter-bomber|multirole|close air support|bomber destroyer|gunship|fire support|anti-tank/i },
  { slug: 'trainer', title: 'Trainer', test: /trainer/i },
  { slug: 'reconnaissance', title: 'Reconnaissance or scout', test: /reconnaissance|scout|observation|forward air control/i },
  { slug: 'transport', title: 'Transport or utility', test: /transport|utility|heavy-lift|cargo|assault helicopter/i },
  { slug: 'tanker', title: 'Tanker', test: /refuelling|tanker/i },
  { slug: 'other', title: 'Other', test: /aerobatic|anti-submarine|sea control/i },
] as const;
export const aircraftRoleValues = (role: string) => aircraftRoles.filter((r) => r.test.test(plainText(role))).map((r) => r.slug);
// Short sim names keep the select narrow on a phone.
const simNames: Record<string, string> = { msfs: 'MSFS' };
const aircraftSims = Object.entries(purchaseSims).map(([s, title]) => ({ slug: s, title: simNames[s] ?? title }));

export function aircraftFilter(record: EncyclopediaRecord, era: string, data: AircraftData): FilterItem {
  const sims = [...new Set((data.purchase ?? []).map((p) => p.sim))];
  return {
    count: 'records',
    search: searchText([record.title, record.designation, data.name, data.short, data.variant]),
    values: { type: [data.group], role: aircraftRoleValues(data.role), era: [era], origin: originNations(data.origin), sim: sims.length ? sims : ['none'] },
  };
}
export const aircraftFacets = (items: FilterItem[]) => buildFacets(items, [
  { key: 'type', label: 'Type', any: 'Any type', order: aircraftGroups },
  { key: 'role', label: 'Role', any: 'Any role', order: aircraftRoles },
  { key: 'era', label: 'Era', any: 'Any era', order: aircraftEras },
  originFacet,
  { key: 'sim', label: 'Flyable in', any: 'Any sim, or none', order: [...aircraftSims, { slug: 'none', title: 'No sim yet' }] },
]);

// Guidance, from the record's cited guidance text. A weapon whose variants
// differ (a laser and a TV Kh-29) takes every kind its text names.
const guidanceKinds = [
  { slug: 'unguided', title: 'Unguided' },
  { slug: 'command', title: 'Command guidance', test: /command|CLOS\b|MCLOS|SACLOS/i },
  { slug: 'semi-active-radar', title: 'Semi-active radar', test: /semi-active radar|semi-active seeker|semi-active homing|terminal semi-active|illuminat/i },
  { slug: 'active-radar', title: 'Active radar', test: /(?<!semi-)active radar|track-via-missile/i },
  { slug: 'anti-radiation', title: 'Passive radar (anti-radiation)', test: /passive radar|radar seeker|home-on-jam|emitter/i },
  { slug: 'infrared', title: 'Infrared or optical seeker', test: /infrared|ultraviolet|optical seeker|photocontrast/i },
  { slug: 'laser', title: 'Laser', test: /laser/i },
  { slug: 'tv', title: 'TV or electro-optical', test: /\bTV\b|electro-optical|television/i },
  { slug: 'satellite-inertial', title: 'GPS or inertial', test: /GPS|inertial|preprogrammed/i },
  { slug: 'radar-directed', title: 'Radar-directed gun', test: /radar-directed|^radar:|range-only radar/i },
] as const;
export function guidanceValues(guidance?: string): string[] {
  if (!guidance) return [];
  const text = plainText(guidance).trim();
  if (/^none\b|falls unguided/i.test(text)) return ['unguided'];
  return guidanceKinds.filter((g) => 'test' in g && g.test.test(text)).map((g) => g.slug);
}
const guidanceFacet = { key: 'guidance', label: 'Guidance', any: 'Any guidance', order: guidanceKinds };

export function ordnanceFilter(record: EncyclopediaRecord, data: OrdnanceData): FilterItem {
  return {
    count: 'records',
    search: searchText([record.title, record.designation, data.name, data.short, ...(data.variants ?? []).map(plainText)]),
    values: { type: [data.group], guidance: guidanceValues(data.guidance), origin: originNations(data.origin) },
  };
}
export const ordnanceFacets = (items: FilterItem[]) => buildFacets(items, [
  { key: 'type', label: 'Type', any: 'Any type', order: ordnanceGroups },
  guidanceFacet,
  originFacet,
]);

export function sensorFilter(record: EncyclopediaRecord, data: SensorData): FilterItem {
  return {
    count: 'records',
    search: searchText([record.title, record.designation, data.name, data.short]),
    values: { type: [data.group], origin: originNations(data.origin) },
  };
}
export const sensorFacets = (items: FilterItem[]) => buildFacets(items, [
  { key: 'type', label: 'Type', any: 'Any type', order: sensorGroups },
  originFacet,
]);

// Threat systems: how the system moves, from the cited mobility text.
const mobilityKinds = [
  { slug: 'man-portable', title: 'Man-portable', test: /shoulder|man-portable|manpads|carried and fired|one soldier/i },
  { slug: 'tracked', title: 'Tracked vehicle', test: /tracked|tank hull|MT-LB|BMP/i },
  { slug: 'wheeled', title: 'Wheeled vehicle', test: /wheeled|truck|HMMWV|\d+\s?[×x]\s?\d+|BAZ|MAZ|KrAZ|ZIL|Ural|Kamaz/i },
  { slug: 'towed-fixed', title: 'Towed or fixed site', test: /towed|fixed|static|semi-mobile|trailer/i },
] as const;
export const mobilityValues = (mobility?: string) => mobility ? mobilityKinds.filter((m) => m.test.test(plainText(mobility))).map((m) => m.slug) : [];

export function threatFilter(record: EncyclopediaRecord, data: ThreatData): FilterItem {
  return {
    count: 'records',
    search: searchText([record.title, record.designation, data.nato, data.short, data.designation]),
    values: { type: [data.group], guidance: guidanceValues(data.guidance), mobility: mobilityValues(data.mobility) },
  };
}
export const threatFacets = (items: FilterItem[]) => buildFacets(items, [
  { key: 'type', label: 'Type', any: 'Any type', order: threatGroups },
  guidanceFacet,
  { key: 'mobility', label: 'Mobility', any: 'Any mobility', order: mobilityKinds },
]);
