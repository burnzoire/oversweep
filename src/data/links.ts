import { categoryRecords, includedRecords, records, recordRoute, termSlug, terminologyContent, type Term } from './encyclopedia';
import { sitePath } from '../lib/paths';

// What a <Term> link shows: where it goes and a short preview, built from the
// one glossary or encyclopedia record so no page copies a definition.
export interface LinkTarget {
  href: string;
  // The record's name, as the glossary or encyclopedia prints it.
  title: string;
  // What kind of entry it is, such as "Brevity" or "Aircraft".
  kind: string;
  lines: { label?: string; text: string }[];
  // Meanings left out of the preview, for words defined by several sets.
  more: number;
}

const categoryNames: Record<string, string> = { aircraft: 'Aircraft', ordnance: 'Ordnance', 'threat-systems': 'Threat system' };

// Previews are a reminder, not the entry: citations are dropped and a long
// definition is cut at a word boundary.
const PREVIEW_CHARS = 220;
export function previewText(text: string) {
  const plain = text.replace(/\s*\[\d+\]/g, '').trim();
  if (plain.length <= PREVIEW_CHARS) return plain;
  return `${plain.slice(0, plain.lastIndexOf(' ', PREVIEW_CHARS)).replace(/[,;:.]$/, '')}…`;
}

const sets = categoryRecords('terminology').map((r) => terminologyContent(r).frontmatter);
const glossary = new Map<string, { word: string; senses: { set: string; term: Term }[] }>();
for (const set of sets) {
  for (const term of set.terms) {
    const slug = termSlug(term.term);
    const entry = glossary.get(slug) ?? glossary.set(slug, { word: term.term, senses: [] }).get(slug)!;
    entry.senses.push({ set: set.short, term });
  }
}

// One meaning of a glossary word in full, for a module's terms list: the set
// named by its short name ("Carrier"), narrowed by `usage` where a set
// gives a word two meanings, or the word's first set. Citations are
// dropped; the list links each word to its entry, which carries them.
export function termSense(word: string, set?: string, usage?: string) {
  const slug = termSlug(word);
  const sense = glossary.get(slug)?.senses.find((s) => (!set || s.set === set) && (!usage || s.term.usage === usage));
  if (!sense) throw new Error(`No glossary entry for "${word}"${set ? ` in ${set}` : ''}`);
  const { term } = sense;
  return { href: `${sitePath('encyclopedia/terminology/')}#${slug}`, expansion: term.expansion, definition: term.definition.replace(/\s*\[\d+\]/g, '') };
}

// A glossary word, by the word itself ("Final Bearing") or its anchor
// ("final-bearing"). A phrase such as "Fence in / fence out" falls back to its
// first word. Undefined when the glossary has no such entry.
export function termTarget(word: string): LinkTarget | undefined {
  const slug = [termSlug(word), termSlug(word.split(/[ /]/)[0])].find((s) => glossary.has(s));
  if (!slug) return undefined;
  const entry = glossary.get(slug)!;
  const shown = entry.senses.slice(0, 2);
  return {
    href: `${sitePath('encyclopedia/terminology/')}#${slug}`,
    title: entry.word,
    kind: 'Glossary',
    lines: shown.map(({ set, term }) => ({ label: set, text: previewText(`${term.expansion ? `${term.expansion}. ` : ''}${term.definition}`) })),
    more: entry.senses.length - shown.length,
  };
}

// An aircraft, ordnance or threat-system record by its slug ("f-14") or
// "category/slug". Throws for a slug the registry does not know; undefined for
// a record left out of this build, so the page shows plain text instead.
export function recordTarget(ref: string): LinkTarget | undefined {
  const [category, slug] = ref.includes('/') ? ref.split('/') : [undefined, ref];
  const found = records.filter((r) => r.slug === slug && r.category !== 'terminology' && (!category || r.category === category));
  if (found.length !== 1) throw new Error(found.length ? `Encyclopedia slug "${ref}" is ambiguous; use category/slug` : `No encyclopedia record "${ref}"`);
  const r = found[0];
  if (!includedRecords.includes(r)) return undefined;
  return { href: sitePath(recordRoute(r)), title: r.title, kind: categoryNames[r.category] ?? r.category, lines: [{ text: previewText(r.summary) }], more: 0 };
}
