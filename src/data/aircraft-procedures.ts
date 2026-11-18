// Aircraft procedures can be public while their simulator validation is pending.
import { reviewTrainers } from './experiences';

export interface ProcedureStep {
  id: string;
  section: 'Pre-start' | 'Crank' | 'Stabilise';
  title: string;
  control: string;
  action: string;
  expect: string;
  caution?: string;
  evidence: string;
  /** Cockpit panels shown for this step (catalogue ids), the acting one first. */
  panels: string[];
  /** The control move that completes the step: `<panel>.<control>` to a position; `hold` ms it must be held. */
  do?: { control: string; to: string; on?: 'press' | 'release'; hold?: number };
  /** Check steps: the confirm button's label. */
  confirm?: string;
}
export interface AircraftProcedure {
  id: string;
  slug: string;
  airframe: string;
  title: string;
  objective: string;
  applicability: string;
  status: 'public-preview' | 'review-only';
  simVersion: string;
  steps: ProcedureStep[];
  /** Cockpit positions at the start, where they differ from each control's cold-and-dark `initial`. */
  initial?: Record<string, string>;
}
export const sourceUrl = 'https://www.digitalcombatsimulator.com/en/downloads/documentation/dcs-viper_early_access_manual_en/';
export const procedures: AircraftProcedure[] = [{
  id: 'procedure.dcs-f16c.engine-start',
  slug: 'engine-start',
  airframe: 'f-16c',
  title: 'F-16C — Engine Start',
  objective: 'Start the DCS F-16C main engine from a cold-and-dark state using exact control actions and expected indications.',
  applicability: 'DCS F-16C Block 50 (circa 2007); official guide edition 23 March 2026. In-simulator verification pending.',
  simVersion: 'DCS build not yet verified',
  status: 'public-preview',
  initial: { 'sidewall-controls.canopy-handle': 'unlocked', 'air-cond.air-source': 'off' },
  steps: [
    {id:'battery',section:'Pre-start',title:'Apply battery power',control:'MAIN PWR',action:'Move the MAIN PWR switch to BATT.',expect:'ACFT BATT FLCS RLY light is illuminated.',caution:'Limit operation on battery to 5 minutes without starting the engine or applying external power.',evidence:'p. 134, Before Engine Start, steps 1–2',panels:['elec'],do:{control:'elec.main-pwr',to:'batt'}},
    {id:'flcs-test',section:'Pre-start',title:'Test FLCS battery supply',control:'FLCS PWR TEST',action:'Hold the FLCS PWR TEST switch at TEST.',expect:'Verify the specified FLCS power test lights, including FLCS PMG and TO FLCS, illuminate; FLCS RLY goes out.',evidence:'p. 134, Before Engine Start, steps 3–4',panels:['test','elec'],do:{control:'test.flcs-pwr-test',to:'test',hold:1000}},
    {id:'flcs-release',section:'Pre-start',title:'Release the FLCS test',control:'FLCS PWR TEST',action:'Release the switch from TEST.',expect:'FLCS PWR TEST returns to its normal position.',evidence:'p. 134, Before Engine Start, step 5',panels:['test','elec'],do:{control:'test.flcs-pwr-test',to:'norm',on:'release'}},
    {id:'main-power',section:'Pre-start',title:'Select main power',control:'MAIN PWR',action:'Move the MAIN PWR switch to MAIN PWR.',expect:'ENGINE, HYD/OIL PRESS, ELEC SYS and SEC warnings illuminate; FLCS RLY indication is on.',evidence:'p. 134, Before Engine Start, steps 6–7',panels:['elec','right-eyebrow','caution'],do:{control:'elec.main-pwr',to:'main-pwr'}},
    {id:'epu-check',section:'Pre-start',title:'Check EPU indications',control:'EPU GEN / EPU PMG',action:'Confirm both EPU GEN and EPU PMG lights are OFF.',expect:'Neither EPU indicator is illuminated.',caution:'If either is illuminated, the official guide instructs you to switch MAIN PWR OFF and abort this start.',evidence:'p. 134, Before Engine Start, step 7',panels:['elec'],confirm:'Confirm EPU lights off'},
    {id:'parking-brake',section:'Pre-start',title:'Set the parking brake',control:'PARKING BRAKE / ANTI-SKID',action:'Move the switch up to PARKING BRAKE.',expect:'The switch stays in the upper position.',evidence:'Eagle Dynamics pp. 54–55',panels:['landing-gear'],do:{control:'landing-gear.anti-skid',to:'parking-brake'}},
    {id:'canopy-close',section:'Pre-start',title:'Lower the canopy',control:'Canopy switch',action:'Hold the lower half of the canopy switch until the canopy is down.',expect:'The switch returns to centre on release. CANOPY stays lit until the canopy is locked.',evidence:'Eagle Dynamics pp. 47, 72, 134',panels:['sidewall-controls','right-eyebrow'],do:{control:'sidewall-controls.canopy',to:'down',hold:1500}},
    {id:'canopy-lock',section:'Pre-start',title:'Lock the canopy',control:'Canopy handle (spider guard)',action:'Close the canopy handle against the cockpit wall.',expect:'The CANOPY warning on the right eyebrow extinguishes.',evidence:'Eagle Dynamics pp. 47, 72',panels:['sidewall-controls','right-eyebrow'],do:{control:'sidewall-controls.canopy-handle',to:'locked'}},
    {id:'canopy-check',section:'Pre-start',title:'Verify the canopy is locked',control:'CANOPY warning',action:'Check the right eyebrow for the CANOPY warning.',expect:'CANOPY is off.',evidence:'Eagle Dynamics pp. 47, 72',panels:['right-eyebrow'],confirm:'Confirm CANOPY light off'},
    {id:'ground-ready',section:'Pre-start',title:'Confirm the ground area is clear',control:'Ground crew / chocks',action:'Confirm ground communications are established as required, chocks are in place and ground crew are clear.',expect:'The engine-start area is clear and the aircraft is secured.',evidence:'Eagle Dynamics p. 134, Before Engine Start, steps 8–11',panels:[],confirm:'Confirm area clear'},
    {id:'fuel-feed',section:'Pre-start',title:'Select normal engine feed',control:'ENG FEED',action:'Turn the selector clockwise from OFF to NORM.',expect:'The pointer aligns with NORM.',evidence:'Eagle Dynamics p. 66',panels:['fuel'],do:{control:'fuel.eng-feed',to:'norm'}},
    {id:'air-source',section:'Pre-start',title:'Select normal air source',control:'AIR SOURCE',action:'Turn the selector clockwise from OFF to NORM.',expect:'The pointer aligns with NORM, selecting automatic environmental control and pressurisation.',evidence:'Eagle Dynamics p. 75',panels:['air-cond'],do:{control:'air-cond.air-source',to:'norm'}},
    {id:'throttle-cutoff',section:'Pre-start',title:'Verify throttle cutoff',control:'Throttle',action:'Check that the throttle is at the OFF detent before cranking.',expect:'The throttle remains at cutoff.',evidence:'Eagle Dynamics pp. 133, 135',panels:['sidewall-controls'],confirm:'Confirm throttle OFF'},
    {id:'jfs',section:'Crank',title:'Engage the jet fuel starter',control:'JFS switch',action:'Set JFS to START 2.',expect:'JET FUEL / RUN light illuminates within 30 seconds; engine RPM begins to rise. ACFT BATT TO FLCS illuminates and FLCS RLY extinguishes.',evidence:'p. 135, Engine Start, step 1',panels:['eng-jet-start','engine-instruments','caution','elec'],do:{control:'eng-jet-start.jfs',to:'start-2'}},
    {id:'sec',section:'Crank',title:'Check SEC and wait for 20% RPM',control:'SEC / RPM',action:'Confirm the SEC caution extinguishes and watch RPM reach at least 20%. Do not advance the throttle before this threshold.',expect:'SEC caution OFF; RPM indication at least 20%.',evidence:'p. 135, Engine Start, steps 2–3',panels:['caution','engine-instruments'],confirm:'Confirm SEC off and 20% RPM'},
    {id:'throttle',section:'Crank',title:'Introduce fuel',control:'Throttle',action:'Move throttle from cutoff to IDLE only once RPM is at least 20%.',expect:'Combustion begins within a few seconds; RPM and FTIT rise. On battery power only, these are the engine indications initially available.',evidence:'p. 135, Engine Start, step 3',panels:['sidewall-controls','engine-instruments'],do:{control:'sidewall-controls.throttle',to:'idle'}},
    {id:'generator',section:'Stabilise',title:'Confirm standby power',control:'ENGINE warning',action:'Watch engine acceleration and verify the ENGINE warning extinguishes at approximately 60% RPM.',expect:'ENGINE warning OFF; SEAT NOT ARMED caution ON as emergency-bus power is established. In DCS, also check three green gear-down indicators (described here only).',evidence:'p. 135, Engine Start, steps 4–5',panels:['engine-instruments','right-eyebrow','caution'],confirm:'Confirm ENGINE warning off'},
    {id:'idle-jfs',section:'Stabilise',title:'Check the JFS is off',control:'JFS switch',action:'Once RPM is at idle, confirm the JFS switch is OFF (set it OFF manually if needed).',expect:'JFS switch OFF; the RUN light is out.',evidence:'p. 135, Engine Start, step 6',panels:['eng-jet-start','engine-instruments'],confirm:'Confirm JFS OFF'},
    {id:'idle-hyd-oil',section:'Stabilise',title:'Check HYD/OIL PRESS',control:'HYD/OIL PRESS warning',action:'Check the right eyebrow.',expect:'HYD/OIL PRESS warning OFF.',evidence:'p. 135, Engine Start, step 7',panels:['right-eyebrow'],confirm:'Confirm HYD/OIL PRESS off'},
    {id:'idle-fuel-flow',section:'Stabilise',title:'Check fuel flow',control:'FUEL FLOW',action:'Read the fuel flow indicator.',expect:'700–1,700 PPH.',evidence:'p. 135, Engine Start, step 8',panels:['fuel-flow'],confirm:'Confirm fuel flow'},
    {id:'idle-oil',section:'Stabilise',title:'Check oil pressure',control:'Engine OIL pressure',action:'Read the OIL pressure indicator.',expect:'15 PSI or greater.',evidence:'p. 135, Engine Start, step 9',panels:['engine-instruments'],confirm:'Confirm oil pressure'},
    {id:'idle-noz',section:'Stabilise',title:'Check nozzle position',control:'Engine NOZ POS',action:'Read the NOZ POS indicator.',expect:'Above 94% open.',evidence:'p. 135, Engine Start, step 10',panels:['engine-instruments'],confirm:'Confirm nozzle position'},
    {id:'idle-rpm',section:'Stabilise',title:'Check idle RPM',control:'Engine RPM',action:'Read the RPM indicator.',expect:'62–80%.',evidence:'p. 135, Engine Start, step 11',panels:['engine-instruments'],confirm:'Confirm RPM'},
    {id:'idle-ftit',section:'Stabilise',title:'Check FTIT',control:'Engine FTIT',action:'Read the FTIT indicator.',expect:'650 °C or less.',evidence:'p. 135, Engine Start, step 12',panels:['engine-instruments'],confirm:'Confirm FTIT'},
    {id:'idle-hyd',section:'Stabilise',title:'Check hydraulic pressure',control:'HYD PRESS A and B',action:'Read both hydraulic pressure indicators.',expect:'2,850–3,250 PSI on A and B.',evidence:'p. 135, Engine Start, step 13',panels:['hyd-pressure'],confirm:'Confirm hydraulic pressure'},
    {id:'master-caution',section:'Stabilise',title:'Acknowledge master caution',control:'MASTER CAUTION',action:'Acknowledge the simulated SEAT NOT ARMED caution by pressing MASTER CAUTION. This step appears only when the master lamp is lit.',expect:'The MASTER CAUTION light goes out.',evidence:'Illustrative acknowledgement of the modelled caution',panels:['left-eyebrow','caution'],do:{control:'left-eyebrow.master-caution',to:'in'}}
  ]
}];
export const visibleProcedures = procedures.filter(p => p.status === 'public-preview' || reviewTrainers);
export const procedureRoute = (p: AircraftProcedure) => `manual/aircraft-procedures/${p.airframe}/${p.slug}/`;
export const airframes = [{slug:'f-16c',title:'F-16C Viper'}];
