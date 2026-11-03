// Weather and Performance: a METAR and TAF decoder for the US code the FAA
// handbook describes, pressure and density altitude, and weight and balance.
// Pure functions, no DOM.
//
// Sources (as cited on the page): FAA Pilot's Handbook of Aeronautical
// Knowledge, FAA-H-8083-25B: METAR pp. 13-6 to 13-8 (with Figures 13-5 and
// 13-6), TAF p. 13-9, pressure and density altitude p. 11-3 and the altimeter
// table (Figure 11-4), the density altitude example p. 8-7, weight and balance
// pp. 10-4 to 10-6. The standard atmosphere constants are the ISA's.

const INTENSITY = { '-': 'light', '+': 'heavy', VC: 'in the vicinity' };
const DESCRIPTOR = { MI: 'shallow', BC: 'patches of', DR: 'low drifting', BL: 'blowing', SH: 'showers of', TS: 'thunderstorm with', FZ: 'freezing', PR: 'partial' };
const PHENOMENA = {
  DZ: 'drizzle', RA: 'rain', SN: 'snow', SG: 'snow grains', IC: 'ice crystals', PL: 'ice pellets', GR: 'hail', GS: 'small hail or snow pellets', UP: 'unknown precipitation',
  BR: 'mist', FG: 'fog', FU: 'smoke', DU: 'dust', SA: 'sand', HZ: 'haze', PY: 'spray', VA: 'volcanic ash',
  PO: 'dust or sand whirls', SQ: 'squalls', FC: 'funnel cloud', SS: 'sandstorm', DS: 'dust storm',
};
export const COVER = { SKC: ['clear', 0], CLR: ['clear', 0], FEW: ['few', 2], SCT: ['scattered', 4], BKN: ['broken', 7], OVC: ['overcast', 8] };
const COVER_TEXT = { FEW: '1 to 2 eighths', SCT: '3 to 4 eighths', BKN: '5 to 7 eighths', OVC: '8 eighths' };
const WX = new RegExp(`^(\\+|-|VC)?(${Object.keys(DESCRIPTOR).join('|')})?((?:${Object.keys(PHENOMENA).join('|')})+)$`);

function weatherMeaning(tok) {
  const m = WX.exec(tok);
  if (!m) return undefined;
  const ph = m[3].match(/.{2}/g).map((p) => PHENOMENA[p]).join(' and ');
  const desc = m[2] ? `${DESCRIPTOR[m[2]]} ` : '';
  const int = m[1] === '+' || m[1] === '-' ? `${INTENSITY[m[1]]} ` : '';
  const near = m[1] === 'VC' ? ' in the vicinity (5 to 10 miles)' : '';
  if (m[2] === 'TS') return `thunderstorm with ${int}${ph}${near}`.replace(/^./, (c) => c.toUpperCase());
  return `${int}${desc}${ph}${near}`.replace(/^./, (c) => c.toUpperCase());
}

const hundreds = (s) => Number(s) * 100;
const fmtFt = (ft) => `${ft.toLocaleString('en-US')} ft`;

