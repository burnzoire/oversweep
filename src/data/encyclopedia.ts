import type { MarkdownInstance } from 'astro';
import registry from './encyclopedia.json';
import { reviewTrainers } from './experiences';
import { airfieldRoles, basings, branches, coverageStatuses, eras, nations, sims, validateCatalogue } from './airfield-model.mjs';

// Encyclopedia records. Like modules, `publication` decides whether a record
// ships in normal builds and is independent of `maturity`, which is always
// shown. Each record's text and structured data live in
// content/encyclopedia/<category>/<slug>.md, where the SME review reads them.
export type EncyclopediaRecord = (typeof registry)[number] & { publication: 'published' | 'excluded' };

export const records = registry as EncyclopediaRecord[];
export const includedRecords = records.filter(r => r.publication === 'published' || reviewTrainers);
export const recordRoute = (r: EncyclopediaRecord) => `encyclopedia/${r.category}/${r.slug}/`;
export const categoryRecords = (category: string) => includedRecords.filter(r => r.category === category);

export interface Source {
  n: number;
  title: string;
  publisher: string;
  date?: string;
  url: string;
  accessed: string;
  note?: string;
}

// Published engagement limits. Distances in km, heights in m; null where the
// cited sources give no figure, which the figures draw dashed.
export interface Envelope {
  basis: string;
  minRangeKm: number | null;
  maxRangeKm: number;
  minAltM: number | null;
  maxAltM: number | null;
  cite: number[];
}

export interface Radar {
  name: string;
  nato?: string;
  role: string;
  band?: string;
}

// A photo self-hosted under public/, credited to where it was found. Any
// record may carry one; the licence is checked on the source page first.
export interface Photo {
  src: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
  author: string;
  date?: string;
  licence: string;
  sourceUrl: string;
  accessed: string;
}

export interface BatteryItem {
  kind: 'radar' | 'launcher' | 'reload' | 'command' | 'gunner';
  label: string;
  count?: number;
  missiles?: number;
}

export interface ThreatData {
  nato: string;
  designation: string;
  role: string;
  inService: string;
  guidance: string;
  seeker?: 'radar' | 'infrared';
  mobility: string;
  envelope: Envelope;
  radars: Radar[];
  radarsCite?: number[];
  // Symbols from the cited RWR threat table; empty when the system has none.
  rwr: { symbol: string; emitter: string }[];
  rwrNote?: string;
  photo?: Photo;
  battery?: { pattern: 'ring' | 'rings' | 'group'; spacing?: string; cite: number[]; items: BatteryItem[] };
  sources: Source[];
}

// A photograph with its credit. `src` is a file under public/, such as
// encyclopedia/aircraft/f-16.jpg; `sourceUrl` is the page the photo and its
// licence were taken from.
export interface Photo {
  src: string;
  alt: string;
  caption: string;
  author: string;
  licence: string;
  licenceUrl?: string;
  sourceUrl: string;
  accessed: string;
  // 'contain' shows the whole picture instead of cropping it to the frame,
  // for long, thin subjects such as a bomb photographed side on.
  fit?: 'contain';
}

// Aircraft records: the data plate gives cited text for the variant named in
// `variant`; `quick` holds plain numbers for the category's comparison table.
export interface AircraftData {
  group: 'jet' | 'propeller' | 'helicopter';
  // Short label for the record nav when the title's first word is not enough.
  short?: string;
  name: string;
  variant: string;
  role: string;
  origin: string;
  manufacturer: string;
  crew: string;
  firstFlight: string;
  inService: string;
  status: string;
  powerplant: string;
  maxSpeed: string;
  ceiling: string;
  range: string;
  armament: string[];
  sensors?: string[];
  // The first photo leads the page; the others follow the record text.
  photos: Photo[];
  quick: { firstFlight: number; maxSpeedKt: number | null; ceilingFt: number | null };
  sources: Source[];
}

export const aircraftGroups = [
  { slug: 'jet', title: 'Jet aircraft' },
  { slug: 'propeller', title: 'Propeller aircraft' },
  { slug: 'helicopter', title: 'Helicopters' },
] as const;

