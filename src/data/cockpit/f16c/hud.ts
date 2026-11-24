import type { HudTape, PanelSpec } from '../types';
import { tracer } from '../trace.ts';
import { ASEC, RETICLE, type MrmView } from './mrm.ts';
import { MOMENTS, type MomentId } from './aim120-scene.ts';

/**
 * F-16C head-up display (HUD), DCS: the combiner glass between its two posts,
 * with the NAV master mode symbology the guide's figure shows.
 *
 * Reference: the guide's p. 90 figure (1152 x 665 JPEG, `pdfimages -j -f 90
 * -l 90`, image 002), the pilot's view through the HUD. The symbology is
 * focused at infinity and drawn square-on; the combiner frame is traced as
 * the pilot sees it and made symmetric about x 576. Not rectified. Values
 * below are reference pixels, cropped at x 290 (canvas) and, for the
 * symbology, relative to the boresight cross at 575, 52.4.
 *
 * Measurements (colour zooms at 5–10x): attitude bars 25.9 px a degree
 * (horizon 149.3 under the marker, +5° bar 18.6, −5° 279, −10° 406.5, the
 * horizon tilted 0.85° = 3 px over 200 px); bars 37.5 px long from 23.5 px
 * either side of the marker, 7 px end ticks, dive bars dashed 9.5/4.5; labels
 * 2.5 px in from the outer end, 7.9 px below climb bars and 5.3 px above dive
 * bars. Flight path marker at 566, 141: circle r 6, wings to 23, tail to 15.
 * Steering cue at 534, 141.6: circle r 4.5, line to 21.6 (pointing up).
 * Steerpoint diamond at 533, 250, half-diagonal 6.5. Boresight cross arms 12.
 * Velocity tape: 0.742 px/kt (400 at y 170, 300 at 244.2), ticks every 10 kt
 * from x 455.8 (5 px, 7.8 px every 50 kt), labels every 100 kt centred x 439.5;
 * pointer y 207, index line x 450–470; box 407.5–440 x 198.3–215.8 with its
 * point at 445.8. Altitude tape: 0.0742 px/ft (9000 at 160, 8000 at 234.2),
 * ticks every 100 ft from x 695.8 (4.2 px, 8.2 px every 500 ft), labels every
 * 1000 ft centred x 716; index line 680–696.7; box 710–752.5 x 200–216.7, point
 * at 702.5. Heading tape: 4.7 px a degree (190 at 542.5, 195 at 566), ticks
 * down from y 275 (6.5 px, 9.5 px every 10°), labels y 292.5; lubber 259–275 at
 * x 575.2; box 561.5–589 x 286–304. Roll indicator: ticks at 0, ±10, ±20 (r 67–75)
 * and ±30, ±45 (r 67–80) about 575, 284.5; caret apex r 76, base r 87.5, 11 wide.
 * Lettering: fixed pitch 7.9 px (AL 1500, B019.5), lines 14.5–15.2 px apart.
 */
