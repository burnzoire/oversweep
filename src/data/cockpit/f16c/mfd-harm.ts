import type { MfdDisplay } from '../types';
import { tracer } from '../trace.ts';

/**
 * F-16C AGM-88 HARM formats for the shared MFD (`mfd.ts`): the SMS page with AG88 selected (guide p. 659) and the
 * WPN page in HAS (p. 660) and POS (p. 662) sub-modes. Words sit on the same fixed layout as the other formats (top
 * row OSB 1-5 at x 186, 258, 332, 405, 478; bottom row OSB 15-11 at the same x; left column OSB 20-16 and right
 * column OSB 6-10 at the HAD's rows). Items inside the screen are placed from the guide's images, which are the
 * same MFD at different sizes: each image is mapped to the 660 px MFD grid with a scale and offset fitted to its
 * own OSB words (p. 659: x 1.628, y 1.586; p. 660: x 1.638, y 1.580; p. 662: x 1.375, y 1.370).
 */
const PX = 4.8;
const { mm } = tracer(PX);
const SC: [number, number] = [329.5, 330];
type Page = MfdDisplay['pages'][number];
type Word = Page['words'][number];
const w = (t: string, x: number, y: number, a?: Word['a'], inv?: boolean, c?: Word['c']): Word =>
  ({ t, at: [mm(x - SC[0]), mm(y - SC[1])], ...(a ? { a } : {}), ...(inv ? { inv } : {}), ...(c ? { c } : {}) });
type P = [number, number];
const q = ([x, y]: P) => `${+mm(x - SC[0]).toFixed(3)} ${+mm(y - SC[1]).toFixed(3)}`;
const poly = (pts: P[], close = false) => `M${pts.map(q).join('L')}${close ? 'Z' : ''}`;

const TOP = [186, 258, 332, 405, 478], TOP_Y = 116.5;
const BOT = [186, 259, 332, 405, 477.5], BOT_Y = 538.5;
const LEFT_Y = [185.5, 257.5, 329.5, 400.5, 472];
const RIGHT_Y = [184.5, 256.5, 328, 400, 471];
const top = (...t: string[]) => t.map((s, i) => (s ? w(s, TOP[i], TOP_Y) : null)).filter((x): x is Word => !!x);
const left = (...t: (string | [string, boolean])[]) => t.map((s, i) => {
  const [text, inv] = typeof s === 'string' ? [s, false] : s;
  return text ? w(text, 111.5, LEFT_Y[i], 'start', inv) : null;
}).filter((x): x is Word => !!x);

/** Format-select row: SMS, HSD and the third slot; the current format inverse (p. 659, p. 662). */
const row = (cur: 'SMS' | 'WPN', slot3: string, last: string) => [
  w('SWAP', BOT[0], BOT_Y), w('SMS', BOT[1], BOT_Y, undefined, cur === 'SMS'), w('HSD', BOT[2], BOT_Y),
  w(cur === 'WPN' ? 'WPN' : slot3, BOT[3], BOT_Y, undefined, cur === 'WPN'), w(last, BOT[4], BOT_Y),
];

/** SMS page (p. 659): A-G master mode (OSB 1), INV (OSB 4), 2AG88 (OSB 6), power (OSB 7), BIT (OSB 8), stations 3 and 7. */
function sms(id: string, powered: boolean): Page {
  return {
    id, words: [
      ...top('A-G', '', '', 'INV'),
      w('2AG88', 551.5, RIGHT_Y[0], 'end'),
      ...(powered ? [w('RDY', 385, 185)] : []),
      w('PWR', 551.5, 249, 'end'), w(powered ? 'ON' : 'OFF', 551.5, 265, 'end'),
      w('BIT', 551.5, RIGHT_Y[2], 'end'),
      w('3', 118, 470, undefined, true), w('7', 546, 470),
      ...(powered ? [w('RDY', 332.5, 505)] : []),
      ...row('SMS', 'WPN', 'S-J'),
    ],
  };
}

/** Station boxes at the bottom of the WPN page: the next station to fire is inverse. */
const stations = (sel: '3' | '7', has: boolean) => has
  ? [w('3', 186, 511.5, undefined, sel === '3'), w('7', 486, 511.5, undefined, sel === '7')]
  : [w(sel, 477, 504, undefined, true)];

