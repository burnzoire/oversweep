// The Airfields & Carriers catalogue model, shared by the site build and the
// tests. Three kinds of record live in content/encyclopedia/airfields-carriers:
//
// - `airfield`: one real-world airfield, whatever any simulator does with it.
// - `theatre`: a real-world region with its own military history.
// - `map`: one simulator's representation of a place, with its own coverage
//   and historical setting.
//
// An airfield names the theatres it belongs to and, for each sim map someone
// has checked, whether the map represents it. A map that an airfield does not
// list has not been checked, which is never the same as "absent".
//
// validateCatalogue() checks required fields, controlled values, dates and
// every relationship, and returns a list of problems; the site build throws
// on any, so a broken record cannot ship.

// Countries and territories, for an airfield's location and for the nation an
// operator or unit belongs to. Keys are stable slugs, not ISO codes, so places
// such as the UK Sovereign Base Areas on Cyprus can be named for what they are.
export const nations = {
  us: { name: 'United States' },
  guam: { name: 'Guam', note: 'US territory' },
  'northern-mariana-islands': { name: 'Northern Mariana Islands', note: 'US commonwealth' },
  japan: { name: 'Japan' },
  uk: { name: 'United Kingdom' },
  'akrotiri-dhekelia': { name: 'Akrotiri and Dhekelia', note: 'UK Sovereign Base Areas on Cyprus' },
  turkey: { name: 'Turkey' },
  qatar: { name: 'Qatar' },
  spain: { name: 'Spain' },
  jordan: { name: 'Jordan' },
  iraq: { name: 'Iraq' },
  australia: { name: 'Australia' },
  cyprus: { name: 'Cyprus' },
  syria: { name: 'Syria' },
  lebanon: { name: 'Lebanon' },
  israel: { name: 'Israel' },
};

// The broad kind of organisation an operator or unit is, in any country.
// Names such as "Royal Air Force" or "US Marine Corps" stay in `name`.
export const branches = {
  'air-force': 'Air force',
  navy: 'Navy',
  army: 'Army',
  marines: 'Marines',
  joint: 'Joint or defence-wide',
  civil: 'Civil',
  government: 'Government (non-military)',
};

// What an airfield is used for today; history goes in the record text.
export const airfieldRoles = {
  fighter: 'Fighter and strike',
  bomber: 'Bomber',
  'flight-training': 'Flight training',
  'weapons-school': 'Weapons and tactics school',
  test: 'Flight test',
  'air-mobility': 'Airlift and tanker',
  reconnaissance: 'Reconnaissance and surveillance',
  'special-operations': 'Special operations',
  rescue: 'Search and rescue',
  rotary: 'Helicopter operations',
  headquarters: 'Command headquarters',
  staging: 'Forward staging and deployments',
  'civil-airport': 'Civil airport',
};

// Permanent units are assigned to the airfield; rotational ones take turns on a
// schedule; deployed ones are there temporarily for an operation or exercise.
export const basings = {
  permanent: 'Permanently based',
  rotational: 'Rotational',
  deployed: 'Temporarily deployed',
};

export const sims = {
  dcs: 'DCS World',
  bms: 'Falcon BMS',
  falcon4: 'Falcon 4.0 / Allied Force',
};

// Whether a sim map represents an airfield. `unchecked` lets a record keep a
// sourced remark about a map without claiming either way.
export const coverageStatuses = {
  represented: 'Represented',
  absent: 'Confirmed absent',
  unchecked: 'Not yet checked',
};

export const eras = {
  wwii: 'Second World War',
  'cold-war': 'Cold War',
  modern: 'Present day',
};

// A year, year and month, or full date: "1944", "1944-06" or "1944-06-15".
const DATE = /^\d{4}(-(0[1-9]|1[0-2])(-(0[1-9]|[12]\d|3[01]))?)?$/;
const CITE = /\[\d+\]/;

