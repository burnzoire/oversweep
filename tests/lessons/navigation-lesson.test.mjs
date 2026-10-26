import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ARC_LEAD_TABLE, anticipation, arcLeads, chordArc, courseFlight, crossTrack, diff, fixOf, formatDD, formatDM, formatDMS, groundSpeedCheck,
  gsCheckValid, headings, hsi, interceptHeading, latitudeBand, leadNm, legGeometry, minutesFor, parseCoordinate,
  pointToPoint, radialSpacing, relativeBearing, resolution, routeFlight, slantRange, tacanPosition, toMGRS, toUTM,
  turnRadius, utmZone, windTriangle,
} from '../../src/lessons/navigation/lesson-model.mjs';

const near = (actual, expected, tolerance, message) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `${message ?? ''} expected ${expected} ± ${tolerance}, got ${actual}`);

test('signed angle difference wraps at north', () => {
  assert.equal(diff(10, 350), 20);
  assert.equal(diff(350, 10), -20);
  assert.equal(diff(180, 0), 180);
  assert.equal(diff(0, 180), 180);
});

test('coordinates parse from decimal, DM and DMS, with hemisphere letters', () => {
  near(parseCoordinate('30.35', 'lat'), 30.35, 1e-12);
  near(parseCoordinate('-87.32', 'lon'), -87.32, 1e-12);
  near(parseCoordinate('N30 21.0', 'lat'), 30.35, 1e-12);
  near(parseCoordinate(`30°21'00"N`, 'lat'), 30.35, 1e-12);
  near(parseCoordinate('087 19 12 W', 'lon'), -87.32, 1e-12);
  near(parseCoordinate('S33 51 24.5', 'lat'), -(33 + 51 / 60 + 24.5 / 3600), 1e-12);
  assert.throws(() => parseCoordinate('91', 'lat'));
  assert.throws(() => parseCoordinate('30 61', 'lat'));
  assert.throws(() => parseCoordinate('30.5 10', 'lat'));
  assert.throws(() => parseCoordinate('30 E', 'lat'));
  assert.throws(() => parseCoordinate('abc', 'lon'));
});

test('coordinate formats round once and carry 60 into the next unit', () => {
  assert.equal(formatDMS(30.35, 'lat'), `N30°21'00"`);
  assert.equal(formatDMS(-87.32, 'lon'), `W087°19'12"`);
  assert.equal(formatDMS(29.999999, 'lat'), `N30°00'00"`);
  assert.equal(formatDMS(-(33 + 51 / 60 + 24.5 / 3600), 'lat', 1), `S33°51'24.5"`);
  assert.equal(formatDM(30.35, 'lat'), `N30°21.00'`);
  assert.equal(formatDM(-87.32, 'lon', 3), `W087°19.200'`);
  assert.equal(formatDM(5.9999999, 'lon'), `E006°00.00'`);
  assert.equal(formatDD(-87.32, 'lon'), 'W087.3200°');
  assert.equal(formatDD(30.35, 'lat', 2), 'N30.35°');
});

test('resolution follows one minute of latitude = 1 NM', () => {
  const r = resolution(60, { dmsDecimals: 0, dmDecimals: 2, ddDecimals: 4, mgrsDigits: 8 });
  near(r.dms.ns, 1852 / 60, 1e-9);
  near(r.dms.ew, 1852 / 120, 1e-9, 'half at 60°');
  near(r.dm.ns, 18.52, 1e-9);
  near(r.dd.ns, 11.112, 1e-9);
  assert.equal(r.mgrs, 10);
  assert.equal(resolution(0, { mgrsDigits: 10 }).mgrs, 1);
  assert.equal(resolution(0, { mgrsDigits: 6 }).mgrs, 100);
});

test('UTM zones, bands and coordinates match WGS 84 references', () => {
  assert.equal(utmZone(38.9, -77.0), 18);
  assert.equal(utmZone(60.5, 5.5), 32, 'Norway exception');
  assert.equal(utmZone(78.2, 15.6), 33, 'Svalbard exception');
  assert.equal(latitudeBand(-80), 'C');
  assert.equal(latitudeBand(0), 'N');
  assert.equal(latitudeBand(83.9), 'X');
  assert.equal(latitudeBand(84), null);
  // References computed with PROJ (pyproj, WGS 84 UTM).
  const u = toUTM(38.88949, -77.03524);
  near(u.easting, 323483.2429, 0.01);
  near(u.northing, 4306482.0159, 0.01);
  const s = toUTM(-33.8568, 151.2153);
  near(s.easting, 334900.5697, 0.01);
  near(s.northing, 6252288.7529, 0.01);
  assert.throws(() => toUTM(85, 0));
});