const PX = 3.0;
const { pt, mm, path } = tracer(PX);
const src = 'DCS F-16C guide pp. 90–94';
const X0 = 290;
/** Boresight cross (reference px). */
const B: [number, number] = [575, 52.4];
const r = (x: number, y: number): [number, number] => [mm(x - B[0]), mm(y - B[1])];
const rx = (x: number) => mm(x - B[0]), ry = (y: number) => mm(y - B[1]);
/** Path in reference px, moved to the boresight frame (mm). */
const rel = (pts: [number, number][], close = true) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${+rx(x).toFixed(3)} ${+ry(y).toFixed(3)}`).join('') + (close ? 'Z' : '');
/** Path in reference px on the canvas (cropped at x 290). */
const abs = (pts: [number, number][], close = true) => path(pts.map(([x, y], i) => `${i ? 'L' : 'M'}${+(x - X0).toFixed(2)} ${y}`).join('') + (close ? 'Z' : ''));

/** Combiner glass top edge: a circular arc from post to post through the apex (576, 3), sampled. */
const arc = (x0: number, x1: number, yEnd: number, steps = 24): [number, number][] => {
  const half = (x1 - x0) / 2, sag = yEnd - 3, R = (half * half + sag * sag) / (2 * sag), cx = (x0 + x1) / 2, cy = 3 + R;
  return Array.from({ length: steps + 1 }, (_, i) => { const x = x0 + (i * (x1 - x0)) / steps; return [x, cy - Math.sqrt(R * R - (x - cx) ** 2)] as [number, number]; });
};
/** Glass: inside the posts' inner edges (339.5 → 381 left, 812.5 → 771 right) and above the base at y 432. */
const GLASS: [number, number][] = [...arc(339.5, 812.5, 49), [771, 432], [381, 432]];
/** Posts (inner faces as seen): outer edge 302 → 311.5, inner 339.5 → 381, mirrored about 576. */
const LEFT_POST: [number, number][] = [[302, 52], [339.5, 49], [381, 432], [381, 445], [311.5, 445]];
const RIGHT_POST = LEFT_POST.map(([x, y]) => [1152 - x, y] as [number, number]);

const box = (x0: number, y0: number, x1: number, y1: number) => rel([[x0, y0], [x1, y0], [x1, y1], [x0, y1]]);
const font = { cap: mm(9.6), pitch: mm(7.9) };

const velocity: HudTape = {
  at: r(455.8, 207), axis: 'y', per: mm(0.742), from: 0, to: 900, minor: 10, major: 50, label: 100,
  edge: 0, minorLength: mm(-5), majorLength: mm(-7.8), labelOffset: mm(439.5 - 455.8), labelDiv: 10, labelPad: 2, window: mm(60),
  index: rel([[450, 207], [470, 207]], false),
  box: rel([[407.5, 198.3], [440, 198.3], [445.8, 207], [440, 215.8], [407.5, 215.8]]),
  readout: { at: r(428.3, 207), anchor: 'middle', format: {} },
};
const altitude: HudTape = {
  at: r(695.8, 207), axis: 'y', per: mm(0.0742), from: 0, to: 60000, minor: 100, major: 500, label: 1000,
  edge: 0, minorLength: mm(4.2), majorLength: mm(8.2), labelOffset: mm(716 - 695.8), labelDiv: 1000, labelPad: 2, labelSuffix: ',0', window: mm(60),
  index: rel([[680, 207], [696.7, 207]], false),
  box: rel([[702.5, 208.3], [710, 200], [752.5, 200], [752.5, 216.7], [710, 216.7]]),
  readout: { at: r(732.5, 208.3), anchor: 'middle', format: { comma: true, round: 10 } },
};
const heading: HudTape = {
  at: r(575.2, 275), axis: 'x', per: mm(4.7), from: -30, to: 390, minor: 5, major: 10, label: 10,
  edge: 0, minorLength: mm(6.5), majorLength: mm(9.5), labelOffset: mm(292.5 - 275), labelDiv: 10, labelPad: 2, window: mm(36), labelWindow: mm(42), labelGap: mm(23),
  index: rel([[575.2, 259], [575.2, 275]], false),
  box: box(561.5, 286, 589, 304),
  readout: { at: r(575.2, 295), anchor: 'middle', format: { pad: 3 } },
};


/**
 * HARM launch cues (guide pp. 663-664). The p. 663 figures are the same HUD seen at about 1.1 times the p. 90 scale (the
 * velocity and altitude tapes are 266 px apart there, 240 here), with the boresight cross at (298, 61) in them. A point
 * (x, y) in a p. 663 image is drawn at the boresight plus ((x - 298), (y - 61)) / 1.1 reference px. The staple, scale
 * dashes, loft ticks and FOV box are measured off image 002 (AMZ, EOM); the caret below the AMZ/MMZ separator, the A
 * prefix and the flashing box (the MMZ) follow image 003, whose staple and caret read the same way.
 */
const H = (x: number, y: number): [number, number] => [B[0] + (x - 298) / 1.1, B[1] + (y - 61) / 1.1];
/** A hint box on the HARM cues, in p. 663 image px (`H`) or HUD reference px (`ref`), as `#x0 y0 x1 y1` in the cues' own units. */
const spot = (a: [number, number], b: [number, number]) => `#${[...a, ...b].map(v => +v.toFixed(3)).join(' ')}`;
export const hudSpot = (x0: number, y0: number, x1: number, y1: number) => spot(r(...H(x0, y0)), r(...H(x1, y1)));
export const hudSpotRef = (x0: number, y0: number, x1: number, y1: number) => spot(r(x0, y0), r(x1, y1));
const hp = (pts: [number, number][]) => rel(pts.map(([x, y]) => H(x, y)), false);
const ht = (t: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' = 'middle') => ({ t, at: r(...H(x, y)), anchor });
/**
 * Staple: line x 398 from y 201 to 273, serifs right to x 409; the upper range dash at y 162 and the zero dash at y 279.5
 * (p. 663 image 002). The figures are for a target about 45 NM away on the 80 NM scale; this scenario closes to 12 NM,
 * so the scale reads 40 NM (p. 664: 40 or 80 NM, whichever covers the range) and the caret sits at 12 NM. The staple's
 * ends and the AMZ/MMZ separator are illustrative: in the AMZ the separator is below the caret (manoeuvre first), and
 * once on bearing the MMZ grows past the caret.
 */
const SCALE_NM = 40;
const nmY = (nm: number) => 279.5 - (nm * 117.5) / SCALE_NM;
export const CARET_Y = nmY(12);
const STAPLE = hp([[409, 201], [398, 201], [398, 273], [409, 273]]) + hp([[399, 162], [411, 162]]) + hp([[399, 279.5], [411, 279.5]]);
const separator = (nm: number) => hp([[398, nmY(nm)], [409, nmY(nm)]]);
/** Azimuth steering line: the full height of the glass through the boresight. */
const ASL = hp([[298, -40], [298, 470]]);
/** EOM loft cues on the line: the small tick (y 67, 24 wide) and the large tick (y 212, 34 wide). */
const LOFT = hp([[286, 67], [310, 67]]) + hp([[281, 212], [315, 212]]);
/** FOV box (p. 663 image 002: 111 x 40 px, 101 x 36 reference px) about the target, which is the selected steerpoint: centred on the steerpoint diamond's rest position (533, 250). */
const FOV = rel([[483, 232], [583, 232], [583, 268], [483, 268]]);
/**
 * With the HARM cues up the heading scale sits above the boresight (p. 663 image 002: ticks hanging from y 92.5, long 9.5 and short
 * 6.2 px, label centre y 110.7, readout box x 283-312.5 by y 103-124 around the steering line), where it is a tape of the same scale
 * as the usual one.
 */
const headingHigh: HudTape = {
  ...heading,
  at: r(...H(298, 92.5)), minorLength: mm(5.6), majorLength: mm(8.6), labelOffset: mm(16.5),
  index: 'M0 0',
  box: box(H(283, 103)[0], H(283, 103)[1], H(312.5, 124)[0], H(312.5, 124)[1]),
  readout: { at: r(...H(298, 113.5)), anchor: 'middle', format: { pad: 3 } },
};
/** The small box with an X in it at the foot of the steering line (p. 663 image 002: box x 291-309, y 446-456 with a heavy top bar, an X from (297, 449) to (303, 455)). The guide's key labels it nowhere; it may be the A-G mode symbol the key lists beside the figure. */
const BOXED_X = hp([[291, 456], [291, 446], [309, 446], [309, 456]]) + hp([[291, 447.5], [309, 447.5]]) + hp([[297, 449.5], [303, 455]]) + hp([[303, 449.5], [297, 455]]);
const harmCues = {
  id: 'harm-cues',
  heading: headingHigh,
  pages: [
    { id: 'none', art: '', texts: [] },
    {
      id: 'amz', art: STAPLE + separator(10) + FOV + BOXED_X, steer: ASL + LOFT,
      texts: [ht(String(SCALE_NM), 404.5, 151), ht('14>', 397, CARET_Y, 'end'), ht('246', 402, 290), ht('00', 403, 303)],
    },
    {
      id: 'mmz', art: STAPLE + separator(16) + BOXED_X, steer: ASL + LOFT,
      texts: [ht(String(SCALE_NM), 404.5, 151), ht('A36>', 397, CARET_Y, 'end'), ht('264', 402, 290)],
      flash: FOV,
    },
    // Air-to-air target designation (guide pp. 405-406), drawn in the radar procedures' scene (see mfd-fcr.ts): the
    // bugged target 45 NM out at 25,000 ft, 0.6° below the jet's 28,000 ft. These keep the heading tape in its usual place.
    {
      // Target 20° left of the nose, outside the HUD: the FCR target locator line from the boresight cross toward it, and
      // the target locator angle at its end, prefixed F for the FCR (p. 406 items 8-9; the line's length is not given:
      // drawn 90 px).
      id: 'aa-tll', keepHeading: true, art: rel([B, [B[0] - 90, B[1] + 2.7]], false),
      texts: [{ t: 'F20', at: r(B[0] - 96, B[1] + 2.7), anchor: 'end' as const }],
    },
    {
      // On the collision course the target is 7° left and 0.6° low: the A-A target designator box (p. 597 image 005: a
      // square about 0.9° across, the target's altitude in thousands of feet below it).
      id: 'aa-td', keepHeading: true, art: rel([[B[0] - 181 - 11.5, B[1] + 15.5 - 11.5], [B[0] - 181 + 11.5, B[1] + 15.5 - 11.5], [B[0] - 181 + 11.5, B[1] + 15.5 + 11.5], [B[0] - 181 - 11.5, B[1] + 15.5 + 11.5]]),
      texts: [{ t: '25', at: r(B[0] - 181, B[1] + 15.5 + 22), anchor: 'middle' as const }],
    },
  ] as { id: string; art: string; texts: { t: string; at: [number, number]; anchor?: 'start' | 'middle' | 'end' }[]; keepHeading?: boolean; steer?: string; flash?: string; scene?: string }[],
};

/**
 * AIM-120 (MRM) cues, guide pp. 593-597. The p. 594 and p. 597 figures are this HUD at 1.06 times the p. 90 scale
 * (pitch ladder 27.45 px a degree there, 25.9 here), boresight cross at (289.5, 53.5). Measured there: the ASEC centred
 * 6° below the boresight (radius 59 px at RPI, 23.7 px beyond ROPT), its aspect caret a small triangle on the rim
 * (bottom 0°, top 180°), the ASC a circle r 6.5 px; the FCR TD box 39 px square with the missile diamond on it (SLAVE);
 * the target locator line about 91 px long, F and the angle at its end. The missile reticle and diamond (boresight
 * launch, p. 593): the diamond 6° below the boresight with four ticks at its corners (p. 593 image 011), the reticle
 * 7.6° in radius about it.
 *
 * The linear missile scale is traced from the p. 595 close-up (image 053, 208 x 492 px), which matches the p. 594 HUD
 * at 0.312 times: its bar 0.312 x (x - 145) from x 390 in p. 594 px, zero at y 262.5 and the range scale (the FCR's,
 * printed above, underlined) 377 image px above it. RPI is the bar's top with a tick right; the box from RTR to RMIN;
 * ROPT a circle (r 10) left of the bar; RAERO a triangle pointing left. The closure and caret end at the bar; the
 * pre-launch pole 54 image px below; the pre-launch time, or the post-launch pole and time, centred under the bar
 * (p. 596).
 */
const DEG = 25.9;
const K = 1.06;
/** A point in the p. 594 figure, in HUD reference px. */
const M5 = (x: number, y: number): [number, number] => [B[0] + (x - 289.5) / K, B[1] + (y - 53.5) / K];
/** A point in the p. 595 scale close-up, in HUD reference px. */
const S5 = (x: number, y: number) => M5(390 + (x - 145) * 0.312, 262.5 + (y - 437) * 0.312);
const ringAt = ([x, y]: [number, number], rad: number, n = 40) =>
  rel(Array.from({ length: n }, (_, i): [number, number] => [x + rad * Math.sin((2 * Math.PI * i) / n), y - rad * Math.cos((2 * Math.PI * i) / n)]));
/** Missile diamond (p. 593 image 011): half-diagonal 0.40°, ticks out to 0.79° at its corners. */
const missileDiamond = ([x, y]: [number, number]) => {
  const a = 0.4 * DEG, b = 0.79 * DEG;
  return rel([[x, y - a], [x + a, y], [x, y + a], [x - a, y]]) + rel([[x, y - a], [x, y - b]], false) + rel([[x + a, y], [x + b, y]], false) +
    rel([[x, y + a], [x, y + b]], false) + rel([[x - a, y], [x - b, y]], false);
};
export interface MrmCue {
  id: string;
  view: MrmView;
  /** The target inside the HUD (degrees right, down of the boresight): the TD box, with the missile diamond on it. */
  td?: [number, number];
  /** The target outside the HUD: the target locator line toward it (0.6° low), degrees off the nose (left negative). */
  tll?: number;
  /** No target of interest: the missile reticle and the diamond. */
  bore?: boolean;
  /** The FCR's range scale (the missile scale's range). */
  scale?: number;
  scene?: string;
}
const RAD = Math.PI / 180;
export function mrmCue(o: MrmCue) {
  const v = o.view, texts: { t: string; at: [number, number]; anchor?: 'start' | 'middle' | 'end' }[] = [];
  let art = '';
  const c: [number, number] = [B[0], B[1] + ASEC.down * DEG];
  if (o.bore) art += ringAt([B[0], B[1] + RETICLE.down * DEG], RETICLE.r * DEG, 72) + missileDiamond([B[0], B[1] + RETICLE.down * DEG]);
  if (o.td) {
    const p: [number, number] = [B[0] + o.td[0] * DEG, B[1] + o.td[1] * DEG], h = 39 / K / 2;
    art += rel([[p[0] - h, p[1] - h], [p[0] + h, p[1] - h], [p[0] + h, p[1] + h], [p[0] - h, p[1] + h]]) + missileDiamond(p);
  }
  if (o.tll !== undefined) {
    const L = 91 / K, n = Math.hypot(o.tll, 0.6), end: [number, number] = [B[0] + (L * o.tll) / n, B[1] + (L * 0.6) / n];
    art += rel([B, end], false);
    texts.push({ t: `F${Math.abs(Math.round(o.tll))}`, at: r(end[0] + (o.tll < 0 ? -4 : 4), end[1]), anchor: o.tll < 0 ? 'end' : 'start' });
  }
  if (v.asec) {
    const R = (v.asec === 'large' ? ASEC.large : ASEC.small) * DEG;
    art += ringAt(c, R);
    if (v.aspect !== undefined) {
      const ph = v.aspect * RAD, ux = Math.sin(ph), uy = Math.cos(ph), tx = -uy, ty = ux;
      const ap: [number, number] = [c[0] + R * ux, c[1] + R * uy], bc: [number, number] = [c[0] + (R + 6) * ux, c[1] + (R + 6) * uy];
      art += rel([ap, [bc[0] + 3.8 * tx, bc[1] + 3.8 * ty], [bc[0] - 3.8 * tx, bc[1] - 3.8 * ty]]);
    }
    if (v.asc) {
      const k = (q: number) => Math.max(-1.6, Math.min(1.6, q)) * R;
      art += ringAt([c[0] + k(v.asc[0]), c[1] + k(v.asc[1])], 6.5 / K, 24);
    }
  }
  if (v.nm !== undefined && v.dlz && o.scale) {
    const d = v.dlz, sy = (nm: number) => 437 - (Math.min(nm, o.scale!) / o.scale!) * 377;
    art += rel([S5(145, sy(d.min)), S5(145, sy(d.pi)), S5(176.5, sy(d.pi))], false);
    art += rel([S5(145, sy(d.tr)), S5(176.5, sy(d.tr)), S5(176.5, sy(d.min)), S5(145, sy(d.min))]);
    art += ringAt(S5(144.5, sy(d.opt)), 10 * 0.312 / K, 20);
    art += rel([S5(149, sy(d.aero)), S5(176, sy(d.aero) - 13), S5(176, sy(d.aero) + 13)]);
    art += rel([S5(143, 60.5), S5(177, 60.5)], false);
    texts.push({ t: String(o.scale), at: r(...S5(160, 31)), anchor: 'middle' });
    const ty = sy(v.nm);
    texts.push({ t: `${v.closure}>`, at: r(...S5(150, ty)), anchor: 'end' });
    if (v.pre) texts.push({ t: v.pre[0], at: r(...S5(122, ty + 54)), anchor: 'end' });
    const lines = v.post ?? (v.pre ? [v.pre[1]] : []);
    lines.forEach((t, i) => texts.push({ t, at: r(...S5(156, 465 + 45.5 * i)), anchor: 'middle' }));
  }
  return { id: o.id, art, texts, keepHeading: true, ...(o.scene ? { scene: o.scene } : {}) };
}
/** The single-target shot's HUD moments (`aim120-scene.ts`): the lead at 340° and 0.6° below; on 347° it is in the HUD. */
const aimCue = (k: MomentId) => {
  const m = MOMENTS[k], off = ((340 - m.hdg + 540) % 360) - 180;
  return mrmCue({ id: `mrm-${k}`, view: m.view, scale: 80, ...(Math.abs(off) > 10 ? { tll: off } : { td: [off, 0.6] }) });
};
/**
 * A bandit seen through the glass (not HUD symbology): a fighter nearly nose-on, a dark silhouette 12 reference px
 * across (drawn larger than it would look at a few miles, so it can be seen), and its contrail at high altitude
 * streaming back and up-right. `az` degrees right and `down` degrees below the boresight cross.
 */
export function bandit(az: number, down: number) {
  const [x, y] = [B[0] + az * DEG, B[1] + down * DEG];
  const P = (pts: [number, number][], close = true) => rel(pts.map(([u, v]) => [x + u, y + v] as [number, number]), false) + (close ? 'Z' : '');
  const body = P([[-6, 0.6], [-1.2, -0.4], [-0.6, -3.6], [0.6, -3.6], [1.2, -0.4], [6, 0.6], [6, 1.3], [1.2, 1], [0.8, 2.2], [-0.8, 2.2], [-1.2, 1], [-6, 1.3]]);
  const trail = P([[0.6, -0.6], [60, -26], [64, -22], [1, 0.6]]);
  return `<path d="${trail}" fill="#f4f6fa" fill-opacity="0.55" stroke="none"/><path d="${body}" fill="#2a303b" stroke="none"/>`;
}
export const MRM_CUES = [
  mrmCue({ id: 'mrm-bore', view: { rdy: '' }, bore: true }),
  // The visual shot (BORE): the bandit 5° right, level with you, then on the missile diamond.
  { id: 'scene-bandit', art: '', texts: [], keepHeading: true, scene: bandit(5, 0) },
  mrmCue({ id: 'mrm-bore-bandit', view: { rdy: '' }, bore: true, scene: bandit(5, 0) }),
  mrmCue({ id: 'mrm-bore-on', view: { rdy: '' }, bore: true, scene: bandit(0, RETICLE.down) }),
  ...(Object.keys(MOMENTS) as MomentId[]).map(aimCue),
];

harmCues.pages.push(...MRM_CUES);
const MODES = ['NAV', 'CCIP', 'CCRP', 'DTOS', 'LADD', 'MAN', 'VIS', 'PRE', 'BORE', 'STRF', 'HARM', 'HTS', 'AAM', 'MSL', 'DGFT', 'MRM', 'SRM', 'HOB', 'EEGS', 'JETT'];
const num = (id: string, name: string, unit: string, rest: number, range: [number, number, number], description: string) =>
  ({ id, name, type: 'display' as const, unit, rest, range, description, source: src });
const word = (id: string, name: string, pages: { id: string; label: string }[], restPage: string, description: string) =>
  ({ id, name, type: 'display' as const, pages, restPage, description, source: src });
const P = (...ws: string[]) => ws.map(w => ({ id: w.toLowerCase(), label: w }));

export const hud: PanelSpec = {
  id: 'hud',
  title: 'Head-up display (HUD)',
  canvas: [mm(1152 - 2 * X0 + 1), mm(450)],
  source: {
    variant: 'DCS F-16C Viper (Block 50)',
    manual: 'Eagle Dynamics, DCS F-16C Viper Early Access Guide (EN, 16 Aug 2026)',
    page: 90,
    image: 'p. 90 HUD figure (1152 x 665 JPEG), cropped to x 290–862, y 0–450',
    rectify: 'none: the pilot\'s view; the symbology is square-on',
    pxPerMm: PX,
    scale: 'Measured against the ICP in the same image: COM 1 and A-G are 324.6 px apart there and 108.4 mm apart on the ICP drawing, so 3.0 px/mm at the base of the HUD. The combiner sits a little further from the eye than the ICP, so the frame may be drawn a few per cent large. The symbology keeps its own angular scale (25.9 px a degree).',
    shown: {
      screen: 'on', 'fpm-azimuth': '-0.35', 'fpm-elevation': '-3.42', pitch: '3.74', roll: '-0.85', 'steering-cue': '-1.24', steering: '0',
      'steerpoint-azimuth': '-1.62', 'steerpoint-elevation': '-7.63', velocity: '350', altitude: '8360', heading: '197', 'velocity-mode': 'c',
      g: '1.1', 'master-arm': 'arm', mach: '0.61', 'max-g': '5.7', 'master-mode': 'nav', 'bullseye-bearing': '324', 'bullseye-range': '53',
      'radar-alt': '7040', alow: '1500', 'slant-range-source': 'b', 'slant-range': '19.5', ttg: '175', 'steerpoint-distance': '19', steerpoint: '4',
    },
    unresolved: [
      'The symbology is drawn green over a desaturated blue sky, standing in for the outside view through the combiner.',
      'Only the NAV symbology in the guide\'s figure is drawn. Not built yet: the vertical velocity scale and bank angle indicator (Scales switch VV/VAH), the ground-track triangle (velocity in GND SPD), the DED and PFL repeaters, the manual bombing reticles, the X over a symbol outside the field of view, flashing fields, the zenith and nadir symbols, and the weapon symbology of other master modes.',
      'The guide says every 500 ft altitude mark carries a label; the figure shows labels only at whole thousands (09,0 and 08,0, none at 8500), so labels are drawn every 1000 ft. Velocity labels are drawn every 100 kt as the figure shows (30, 40).',
      'Tape windows (velocity and altitude ±60 px, heading ±36 px) are taken from the ticks the figure shows; heading labels are hidden within 23 px of the lubber line, under and beside the readout box, as the figure hides the 20 (14 px right of it) and shows the 19 (33 px left).',
      'The attitude bars turn with roll about the flight path marker and are caged to it in azimuth (guide); the roll caret is drawn turning with the bars, and the steering cue rides with the marker without turning. The figure\'s 0.85° bank is too small to check either.',
      'Field order and alignment: the bullseye field is drawn as bearing then range (324 053); the radar altitude and ALOW values are right-aligned, other fields left-aligned. The fuel and home bingo messages that replace the bullseye field are not drawn.',
      'The HUD lettering is set in a fixed-width face at the measured 7.9 px pitch; the sim\'s decimal point is narrower in some fields (0.61, 5.7).',
      'The combiner frame is the two posts and the glass top edge as seen from the seat, made symmetric; the housing at the base of the glass is not named in the guide and is drawn as an outline.',
      'Cold and dark, the HUD is blank; pick "On" in the Instruments list (or a procedure turns it on).',
    ],
  },
  plate: [
    { d: abs([...arc(302, 850, 52), [840.5, 445], [311.5, 445]]) },
  ],
  engraving: [
    { kind: 'path', pen: 'heavy', d: abs(LEFT_POST) },
    { kind: 'path', pen: 'heavy', d: abs(RIGHT_POST) },
    { kind: 'path', pen: 'medium', d: abs([[381, 432], [771, 432]], false) },
    // Housing at the base of the glass: 551–601 wide from y 386, domed top to y 374.
    { kind: 'path', pen: 'medium', d: path(`M${551 - X0} 432V386Q${551 - X0} 382 ${556 - X0} 382Q${576 - X0} 368 ${596 - X0} 382Q${601 - X0} 382 ${601 - X0} 386V432`) },
  ],
  placements: [
    {
      component: 'hud', at: pt(B[0] - X0, B[1]), hud: {
        glass: rel(GLASS),
        font, deg: mm(25.9),
        boresight: { arm: mm(12) },
        fpm: { r: mm(6), wing: mm(23), tail: mm(15) },
        ladder: { gap: mm(23.5), length: mm(37.5), tick: mm(7), dash: [mm(9.5), mm(4.5)], labelInset: mm(2.5), labelDrop: [mm(7.9), mm(5.3)], horizon: mm(224) },
        steering: { r: mm(4.5), line: mm(21.6) },
        diamond: mm(6.5),
        velocity, altitude, heading,
        velocityMode: r(462.5, 200),
        roll: { centre: r(575, 284.5), r: [mm(67), mm(75), mm(80)], ticks: [-45, -30, -20, -10, 0, 10, 20, 30, 45], longAt: [-45, -30, 30, 45], caret: [mm(76), mm(87.5), mm(11)] },
        fields: [
          { indicator: 'g', at: r(468.7, 135.8), anchor: 'middle', format: { decimals: 1 } },
          { indicator: 'soi', at: r(451.8, 121.8) },
          { indicator: 'master-arm', at: r(456.7, 275.4) },
          { indicator: 'mach', at: r(456.7, 290), format: { decimals: 2 } },
          { indicator: 'max-g', at: r(440, 304.6), format: { decimals: 1 } },
          { indicator: 'align', at: r(440, 304.6) },
          { indicator: 'master-mode', at: r(440, 319) },
          { indicator: 'bullseye-bearing', at: r(422.5, 333.3), format: { pad: 3 } },
          { indicator: 'bullseye-range', at: r(463.7, 333.3), format: { pad: 3 } },
          { indicator: 'radar-alt', at: r(718, 287.5), anchor: 'end', format: { comma: true, round: 10 }, prefix: { text: 'R', at: r(665.8, 286.5) } },
          { indicator: 'alow', at: r(721, 306.7), anchor: 'end', prefix: { text: 'AL', at: r(665.8, 306.7) } },
          { indicator: 'slant-range-source', at: r(665.8, 321.7) },
          { indicator: 'slant-range', at: r(673.7, 321.7), format: { pad: 3, decimals: 1 } },
          { indicator: 'ttg', at: r(665.8, 336.7), format: { clock: true, pad: 3 } },
          { indicator: 'steerpoint-distance', at: r(665.8, 352.5), format: { pad: 3 }, prefix: { text: '>', at: r(689.5, 352.5) } },
          { indicator: 'steerpoint', at: r(697.4, 352.5), format: { pad: 3 } },
        ],
        boxes: [box(674, 280, 719, 296.7)],
        cues: harmCues,
      },
    },
  ],
  controls: [],
  indicators: [
    word('screen', 'HUD', [{ id: 'on', label: 'On' }, { id: 'off', label: 'Off' }], 'off', 'The HUD picture. Cold and dark it is blank.'),
    num('fpm-azimuth', 'Flight path marker (left/right)', '°', -0.35, [-10, 10, 0.1], 'Flight path marker: the aircraft\'s inertial velocity vector, a circle with wings at 3 and 9 o\'clock and a tail at 12. Its offset left or right of the boresight cross, in degrees (drift); the attitude bars slide sideways with it.'),
    num('fpm-elevation', 'Flight path marker (up/down)', '°', -3.42, [-20, 5, 0.1], 'The flight path marker\'s height above (+) or below (−) the boresight cross, in degrees; below it by about the angle of attack.'),
    num('pitch', 'Pitch (attitude bars)', '°', 3.74, [-90, 90, 0.5], 'The attitude bars (horizon line and pitch ladder, every 5°, every 10° past 60°): pitch is read at the boresight cross, the climb or dive angle at the flight path marker. Climb bars are solid, dive bars dashed; each has a tick pointing to the horizon. The bars are caged to the flight path marker in azimuth, so they slide sideways with drift, and turn with bank about the marker.'),
    num('roll', 'Bank', '°', -0.85, [-180, 180, 1], 'Bank angle, right wing down positive: the attitude bars turn about the flight path marker, and the roll indicator\'s caret moves along its arc (marks at 0, 10, 20, 30 and 45°).'),
    num('steering-cue', 'Great circle steering cue (position)', '°', -1.24, [-10, 10, 0.1], 'Great circle steering cue: lateral steering to the selected steerpoint. Its offset from the flight path marker, in degrees.'),
    num('steering', 'Great circle steering cue (line)', '°', 0, [-180, 180, 1], 'The line from the steering cue shows the steerpoint\'s relative bearing from the nose: 12 o\'clock ahead, 3 or 9 o\'clock 90° right or left, 6 o\'clock behind.'),
    num('steerpoint-azimuth', 'Steerpoint diamond (left/right)', '°', -1.62, [-15, 15, 0.1], 'Steerpoint diamond: where the selected steerpoint is, in position and altitude. Degrees left or right of the boresight cross.'),
    num('steerpoint-elevation', 'Steerpoint diamond (up/down)', '°', -7.63, [-25, 10, 0.1], 'The steerpoint diamond\'s height above (+) or below (−) the boresight cross, in degrees.'),
    num('velocity', 'Velocity', 'kt', 350, [0, 900, 1], 'Velocity scale and readout, 60–900 kt (0 below 60 kt CAS); a long mark every 50 kt, a short one every 10 kt.'),
    word('velocity-mode', 'Velocity type', P('C', 'T', 'G'), 'c', 'Letter by the velocity scale: C calibrated, T true, G ground speed (Velocity switch on the HUD control panel).'),
    num('altitude', 'Altitude', 'ft', 8360, [0, 60000, 10], 'Altitude scale and readout to the nearest 10 ft; a long mark every 500 ft, a short one every 100 ft.'),
    num('heading', 'Heading', '°', 197, [0, 359, 1], 'Heading scale (magnetic) with its lubber line above and the readout below; a long mark every 10°, a short one every 5°.'),
    num('g', 'G', 'g', 1.1, [-9.9, 9.9, 0.1], 'Current load factor, to a tenth of a g.'),
    word('soi', 'Sensor of interest marker', [{ id: 'off', label: '' }, { id: 'on', label: '*' }], 'off', 'An asterisk above the G readout while the HUD is the sensor of interest (guide p. 663 shows it). Blank when another display, such as the HAD, is the SOI.'),
    num('harm-asl', 'Azimuth steering line (position)', '°', 0, [-10, 10, 0.1], 'The azimuth steering line of the HARM launch cues: its offset from the boresight is how far you must turn to be on bearing to the target. Aligned through the flight path marker when on bearing (guide p. 663).'),
    word('master-arm', 'Master arm status', [{ id: 'none', label: '(blank)' }, { id: 'arm', label: 'ARM' }, { id: 'sim', label: 'SIM' }], 'arm', 'MASTER ARM switch: ARM, SIM (simulate) or blank (OFF).'),
    num('mach', 'Mach', 'M', 0.61, [0, 2.2, 0.01], 'Mach number to the hundredth.'),
    num('max-g', 'Maximum G', 'g', 5.7, [-9.9, 9.9, 0.1], 'Highest load factor of the flight; WARN RESET on the ICP resets it to 1.0.'),
    word('align', 'INS alignment cue (ALIGN)', [{ id: 'none', label: '(blank)' }, { id: 'align', label: 'ALIGN' }], 'none', 'ALIGN, in the place of the maximum G readout, while the INS alignment is usable for navigation (steady) and fully aligned (flashing); gone once the INS knob is in NAV. While it shows, the maximum G is not drawn.'),
    word('harm-cues', 'HARM launch cues', [{ id: 'none', label: '(none)' }, { id: 'amz', label: 'AMZ: loft cues, launch scale, FOV box steady' }, { id: 'mmz', label: 'MMZ: FOV box flashing, in range' }, { id: 'aa-tll', label: 'A-A: target locator line toward a bugged target outside the HUD' }, { id: 'aa-td', label: 'A-A: target designator box on the bugged target' }, ...MRM_CUES.map(c => ({ id: c.id, label: `AIM-120: ${c.id.slice(4)}` }))], 'none', 'Weapon and target cues. Air-to-air: the target designator box over the FCR target of interest, with its altitude below, or, when it is outside the HUD, the target locator line from the boresight cross toward it and the angle off the nose (guide pp. 405-406). AGM-88: the POS launch cues (guide pp. 663-664): the azimuth steering line, the minimum and maximum loft ticks on it, the HARM launch scale (HLS) staple on the right with a caret for the present range and the loft angle needed (an A prefix inside the missile maneuver zone), the release altitude under it, and the FOV box, which flashes when the missile is in range and the weapon release button is hot.'),
    word('master-mode', 'Master mode', [...P(...MODES), { id: 'mrm4', label: '4 MRM' }, { id: 'mrm3', label: '3 MRM' }], 'nav', 'Master mode, air-to-air missile type or air-to-ground submode.'),
    num('bullseye-bearing', 'Bullseye bearing', '°', 324, [0, 359, 1], 'Ownship bearing from the bullseye, when bullseye is on and no fuel message shows.'),
    num('bullseye-range', 'Bullseye range', 'NM', 53, [0, 999, 1], 'Ownship range from the bullseye, nautical miles.'),
    num('radar-alt', 'Radar altitude', 'ft', 7040, [0, 50000, 10], 'Radar altitude to the nearest 10 ft, boxed with R; blank when the radar altimeter is in standby or not transmitting.'),
    num('alow', 'ALOW setting', 'ft', 1500, [0, 50000, 10], 'CARA ALOW setting (AL); flashes, with a voice alert, below it.'),
    word('slant-range-source', 'Slant range source', P('F', 'L', 'T', 'P', 'B', 'R', 'M'), 'b', 'How the slant range is found: F radar, L laser, T targeting pod, P terrain referenced, B barometric to the steerpoint, R radar altimeter, M manual.'),
    num('slant-range', 'Slant range', 'NM', 19.5, [0, 999.9, 0.1], 'Straight-line range to the target or steerpoint, to a tenth of a nautical mile.'),
    num('ttg', 'Time to go', 's', 175, [0, 5999, 1], 'Time to the selected steerpoint at the present ground speed, minutes and seconds.'),
    num('steerpoint-distance', 'Distance to steerpoint', 'NM', 19, [0, 999, 1], 'Distance to the selected steerpoint, whole nautical miles (left of the chevron).'),
    num('steerpoint', 'Steerpoint number', '', 4, [1, 99, 1], 'Selected steerpoint number (right of the chevron).'),
  ],
};