// Groups on the ordnance list, in display order. Groups without records are
// not shown, so later ordnance batches only add records.
export const ordnanceGroups = [
  { slug: 'air-to-air', title: 'Air-to-air missiles' },
  { slug: 'guided-air-to-ground', title: 'Guided air-to-ground weapons' },
  { slug: 'gun', title: 'Aircraft guns' },
  { slug: 'bomb', title: 'General-purpose bombs' },
  { slug: 'cluster', title: 'Cluster bombs' },
  { slug: 'fire-practice', title: 'Fire bombs and practice bombs' },
  { slug: 'rocket', title: 'Rockets' },
] as const;

// Ordnance records: the data plate gives cited text for the weapon and the
// variants it names; `quick` holds the comparison table's columns: weight in
// kilograms and the year or decade the weapon entered service.
export interface OrdnanceData {
  group: (typeof ordnanceGroups)[number]['slug'];
  // Short label for the record nav when the title's first word is not enough.
  short?: string;
  name: string;
  type: string;
  origin: string;
  inService: string;
  weight: string;
  dimensions: string;
  // Bombs, rockets and missiles fill the warhead to delivery rows; guns leave
  // them out and fill the gun rows instead.
  warhead?: string;
  guidance?: string;
  motor?: string;
  fuzing?: string;
  delivery?: string;
  range?: string;
  calibre?: string;
  action?: string;
  rateOfFire?: string;
  muzzleVelocity?: string;
  ammunition?: string;
  carriers: string[];
  variants?: string[];
  // The first photo leads the page; the others follow the record text.
  photos: Photo[];
  quick: { introduced: string | null; weightKg: number | null };
  sources: Source[];
}

// An official chart reproduced as an image, such as an FAA airport diagram.
// `chart` names the edition, since charts are reissued every few weeks.
export interface Chart {
  src: string;
  alt: string;
  caption: string;
  chart: string;
  publisher: string;
  sourceUrl: string;
  accessed: string;
}

// A runway drawn to scale from its published threshold coordinates, for
// fields with no public airport diagram: [latitude, longitude] in degrees.
export interface RunwayLine {
  id: string;
  widthFt: number;
  ends: [[number, number], [number, number]];
}

// Airfields & Carriers records. The model, its controlled lists and the
// validation the build runs are in airfield-model.mjs; these types describe
// the frontmatter it checks. Dates are "YYYY", "YYYY-MM" or "YYYY-MM-DD".
export type Nation = keyof typeof nations;
export type Branch = keyof typeof branches;
export type Sim = keyof typeof sims;

// When a fact applies: `from` and `to` bound it; `asOf` is when a source
// described it as current; `ended` marks a past period with no known end.
// All are optional, and none means no date is known.
export interface Period { from?: string; to?: string; asOf?: string; ended?: boolean }

export interface AirfieldName extends Period { name: string; former?: boolean; cite: string }
export interface Operator extends Period { name: string; detail?: string; nation: Nation; branch: Branch; cite: string }
export interface Unit extends Period {
  name: string;
  nation: Nation;
  branch: Branch;
  // Left out when the sources do not say whether the unit is based or visiting.
  basing?: keyof typeof basings;
  aircraft?: string[];
  cite: string;
}
export interface Runway {
  id: string;
  // A second field of the same base, such as "South Field".
  field?: string;
  lengthFt: number | null;
  widthFt?: number;
  surface?: string;
  unpaved?: boolean;
  note?: string;
  cite: string;
}
export interface SimDifference { topic: string; text: string }

// How one sim map shows the airfield. A map the airfield does not list has
// not been checked; `unchecked` keeps a sourced remark without a claim.
export interface MapCoverage {
  map: string;
  status: keyof typeof coverageStatuses;
  inSimName?: string;
  checked: string;
  cite?: string;
  note?: string;
  facts?: string[];
  differences?: SimDifference[];
}