const isText = (v) => typeof v === 'string' && v.trim().length > 0;
const isNumber = (v) => typeof v === 'number' && Number.isFinite(v);

// The period a fact applies to: `from` and `to` bound it, `asOf` says when a
// source described it as current, and `ended: true` marks a period that is
// over though its end date is not known. All are optional; none at all means the
// sources give no date, which pages show as such.
function checkPeriod(p, where, problems) {
  for (const key of ['from', 'to', 'asOf']) {
    if (p[key] === undefined) continue;
    if (typeof p[key] !== 'string' || !DATE.test(p[key])) problems.push(`${where}: ${key} "${p[key]}" is not a YYYY, YYYY-MM or YYYY-MM-DD date.`);
  }
  if (p.ended !== undefined && p.ended !== true) problems.push(`${where}: ended must be true or left out.`);
  if (DATE.test(p.from ?? '') && DATE.test(p.to ?? '') && p.to < p.from) problems.push(`${where}: ends (${p.to}) before it starts (${p.from}).`);
}

// Every [n] in a cited string must name one of the record's sources.
function checkCites(text, sourceNumbers, where, problems) {
  for (const [, n] of String(text).matchAll(/\[(\d+)\]/g))
    if (!sourceNumbers.has(Number(n))) problems.push(`${where}: cites [${n}], which is not in its sources.`);
}

function checkSources(data, where, problems) {
  if (!Array.isArray(data.sources) || data.sources.length === 0) {
    problems.push(`${where}: has no sources.`);
    return new Set();
  }
  const numbers = new Set();
  for (const s of data.sources) {
    if (!Number.isInteger(s.n) || numbers.has(s.n)) problems.push(`${where}: source number ${s.n} is missing or repeated.`);
    numbers.add(s.n);
    for (const key of ['title', 'publisher', 'url', 'accessed']) if (!isText(s[key])) problems.push(`${where}: source ${s.n} has no ${key}.`);
    if (isText(s.accessed) && !DATE.test(s.accessed)) problems.push(`${where}: source ${s.n} accessed "${s.accessed}" is not a date.`);
  }
  return numbers;
}

function required(data, keys, where, problems) {
  for (const key of keys) if (!isText(data[key])) problems.push(`${where}: ${key} is missing.`);
}

// Requires a cited text: non-empty and with at least one [n] marker.
function cited(text, label, where, sourceNumbers, problems) {
  if (!isText(text)) return problems.push(`${where}: ${label} is missing.`);
  if (!CITE.test(text)) problems.push(`${where}: ${label} has no citation.`);
  checkCites(text, sourceNumbers, `${where} ${label}`, problems);
}

function checkPhotos(data, where, problems, { lead }) {
  const photos = data.photos ?? [];
  if (!Array.isArray(photos)) return problems.push(`${where}: photos must be a list.`);
  if (lead && photos.length === 0) problems.push(`${where}: needs a credited lead photo.`);
  photos.forEach((p, i) => {
    for (const key of ['src', 'alt', 'caption', 'author', 'licence', 'sourceUrl', 'accessed']) if (!isText(p[key])) problems.push(`${where}: photo ${i + 1} has no ${key}.`);
  });
}

