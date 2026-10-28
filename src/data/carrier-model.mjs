// Each entry is one physical hull. Renaming and transfer do not create a ship.
export const carrierCutoff = '1945-09-02';
export const carrierAsOf = '2026-10-29';
export const carrierMaturity = 'Drafted — not technically validated';

const text = (value) => typeof value === 'string' && value.trim().length > 0;
const date = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value ?? '') && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;

export function validateCarriers(entries) {
  if (!Array.isArray(entries)) return ['Carriers must be an array.'];
  const problems = [];
  const slugs = new Set();
  const identities = new Set();
  for (const [index, entry] of entries.entries()) {
    const label = entry?.slug || `carrier ${index + 1}`;
    const fail = (message) => problems.push(`${label}: ${message}`);
    if (!entry || typeof entry !== 'object') { fail('record must be an object'); continue; }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.slug ?? '')) fail('slug is missing or invalid');
    if (slugs.has(entry.slug)) fail('duplicate slug');
    slugs.add(entry.slug);
    for (const field of ['name', 'hull', 'class', 'origin', 'summary']) if (!text(entry[field])) fail(`${field} is missing`);
    // Navies reuse pennant numbers for later classes of ship.
    const identity = `${entry.origin}|${entry.class}|${entry.hull}`.toLowerCase();
    if (identities.has(identity)) fail('duplicate origin, class and hull identity');
    identities.add(identity);
    for (const field of ['operators', 'aliases']) {
      if (!Array.isArray(entry[field]) || entry[field].some((x) => !text(x)) || (field === 'operators' && !entry[field].length && !(entry.commissioned === null && entry.completed))) fail(`${field} must be a list of names`);
    }
    const entryDate = carrierEntryDate(entry);
    if (!entryDate) fail('completed or commissioned is required');
    for (const field of ['completed', 'commissioned']) {
      const value = entry[field];
      if (value === undefined || value === null) continue;
      if (!date(value) && !/^\d{4}$/.test(value)) fail(`${field} must be an ISO date or a documented year`);
      else if (/^\d{4}$/.test(value) ? Number(value) <= 1945 || Number(value) > Number(carrierAsOf.slice(0, 4)) : value <= carrierCutoff || value > carrierAsOf) fail(`${field} is outside the post-WWII catalogue dates`);
    }
    if (!Array.isArray(entry.sources) || !entry.sources.length) fail('sources are required');
    for (const source of Array.isArray(entry.sources) ? entry.sources : []) {
      if (!source || !text(source.title) || !text(source.publisher) || !/^https?:\/\//.test(source.url ?? '') || !date(source.accessed)) fail('each source needs a title, publisher, URL and access date');
    }
  }
  return problems;
}

// Completion is used when a ship was delivered without entering commission.
export const carrierEntryDate = (carrier) => carrier.completed ?? carrier.commissioned ?? '';
export const carrierEntryLabel = (carrier) => carrier.completed ? 'Completed' : 'Carrier commission';

export function carrierSearchText(carrier) {
  const original = [carrier.name, carrier.hull, carrier.class, carrier.origin, ...(carrier.operators ?? []), ...(carrier.aliases ?? [])].join(' | ').toLowerCase();
  return `${original} | ${normalizeCarrierSearch(original)}`;
}

export const normalizeCarrierSearch = (value) => value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

export function carrierDate(value) {
  return /^\d{4}$/.test(value) ? value : new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`));
}