export interface AirfieldData {
  kind: 'airfield';
  short?: string;
  name: string;
  status: 'active' | 'closed';
  names?: AirfieldName[];
  identifiers?: { icao?: string; iata?: string; faa?: string; others?: string[] };
  country: Nation;
  location: string;
  coordinates: { lat: number; lon: number; cite: string };
  elevationFt: number;
  elevationCite: string;
  opened: { year: number; text: string };
  closed?: { year: number; text: string };
  roles: (keyof typeof airfieldRoles)[];
  operators: Operator[];
  units?: Unit[];
  facilities: { asOf?: string; runways: Runway[]; arresting?: string[]; navaids?: string[]; other?: string[] };
  theatres?: string[];
  maps?: MapCoverage[];
  // FAA airport diagrams for US fields; `runwayPlan` draws the runways of
  // fields without one, from the coordinates its `cite` names. (Astro reserves
  // the frontmatter key `layout`.)
  charts?: Chart[];
  runwayPlan?: { runways: RunwayLine[]; cite: string };
  // The first photo leads the page; the others follow the record text.
  photos: Photo[];
  sources: Source[];
}

// A real-world region. Its airfields and maps are found from their records.
// The body has the sections Historical significance and Forces deployed.
export interface TheatreData {
  kind: 'theatre';
  short?: string;
  name: string;
  region: string;
  countries: Nation[];
  photos: Photo[];
  sources: Source[];
}

// One simulator map: its own coverage and historical setting. The body has a
// Coverage section.
export interface MapData {
  kind: 'map';
  sim: Sim;
  short: string;
  name: string;
  publisher: string;
  setting: Period & { era: keyof typeof eras; text: string };
  area: string;
  theatres?: string[];
  differences?: SimDifference[];
  photos?: Photo[];
  sources: Source[];
}

export type AirfieldCatalogueData = AirfieldData | TheatreData | MapData;

// Terminology records are glossary sets, one per source family (brevity
// words, joint terms, airfield terms, carrier terms). The category page merges
// every set into one A–Z list, so a word defined differently by two sources
// shows both meanings side by side.
export interface Term {
  // The word as the source prints it, such as "BINGO" or "MERGE(D)".
  term: string;
  // Fill-ins the source prints after the word, such as "[direction]".
  form?: string;
  // What an abbreviation stands for.
  expansion?: string;
  definition: string;
  // Who uses the word, when it differs from the set's `usage`.
  usage?: string;
  // Brevity domains from the publication's key, such as "Air-to-air".
  domains?: string[];
  // How the meaning differs between services, NATO or ICAO, with [n] citations.
  note?: string;
  cite: { n: number; page?: string }[];
}

export interface TerminologyData {
  // Short name for the glossary filter buttons.
  short: string;
  usage: string;
  // Leads the set page; the first set's photo is also the category's cover.
  photo?: Photo;
  terms: Term[];
  sources: Source[];
}