test('MGRS references match the NGA lettering, truncated to the chosen digits', () => {
  // References computed with the mgrs package (GeoTrans lettering).
  const cases = [
    [38.88949, -77.03524, '18S UJ 23483 06482'],
    [30.35, -87.32, '16R DU 69245 57612'],
    [-33.8568, 151.2153, '56H LH 34900 52288'],
    [60.5, 5.5, '32V LN 07793 12209'],
    [78.2, 15.6, '33X WG 13696 80760'],
    [0, 0, '31N AA 66021 00000'],
    [-79.9, -179.9, '01C DM 43247 28161'],
    [51.4778, -0.0015, '30U YC 08213 07224'],
    [21.3069, -157.8583, '04Q FJ 18417 56542'],
  ];
  for (const [lat, lon, ref] of cases) assert.equal(toMGRS(lat, lon).text, ref, `${lat}, ${lon}`);
  assert.equal(toMGRS(38.88949, -77.03524, 8).text, '18S UJ 2348 0648');
  assert.equal(toMGRS(38.88949, -77.03524, 6).text, '18S UJ 234 064');
  assert.equal(toMGRS(38.88949, -77.03524, 2).text, '18S UJ 2 0');
  assert.throws(() => toMGRS(0, 0, 7));
});

test('true, magnetic and compass headings follow "east is least, west is best"', () => {
  // PHAK 16-7: 9° E variation turns a true 360° into a magnetic 351°.
  assert.equal(headings({ trueHeading: 360, variation: 9 }).magnetic, 351);
  assert.equal(headings({ trueHeading: 90, variation: 9 }).magnetic, 81);
  assert.equal(headings({ trueHeading: 60, variation: -7 }).magnetic, 67);
  assert.equal(headings({ trueHeading: 60, variation: -7, deviation: 2 }).compass, 69);
  // NAVEDTRA 2-12: an object directly behind is at relative bearing 180 on any heading.
  assert.equal(relativeBearing(210, 30), 180);
  assert.equal(relativeBearing(210, 280), 70);
});

test('wind triangle reproduces the PHAK worked example', () => {
  // PHAK 16-14/16-15: TC 090, wind 045 at 40 kt, TAS 120 → WCA 14 left, TH 076, GS 88.
  const w = windTriangle({ course: 90, tas: 120, windFrom: 45, windSpeed: 40 });
  assert.equal(Math.round(w.wca), -14);
  assert.equal(Math.round(w.heading), 76);
  assert.equal(Math.round(w.groundSpeed), 88);
  // 220 NM at 88 kt is 2.5 hours (PHAK 16-15).
  near(minutesFor(220, 88), 150, 1e-9);
  const tail = windTriangle({ course: 90, tas: 120, windFrom: 270, windSpeed: 20 });
  near(tail.wca, 0, 1e-9);
  near(tail.groundSpeed, 140, 1e-9, 'PHAK 16-9 tailwind');
  assert.throws(() => windTriangle({ course: 0, tas: 100, windFrom: 90, windSpeed: 120 }));
});

test('radial and range of a station-frame position', () => {
  const p = tacanPosition({ radial: 90, dme: 30 });
  const f = fixOf(p);
  near(f.radial, 90, 1e-9);
  near(f.range, 30, 1e-9);
  // Directly overhead at 6,076 ft the DME reads 1 NM.
  near(slantRange(0, 6076), 1, 1e-12);
  near(slantRange(3, 0), 3, 1e-12);
});

test('HSI: bearing pointer, TO/FROM and CDI deflection', () => {
  // NAVEDTRA 2-28: on the 090 radial the course to the station is 270.
  const to = hsi({ radial: 90, course: 270 });
  assert.equal(to.head, 270);
  assert.equal(to.tail, 90);
  assert.equal(to.toFrom, 'TO');
  assert.equal(to.deviation, 0);
  // South of the station on the 190 radial, course 360 to the station: you are
  // left of course, so the bar sits right.
  const left = hsi({ radial: 190, course: 360 });
  assert.equal(left.toFrom, 'TO');
  assert.equal(left.deviation, 10);
  assert.equal(left.dots, 2);
  assert.ok(left.fullScale);
  // Outbound on the 010 radial with 360 set: right of course, bar left.
  const right = hsi({ radial: 10, course: 360 });
  assert.equal(right.toFrom, 'FROM');
  assert.equal(right.deviation, -10);
  const half = hsi({ radial: 5, course: 360 });
  assert.equal(half.dots, -1);
});

