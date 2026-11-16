import type { AircraftCockpit } from '../types';
import { elec } from './elec.ts';
import { fuel } from './fuel.ts';

/**
 * DCS F-16C cockpit catalogue: areas and panels in the order the official guide
 * describes them (Cockpit Overview, pp. 43–82). Ids are stable: procedures and
 * links refer to `<panel id>` and `<panel id>.<control id>`. A panel without a
 * `spec` is listed but not yet built.
 */
export const f16cCockpit: AircraftCockpit = {
  id: 'dcs-f16c',
  airframe: 'f-16c',
  title: 'F-16C Viper',
  variant: 'DCS F-16C Viper (Block 50)',
  manual: {
    title: 'Eagle Dynamics — DCS F-16C Viper Early Access Guide',
    url: 'https://www.digitalcombatsimulator.com/en/downloads/documentation/dcs-viper_early_access_manual_en/',
    edition: 'EN, 16 August 2026',
  },
  areas: [
    {
      id: 'instrument-panel', title: 'Instrument panel', panels: [
        { id: 'aoa-indexer', title: 'AoA indexer', page: 44 },
        { id: 'ar-nws-indicator', title: 'AR status / NWS indicator', page: 45 },
        { id: 'left-eyebrow', title: 'Left eyebrow lights', page: 45 },
        { id: 'right-eyebrow', title: 'Right eyebrow lights', page: 46 },
        { id: 'misc', title: 'MISC panel', page: 47 },
        { id: 'rf-switch', title: 'RF switch', page: 48 },
        { id: 'sai', title: 'Standby attitude indicator', page: 49 },
        { id: 'engine-instruments', title: 'Engine instruments', page: 50 },
        { id: 'airspeed-mach', title: 'Airspeed / Mach indicator', page: 51 },
        { id: 'altimeter', title: 'Altimeter', page: 51 },
        { id: 'aoa-indicator', title: 'AoA indicator', page: 52 },
        { id: 'vvi', title: 'Vertical velocity indicator', page: 52 },
        { id: 'adi', title: 'Attitude director indicator', page: 53 },
        { id: 'fuel-qty-sel', title: 'FUEL QTY SEL panel', page: 54 },
      ],
    },
    {
      id: 'left-aux-console', title: 'Left auxiliary console', panels: [
        { id: 'landing-gear', title: 'Landing gear panel', page: 55 },
        { id: 'hmcs', title: 'HMCS control panel', page: 57 },
        { id: 'alt-gear', title: 'ALT GEAR handle', page: 57 },
      ],
    },
    {
      id: 'right-aux-console', title: 'Right auxiliary console', panels: [
        { id: 'compass', title: 'Magnetic compass', page: 58 },
        { id: 'fuel-qty', title: 'Fuel quantity indicator', page: 58 },
        { id: 'pfld', title: 'Pilot fault list display', page: 59 },
        { id: 'caution', title: 'Caution light panel', page: 59 },
        { id: 'hyd-pressure', title: 'Hydraulic pressure indicators', page: 61 },
        { id: 'epu-fuel', title: 'EPU fuel quantity indicator', page: 61 },
        { id: 'cabin-pressure', title: 'Cabin pressure indicator', page: 61 },
        { id: 'clock', title: 'Clock', page: 61 },
      ],
    },
    {
      id: 'left-console', title: 'Left console', panels: [
        { id: 'manual-pitch-override', title: 'Manual pitch override switch', page: 62 },
        { id: 'eng-jet-start', title: 'ENG & JET START panel', page: 63 },
        { id: 'epu', title: 'EPU panel', page: 64 },
        { id: 'elec', title: 'ELEC panel', page: 64, spec: elec },
        { id: 'audio', title: 'AUDIO 1 & 2 panels', page: 65 },
        { id: 'avtr', title: 'AVTR panel', page: 66 },
        { id: 'fuel', title: 'FUEL panel', page: 67, spec: fuel },
        { id: 'iff', title: 'IFF panel', page: 67 },
        { id: 'ext-lighting', title: 'EXT LIGHTING panel', page: 69 },
        { id: 'flt-control', title: 'FLT CONTROL panel', page: 71 },
        { id: 'manual-trim', title: 'MANUAL TRIM panel', page: 72 },
        { id: 'test', title: 'TEST panel', page: 72 },
        { id: 'canopy', title: 'Canopy switch and handle', page: 73 },
        { id: 'canopy-jettison', title: 'Canopy jettison T-handle', page: 74 },
        { id: 'defog', title: 'DEFOG lever', page: 74 },
      ],
    },
    {
      id: 'right-console', title: 'Right console', panels: [
        { id: 'snsr-pwr', title: 'SNSR PWR panel', page: 75 },
        { id: 'interior-lighting', title: 'Interior LIGHTING panel', page: 76 },
        { id: 'air-cond', title: 'AIR COND panel', page: 76 },
        { id: 'ky-58', title: 'KY-58 secure voice panel', page: 77 },
        { id: 'oxygen', title: 'OXYGEN regulator panel', page: 77 },
        { id: 'anti-ice', title: 'ANTI ICE & ANT SEL switches', page: 78 },
        { id: 'avionics-power', title: 'AVIONICS POWER panel', page: 78 },
        { id: 'misc-switches', title: 'Voice message, zeroize, seat adjust and nuclear consent switches', page: 80 },
      ],
    },
    {
      id: 'ejection-seat', title: 'Ejection seat', panels: [
        { id: 'ejection-seat', title: 'Ejection seat controls', page: 81 },
      ],
    },
  ],
};

export const cockpits = [f16cCockpit];
export const builtPanels = (c: AircraftCockpit) =>
  c.areas.flatMap(a => a.panels.filter(p => p.spec).map(p => ({ area: a, panel: p, spec: p.spec! })));
export const cockpitRoute = (c: AircraftCockpit) => `manual/aircraft-procedures/${c.airframe}/cockpit/`;
export const panelRoute = (c: AircraftCockpit, panelId: string) => `${cockpitRoute(c)}${panelId}/`;
