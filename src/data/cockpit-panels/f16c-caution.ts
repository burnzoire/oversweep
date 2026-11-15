import type { Annunciator, PanelSpec } from './types';

/**
 * F-16C caution light panel, as modelled in DCS.
 * Units are pixels of the guide's p. 59 caution panel image (485 x 372), which is
 * already square-on, so no warp was needed:
 *   python3 -I scripts/panel-trace.py <p59-image> <out> 0,0 485,0 0,372 485,372
 */
const legends = [
  ['FLCS\nFAULT', 'ENGINE\nFAULT', 'AVIONICS\nFAULT', 'SEAT NOT\nARMED'],
  ['ELEC SYS', 'SEC', 'EQUIP\nHOT', 'NWS\nFAIL'],
  ['PROBE HEAT', 'FUEL/OIL\nHOT', 'RADAR\nALT', 'ANTI\nSKID'],
  ['CADC', 'INLET\nICING', 'IFF', 'HOOK'],
  ['STORES\nCONFIG', 'OVERHEAT', 'NUCLEAR', 'OBOGS'],
  ['ATF NOT\nENGAGED', 'EEC', '', 'CABIN\nPRESS'],
  ['FWD\nFUEL LOW', 'BUC', '', ''],
  ['AFT\nFUEL LOW', '', '', ''],
];
/** Lamps the startup procedure drives. */
const lamps: Record<string, string> = { 'ELEC SYS': 'warn-elec', SEC: 'warn-sec', 'SEAT NOT\nARMED': 'warn-seat' };
const colX = [15, 130.3, 245.6, 361], rowY = [17, 60.4, 103.8, 147.2, 190.6, 234, 277.4, 320.8];

export const f16cCaution: PanelSpec = {
  id: 'f16c-caution',
  title: 'F-16C caution light panel',
  size: [485, 372],
  unit: 4,
  source: {
    trace: 'Eagle Dynamics, DCS F-16C Viper Early Access Guide (EN, 16 Aug 2026 edition), p. 59, "Caution Light Panel" image',
    size: 'No dimensions in the guide; the image shows the lamp matrix only, so the plate edge is drawn at the image edge.',
    checks: ['Same guide, p. 59 lamp descriptions'],
    variant: 'DCS F-16C Block 50',
  },
  plates: [{ d: 'M6 0H479Q485 0 485 6V366Q485 372 479 372H6Q0 372 0 366V6Q0 0 6 0Z' }],
  parts: legends.flatMap((row, r) => row.map((text, c): Annunciator => ({
    kind: 'annunciator', at: [colX[c], rowY[r]], size: [110, 37], cap: 8.5, inset: 2.5,
    cells: [{ text, lamp: lamps[text], width: Math.min(88, text.split('\n').reduce((m, l) => Math.max(m, l.length), 0) * 7.6) || undefined }],
  }))),
};
