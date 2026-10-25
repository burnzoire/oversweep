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

type RecordFile<T extends Record<string, any> = ThreatData> = MarkdownInstance<T>;
const files = import.meta.glob<RecordFile<Record<string, unknown>>>('/content/encyclopedia/*/*.md', { eager: true });

function contentFile(r: EncyclopediaRecord) {
  const file = files[`/content/encyclopedia/${r.category}/${r.slug}.md`];
  if (!file) throw new Error(`Encyclopedia record ${r.id} has no content file`);
  return file;
}

export const recordContent = (r: EncyclopediaRecord) => contentFile(r) as unknown as RecordFile;
export const aircraftContent = (r: EncyclopediaRecord) => contentFile(r) as unknown as RecordFile<AircraftData>;

export function getRecord(category: string, slug: string): EncyclopediaRecord {
  const found = records.find(r => r.category === category && r.slug === slug);
  if (!found) throw new Error(`Unregistered encyclopedia record: ${category}/${slug}`);
  return found;
}
