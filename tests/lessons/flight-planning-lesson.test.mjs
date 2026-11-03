import assert from 'node:assert/strict';
import test from 'node:test';
import { PLAN_QUESTIONS, SORTIE, descentDistance, equalTimePoint, magnetic, nmPerMin, planSortie, tasFromIas2pct, tasFromIasFl, vvi, windTriangle } from '../../src/lessons/flight-planning/sortie-model.mjs';
import { METARS, TAF_EXAMPLE, WX_QUESTIONS, altimeterCorrection, balance, decodeMetar, decodeTaf, densityAltitude, pressureAltitude } from '../../src/lessons/flight-planning/weather-model.mjs';

const near = (a, b, tol) => assert.ok(Math.abs(a - b) <= tol, `expected ${b}, got ${a}`);

test('wind triangle reproduces the PHAK worked log (TC 031, 360/10, 115 KTAS: 3° L, 106 kt)', () => {
  const w = windTriangle({ tc: 31, tas: 115, windFrom: 360, windKt: 10 });
  near(w.wca, -3, 0.5);
  near(w.gs, 106, 0.5);
  assert.equal(Math.round(magnetic(Math.round(w.th), 7)), 21);
  assert.throws(() => windTriangle({ tc: 0, tas: 50, windFrom: 90, windKt: 60 }), RangeError);
});

test('still air: heading equals course and ground speed equals TAS', () => {
  const w = windTriangle({ tc: 123, tas: 360, windFrom: 0, windKt: 0 });
  near(w.wca, 0, 1e-9);
  near(w.gs, 360, 1e-9);
});

test('AFMAN 11-217V3 rules of thumb', () => {
  assert.equal(nmPerMin(420), 7);
  assert.equal(tasFromIas2pct(250, 10000), 300);
  assert.equal(tasFromIasFl(250, 10000), 300);
  assert.equal(descentDistance(24000), 80);
  assert.equal(vvi(300, 300), 1500);
});

test('equal time point moves toward the field behind with a tailwind going on', () => {
  assert.equal(equalTimePoint({ distance: 600, gsReturn: 420, gsContinue: 420 }), 300);
  assert.ok(equalTimePoint({ distance: 600, gsReturn: 360, gsContinue: 480 }) < 300);
  assert.throws(() => equalTimePoint({ distance: 600, gsReturn: 0, gsContinue: 480 }), RangeError);
});

test('the sortie plan is consistent: JOKER above BINGO, landing above the reserve, ladder falls', () => {
  for (const wind of [{ from: 0, kt: 0 }, { from: 270, kt: 40 }, { from: 90, kt: 80 }]) {
    const p = planSortie(wind);
    assert.equal(p.joker - p.bingo, SORTIE.fuel.jokerMargin);
    assert.ok(p.landHome > SORTIE.fuel.reserve);
    for (let i = 1; i < p.ladder.length; i++) assert.ok(p.ladder[i].fuel < p.ladder[i - 1].fuel);
    assert.ok(p.enoughForArea);
  }
});

test('quiz answers are among their options', () => {
  for (const q of [...PLAN_QUESTIONS, ...WX_QUESTIONS]) assert.ok(q.options.includes(q.answer), q.ask);
});

test('METAR decoder reads the PHAK example', () => {
  const d = decodeMetar(METARS[0].text);
  assert.equal(d.ceiling, 800);
  near(d.vis, 0.75, 1e-9);
  assert.ok(d.parts.every((p) => p.kind !== 'unknown'));
  assert.equal(d.parts.find((p) => p.tok === '+TSRA').text, 'Thunderstorm with heavy rain');
  assert.equal(decodeMetar('METAR KXYZ 031455Z 27012KT 10SM FEW040 SCT250 21/08 A3002').ceiling, null);
  assert.equal(decodeMetar('METAR EGXX 031450Z 27012KT 9999 FEW040 21/08 Q1013').parts.filter((p) => p.kind === 'unknown').length, 2);
});

test('TAF decoder splits the PHAK example into its groups', () => {
  const t = decodeTaf(TAF_EXAMPLE);
  assert.equal(t.hours, 24);
  assert.deepEqual(t.groups.map((g) => [g.type, g.start, g.end]), [['BASE', 0, 3], ['TEMPO', 0, 2], ['FM', 3, 12], ['FM', 12, 16], ['PROB30', 12, 16], ['FM', 16, 24], ['TEMPO', 16, 20]]);
  assert.equal(t.groups[4].ceiling, 3000);
});

test('pressure and density altitude match the PHAK table and examples', () => {
  assert.equal(altimeterCorrection(29.92), 0);
  assert.equal(altimeterCorrection(29.0), 863);
  assert.equal(pressureAltitude(1000, 30.5), 469);
  near(densityAltitude(5048, 30), 7855, 15);
  near(densityAltitude(5048, -25), 1232, 15);
  near(densityAltitude(0, 15), 0, 1);
});

test('weight and balance: CG = total moment ÷ total weight', () => {
  const b = balance({});
  near(b.cg, b.moment / b.weight, 1e-9);
  assert.ok(b.inLimits);
  assert.ok(balance({ rear: 0 }).tooAft);
  assert.ok(balance({ rear: 0, pod: 100 }).inLimits);
});

test('decoder: mixed visibility, qualifiers, +FC and unknown ceilings', () => {
  const ex = decodeMetar('METAR KXYZ 030955Z VRB04KT 1 1/2SM BR SCT005 OVC010 12/11 A3001');
  near(ex.vis, 1.5, 1e-9);
  assert.equal(ex.ceiling, 1000);
  assert.ok(!ex.parts.some((p) => p.kind === 'unknown'));
  const good = decodeMetar('METAR KXYZ 031455Z 27012KT 10SM FEW040 21/08 A3002');
  assert.equal(good.vis, 10);
  assert.equal(good.visQ, null);
  const low = decodeMetar('METAR KXYZ 030812Z 00000KT M1/4SM FG VV/// 09/09 A2995');
  assert.equal(low.visQ, 'less');
  assert.equal(low.ceiling, undefined);
  assert.equal(decodeMetar('METAR KXYZ 032255Z 31018KT 1SM +FC BKN015 A2968').parts.find((p) => p.tok === '+FC').text, 'Tornado or waterspout');
});