// One token in a report body (shared by METAR and TAF).
export function decodeToken(tok, ctx = {}) {
  let m;
  if (ctx.remarks) return { kind: 'remark', text: tok === 'PRESFR' ? 'Pressure falling rapidly' : tok === 'PRESRR' ? 'Pressure rising rapidly' : tok === 'AO1' ? 'Automated station without a precipitation discriminator' : tok === 'AO2' ? 'Automated station with a precipitation discriminator' : 'Remark' };
  if (tok === 'METAR' || tok === 'SPECI') return { kind: 'type', text: tok === 'METAR' ? 'Routine report' : 'Special report, issued between routine ones' };
  if (tok === 'TAF') return { kind: 'type', text: 'Terminal aerodrome forecast' };
  if (tok === 'AMD') return { kind: 'type', text: 'Amended forecast' };
  if (tok === 'AUTO') return { kind: 'modifier', text: 'From an automated station' };
  if (tok === 'COR') return { kind: 'modifier', text: 'Corrected report, replacing one with an error' };
  if (tok === 'RMK') return { kind: 'remark', text: 'Remarks follow' };
  if ((m = /^(\d{2})(\d{2})(\d{2})Z$/.exec(tok))) return { kind: 'time', text: `Day ${Number(m[1])}, ${m[2]}${m[3]} UTC (Zulu)` };
  if ((m = /^(\d{2})(\d{2})\/(\d{2})(\d{2})$/.exec(tok))) return { kind: 'period', text: `From day ${Number(m[1])} ${m[2]}00Z to day ${Number(m[3])} ${m[4]}00Z` };
  if ((m = /^(\d{3}|VRB)(\d{2,3})(?:G(\d{2,3}))?KT$/.exec(tok))) {
    if (m[1] === '000' && Number(m[2]) === 0) return { kind: 'wind', text: 'Wind calm' };
    return { kind: 'wind', text: `Wind ${m[1] === 'VRB' ? 'variable' : `from ${m[1]}° true`} at ${Number(m[2])} kt${m[3] ? `, gusting ${Number(m[3])}` : ''}`, wind: { from: m[1] === 'VRB' ? null : Number(m[1]), kt: Number(m[2]), gust: m[3] ? Number(m[3]) : null } };
  }
  if ((m = /^(\d{3})V(\d{3})$/.exec(tok))) return { kind: 'wind', text: `Wind direction varying between ${m[1]}° and ${m[2]}°` };
  if ((m = /^(P|M)?(\d+\/\d+|\d+)SM$/.exec(tok))) {
    const v = m[2].includes('/') ? m[2].split('/').reduce((a, b) => Number(a) / Number(b)) : Number(m[2]);
    const words = m[2].replace('1/2', '½').replace('3/4', '¾').replace('1/4', '¼');
    return { kind: 'visibility', text: `Visibility ${m[1] === 'P' ? 'more than ' : m[1] === 'M' ? 'less than ' : ''}${words} statute mile${v > 1 || m[1] === 'P' ? 's' : ''}`, vis: v + (m[1] === 'P' ? 0.1 : 0) };
  }
  if ((m = /^R(\d{2}[LRC]?)\/(\d{4})FT$/.exec(tok))) return { kind: 'rvr', text: `Runway visual range on runway ${m[1]}: ${fmtFt(Number(m[2]))}` };
  if ((m = /^(FEW|SCT|BKN|OVC)(\d{3})(CB|TCU)?$/.exec(tok))) {
    const ft = hundreds(m[2]);
    const type = m[3] === 'CB' ? ', cumulonimbus' : m[3] === 'TCU' ? ', towering cumulus' : '';
    return { kind: 'sky', text: `${COVER[m[1]][0][0].toUpperCase()}${COVER[m[1]][0].slice(1)} (${COVER_TEXT[m[1]]}) at ${fmtFt(ft)} above ground${type}`, layer: { cover: m[1], ft } };
  }
  if ((m = /^VV(\d{3})$/.exec(tok))) return { kind: 'sky', text: `Sky obscured, vertical visibility ${fmtFt(hundreds(m[1]))}`, layer: { cover: 'VV', ft: hundreds(m[1]) } };
  if (tok === 'SKC' || tok === 'CLR') return { kind: 'sky', text: 'Sky clear' };
  if ((m = /^(M?\d{2})\/(M?\d{2})$/.exec(tok))) {
    const c = (s) => Number(s.replace('M', '-'));
    return { kind: 'temperature', text: `Temperature ${c(m[1])} °C, dew point ${c(m[2])} °C`, temp: c(m[1]), dew: c(m[2]) };
  }
  if ((m = /^A(\d{2})(\d{2})$/.exec(tok))) return { kind: 'altimeter', text: `Altimeter setting ${m[1]}.${m[2]} inches of mercury`, altimeter: Number(`${m[1]}.${m[2]}`) };
  const wx = weatherMeaning(tok);
  if (wx) return { kind: 'weather', text: wx };
  if (/^[A-Z][A-Z0-9]{3}$/.test(tok) && ctx.index !== undefined && ctx.index <= 2) return { kind: 'station', text: `Station ${tok} (ICAO identifier; K is the contiguous US)` };
  return { kind: 'unknown', text: 'Not decoded here: another country\'s variant of the code, or a group this decoder does not cover' };
}

// The ceiling: the lowest broken or overcast layer, or a vertical visibility.
export function ceilingOf(layers) {
  const c = layers.filter((l) => l.cover === 'BKN' || l.cover === 'OVC' || l.cover === 'VV').map((l) => l.ft);
  return c.length ? Math.min(...c) : null;
}

export function decodeMetar(text) {
  const toks = text.trim().toUpperCase().split(/\s+/).filter(Boolean);
  let remarks = false;
  const parts = toks.map((tok, index) => {
    const d = decodeToken(tok, { remarks, index });
    if (tok === 'RMK') remarks = true;
    return { tok, ...d };
  });
  const layers = parts.filter((p) => p.layer).map((p) => p.layer);
  return { parts, ceiling: ceilingOf(layers), vis: parts.find((p) => p.vis !== undefined)?.vis ?? null };
}

