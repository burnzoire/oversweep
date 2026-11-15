import type { PanelSpec } from './types';

/**
 * F-16C ELEC control panel (left console), as modelled in DCS.
 * Units are pixels of the rectified reference: the guide's p. 64 cockpit image
 * warped so the four DZUS fastener centres form a rectangle:
 *   python3 -I scripts/panel-trace.py <p64-image> <out> 22,67=28,64 307,59=304,64 40,387=28,390 309,392=304,390 332 442
 * (extract the image with `pdfimages -j -f 64 -l 64`; it is the 330 x 440 JPEG).
 */
export const f16cElec: PanelSpec = {
  id: 'f16c-elec',
  title: 'F-16C ELEC control panel',
  size: [330, 442],
  unit: 4,
  source: {
    trace: 'Eagle Dynamics, DCS F-16C Viper Early Access Guide (EN, 16 Aug 2026 edition), p. 64, "ELEC Control Panel" image, rectified on the four DZUS fasteners',
    size: 'No dimensions in the guide; proportions are those of the DCS cockpit model. Left, top and bottom panel edges are cropped in the reference and are drawn just inside the crop with a small gap so the raised plate edge stays visible.',
    checks: ['Same guide, p. 64 callouts 1-10 (control names and lamp legends)'],
    variant: 'DCS F-16C Block 50',
  },
  plates: [
    { d: 'M9 0H321Q325 0 325 4V438Q325 442 321 442H9Q5 442 5 438V4Q5 0 9 0Z' },
    { raised: true, d: 'M13 5H178Q182 5 182 9V292Q182 297 187 297H258Q263 297 263 302V333Q263 338 258 338H13Q9 338 9 334V9Q9 5 13 5Z' },
  ],
  parts: [
    { kind: 'dzus', at: [26, 64], r: 20, slot: 0 },
    { kind: 'dzus', at: [304, 64], r: 20, slot: 0 },
    { kind: 'dzus', at: [25, 390], r: 20, slot: 0 },
    { kind: 'dzus', at: [304, 390], r: 20, slot: 0 },
    { kind: 'screw', at: [147, 123], r: 16 },
    { kind: 'screw', at: [61, 293], r: 16 },
    { kind: 'screw', at: [77, 370], r: 9 },

    { kind: 'label', at: [99, 32], text: 'MAIN PWR', size: 14, width: 76 },
    { kind: 'label', at: [149, 81], text: 'BATT', size: 15, width: 41 },
    { kind: 'label', at: [95, 128], text: 'OFF', size: 14, width: 28 },
    {
      kind: 'toggle', id: 'main-pwr', at: [97, 81], r: 24, initial: 'off',
      stateAttr: 'main-state', hitClass: 'switch',
      positions: [
        { id: 'main', label: 'MAIN PWR' },
        { id: 'batt', label: 'BATT' },
        { id: 'off', label: 'OFF' },
      ],
    },

    { kind: 'label', at: [78, 173], text: '+', size: 10 },
    { kind: 'label', at: [122, 184], text: 'CAUTION', size: 14, width: 65 },
    { kind: 'label', at: [122, 204], text: 'RESET', size: 14, width: 48 },
    { kind: 'pushbutton', id: 'caution-reset', at: [122, 257], r: 30, label: 'CAUTION RESET', hitClass: 'reset', hitAttrs: { 'data-elec-reset': '' } },

    { kind: 'label', at: [20, 172], text: 'E', size: 20 },
    { kind: 'label', at: [20, 198], text: 'L', size: 20 },
    { kind: 'label', at: [20, 225], text: 'E', size: 20 },
    { kind: 'label', at: [20, 251], text: 'C', size: 20 },

    { kind: 'rule', from: [97, 321], to: [128, 321] },
    { kind: 'label', at: [175, 321], text: 'ACFT BATT', size: 16, width: 86 },
    { kind: 'rule', from: [222, 321], to: [253, 321] },

    { kind: 'annunciator', at: [192, 49], size: [69, 73], cap: 13, cells: [{ text: 'FLCS PMG', lamp: 'flcs-pmg', width: 49 }, { text: 'MAIN GEN', lamp: 'main-gen', width: 49 }] },
    { kind: 'annunciator', at: [192, 127], size: [69, 76], cap: 13, cells: [{ text: 'STBY GEN', lamp: 'stby-gen', width: 49 }, { text: ' ' }] },
    { kind: 'annunciator', at: [192, 210], size: [69, 77], cap: 13, cells: [{ text: 'EPU GEN', lamp: 'epu-gen', width: 46 }, { text: 'EPU PMG', lamp: 'epu-pmg', width: 47 }] },
    { kind: 'annunciator', at: [102, 345], size: [75, 80], cap: 13, cells: [{ text: 'TO FLCS', lamp: 'to-flcs', width: 44 }, { text: 'FLCS RLY', lamp: 'flcs-rly', width: 51 }] },
    { kind: 'annunciator', at: [190, 345], size: [73, 80], cap: 13, cells: [{ text: 'FAIL', lamp: 'acft-batt-fail', width: 25 }] },
  ],
};