function checkAirfield(rec, ctx, problems) {
  const { data } = rec;
  const where = `airfield ${rec.slug}`;
  const nums = checkSources(data, where, problems);
  required(data, ['name'], where, problems);
  if (!['active', 'closed'].includes(data.status)) problems.push(`${where}: status must be active or closed.`);
  if (!nations[data.country]) problems.push(`${where}: country "${data.country}" is not in the nations list.`);
  cited(data.location, 'location', where, nums, problems);
  const c = data.coordinates;
  if (!c || !isNumber(c.lat) || !isNumber(c.lon) || Math.abs(c.lat) > 90 || Math.abs(c.lon) > 180) problems.push(`${where}: coordinates need a latitude and longitude in degrees.`);
  else cited(c.cite, 'coordinates cite', where, nums, problems);
  if (!isNumber(data.elevationFt)) problems.push(`${where}: elevationFt is missing.`);
  cited(data.elevationCite, 'elevationCite', where, nums, problems);
  if (!data.opened || !Number.isInteger(data.opened.year)) problems.push(`${where}: opened.year is missing.`);
  else cited(data.opened.text, 'opened.text', where, nums, problems);
  if (data.status === 'closed' && !(data.closed && Number.isInteger(data.closed.year))) problems.push(`${where}: a closed airfield needs closed.year.`);

  const ids = data.identifiers ?? {};
  for (const [key, pattern] of Object.entries({ icao: /^[A-Z]{4}$/, iata: /^[A-Z]{3}$/, faa: /^[A-Z0-9]{3,4}$/ }))
    if (ids[key] !== undefined && !pattern.test(ids[key])) problems.push(`${where}: ${key} identifier "${ids[key]}" is malformed.`);
  if (ids.others !== undefined && !(Array.isArray(ids.others) && ids.others.every(isText))) problems.push(`${where}: identifiers.others must be a list of codes.`);

  (data.names ?? []).forEach((n, i) => {
    if (!isText(n.name)) problems.push(`${where}: names[${i}] has no name.`);
    cited(n.cite, `names[${i}].cite`, where, nums, problems);
    checkPeriod(n, `${where} name "${n.name}"`, problems);
  });

  if (!Array.isArray(data.roles) || data.roles.length === 0) problems.push(`${where}: roles are missing.`);
  for (const r of data.roles ?? []) if (!airfieldRoles[r]) problems.push(`${where}: unknown role "${r}".`);

  if (!Array.isArray(data.operators) || data.operators.length === 0) problems.push(`${where}: operators are missing.`);
  (data.operators ?? []).forEach((o, i) => {
    const at = `${where} operator ${o.name ?? i}`;
    if (!isText(o.name)) problems.push(`${at}: name is missing.`);
    if (!nations[o.nation]) problems.push(`${at}: nation "${o.nation}" is not in the nations list.`);
    if (!branches[o.branch]) problems.push(`${at}: branch "${o.branch}" is unknown.`);
    cited(o.cite, 'cite', at, nums, problems);
    checkPeriod(o, at, problems);
  });

  (data.units ?? []).forEach((u, i) => {
    const at = `${where} unit ${u.name ?? i}`;
    if (!isText(u.name)) problems.push(`${at}: name is missing.`);
    if (!nations[u.nation]) problems.push(`${at}: nation "${u.nation}" is not in the nations list.`);
    if (!branches[u.branch]) problems.push(`${at}: branch "${u.branch}" is unknown.`);
    // Basing may be left out when the sources do not say; pages then say so.
    if (u.basing !== undefined && !basings[u.basing]) problems.push(`${at}: basing "${u.basing}" is not permanent, rotational or deployed.`);
    if (u.aircraft !== undefined && !(Array.isArray(u.aircraft) && u.aircraft.every(isText))) problems.push(`${at}: aircraft must be a list of names.`);
    cited(u.cite, 'cite', at, nums, problems);
    checkPeriod(u, at, problems);
  });

  const f = data.facilities;
  if (!f || !Array.isArray(f.runways) || f.runways.length === 0) problems.push(`${where}: facilities.runways are missing.`);
  else {
    if (f.asOf !== undefined && !DATE.test(f.asOf)) problems.push(`${where}: facilities.asOf "${f.asOf}" is not a date.`);
    f.runways.forEach((r, i) => {
      const at = `${where} runway ${r.id ?? i}`;
      if (!isText(r.id)) problems.push(`${at}: id is missing.`);
      if (r.lengthFt !== null && !isNumber(r.lengthFt)) problems.push(`${at}: lengthFt must be a number, or null when unknown.`);
      if (r.widthFt !== undefined && r.widthFt !== null && !isNumber(r.widthFt)) problems.push(`${at}: widthFt must be a number.`);
      cited(r.cite, 'cite', at, nums, problems);
    });
    for (const key of ['arresting', 'navaids', 'other']) {
      if (f[key] === undefined) continue;
      if (!Array.isArray(f[key])) problems.push(`${where}: facilities.${key} must be a list.`);
      else f[key].forEach((t, i) => cited(t, `facilities.${key}[${i}]`, where, nums, problems));
    }
  }

  for (const t of data.theatres ?? []) if (!ctx.theatres.has(t)) problems.push(`${where}: names unknown theatre "${t}".`);
  const seen = new Set();
  (data.maps ?? []).forEach((m, i) => {
    const at = `${where} map ${m.map ?? i}`;
    if (!ctx.maps.has(m.map)) problems.push(`${at}: no map record "${m.map}".`);
    if (seen.has(m.map)) problems.push(`${at}: listed twice.`);
    seen.add(m.map);
    if (!coverageStatuses[m.status]) problems.push(`${at}: status must be represented, absent or unchecked.`);
    if (!isText(m.checked) || !DATE.test(m.checked)) problems.push(`${at}: checked must be the date the map was checked.`);
    // A coverage claim either way needs a source; a remark on an unchecked map needs one too.
    if (m.status !== 'unchecked' || m.note) cited(m.cite, 'cite', at, nums, problems);
    if (m.status === 'unchecked' && !m.note) problems.push(`${at}: an unchecked map entry needs a note saying why it is listed.`);
    if (m.status !== 'represented' && (m.facts?.length || m.differences?.length)) problems.push(`${at}: only a represented airfield can have sim facts or differences.`);
    if (m.note) checkCites(m.note, nums, `${at} note`, problems);
    (m.facts ?? []).forEach((t, j) => cited(t, `facts[${j}]`, at, nums, problems));
    (m.differences ?? []).forEach((d, j) => {
      if (!isText(d.topic)) problems.push(`${at}: differences[${j}] has no topic.`);
      cited(d.text, `differences[${j}].text`, at, nums, problems);
    });
  });

  for (const ch of data.charts ?? []) for (const key of ['src', 'alt', 'caption', 'chart', 'publisher', 'sourceUrl', 'accessed']) if (!isText(ch[key])) problems.push(`${where}: a chart has no ${key}.`);
  if (data.runwayPlan) {
    cited(data.runwayPlan.cite, 'runwayPlan.cite', where, nums, problems);
    for (const r of data.runwayPlan.runways ?? [])
      if (!isText(r.id) || !isNumber(r.widthFt) || r.ends?.length !== 2 || !r.ends.flat().every(isNumber)) problems.push(`${where}: runwayPlan runway ${r.id} needs an id, a width and two [lat, lon] ends.`);
  }
  checkPhotos(data, where, problems, { lead: true });
}