// TAF: split into the base forecast and its change groups, each with its
// start and end in hours from the start of the valid period.
export function decodeTaf(text) {
  const toks = text.trim().toUpperCase().split(/\s+/).filter(Boolean);
  const vi = toks.findIndex((t) => /^\d{4}\/\d{4}$/.test(t));
  if (vi < 0) throw new Error('No valid period');
  const [d1, h1, d2, h2] = toks[vi].match(/\d{2}/g).map(Number);
  const hour = (d, h, m = 0) => (d - d1) * 24 + (h - h1) + m / 60;
  const end = hour(d2, h2);
  const groups = [];
  let cur = { type: 'BASE', start: 0, toks: [] };
  const push = () => { groups.push(cur); };
  for (let i = vi + 1; i < toks.length; i++) {
    const t = toks[i];
    let m;
    if ((m = /^FM(\d{2})(\d{2})(\d{2})$/.exec(t))) { push(); cur = { type: 'FM', start: hour(+m[1], +m[2], +m[3]), toks: [] }; continue; }
    if ((m = /^FM(\d{2})(\d{2})$/.exec(t))) { push(); cur = { type: 'FM', start: hour(d1 + (+m[1] < h1 ? 1 : 0), +m[1], +m[2]), toks: [] }; continue; }
    if (t === 'TEMPO' || /^PROB\d{2}$/.test(t)) {
      const p = /^\d{4}\/\d{4}$/.test(toks[i + 1]) ? toks[i + 1].match(/\d{2}/g).map(Number) : null;
      push();
      cur = { type: t, start: p ? hour(p[0], p[1]) : 0, end: p ? hour(p[2], p[3]) : end, toks: [] };
      if (p) i++;
      continue;
    }
    cur.toks.push(t);
  }
  push();
  // Prevailing groups (base and FM) run until the next prevailing group.
  const prevailing = groups.filter((g) => g.type === 'BASE' || g.type === 'FM');
  prevailing.forEach((g, i) => { g.end = i + 1 < prevailing.length ? prevailing[i + 1].start : end; });
  for (const g of groups) {
    g.parts = g.toks.map((tok) => ({ tok, ...decodeToken(tok) }));
    g.ceiling = ceilingOf(g.parts.filter((p) => p.layer).map((p) => p.layer));
    g.vis = g.parts.find((p) => p.vis !== undefined)?.vis ?? null;
  }
  return { station: toks[vi - 2], issued: toks[vi - 1], hours: end, groups };
}

// The FAA handbook's examples, and invented ones labelled so on the page.
export const METARS = [
  { label: 'The FAA handbook example', text: 'METAR KGGG 161753Z AUTO 14021G26KT 3/4SM +TSRA BR BKN008 OVC012CB 18/17 A2970 RMK PRESFR' },
  { label: 'Invented: a good day', text: 'METAR KXYZ 031455Z 27012KT 10SM FEW040 SCT250 21/08 A3002' },
  { label: 'Invented: low cloud and fog', text: 'SPECI KXYZ 030812Z 00000KT 1/2SM R27/2400FT FG VV002 09/09 A2995' },
  { label: 'Invented: snow showers, gusts', text: 'METAR KXYZ 032255Z 31018G30KT 2SM -SHSN BKN015 OVC025 M04/M08 A2968 RMK AO2' },
];
// The handbook's printed code leaves out the base forecast that its own
// explanation gives (wind 150° at 12 kt, over 6 SM, broken at 9,000 ft); it is
// restored here and the page says so.
export const TAF_EXAMPLE = 'TAF KPIR 111130Z 1112/1212 15012KT P6SM BKN090 TEMPO 1112/1114 5SM BR FM1500 16015G25KT P6SM SCT040 BKN250 FM120000 14012KT P6SM BKN080 OVC150 PROB30 1200/1204 3SM TSRA BKN030CB FM120400 14008KT P6SM SCT040 OVC080 TEMPO 1204/1208 3SM TSRA OVC030CB';

// Pressure altitude from the altimeter setting: the handbook's table of
// corrections to add to (or subtract from) field elevation, interpolated.
export const ALTIMETER_TABLE = [
  [28.0, 1824], [28.1, 1727], [28.2, 1630], [28.3, 1533], [28.4, 1436], [28.5, 1340], [28.6, 1244], [28.7, 1148], [28.8, 1053], [28.9, 957],
  [29.0, 863], [29.1, 768], [29.2, 673], [29.3, 579], [29.4, 485], [29.5, 392], [29.6, 298], [29.7, 205], [29.8, 112], [29.9, 20], [29.92, 0],
  [30.0, -73], [30.1, -165], [30.2, -257], [30.3, -348], [30.4, -440], [30.5, -531], [30.6, -622], [30.7, -712], [30.8, -803], [30.9, -893],
];
export function altimeterCorrection(setting) {
  const t = ALTIMETER_TABLE;
  if (setting <= t[0][0]) return t[0][1];
  if (setting >= t.at(-1)[0]) return t.at(-1)[1];
  const i = t.findIndex(([s]) => s >= setting);
  const [s0, c0] = t[i - 1], [s1, c1] = t[i];
  return c0 + ((setting - s0) / (s1 - s0)) * (c1 - c0);
}
export const pressureAltitude = (fieldFt, setting) => fieldFt + altimeterCorrection(setting);