/** HAS page (p. 660): threat table 3 (3, S, 6, 2, 13), the ALIC video box, scan time and the crosshair scale. */
const HAS_LEFT = ['3', 'S', '6', '2', '13'];
const hasMarks = (() => {
  const x = (v: number) => 1.638 * v - 13.8, y = (v: number) => 1.58 * v - 9.9;
  const cx = x(211);
  let d = poly([[cx, y(140)], [cx, y(310)]]) + poly([[x(108), y(175)], [x(313), y(175)]]);
  for (const t of [143, 177, 244, 278]) d += poly([[x(t), y(175) - 9], [x(t), y(175) + 9]]);
  for (const [ty, hw] of [[243, 9], [277, 9]] as const) d += poly([[cx - hw, y(ty)], [cx + hw, y(ty)]]);
  d += poly([[cx - 9, y(207) - 8], [cx - 9, y(207) + 8]]) + poly([[cx + 9, y(207) - 8], [cx + 9, y(207) + 8]]) + poly([[cx - 9, y(207)], [cx + 9, y(207)]]);
  return d;
})();
const hasFrame = poly([[163, 211], [502, 211], [502, 488], [163, 488]], true);
const dtsb = poly([[179.5, 140], [481, 140], [481, 183], [179.5, 183]], true);
const has: Page = {
  id: 'wpn-has', words: [
    ...top('HAS', 'TBL1', 'CTR', 'SRCH', 'UFC'),
    ...left(...HAS_LEFT),
    w('00:22', 294, 195.5), w('SCT-7', 369.5, 195.5),
    w('R', 543, 243), w('S', 543, 262),
    ...stations('3', true),
    ...row('WPN', 'WPN', 'DCLT'),
  ],
  marks: hasMarks,
  paths: [{ d: dtsb, c: 'green' }, { d: hasFrame, c: 'red', pen: 'fine' }],
};

/**
 * POS page (p. 662): sub-mode, threat table, attack profile and UFC across the top; the table's five threats down
 * the left (the handed-off one inverse); in-flight missile data above the launch status divider line (LSDL), the
 * next missile's data below it (threat, steerpoint, time to impact, impact time); station 3 boxed.
 */
export interface PosState { profile: 'EOM' | 'PB' | 'RUK'; threat?: string; stpt?: string; tti?: string; impact?: string; inflight?: { tti: string; stpt: string; threat: string }; id: string }
const TBL1 = ['10', 'BB', 'CS', '11', 'SD'];
function pos(s: PosState): Page {
  const ruk = s.profile === 'RUK';
  const words: Word[] = [
    ...top('POS', 'TBL1', s.profile, '', 'UFC'),
    ...left(...TBL1.map((t): [string, boolean] => [t, t === s.threat])),
  ];
  if (s.inflight) {
    const i = s.inflight;
    words.push(...(ruk ? [] : [w(i.tti, 182, 216.5)]), w(i.stpt, 183, 252), w(i.threat, 183, 270));
  }
  if (s.threat) {
    words.push(w(s.threat, 473, 307, undefined, true), w(s.stpt ?? '', 479, 331));
    if (!ruk && s.tti) words.push(w(s.tti, 474.7, 377), w(s.impact ?? '', 494, 399));
  }
  words.push(w('RDY', 330, 504), ...stations('3', false), ...row('WPN', 'WPN', 'DCLT'));
  const lsdl = poly([[146, 288], [513, 288]]);
  // The range-staple symbol at the lower right (p. 662; a bar with serifs and a small tick), as drawn there.
  const staple = poly([[537, 453.5], [549, 453.5]]) + poly([[543, 453.5], [543, 485]]) + poly([[539.5, 471], [546.5, 471]]) + poly([[537, 485], [549, 485]]);
  return { id: s.id, words, marks: staple, paths: [{ d: lsdl, c: 'green' }] };
}

export const harmPages: Page[] = [
  sms('sms-ag88-off', false), sms('sms-ag88', true), has,
  pos({ id: 'wpn-pos', profile: 'EOM' }),
  pos({ id: 'wpn-pos-handoff', profile: 'EOM', threat: '11', stpt: '4', tti: '1:23', impact: '16:01:40' }),
  pos({ id: 'wpn-pos-flight', profile: 'EOM', inflight: { tti: '1:22', stpt: '4', threat: '11' } }),
];
export const harmPageLabels: Record<string, string> = {
  'sms-ag88-off': 'SMS format: AG88 selected, HARMs powered off',
  'sms-ag88': 'SMS format: AG88 selected, HARMs powered on and ready',
  'wpn-has': 'WPN format: AGM-88 in HARM-as-sensor (HAS) mode',
  'wpn-pos': 'WPN format: AGM-88 in position-known (POS) mode, EOM, nothing handed off',
  'wpn-pos-handoff': 'WPN format: POS, EOM, the radar and steerpoint handed off',
  'wpn-pos-flight': 'WPN format: POS, one missile in flight above the launch status divider line',
};