function checkTheatre(rec, problems) {
  const { data } = rec;
  const where = `theatre ${rec.slug}`;
  const nums = checkSources(data, where, problems);
  // The region is the theatre's own definition, so it needs no citation.
  required(data, ['name', 'region'], where, problems);
  if (!Array.isArray(data.countries) || data.countries.length === 0) problems.push(`${where}: countries are missing.`);
  for (const c of data.countries ?? []) if (!nations[c]) problems.push(`${where}: country "${c}" is not in the nations list.`);
  checkPhotos(data, where, problems, { lead: true });
}

function checkMap(rec, ctx, problems) {
  const { data } = rec;
  const where = `map ${rec.slug}`;
  const nums = checkSources(data, where, problems);
  required(data, ['name', 'short', 'publisher'], where, problems);
  if (!sims[data.sim]) problems.push(`${where}: sim "${data.sim}" is unknown.`);
  const s = data.setting;
  if (!s || !eras[s.era]) problems.push(`${where}: setting.era must be one of ${Object.keys(eras).join(', ')}.`);
  else {
    cited(s.text, 'setting.text', where, nums, problems);
    checkPeriod(s, `${where} setting`, problems);
  }
  cited(data.area, 'area', where, nums, problems);
  for (const t of data.theatres ?? []) if (!ctx.theatres.has(t)) problems.push(`${where}: names unknown theatre "${t}".`);
  // Differences at places that have no airfield record, such as a renamed airport.
  (data.differences ?? []).forEach((d, j) => {
    if (!isText(d.topic)) problems.push(`${where}: differences[${j}] has no topic.`);
    cited(d.text, `differences[${j}].text`, where, nums, problems);
  });
  checkPhotos(data, where, problems, { lead: false });
}