// Standard atmosphere (troposphere): temperature 15 °C falling about 2 °C
// per 1,000 ft, and the density altitude that matches a given pressure
// altitude and temperature.
const L = 0.0019812; // °C per ft
const EXP = 5.25588;
export const standardTemp = (ft) => 15 - L * ft;
export function densityAltitude(pressureAltFt, tempC) {
  const T0 = 288.15;
  const pRatio = (1 - (L * pressureAltFt) / T0) ** EXP;
  const sigma = (pRatio * T0) / (tempC + 273.15);
  return (T0 / L) * (1 - sigma ** (1 / (EXP - 1)));
}

// Weight and balance: an invented two-seat jet trainer, arms in inches aft of
// the datum. CG = total moment ÷ total weight.
export const LOADING = {
  empty: { label: 'Empty aircraft', weight: 9400, arm: 200 },
  items: [
    { id: 'front', label: 'Front cockpit', arm: 120, min: 120, max: 260, step: 10, value: 200 },
    { id: 'rear', label: 'Rear cockpit', arm: 160, min: 0, max: 260, step: 10, value: 200 },
    { id: 'fuel', label: 'Fuel', arm: 215, min: 0, max: 3000, step: 100, value: 3000 },
    { id: 'pod', label: 'Nose baggage pod', arm: 60, min: 0, max: 200, step: 10, value: 0 },
  ],
  limits: { fwd: 192, aft: 202, maxWeight: 13200 },
};
export function balance(loads) {
  const rows = [{ ...LOADING.empty }, ...LOADING.items.map((it) => ({ label: it.label, weight: loads[it.id] ?? it.value, arm: it.arm }))];
  const weight = rows.reduce((s, r) => s + r.weight, 0);
  const moment = rows.reduce((s, r) => s + r.weight * r.arm, 0);
  const cg = moment / weight;
  const { fwd, aft, maxWeight } = LOADING.limits;
  return { rows: rows.map((r) => ({ ...r, moment: r.weight * r.arm })), weight, moment, cg, inLimits: cg >= fwd && cg <= aft && weight <= maxWeight, tooHeavy: weight > maxWeight, tooFwd: cg < fwd, tooAft: cg > aft };
}

export const WX_QUESTIONS = [
  { outcome: 1, ask: 'A standard briefing opens with which item?', options: ['Adverse conditions', 'The synopsis', 'Winds aloft', 'NOTAMs'], answer: 'Adverse conditions', why: 'Adverse conditions come first, because they may decide whether to cancel or change the route.' },
  { outcome: 2, ask: 'What does 14021G26KT mean?', options: ['Wind from 140° true at 21 kt, gusting 26', 'Wind from 140° magnetic at 26 kt', 'Wind from 210° at 14 kt', 'Visibility 14 miles, wind 21 kt'], answer: 'Wind from 140° true at 21 kt, gusting 26', why: 'Three digits of direction the wind blows from (true, tens of degrees), two of speed, G and the peak gust.' },
  { outcome: 2, ask: 'BKN008 OVC012CB: what is the ceiling?', options: ['800 ft', '1,200 ft', '80 ft', 'No ceiling'], answer: '800 ft', why: 'Heights are hundreds of feet above ground; the lowest broken or overcast layer is the ceiling.' },
  { outcome: 2, ask: 'What does M04/M08 mean?', options: ['Temperature −4 °C, dew point −8 °C', 'Minimum visibility 4, maximum 8', 'Temperature 4 °C, dew point 8 °C', 'Wind 4 to 8 kt'], answer: 'Temperature −4 °C, dew point −8 °C', why: 'Temperature and dew point are in Celsius, and M means minus.' },
  { outcome: 3, ask: 'In a TAF, what is the difference between FM and TEMPO?', options: ['FM starts new conditions that persist; TEMPO is a fluctuation under an hour', 'They mean the same', 'TEMPO is a 30% chance', 'FM is a forecast from another station'], answer: 'FM starts new conditions that persist; TEMPO is a fluctuation under an hour', why: 'FM marks a rapid, significant change; TEMPO a temporary one expected to last less than an hour.' },
  { outcome: 4, ask: 'A hot day at a high field: what happens to density altitude and takeoff distance?', options: ['Both go up', 'Density altitude goes down, distance up', 'Both go down', 'No change if the altimeter is set'], answer: 'Both go up', why: 'Above-standard temperature raises density altitude, and the higher the elevation, temperature or weight, the longer the takeoff roll.' },
  { outcome: 5, ask: 'Total weight 12,000 lb, total moment 2,400,000 in-lb. Where is the CG?', options: ['200 in aft of the datum', '2,000 in', '20 in', '120 in'], answer: '200 in aft of the datum', why: 'CG = total moment ÷ total weight.' },
];
