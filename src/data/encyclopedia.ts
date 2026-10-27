import type { MarkdownInstance } from 'astro';
import registry from './encyclopedia.json';
import { reviewTrainers } from './experiences';

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

// The services that run the bases on the Airfields & Carriers list, shown as
// a label on each base; the list itself is grouped by theatre.
export const airfieldGroups = [
  { slug: 'air-force', title: 'Air Force base' },
  { slug: 'navy', title: 'Naval air station' },
  { slug: 'marine-corps', title: 'Marine Corps air station' },
  { slug: 'army', title: 'Army airfield' },
] as const;

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

// Simulators whose theatres the Airfields & Carriers records are grouped by.
export const sims = {
  dcs: 'DCS World',
  bms: 'Falcon BMS',
  falcon4: 'Falcon 4.0 / Allied Force',
} as const;
export type Sim = keyof typeof sims;

// Where a sim represents a theatre or base: `product` names the map or
// theatre, as cited text with [n] markers; `notes` says what it covers.
export interface SimCoverage {
  sim: Sim;
  product: string;
  notes?: string;
}

// A cited way a sim differs from the real place, such as a frequency, a name
// or a facility that has since closed.
export interface SimDifference {
  sim: Sim;
  topic: string;
  text: string;
}

// Theatre records group the bases a sim map covers. Their order on the list
// is their order in the registry. The body has the sections Era, Historical
// significance and Forces deployed.
export interface TheatreData {
  kind: 'theatre';
  short?: string;
  name: string;
  // When the theatre is set, as cited text, such as "Present day [2]".
  era: string;
  region: string;
  sims: SimCoverage[];
  simDifferences?: SimDifference[];
  photos: Photo[];
  sources: Source[];
}

// Air base records: the data plate gives cited text; `quick` holds the
// comparison table's columns. `theatre` names the theatre record whose sim map
// covers the base; bases no sim covers leave it out and are listed after the
// theatres. `group` is the service that runs the base, shown as a label.
export interface AirbaseData {
  kind: 'base';
  theatre?: string;
  sims: SimCoverage[];
  simDifferences?: SimDifference[];
  group: (typeof airfieldGroups)[number]['slug'];
  // Short label for the record nav when the title is too long.
  short?: string;
  name: string;
  location: string;
  operator: string;
  opened: string;
  elevation: string;
  runways: string[];
  arrestingGear?: string;
  navaids?: string[];
  units: string[];
  // FAA airport diagrams for US fields; `runwayPlan` draws the runways of
  // fields without one, from the coordinates its `cite` names. (Astro reserves
  // the frontmatter key `layout`.)
  charts?: Chart[];
  runwayPlan?: { runways: RunwayLine[]; cite: string };
  // The first photo leads the page; the others follow the record text.
  photos: Photo[];
  quick: { opened: number; elevationFt: number; longestRunwayFt: number };
  sources: Source[];
}

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
export const airfieldContent = (r: EncyclopediaRecord) => contentFile(r) as unknown as RecordFile<AirbaseData | TheatreData>;

// The Airfields & Carriers list: theatres in registry order, each with the
// bases its sim maps cover, then the bases no sim covers.
export function theatreList() {
  const entries = categoryRecords('airfields-carriers').map((record) => ({ record, data: airfieldContent(record).frontmatter }));
  const bases = entries.filter((e): e is { record: EncyclopediaRecord; data: AirbaseData } => e.data.kind === 'base');
  const theatres = entries
    .filter((e): e is { record: EncyclopediaRecord; data: TheatreData } => e.data.kind === 'theatre')
    .map((t) => ({ ...t, bases: bases.filter((b) => b.data.theatre === t.record.slug) }));
  for (const b of bases) {
    if (b.data.theatre && !theatres.some((t) => t.record.slug === b.data.theatre))
      throw new Error(`Air base ${b.record.id} names unknown theatre "${b.data.theatre}"`);
  }
  return { theatres, outside: bases.filter((b) => !b.data.theatre) };
}

export function getRecord(category: string, slug: string): EncyclopediaRecord {
  const found = records.find(r => r.category === category && r.slug === slug);
  if (!found) throw new Error(`Unregistered encyclopedia record: ${category}/${slug}`);
  return found;
}