// `entries` are { slug, data } for every record in the category, data being
// the content file's frontmatter. Returns a list of problems, empty when valid.
export function validateCatalogue(entries) {
  const problems = [];
  const byKind = (kind) => entries.filter((e) => e.data?.kind === kind);
  for (const e of entries) if (!['airfield', 'theatre', 'map'].includes(e.data?.kind)) problems.push(`${e.slug}: kind must be airfield, theatre or map.`);
  const ctx = { theatres: new Set(byKind('theatre').map((e) => e.slug)), maps: new Set(byKind('map').map((e) => e.slug)) };
  for (const e of byKind('airfield')) checkAirfield(e, ctx, problems);
  for (const e of byKind('theatre')) checkTheatre(e, problems);
  for (const e of byKind('map')) checkMap(e, ctx, problems);
  return problems;
}

// Facts derived for display, search and comparison, so no number is typed twice.

// The longest paved runway, in feet, or null when no length is known.
export function longestRunwayFt(runways) {
  const lengths = runways.filter((r) => !r.unpaved && isNumber(r.lengthFt)).map((r) => r.lengthFt);
  return lengths.length ? Math.max(...lengths) : null;
}


export const useLabels = { military: 'Military', joint: 'Joint military and civil', civil: 'Civil', none: 'No current operator' };

// Military, joint military and civil, or civil, from the operators that have
// no end date.
/** @returns {keyof typeof useLabels} */
export function currentUse(operators) {
  const now = operators.filter((o) => !hasEnded(o));
  const military = now.some((o) => o.branch !== 'civil' && o.branch !== 'government');
  const civil = now.some((o) => o.branch === 'civil' || o.branch === 'government');
  return military && civil ? 'joint' : civil ? 'civil' : military ? 'military' : 'none';
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// "1944", "Jun 1944" or "18 Jun 1944".
export function dateText(date) {
  const [year, month, day] = date.split('-');
  if (!month) return year;
  return [day && Number(day), MONTHS[Number(month) - 1], year].filter(Boolean).join(' ');
}

// A fact that has ended carries `to`, or `ended: true` when its end date is
// not known; one without either is taken to hold still.
export const hasEnded = (p) => p.to !== undefined || p.ended === true;

// "1957–1969", "since 1975", "from 1948 (end not given)", "until 1945",
// "as of Oct 2026", or null when the sources give no date.
export function periodText(p) {
  const from = p.from && dateText(p.from);
  const to = p.to && dateText(p.to);
  const asOf = p.asOf && `as of ${dateText(p.asOf)}`;
  let text = null;
  if (from && to) text = from === to ? from : `${from}${from.includes(' ') || to.includes(' ') ? ' – ' : '–'}${to}`;
  else if (from) text = p.ended ? `from ${from}, end not given` : `since ${from}`;
  else if (to) text = `until ${to}`;
  if (asOf && !(from && to)) text = text ? `${text}; ${asOf}` : asOf;
  if (!text && p.ended) text = 'ended, dates not given';
  return text;
}

// Every name, identifier and alias someone might search for, lower-cased.
export function searchTerms(slug, data, mapNames = []) {
  const ids = Object.values(data.identifiers ?? {}).flat();
  return [data.name, data.short, slug, ...(data.names ?? []).map((n) => n.name), ...ids, ...mapNames]
    .filter(Boolean)
    .join(' | ')
    .toLowerCase();
}