// The anchor of a word on the glossary and set pages: "MERGE(D)" is merged,
// "Feet Wet/Dry" is feet-wet-dry. Words sharing an anchor are one glossary entry.
export const termSlug = (term: string) =>
  term.toLowerCase().replace(/[()]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Eras for the aircraft list filter, in display order, set by `era` on each
// aircraft registry entry. Early jets are the first jet generation, retired
// from front-line service.
export const aircraftEras = [
  { slug: 'modern', title: 'Modern' },
  { slug: 'early-jet', title: 'Early jets' },
  { slug: 'wwii', title: 'Second World War' },
] as const;
export type AircraftEra = (typeof aircraftEras)[number]['slug'];
export const aircraftEra = (r: EncyclopediaRecord): AircraftEra => {
  const era = aircraftEras.find((e) => e.slug === (r as { era?: string }).era);
  if (!era) throw new Error(`Aircraft record ${r.id} has no valid era`);
  return era.slug;
};

type RecordFile<T extends Record<string, any> = ThreatData> = MarkdownInstance<T>;
const files = import.meta.glob<RecordFile<Record<string, unknown>>>('/content/encyclopedia/*/*.md', { eager: true });

function contentFile(r: EncyclopediaRecord) {
  const file = files[`/content/encyclopedia/${r.category}/${r.slug}.md`];
  if (!file) throw new Error(`Encyclopedia record ${r.id} has no content file`);
  return file;
}

export const recordContent = (r: EncyclopediaRecord) => contentFile(r) as unknown as RecordFile;
export const aircraftContent = (r: EncyclopediaRecord) => contentFile(r) as unknown as RecordFile<AircraftData>;
export const ordnanceContent = (r: EncyclopediaRecord) => contentFile(r) as unknown as RecordFile<OrdnanceData>;
export const terminologyContent = (r: EncyclopediaRecord) => contentFile(r) as unknown as RecordFile<TerminologyData>;
export const airfieldContent = (r: EncyclopediaRecord) => contentFile(r) as unknown as RecordFile<AirfieldCatalogueData>;

type Entry<T> = { record: EncyclopediaRecord; data: T };

// One DCS map's airfields, as scripts/import_map_airfields.py writes them.
export interface MapAirfieldTable {
  map: string;
  source: { title: string; publisher: string; url: string; commit: string; beacons: boolean; radioFallback?: { title: string; url: string } | null };
  airfields: {
    name: string;
    elevationFt?: number;
    lat?: number;
    lon?: number;
    runways: { name: string; lengthFt?: number; ends: { name: string; heading: number }[] }[];
    radio: { vhf?: number; uhf?: number; vhfLow?: number; hf?: number };
    radioSource?: 'pydcs';
    navaids: { type: string; callsign?: string; channel?: number; band?: 'X' | 'Y'; frequency?: number; unit?: 'kHz' | 'MHz' }[];
    approaches: { type: string; runway: string; callsign?: string; frequency?: number; channel?: number }[];
  }[];
}

export interface AirfieldEntry extends Entry<AirfieldData> { theatres: Entry<TheatreData>[]; maps: (Entry<MapData> & { coverage: MapCoverage })[] }
export interface TheatreEntry extends Entry<TheatreData> { airfields: AirfieldEntry[]; maps: MapEntry[] }
export interface MapEntry extends Entry<MapData> { theatres: Entry<TheatreData>[]; airfields: { airfield: AirfieldEntry; coverage: MapCoverage }[] }

// The categories whose records make up the airfield catalogue.
export const airfieldCategories = ['airfields-carriers', 'theatres'];

// The airfield catalogue, validated once per build: every record in the
// Airfields & Carriers and Theatres categories (theatres and their sim maps), resolved into airfields, theatres and maps with their
// relationships both ways. Throws, failing the build, on any problem.
let catalogue: { airfields: AirfieldEntry[]; theatres: TheatreEntry[]; maps: MapEntry[] } | undefined;
export function airfieldCatalogue() {
  if (catalogue) return catalogue;
  // Validate every registered record, published or not, so a draft cannot hide a broken link.
  const all = records.filter((r) => airfieldCategories.includes(r.category)).map((record) => ({ record, data: airfieldContent(record).frontmatter }));
  const problems = validateCatalogue(all.map(({ record, data }) => ({ slug: record.slug, data })));
  if (problems.length) throw new Error(`Airfield, theatre and sim map records are invalid:\n- ${problems.join('\n- ')}`);
  const shipped = all.filter(({ record }) => includedRecords.includes(record));
  const ofKind = <T extends AirfieldCatalogueData>(kind: T['kind']) => shipped.filter((e): e is Entry<T> => e.data.kind === kind);
  const theatreEntries = ofKind<TheatreData>('theatre');
  const mapEntries = ofKind<MapData>('map');
  const airfields: AirfieldEntry[] = ofKind<AirfieldData>('airfield').map((e) => ({
    ...e,
    theatres: theatreEntries.filter((t) => e.data.theatres?.includes(t.record.slug)),
    maps: (e.data.maps ?? []).flatMap((coverage) => mapEntries.filter((m) => m.record.slug === coverage.map).map((m) => ({ ...m, coverage }))),
  }));
  const maps: MapEntry[] = mapEntries.map((m) => ({
    ...m,
    theatres: theatreEntries.filter((t) => m.data.theatres?.includes(t.record.slug)),
    airfields: airfields.flatMap((airfield) => airfield.maps.filter((x) => x.record === m.record).map(({ coverage }) => ({ airfield, coverage }))),
  }));
  const theatres: TheatreEntry[] = theatreEntries.map((t) => ({
    ...t,
    airfields: airfields.filter((a) => a.theatres.some((x) => x.record === t.record)),
    maps: maps.filter((m) => m.theatres.some((x) => x.record === t.record)),
  }));
  return (catalogue = { airfields, theatres, maps });
}

// The id of an airfield's row in its map's "Airfields on this map" table.
export const mapAirfieldAnchor = (name: string) => `af-${name.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;

const mapTableFiles = import.meta.glob<MapAirfieldTable>('./map-airfields/*.json', { eager: true, import: 'default' });
export const mapAirfieldTables = () => Object.values(mapTableFiles);

// One real airfield as the sims show it, gathered from every map table.
export interface SimAirfield {
  name: string;
  names: string[];
  maps: { map: MapEntry; name: string }[];
  record?: AirfieldEntry;
  theatres: Entry<TheatreData>[];
  longestFt?: number;
}

// Every airfield with a runway on every map, one entry per airfield. Entries
// on two maps less than 3 km apart are the same airfield; where a table gives
// no coordinates (The Channel), the same name on another map is. An airfield
// record claims the entries named in its represented map coverage.
let simList: SimAirfield[] | undefined;
export function simAirfields(): SimAirfield[] {
  if (simList) return simList;
  const { airfields, maps } = airfieldCatalogue();
  const key = (name: string) => mapAirfieldAnchor(name);
  const km = (a: { lat: number; lon: number }, b: { lat: number; lon: number }) => {
    const rad = Math.PI / 180;
    const x = (b.lon - a.lon) * rad * Math.cos(((a.lat + b.lat) / 2) * rad);
    return Math.hypot(x, (b.lat - a.lat) * rad) * 6371;
  };
  const groups: { at?: { lat: number; lon: number }; keys: Set<string>; mapSlugs: Set<string>; record?: AirfieldEntry; maps: SimAirfield['maps']; lengths: number[] }[] = [];
  for (const table of mapAirfieldTables()) {
    const map = maps.find((m) => m.record.slug === table.map);
    if (!map) continue;
    for (const field of table.airfields.filter((x) => x.runways.length)) {
      const at = field.lat !== undefined && field.lon !== undefined ? { lat: field.lat, lon: field.lon } : undefined;
      const record = airfields.find((a) => a.maps.some((x) => x.record === map.record && x.coverage.status === 'represented' && x.coverage.inSimName === field.name));
      let group = groups.find((g) => !g.mapSlugs.has(table.map)
        && (record && g.record ? record === g.record : at && g.at ? km(at, g.at) < 3 : g.keys.has(key(field.name))));
      if (!group) groups.push((group = { at, keys: new Set(), mapSlugs: new Set(), maps: [], lengths: [] }));
      group.at ??= at;
      group.record ??= record;
      group.keys.add(key(field.name));
      group.mapSlugs.add(table.map);
      group.maps.push({ map, name: field.name });
      group.lengths.push(...field.runways.flatMap((r) => r.lengthFt ?? []));
    }
  }
  simList = groups.map((g) => {
    const names = [...new Set(g.maps.map((x) => x.name))];
    return {
      name: g.record?.record.title ?? names[0],
      names,
      maps: g.maps,
      record: g.record,
      theatres: [...new Set(g.maps.flatMap((x) => x.map.theatres))],
      longestFt: g.lengths.length ? Math.max(...g.lengths) : undefined,
    };
  }).sort((a, b) => a.name.localeCompare(b.name, 'en'));
  return simList;
}

export function getRecord(category: string, slug: string): EncyclopediaRecord {
  const found = records.find(r => r.category === category && r.slug === slug);
  if (!found) throw new Error(`Unregistered encyclopedia record: ${category}/${slug}`);
  return found;
}