test('intercept headings by the FTI methods', () => {
  // 30° method: inbound course 360 from the 210 radial (pointer 030) → 060.
  const thirty = interceptHeading({ method: 'thirty', course: 360, radial: 210 });
  assert.equal(thirty.heading, 60);
  assert.equal(thirty.angle, 60);
  assert.ok(thirty.valid);
  // Double angle off the bow: pointer 20° off → 40° intercept.
  assert.equal(interceptHeading({ method: 'double', course: 360, radial: 200 }).heading, 40);
  // Capped at 45° beyond the pointer.
  assert.equal(interceptHeading({ method: 'double', course: 360, radial: 240 }).heading, 105);
  // 45° outbound: desired 010 radial, now on the 020 radial (tail 020) → 325.
  assert.equal(interceptHeading({ method: 'fortyfive', course: 10, radial: 20 }).heading, 325);
  // After station passage: tail 040, course 010 → 30° beyond → 340.
  assert.equal(interceptHeading({ method: 'passage', course: 10, radial: 40 }).heading, 340);
  assert.equal(interceptHeading({ method: 'passage', course: 10, radial: 100 }).heading, 325);
  // An intercept steeper than 90° is outside the FTI's limit.
  assert.equal(interceptHeading({ method: 'thirty', course: 360, radial: 250 }).valid, false);
  assert.throws(() => interceptHeading({ method: 'nope', course: 0, radial: 0 }));
});

test('lead points and radial spacing', () => {
  assert.equal(leadNm(250).nm, 2.5);
  near(leadNm(300, 60).nm, 2, 1e-9);
  near(leadNm(300, 45).nm, 1, 1e-9);
  assert.equal(leadNm(300, 20).nm, 0);
  assert.equal(radialSpacing(60), 1);
  assert.equal(radialSpacing(30), 0.5);
});

test('ground speed checks (P-1204 p. 71)', () => {
  assert.equal(groundSpeedCheck({ nm: 12, minutes: 2 }), 360);
  assert.equal(groundSpeedCheck({ nm: 12, minutes: 3 }), 240);
  assert.ok(gsCheckValid(20, 15000));
  assert.ok(!gsCheckValid(10, 15000));
});

test('arc leads reproduce the FTI examples and table', () => {
  // 250 KGS: radial-to-arc lead 2.5 DME before the arc.
  assert.equal(arcLeads({ groundSpeed: 250, arc: 10, inbound: true }).leadDme, 12.5);
  assert.equal(arcLeads({ groundSpeed: 250, arc: 10, inbound: false }).leadDme, 7.5);
  // 15 DME at 250 KGS: 10 radials.
  assert.equal(arcLeads({ groundSpeed: 250, arc: 15 }).leadRadials, 10);
  for (const row of ARC_LEAD_TABLE) near(arcLeads({ groundSpeed: 250, arc: row.dme }).leadRadials, row.ninety, 0.45, `${row.dme} DME`);
  assert.equal(arcLeads({ groundSpeed: 250, arc: 15 }).method, 'chord');
  assert.equal(arcLeads({ groundSpeed: 250, arc: 10 }).method, 'bank');
});

test('chord method stays within a band around the arc', () => {
  const c = chordArc({ arc: 20, ahead: 10, sweep: 90 });
  assert.ok(c.legs > 3);
  near(c.maxDme, 20, 0.05, 'turn points on the arc');
  // A chord between ±10° pointer positions dips to 20·cos 10° inside the arc.
  near(c.minDme, 20 * Math.cos(10 * Math.PI / 180), 0.05);
  const wide = chordArc({ arc: 20, ahead: 5, sweep: 90 });
  assert.ok(wide.minDme > c.minDme, 'a smaller lead keeps closer to the arc');
});

test('point-to-point reuses the Case III geometry', () => {
  const p = pointToPoint({ radial: 90, dme: 30 }, { radial: 180, dme: 21 });
  near(p.course, 235.0, 0.1);
  near(p.distance, 36.6, 0.05);
});

test('turn radius and fly-by anticipation', () => {
  // 300 kt at 30° bank: v²/(g tan 30°) ≈ 4,207 m ≈ 2.27 NM.
  near(turnRadius(300, 30), 2.27, 0.01);
  near(anticipation(300, 90, 30), turnRadius(300, 30), 1e-9);
  assert.equal(anticipation(300, 0), 0);
  const g = legGeometry({ x: 0, y: 0 }, { x: 0, y: 10 }, { x: 1, y: 4 });
  assert.equal(g.xtk, 1);
  assert.equal(g.along, 4);
});

