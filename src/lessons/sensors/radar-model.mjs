// Geometry and steps for the Radar, Warning Receivers and Countermeasures
// module. No DOM: the page and lesson-ui import it, and the tests check it.
// Sources: [1] Electronic Warfare Fundamentals (ACC TRSS, 2000), [2] CNATRA
// P-825 (07-14), both by printed page. Numbers marked "illustrative" are
// invented to draw the figures and belong to no radar.

export const FT_PER_NM = 6076.12;
const rad = (d) => (d * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;

// P-825 p. 8-7: vertical displacement (ft) = elevation (deg) x range (NM) x 100,
// worked in reverse to point the scan volume at a called altitude.
export const elevationRule = (dAltFt, rangeNm) => dAltFt / (rangeNm * 100);
export const elevationExact = (dAltFt, rangeNm) => deg(Math.atan2(dAltFt, rangeNm * FT_PER_NM));
export const altitudeAt = (ownAltFt, elevDeg, rangeNm) => ownAltFt + elevDeg * rangeNm * 100;

// Illustrative scan pattern: each bar covers BAR_DEG of elevation. The 13 s
// frame for 6 bars across 140 degrees is P-825's training figure (p. 13-2);
// scaling it in proportion to bars and width is this figure's assumption.
export const BAR_DEG = 2.2;
export const FRAME_6B_140_SEC = 13;
export const frameSeconds = (bars, azDeg) => FRAME_6B_140_SEC * (bars / 6) * (azDeg / 140);

// The volume's lower and upper elevation and altitude at a range.
export function scanCoverage({ ownAltFt, antElevDeg, bars, rangeNm }) {
  const half = (bars * BAR_DEG) / 2;
  const low = antElevDeg - half, high = antElevDeg + half;
  return { lowDeg: low, highDeg: high, lowFt: altitudeAt(ownAltFt, low, rangeNm), highFt: altitudeAt(ownAltFt, high, rangeNm) };
}
export const inVolume = (cov, targetAltFt) => targetAltFt >= cov.lowFt && targetAltFt <= cov.highFt;

// Doppler notch. A pulse-Doppler radar cancels returns with no motion relative
// to the ground beneath them, and anything slower than its speed gate ([1]
// pp. 5-17, 7-22). Seen from the radar, a target's own velocity adds the
// component along the line of sight: speed x cos(target aspect). At 90 TA that
// is zero, and the target closes only at the fighter's own speed, like the
// ground: it is in the clutter notch ([2] p. 8-5).
export const ownRadialKt = (targetKt, taDeg) => targetKt * Math.cos(rad(taDeg));
export const closureKt = (fighterKt, targetKt, taDeg) => fighterKt + ownRadialKt(targetKt, taDeg);
export const inNotch = (targetKt, taDeg, gateKt) => Math.abs(ownRadialKt(targetKt, taDeg)) < gateKt;
// Degrees either side of the beam (90 TA) inside the notch for a speed and gate.
export const notchHalfWidth = (targetKt, gateKt) => (gateKt >= targetKt ? 90 : deg(Math.asin(gateKt / targetKt)));

// Generic warning-receiver scenario, invented. Bearings are true; the scope
// shows them relative to the nose. Symbols, modes and the scope layout are
// generic: each aircraft's display differs.
export const rel = (bearing, heading) => ((bearing - heading) % 360 + 360) % 360;
export const clock = (relDeg) => { const c = Math.round(relDeg / 30) % 12; return c === 0 ? 12 : c; };

export const RWR_STEPS = [
  {
    phase: 'Quiet', heading: 360, threats: [],
    text: 'Heading north, no warning receiver indications: in brevity, naked.', href: '#rwr',
  },
  {
    phase: 'Early warning', heading: 360, threats: [{ id: 'EW', kind: 'surface', bearing: 60, mode: 'search' }],
    text: 'A surveillance radar appears at about 2 o\'clock, in search. It has identified a signal, not detected you.', href: '#rwr',
  },
  {
    phase: 'New guy', heading: 360, threats: [{ id: 'EW', kind: 'surface', bearing: 60, mode: 'search' }, { id: 'AI', kind: 'air', bearing: 330, mode: 'search' }],
    text: 'An airborne radar appears at about 11 o\'clock, with the new-threat alert tone. Still a search mode.', href: '#rwr',
  },
  {
    phase: 'Spike', heading: 360, threats: [{ id: 'EW', kind: 'surface', bearing: 60, mode: 'search' }, { id: 'AI', kind: 'air', bearing: 330, mode: 'track' }],
    text: 'The airborne radar goes to track: a spike. Tell the flight its direction; assume a missile could follow.', href: '#rwr',
  },
  {
    phase: 'Launch', heading: 360, threats: [{ id: 'EW', kind: 'surface', bearing: 60, mode: 'search' }, { id: 'AI', kind: 'air', bearing: 330, mode: 'launch' }],
    text: 'Launch warning from the same symbol. The receiver infers a launch from the signal; it cannot see the missile.', href: '#countermeasures',
  },
  {
    phase: 'Beam', heading: 60, threats: [{ id: 'EW', kind: 'surface', bearing: 60, mode: 'search' }, { id: 'AI', kind: 'air', bearing: 330, mode: 'launch' }],
    text: 'Turn hard to put the threat on the beam, at 9 o\'clock, and dispense chaff: you are in its Doppler notch and the chaff stops at once in the air beside you.', href: '#countermeasures',
  },
  {
    phase: 'Spike gone', heading: 60, threats: [{ id: 'EW', kind: 'surface', bearing: 60, mode: 'search' }, { id: 'AI', kind: 'air', bearing: 330, mode: 'search' }],
    text: 'In this invented case the track drops back to search. Hold the beam for the briefed time before you decide what next.', href: '#countermeasures',
  },
];

export const RADAR_QUESTIONS = [
  { outcome: 1, ask: 'Raising the PRF of a pulse-Doppler radar does what?', answer: 'Fewer blind speeds, more range ambiguity', options: ['Fewer blind speeds, more range ambiguity', 'More blind speeds, less range ambiguity', 'Longer unambiguous range'], why: 'Higher PRF spaces the spectral lines wider, so fewer blind speeds, but returns arrive after the next pulse and range becomes ambiguous. ([1] pp. 5-17, 7-21)' },
  { outcome: 1, ask: 'Two jets fly line abreast close together at long range. Why might the radar show one contact?', answer: 'They are in one resolution cell', options: ['They are in one resolution cell', 'The radar is in the notch', 'The PRF is too low'], why: 'Targets inside one range-and-beamwidth cell are displayed as one; the cell grows with range. ([1] p. 5-14)' },
  { outcome: 2, ask: 'The controller calls a group 10,000 ft above you at 20 NM. Where should the scan volume cover?', answer: 'At least 5° up', options: ['At least 2° up', 'At least 5° up', 'At least 10° up'], why: '10,000 ft = 20 NM × elevation × 100, so elevation is 5°. ([2] p. 8-7)' },
  { outcome: 2, ask: 'Why not move the elevation the moment nothing shows?', answer: 'The scan must finish a frame first', options: ['The scan must finish a frame first', 'The antenna cannot move in search', 'Only the controller can move it'], why: 'Wait for complete frames, about 13 s for 6 bars at 140°, so the volume is sanitized before you move it. ([2] pp. 10-3, 13-2)' },
  { outcome: 3, ask: 'A fighter with a radar-guided missile needs which mode to guide it all the way, and which can it use instead?', answer: 'Single-target track; track-while-scan for an active missile', options: ['Single-target track; track-while-scan for an active missile', 'Search; track-while-scan', 'Track-while-scan only'], why: 'A semi-active missile needs the shooter to illuminate the target with an STT lock until impact; an active missile can be guided from track-while-scan. ([2] pp. 14-4, 14-7)' },
  { outcome: 4, ask: 'What does a warning receiver symbol\'s position tell you?', answer: 'The radar\'s rough direction from your nose', options: ['The radar\'s rough direction from your nose', 'Its exact range', 'Whether it has detected you'], why: 'The symbol shows relative bearing, worked out from signal strength at each antenna; precise position is not possible, and hard maneuvering makes it worse. ([1] pp. 17-1, 17-8, 17-11 to 17-13)' },
  { outcome: 4, ask: 'Your receiver shows nothing, then an IR missile hits a wingman. How?', answer: 'IR missiles are passive', options: ['IR missiles are passive', 'The receiver was in search mode', 'The missile was in the notch'], why: 'A heat-seeker radiates nothing for the receiver to detect, unless a radar was used to cue it; missile warning systems were built for this. ([1] pp. 15-6 to 15-7)' },
  { outcome: 5, ask: 'Against a Doppler tracking radar, when does self-protection chaff work best?', answer: 'With the radar on the beam', options: ['Flying straight at the radar', 'With the radar on the beam', 'Flying straight away'], why: 'Chaff stops in the air almost at once, so a Doppler radar filters it out unless you also have no relative velocity, which happens on the beam. ([1] p. 13-8)' },
  { outcome: 5, ask: 'A heat-seeker is fired at you. What does the training text pair with the flare?', answer: 'A turn to put the missile on the beam', options: ['A climb into the sun', 'A turn to put the missile on the beam', 'Full afterburner'], why: 'Dispense and turn to put the missile on the beam: it raises the line-of-sight rate and separates you from the flare. Afterburner makes the flare\'s job harder. ([1] pp. 15-4 to 15-6)' },
];
