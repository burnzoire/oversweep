import { carrierAsOf } from './carrier-model.mjs';

const text = (value) => typeof value === 'string' && value.trim().length > 0;
const slug = (value) => typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
const date = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value ?? '') && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
const historicDate = (value, asOf) => typeof value === 'string' && (date(value) ? value <= asOf : /^\d{4}$/.test(value) && Number(value) > 0 && value <= asOf.slice(0, 4));
const webUrl = (value) => { try { return ['https:', 'http:'].includes(new URL(value).protocol); } catch { return false; } };

// Profile sources are scoped to a class or a hull: citation IDs never cross records.
export function validateCarrierProfiles(data, carriers) {
  if (!data || !Array.isArray(data.classes) || !Array.isArray(data.ships)) return ['Carrier profiles need classes and ships arrays.'];
  const problems = [];
  const classes = new Map();
  const registryClasses = new Set();
  const registry = new Map(carriers.map((carrier) => [carrier.slug, carrier]));
  function claims(entry, label, asOf) {
    const fail = (message) => problems.push(`${label}: ${message}`);
    const ids = new Set();
    if (!Array.isArray(entry.sources) || !entry.sources.length) fail('sources are required');
    for (const source of Array.isArray(entry.sources) ? entry.sources : []) {
      if (!source || !slug(source.id) || !text(source.title) || !text(source.publisher) || !webUrl(source.url) || !date(source.accessed)) {
        fail('each source needs a valid id, title, publisher, URL and access date');
        continue;
      }
      if (ids.has(source.id)) fail(`duplicate source id ${source.id}`);
      ids.add(source.id);
      if (source.accessed > asOf) fail(`source ${source.id} accessed after profile snapshot`);
    }
    return (claim, location) => {
      if (!claim || !Array.isArray(claim.cites) || !claim.cites.length) fail(`${location} requires citations`);
      else for (const id of claim.cites) if (!ids.has(id)) fail(`${location} cites unknown source ${id}`);
    };
  }
  for (const [index, entry] of data.classes.entries()) {
    const label = entry?.slug || `class ${index + 1}`;
    const fail = (message) => problems.push(`${label}: ${message}`);
    if (!entry || typeof entry !== 'object') { fail('record must be an object'); continue; }
    if (!slug(entry.slug)) fail('class slug is missing or invalid');
    if (classes.has(entry.slug)) fail('duplicate class slug');
    classes.set(entry.slug, entry);
    for (const field of ['name', 'registryClass', 'summary']) if (!text(entry[field])) fail(`${field} is missing`);
    if (registryClasses.has(entry.registryClass)) fail('duplicate registry class');
    registryClasses.add(entry.registryClass);
    if (!carriers.some((carrier) => carrier.class === entry.registryClass)) fail('registryClass does not match a carrier class');
    if (!date(entry.asOf) || entry.asOf > carrierAsOf) fail('asOf must be a valid date no later than the catalogue snapshot');
    const cite = claims(entry, label, date(entry.asOf) ? entry.asOf : carrierAsOf);
    cite({ cites: entry.summaryCites }, 'summary');
    if (!Array.isArray(entry.facts) || !entry.facts.length) fail('facts are required');
    for (const fact of Array.isArray(entry.facts) ? entry.facts : []) {
      if (!text(fact?.label) || !text(fact?.value)) fail('each fact needs a label and value');
      cite(fact, 'fact');
    }
    if (!Array.isArray(entry.sections) || !entry.sections.length) fail('sections are required');
    for (const section of Array.isArray(entry.sections) ? entry.sections : []) {
      if (!text(section?.title) || !text(section?.text)) fail('each section needs a title and text');
      cite(section, 'section');
    }
  }
  const seenShips = new Set();
  for (const [index, entry] of data.ships.entries()) {
    const label = entry?.carrier || `ship profile ${index + 1}`;
    const fail = (message) => problems.push(`${label}: ${message}`);
    if (!entry || typeof entry !== 'object') { fail('record must be an object'); continue; }
    if (seenShips.has(entry.carrier)) fail('duplicate ship profile');
    seenShips.add(entry.carrier);
    const carrier = registry.get(entry.carrier);
    if (!carrier) fail('carrier must reference an existing exact registry slug');
    const profile = data.classes.find((item) => item?.registryClass === carrier?.class);
    if (!profile) fail('carrier must belong to an exact matching class profile');
    const asOf = date(profile?.asOf) ? profile.asOf : carrierAsOf;
    const cite = claims(entry, label, asOf);
    if (!text(entry.overview?.text)) fail('overview text is required');
    cite(entry.overview, 'overview');
    if (!Array.isArray(entry.milestones) || !entry.milestones.length) fail('milestones are required');
    for (const milestone of Array.isArray(entry.milestones) ? entry.milestones : []) {
      if (!historicDate(milestone?.date, asOf)) fail('milestone date must be a valid ISO date or year no later than the snapshot');
      if (!text(milestone?.text)) fail('milestone text is required');
      cite(milestone, 'milestone');
    }
  }
  return problems;
}

export const carrierClassRoute = (profile) => `encyclopedia/carriers/classes/${profile.slug}/`;