test('route flight sequences waypoints and flies direct-to', () => {
  const waypoints = [{ x: 0, y: 0 }, { x: 0, y: 20 }, { x: 20, y: 20 }, { x: 20, y: 0 }];
  const run = (flyOver) => {
    const r = routeFlight({ waypoints, groundSpeed: 300, flyOver });
    let s, maxOut = 0;
    for (let i = 0; i < 3600 && !(s = r.step(1)).done; i++) {
      // Distance outside the corner at waypoint 2 while on leg 2→3.
      if (s.active === 2) maxOut = Math.max(maxOut, s.y - 20);
    }
    return { s, maxOut };
  };
  const by = run(false), over = run(true);
  assert.ok(by.s.done && over.s.done);
  assert.ok(by.maxOut < 0.2, `fly-by stays inside the corner (${by.maxOut})`);
  assert.ok(over.maxOut > 1, `fly-over overshoots the corner (${over.maxOut})`);
  // Direct-to: the desired track runs from the present position to the waypoint.
  const r = routeFlight({ waypoints, groundSpeed: 300 });
  for (let i = 0; i < 60; i++) r.step(1);
  const d = r.directTo(3);
  assert.equal(d.leg, 'DF');
  near(d.xtk, 0, 1e-9);
  near(d.desiredTrack, d.bearing, 1e-9);
  near(d.timeToGo, d.distance / 300 * 3600, 1e-9);
});

const fly = (opts, seconds) => { const f = courseFlight(opts); let s = f.state(); for (let i = 0; i < seconds; i++) s = f.step(); return s; };

test('cross-track has the CDI bar\'s sense', () => {
  // West of the inbound 360 course line: the course is to the right.
  assert.ok(crossTrack({ x: -2, y: -10 }, 360) > 0);
  assert.ok(crossTrack({ x: 2, y: -10 }, 360) < 0);
  near(crossTrack({ x: -2, y: -10 }, 360), 2, 1e-12);
  assert.equal(Math.sign(crossTrack(tacanPosition({ radial: 200, dme: 20 }), 360)), Math.sign(hsi({ radial: 200, course: 360 }).deviation));
});

test('course flight: FTI method intercepts and tracks the course', () => {
  const start = courseFlight({ course: 360, radial: 210, dme: 25, heading: 360, mode: 'method', method: 'thirty' }).state();
  assert.equal(start.interceptHeading, 60);
  assert.equal(start.phase, 'intercept');
  const s = fly({ course: 360, radial: 210, dme: 25, heading: 360, mode: 'method', method: 'thirty' }, 520);
  assert.equal(s.phase, 'track');
  near(s.xtk, 0, 0.05);
  near(diff(s.heading, 360), 0, 1);
  // The roll-out finishes on the course, without a large overshoot.
  const f = courseFlight({ course: 360, radial: 210, dme: 25, heading: 360, mode: 'method', method: 'thirty' });
  let worst = 0;
  for (let i = 0; i < 520; i++) worst = Math.min(worst, f.step().xtk);
  assert.ok(worst > -0.1, `overshoot ${worst}`);
});

test('course flight: homing curves downwind, tracking holds the course', () => {
  const opts = { course: 360, radial: 180, dme: 20, heading: 360, windFrom: 270, windSpeed: 40 };
  const f = courseFlight({ ...opts, mode: 'homing' });
  let s = f.state(), widest = 0;
  while (s.range > 1.2 && s.t < 600) { s = f.step(); widest = Math.min(widest, s.xtk); }
  assert.ok(widest < -1, `homing stayed within ${widest} NM`);
  const t = courseFlight({ ...opts, mode: 'track' });
  let off = 0;
  for (let i = 0; i < 300; i++) off = Math.max(off, Math.abs(t.step().xtk));
  assert.ok(off < 0.1, `tracking wandered ${off} NM`);
});

test('course flight: station passage flips TO to FROM on the same course', () => {
  const f = courseFlight({ course: 360, radial: 180, dme: 8, heading: 360, mode: 'track' });
  assert.equal(f.state().toFrom, 'TO');
  let s;
  for (let i = 0; i < 260; i++) s = f.step();
  assert.equal(s.toFrom, 'FROM');
  near(s.radial, 0, 2);
  near(s.xtk, 0, 0.1);
});

test('course flight: hold mode turns to the heading bug at a half standard rate', () => {
  const f = courseFlight({ course: 360, radial: 210, dme: 20, heading: 360, mode: 'hold' });
  f.setBug(30);
  near(f.step().heading, 1.5, 1e-9);
  let s;
  for (let i = 0; i < 30; i++) s = f.step();
  near(s.heading, 30, 1e-9);
  assert.throws(() => courseFlight({ course: 360, radial: 0, dme: 5, heading: 0, mode: 'nope' }), RangeError);
});
