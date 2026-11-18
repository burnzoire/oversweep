import type { AircraftCockpit } from '../types';
import { elec } from './elec.ts';
import { audio } from './audio.ts';
import { engJetStart } from './eng-jet-start.ts';
import { fuel } from './fuel.ts';
import { landingGear } from './landing-gear.ts';
import { airCond } from './air-cond.ts';
import { caution } from './caution.ts';
import { rightEyebrow } from './right-eyebrow.ts';
import { leftEyebrow } from './left-eyebrow.ts';
import { extLighting } from './ext-lighting.ts';
import { ecm } from './ecm.ts';
import { uhf } from './uhf.ts';
import { snsrPwr } from './snsr-pwr.ts';
import { interiorLighting } from './interior-lighting.ts';
import { avionicsPower } from './avionics-power.ts';
import { engineInstruments } from './engine-instruments.ts';
import { fuelQty } from './fuel-qty.ts';
import { fuelFlow } from './fuel-flow.ts';
import { epu } from './epu.ts';
import { defog } from './defog.ts';
import { sidewallControls } from './sidewall-controls.ts';

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
        { id: 'left-eyebrow', title: 'Left eyebrow lights', page: 45, spec: leftEyebrow },
        { id: 'right-eyebrow', title: 'Right eyebrow lights', page: 46, spec: rightEyebrow },
        { id: 'misc', title: 'MISC panel', page: 47 },
        { id: 'rf-switch', title: 'RF switch', page: 48 },
        { id: 'sai', title: 'Standby attitude indicator', page: 49 },
        { id: 'engine-instruments', title: 'Engine instruments', page: 50, spec: engineInstruments },
        { id: 'fuel-flow', title: 'Fuel flow indicator', page: 50, spec: fuelFlow },
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
        { id: 'landing-gear', title: 'Landing gear panel', page: 55, spec: landingGear },
        { id: 'hmcs', title: 'HMCS control panel', page: 57 },
        { id: 'alt-gear', title: 'ALT GEAR handle', page: 57 },
      ],
    },
    {
      id: 'right-aux-console', title: 'Right auxiliary console', panels: [
        { id: 'compass', title: 'Magnetic compass', page: 58 },
        { id: 'fuel-qty', title: 'Fuel quantity indicator', page: 58, spec: fuelQty },
        { id: 'pfld', title: 'Pilot fault list display', page: 59 },
        { id: 'caution', title: 'Caution light panel', page: 59, spec: caution },
        { id: 'hyd-pressure', title: 'Hydraulic pressure indicators', page: 61 },
        { id: 'epu-fuel', title: 'EPU fuel quantity indicator', page: 61 },
        { id: 'cabin-pressure', title: 'Cabin pressure indicator', page: 61 },
        { id: 'clock', title: 'Clock', page: 61 },
      ],
    },
    {
      id: 'left-console', title: 'Left console', panels: [
        { id: 'manual-pitch-override', title: 'Manual pitch override switch', page: 62 },
        { id: 'eng-jet-start', title: 'ENG & JET START panel', page: 63, spec: engJetStart },
        { id: 'epu', title: 'EPU panel', page: 64, spec: epu },
        { id: 'elec', title: 'ELEC panel', page: 64, spec: elec },
        { id: 'audio', title: 'AUDIO 1 & 2 panels', page: 65, spec: audio },
        { id: 'avtr', title: 'AVTR panel', page: 66 },
        { id: 'fuel', title: 'FUEL panel', page: 67, spec: fuel },
        { id: 'iff', title: 'IFF panel', page: 67 },
        { id: 'ext-lighting', title: 'EXT LIGHTING panel', page: 69, spec: extLighting },
        { id: 'ecm', title: 'ECM panel', page: 706, spec: ecm },
        { id: 'uhf', title: 'UHF backup panel', page: 259, spec: uhf },
        { id: 'flt-control', title: 'FLT CONTROL panel', page: 71 },
        { id: 'manual-trim', title: 'MANUAL TRIM panel', page: 72 },
        { id: 'test', title: 'TEST panel', page: 72 },
        { id: 'canopy-jettison', title: 'Canopy jettison T-handle', page: 74 },
        { id: 'defog', title: 'DEFOG lever', page: 74, spec: defog },
        { id: 'anti-g-test', title: 'ANTI-G TEST button', page: 62 },
      ],
    },
    {
      id: 'left-sidewall', title: 'Left sidewall', panels: [
        { id: 'throttle', title: 'Throttle', page: 86 },
        // Controls on the vertical sidewall above the throttle: canopy switch
        // and handle (p. 73) and CHAFF/FLARE dispense button (p. 708). The
        // handcrank is further aft, so it has its own page. DEFOG and the
        // canopy jettison T-handle are on the (horizontal) left console.
        { id: 'sidewall-controls', title: 'Sidewall controls', page: 73, spec: sidewallControls },
        { id: 'canopy-handcrank', title: 'Manual canopy handcrank', page: 62 },
      ],
    },
    {
      id: 'right-console', title: 'Right console', panels: [
        { id: 'snsr-pwr', title: 'SNSR PWR panel', page: 75, spec: snsrPwr },
        { id: 'interior-lighting', title: 'Interior LIGHTING panel', page: 76, spec: interiorLighting },
        { id: 'air-cond', title: 'AIR COND panel', page: 76, spec: airCond },
        { id: 'ky-58', title: 'KY-58 secure voice panel', page: 77 },
        { id: 'oxygen', title: 'OXYGEN regulator panel', page: 77 },
        { id: 'anti-ice', title: 'ANTI ICE & ANT SEL switches', page: 78 },
        { id: 'avionics-power', title: 'AVIONICS POWER panel', page: 78, spec: avionicsPower },
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
