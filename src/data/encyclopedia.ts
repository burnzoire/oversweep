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
  // Symbols from the cited RWR threat table; empty when the system has none.
  rwr: { symbol: string; emitter: string }[];
  rwrNote?: string;
  battery?: { pattern: 'ring' | 'group'; spacing?: string; items: BatteryItem[] };
  sources: Source[];
}

type RecordFile = MarkdownInstance<ThreatData>;
const files = import.meta.glob<RecordFile>('/content/encyclopedia/*/*.md', { eager: true });

export function recordContent(r: EncyclopediaRecord): RecordFile {
  const file = files[`/content/encyclopedia/${r.category}/${r.slug}.md`];
  if (!file) throw new Error(`Encyclopedia record ${r.id} has no content file`);
  return file;
}

export function getRecord(category: string, slug: string): EncyclopediaRecord {
  const found = records.find(r => r.category === category && r.slug === slug);
  if (!found) throw new Error(`Unregistered encyclopedia record: ${category}/${slug}`);
  return found;
}
