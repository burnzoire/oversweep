import type { MfdDisplay } from '../types';
import { tracer } from '../trace.ts';

/**
 * F-16C SMS air-to-air missile page with an AIM-120 type selected (guide p. 599 image, 660 x 660 px, the same
 * square-on MFD as p. 122), for the shared MFD (`mfd.ts`). Measured on the figure: AAM centred x 185.5 and INV x 406
 * on the top row (y 117); SLAVE from x 112, RDY centred x 373.5 and 4A120B ending x 551 on OSB 19 and OSB 7's row
 * (y 257); the stations on y 471.5, left wing 1, M, 3 centred x 118, 144, 170 (the selected station inverse), right
 * wing 7, M, 9 centred x 494.5, 520, 546; the second RDY centred x 332, y 511; the format row SWAP, SMS (inverse),
 * HSD and S-J.
 *
 * The load is the figure's: four AIM-120Bs on stations 1, 3, 7 and 9 and two AIM-9s (M, the other missile type) on
 * 2 and 8. OSB 1 reads MSL in missile override (p. 599 item 1).
 */
const PX = 4.8;
const { mm } = tracer(PX);
const SC: [number, number] = [329.5, 330];
type Page = MfdDisplay['pages'][number];
type Word = Page['words'][number];
const w = (t: string, x: number, y: number, a?: Word['a'], inv?: boolean): Word =>
  ({ t, at: [mm(x - SC[0]), mm(y - SC[1])], ...(a ? { a } : {}), ...(inv ? { inv } : {}) });

type Station = '1' | '3' | '7' | '9';
interface SmsAa {
  /** OSB 1: AAM in A-A master mode, MSL in missile override. */
  mode: 'AAM' | 'MSL';
  los: 'SLAVE' | 'BORE';
  /** Status: RDY with MASTER ARM at ARM, blank with it off. */
  rdy: boolean;
  /** AIM-120s left, by station, and the selected station. */
  left: Station[];
  sel: Station;
}
const X: Record<Station | '2' | '8', number> = { 1: 118, 2: 144, 3: 170, 7: 494.5, 8: 520, 9: 546 };
function sms(id: string, s: SmsAa): Page {
  const st = (k: Station) => (s.left.includes(k) ? [w(k, X[k], 471.5, undefined, k === s.sel)] : []);
  return {
    id, words: [
      w(s.mode, 185.5, 117), w('INV', 406, 117),
      w(s.los, 112, 257, 'start'), ...(s.rdy ? [w('RDY', 373.5, 257)] : []), w(`${s.left.length}A120B`, 551, 257, 'end'),
      ...st('1'), w('M', X[2], 471.5), ...st('3'), ...st('7'), w('M', X[8], 471.5), ...st('9'),
      ...(s.rdy ? [w('RDY', 332, 511)] : []),
      w('SWAP', 186.5, 538.5), w('SMS', 259.5, 538.5, undefined, true), w('HSD', 332, 538.5), w('S-J', 478, 538.5),
    ],
  };
}

const ALL: Station[] = ['1', '3', '7', '9'];
export const SMS_AA_STATES = {
  'sms-msl': { mode: 'MSL', los: 'SLAVE', rdy: false, left: ALL, sel: '1' },
  'sms-msl-rdy': { mode: 'MSL', los: 'SLAVE', rdy: true, left: ALL, sel: '1' },
  'sms-msl-3': { mode: 'MSL', los: 'SLAVE', rdy: true, left: ['3', '7', '9'], sel: '9' },
  'sms-aam': { mode: 'AAM', los: 'SLAVE', rdy: false, left: ALL, sel: '1' },
  'sms-aam-bore': { mode: 'AAM', los: 'BORE', rdy: false, left: ALL, sel: '1' },
  'sms-aam-bore-rdy': { mode: 'AAM', los: 'BORE', rdy: true, left: ALL, sel: '1' },
  'sms-aam-bore-3': { mode: 'AAM', los: 'BORE', rdy: true, left: ['3', '7', '9'], sel: '9' },
} satisfies Record<string, SmsAa>;
export type SmsAaPage = keyof typeof SMS_AA_STATES;
export const smsAaPages: Page[] = Object.entries(SMS_AA_STATES).map(([id, s]) => sms(id, s as SmsAa));
export const smsAaPageLabels: Record<SmsAaPage, string> = {
  'sms-msl': 'SMS: missile override, 4 AIM-120B, SLAVE, MASTER ARM off',
  'sms-msl-rdy': 'SMS: missile override, 4 AIM-120B, SLAVE, ready',
  'sms-msl-3': 'SMS: missile override, 3 AIM-120B left, station 9 next',
  'sms-aam': 'SMS: A-A, AAM, 4 AIM-120B, SLAVE',
  'sms-aam-bore': 'SMS: A-A, AAM, 4 AIM-120B, BORE, MASTER ARM off',
  'sms-aam-bore-rdy': 'SMS: A-A, AAM, AIM-120B, BORE, ready',
  'sms-aam-bore-3': 'SMS: A-A, AAM, BORE, 3 AIM-120B left',
};
/** A hint box in p. 599 pixels (`#x0 y0 x1 y1` in mm about the screen centre). */
export const smsBox = (x0: number, y0: number, x1: number, y1: number) => `#${[x0 - SC[0], y0 - SC[1], x1 - SC[0], y1 - SC[1]].map(v => +mm(v).toFixed(3)).join(' ')}`;
