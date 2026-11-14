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
  visual?: 'power' | 'test' | 'jfs' | 'rpm20' | 'idle' | 'engine' | 'stable';
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
}
export const sourceUrl = 'https://www.digitalcombatsimulator.ru/upload/iblock/6f7/joywm66pwdgg4iacljy8zolons4dz8dh/DCS%20F-16C%20Early%20Access%20Guide%20EN.pdf';
export const procedures: AircraftProcedure[] = [{
  id: 'procedure.dcs-f16c.engine-start',
  slug: 'engine-start',
  airframe: 'f-16c',
  title: 'F-16C — Engine Start',
  objective: 'Start the DCS F-16C main engine from a cold-and-dark state using exact control actions and expected indications.',
  applicability: 'DCS F-16C Block 50 (circa 2007); official guide edition 23 March 2026. In-simulator verification pending.',
  simVersion: 'DCS build not yet verified',
  status: 'public-preview',
  steps: [
    {id:'battery',section:'Pre-start',title:'Apply battery power',control:'MAIN PWR',action:'Move the MAIN PWR switch to BATT.',expect:'ACFT BATT FLCS RLY light is illuminated.',caution:'Limit operation on battery to 5 minutes without starting the engine or applying external power.',evidence:'p. 134, Before Engine Start, steps 1–2',visual:'power'},
    {id:'flcs-test',section:'Pre-start',title:'Test FLCS battery supply',control:'FLCS PWR TEST',action:'Hold the FLCS PWR TEST switch at TEST.',expect:'Verify the specified FLCS power test lights, including FLCS PMG and TO FLCS, illuminate; FLCS RLY goes out.',evidence:'p. 134, Before Engine Start, steps 3–4',visual:'test'},
    {id:'flcs-release',section:'Pre-start',title:'Release the FLCS test',control:'FLCS PWR TEST',action:'Release the switch from TEST.',expect:'FLCS PWR TEST returns to its normal position.',evidence:'p. 134, Before Engine Start, step 5',visual:'power'},
    {id:'main-power',section:'Pre-start',title:'Select main power',control:'MAIN PWR',action:'Move the MAIN PWR switch to MAIN PWR.',expect:'ENGINE, HYD/OIL PRESS, ELEC SYS and SEC warnings illuminate; FLCS RLY indication is on.',evidence:'p. 134, Before Engine Start, steps 6–7',visual:'power'},
    {id:'epu-check',section:'Pre-start',title:'Check EPU indications',control:'EPU GEN / EPU PMG',action:'Confirm both EPU GEN and EPU PMG lights are OFF.',expect:'Neither EPU indicator is illuminated.',caution:'If either is illuminated, the official guide instructs you to switch MAIN PWR OFF and abort this start.',evidence:'p. 134, Before Engine Start, step 7',visual:'power'},
    {id:'ground-ready',section:'Pre-start',title:'Prepare for crank',control:'Ground / canopy',action:'Establish required ground communications, position chocks, and ensure ground crew are clear. Set canopy as desired.',expect:'Engine-start area is clear and aircraft secured.',evidence:'p. 134, Before Engine Start, steps 8–11'},
    {id:'jfs',section:'Crank',title:'Engage the jet fuel starter',control:'JFS switch',action:'Set JFS to START 2.',expect:'JET FUEL / RUN light illuminates within 30 seconds; engine RPM begins to rise. ACFT BATT TO FLCS illuminates and FLCS RLY extinguishes.',evidence:'p. 135, Engine Start, step 1',visual:'jfs'},
    {id:'sec',section:'Crank',title:'Check SEC and wait for 20% RPM',control:'SEC / RPM',action:'Confirm the SEC caution extinguishes and watch RPM reach at least 20%. Do not advance the throttle before this threshold.',expect:'SEC caution OFF; RPM indication at least 20%.',evidence:'p. 135, Engine Start, steps 2–3',visual:'rpm20'},
    {id:'throttle',section:'Crank',title:'Introduce fuel',control:'Throttle',action:'Move throttle from cutoff to IDLE only once RPM is at least 20%.',expect:'Combustion begins within a few seconds; RPM and FTIT rise. On battery power only, these are the engine indications initially available.',evidence:'p. 135, Engine Start, step 3',visual:'idle'},
    {id:'generator',section:'Stabilise',title:'Confirm standby power',control:'ENGINE warning',action:'Watch engine acceleration and verify the ENGINE warning extinguishes at approximately 60% RPM.',expect:'ENGINE warning OFF; SEAT NOT ARMED caution ON as emergency-bus power is established. In DCS, also check three green gear-down indicators (described here only).',evidence:'p. 135, Engine Start, steps 4–5',visual:'engine'},
    {id:'idle-check',section:'Stabilise',title:'Check engine at idle',control:'Engine instruments',action:'Allow RPM to stabilise. Confirm JFS is OFF (set OFF manually if needed), HYD/OIL PRESS warning OFF, then check RPM and FTIT. The fuel flow, oil pressure, nozzle position and hydraulic checks below are reference-only for DCS.',expect:'RPM 62–80%; FTIT ≤650°C; fuel flow 700–1,700 PPH; oil pressure ≥15 PSI; nozzle position >94%; hydraulic A/B 2,850–3,250 PSI.',evidence:'p. 135, Engine Start, steps 6–13',visual:'stable'},
    {id:'master-caution',section:'Stabilise',title:'Acknowledge master caution',control:'MASTER CAUTION',action:'Acknowledge the simulated SEAT NOT ARMED caution by pressing MASTER CAUTION. This step appears only when the master lamp is lit.',expect:'The MASTER CAUTION light goes out.',evidence:'Illustrative acknowledgement of the modelled caution',visual:'stable'}
  ]
}];
export const visibleProcedures = procedures.filter(p => p.status === 'public-preview' || reviewTrainers);
export const procedureRoute = (p: AircraftProcedure) => `manual/aircraft-procedures/${p.airframe}/${p.slug}/`;
export const airframes = [{slug:'f-16c',title:'F-16C Viper'}];
