// Aircraft procedures can be public while their simulator validation is pending.
import { reviewTrainers } from './experiences';

export interface ProcedureStep {
  id: string;
  section: string;
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
  /** Turn a knob until the readout shows `to`, `per` degrees a click. */
  turn?: { control: string; to: number; per: number };
  /** A cross-check question: the reader picks one answer; `answer` indexes `options`. */
  ask?: { question: string; options: string[]; answer: number; right: string; wrong: string };
  /** Encyclopedia records this step sends the reader to (slugs, shown as links). */
  links?: { slug: string; label: string; anchor?: string }[];
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
  /** Which script drives the cockpit panels. */
  model: 'engine-start' | 'tacan-recovery';
  /** The scenario shown above the steps, and the closing heading. */
  intro: string;
  description: string;
  complete: string;
  /** The Sources section's text. */
  sources: string;
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
  model: 'engine-start',
  intro: 'Initial state: cold-and-dark F-16C on the ground, canopy open, throttle at cutoff. Ground crew and area must be clear before cranking. The cockpit panels beside the steps are a teaching simulation, not connected to DCS.',
  description: 'Illustrated DCS F-16C engine-start procedure on interactive cockpit panels.',
  complete: 'Engine start complete',
  sources: 'Eagle Dynamics — DCS F-16C Early Access Guide (23 March 2026), cockpit controls, “Before Engine Start” and “Engine Start”, pp. 134–135.',
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

const GUIDE = 'Eagle Dynamics pp.';
const tacan: AircraftProcedure = {
  id: 'procedure.dcs-f16c.tacan-recovery',
  slug: 'tacan-recovery',
  airframe: 'f-16c',
  title: 'F-16C — TACAN Navigation & Recovery',
  objective: 'Return to Incirlik with the INS no longer trusted: look up the beacon, tune it on the ICP and DED, set the EHSI to TCN and read the bearing, course and distance.',
  applicability: 'DCS F-16C Block 50 (circa 2007); official guide edition 16 August 2026. Beacon data is the Syria map’s. In-simulator verification pending.',
  simVersion: 'DCS build not yet verified',
  status: 'public-preview',
  model: 'tacan-recovery',
  intro: 'Scenario: you are airborne in the Syria map, heading 060°, and the INS can no longer be relied on, so the EHSI is still in NAV mode and its steerpoint bearing and range cannot be trusted. Incirlik is your recovery field. The panels beside the steps are a teaching simulation, not connected to DCS; the aircraft’s position, bearing and range are illustrative.',
  description: 'Illustrated DCS F-16C TACAN recovery: look up a beacon, tune it with the ICP and DED, and navigate to it on the EHSI.',
  complete: 'TACAN recovery set up: you are tracking inbound to Incirlik',
  sources: 'Eagle Dynamics — DCS F-16C Viper Early Access Guide (EN, 16 August 2026): EHSI pp. 230–232, MIDS LVT p. 235, “Tuning a TACAN Station” and T-ILS page pp. 236–237, “Radio Navigation by TACAN” and EHSI TACAN mode pp. 238–239. Beacon data: the Encyclopedia’s Syria map table, from the game’s own data.',
  steps: [
    {id:'lookup',section:'Find the beacon',title:'Look up the airfield’s TACAN',control:'Encyclopedia',action:'Open the Syria map’s airfield table and find Incirlik. Note its TACAN channel and three-letter identifier.',expect:'TACAN channel 21, identifier DAN. The game’s data gives no band (the table shows 21X*, band assumed); the guide’s own example for Incirlik is 21X, and you will confirm the band by the identifier you receive.',evidence:'Encyclopedia: Syria map airfield table; Eagle Dynamics p. 236 (DAN is Incirlik)',panels:[],links:[{slug:'dcs-syria',label:'Syria map airfield table',anchor:'af-incirlik'},{slug:'incirlik',label:'Incirlik record'}],confirm:'I have channel 21 and ident DAN'},
    {id:'mids',section:'Tune the station',title:'Power the MIDS LVT',control:'MIDS LVT knob',action:'Set the MIDS LVT knob on the AVIONICS POWER panel to ON.',expect:'The TACAN field at the bottom right of the CNI page, blank while the MIDS LVT is off, shows the current TACAN channel and band (here 1Y).',caution:'On the Block 50 the MIDS LVT carries the TACAN: with it off, the UFC TACAN functions and the EHSI bearing and range are unavailable.',evidence:GUIDE+' 235–236',panels:['avionics-power','ded'],do:{control:'avionics-power.mids',to:'on'}},
    {id:'tils',section:'Tune the station',title:'Open the T-ILS page',control:'ICP 1 / T-ILS',action:'With the CNI page showing, press 1 / T-ILS on the ICP keypad.',expect:'The DED shows the T-ILS page: TCN REC at top left, CHAN 1, BAND Y.',evidence:GUIDE+' 236–237, tuning step 1',panels:['icp','ded'],do:{control:'icp.key-1',to:'in'}},
    {id:'mode',section:'Tune the station',title:'Select T/R mode',control:'ICP DCS switch',action:'Move the DCS switch to SEQ to step the TACAN mode from REC to T/R.',expect:'TCN T/R. REC gives bearing only; T/R adds the distance to the station. A ground or naval station uses REC or T/R; A/A T/R is for air-to-air.',caution:'With the RF switch at QUIET or SILENT the TACAN is held in REC whatever is set here, so there is no range.',evidence:GUIDE+' 235, 237, 236 (step 2)',panels:['icp','ded'],do:{control:'icp.dcs-lr',to:'seq'}},
    {id:'chan-field',section:'Tune the station',title:'Move the asterisks to CHAN',control:'ICP DCS switch',action:'Move the DCS switch down to bring the DED asterisks round the CHAN field.',expect:'Asterisks bracket the channel number.',evidence:GUIDE+' 237, tuning step 3',panels:['icp','ded'],do:{control:'icp.dcs-ud',to:'down'}},
    {id:'chan-2',section:'Tune the station',title:'Type the channel: 2',control:'ICP keypad',action:'Press 2 on the ICP keypad.',expect:'The channel field shows the new digit, highlighted: it is not accepted yet.',evidence:GUIDE+' 237, tuning step 4',panels:['icp','ded'],do:{control:'icp.key-2',to:'in'}},
    {id:'chan-1',section:'Tune the station',title:'Type the channel: 1',control:'ICP keypad',action:'Press 1 on the ICP keypad. The channel is typed with no leading zero.',expect:'The field reads 21, highlighted.',evidence:GUIDE+' 237, tuning step 4',panels:['icp','ded'],do:{control:'icp.key-1',to:'in'}},
    {id:'chan-enter',section:'Tune the station',title:'Accept the channel',control:'ICP ENTR',action:'Press ENTR.',expect:'The channel is accepted and no longer highlighted. BCN stays blank: there is no channel 21 station on band Y.',caution:'RCL instead of ENTR rejects the entry.',evidence:GUIDE+' 237, tuning step 5',panels:['icp','ded'],do:{control:'icp.entr',to:'in'}},
    {id:'band-zero',section:'Tune the station',title:'Toggle the band',control:'ICP 0 / M-SEL',action:'Press 0 / M-SEL.',expect:'A highlighted 0 shows in the channel field: the band toggle is waiting to be accepted.',evidence:GUIDE+' 237, tuning step 6',panels:['icp','ded'],do:{control:'icp.key-0',to:'in'}},
    {id:'band-enter',section:'Tune the station',title:'Accept the band',control:'ICP ENTR',action:'Press ENTR.',expect:'BAND changes to X, CHAN is back to 21, and the beacon identifier DAN appears in the BCN field.',evidence:GUIDE+' 237, tuning step 7',panels:['icp','ded'],do:{control:'icp.entr',to:'in'}},
    {id:'ident',section:'Tune the station',title:'Verify the identifier',control:'DED BCN field',action:'Check that BCN shows DAN, the identifier you noted for Incirlik.',expect:'DAN. If it is blank or another identifier, the channel or band is wrong; do not navigate on it. You can also hear the Morse identifier by turning the TACAN knob on the AUDIO 2 panel clockwise.',evidence:GUIDE+' 237, tuning step 8 and “Identifying a TACAN Station”',panels:['ded'],confirm:'BCN shows DAN'},
    {id:'ehsi-mode-1',section:'Navigate on the EHSI',title:'Step the instrument mode',control:'EHSI M button',action:'Press the M (instrument mode) button on the EHSI. The mode steps NAV, NAV/PLS, TCN, TCN/PLS and round again.',expect:'NAV/PLS: the bearing, range and deviation are still the steerpoint’s. Press again for TCN.',evidence:GUIDE+' 232 (items 15–16), 238',panels:['ehsi'],do:{control:'ehsi.mode',to:'in'}},
    {id:'ehsi-mode-2',section:'Navigate on the EHSI',title:'Select TCN',control:'EHSI M button',action:'Press M again.',expect:'TCN shows briefly in front of the aircraft symbol and stays at the bottom. The bearing pointer and range now come from the TACAN station.',evidence:GUIDE+' 232 (items 11, 15–16), 238',panels:['ehsi'],do:{control:'ehsi.mode',to:'in'}},
    {id:'course',section:'Navigate on the EHSI',title:'Set the inbound course',control:'EHSI CRS knob',action:'Turn the CRS knob until the course reads 075°, the bearing to the station (one click is 5°).',expect:'The course arrow turns to the bearing pointer and the deviation bar moves to the middle of the scale as it lines up. The TO indicator points the same way as the course arrow: flying this course takes you to the station.',evidence:GUIDE+' 231–232 (items 6–10, 14), 238–239',panels:['ehsi'],turn:{control:'ehsi.crs',to:75,per:5}},
    {id:'read',section:'Navigate on the EHSI',title:'Read the bearing and range',control:'EHSI bearing pointer and range',action:'Read the bearing pointer, the range and the deviation bar.',expect:'Bearing pointer at 075° (15° right of the nose), range 38.4 NM, deviation bar centred: you are on the inbound course, 38 NM from Incirlik. TACAN needs line of sight and is generally reliable to about 130 NM, less at low altitude.',evidence:GUIDE+' 231 (items 1, 3, 7), 238',panels:['ehsi'],confirm:'Read the EHSI'},
    {id:'cross-check',section:'Navigate on the EHSI',title:'Cross-check the return',control:'EHSI',action:'Compare your heading with the course and the bearing pointer, then pick the correct reading.',expect:'You are on course now but your heading (060°) is 15° left of it.',evidence:GUIDE+' 231, 238–239',panels:['ehsi'],ask:{question:'Heading 060°, course 075°, the bearing pointer 15° right of the nose and the deviation bar centred. What does that tell you?',options:['You are off the course and must turn left.','You are on the course now, but heading left of it; turn right toward 075° and you stay on the radial.','The station is behind you; the TO indicator would point down.'],answer:1,right:'Right. On course, heading 15° left of it: turn right to 075° (the Heading Set knob and HDG SEL can fly it for you) and the deviation bar stays centred.',wrong:'Not quite: with the deviation bar centred you are on the course, the pointer is right of the nose and TO is set, so the station is ahead.'}}
  ]
};
procedures.push(tacan);
export const visibleProcedures = procedures.filter(p => p.status === 'public-preview' || reviewTrainers);
export const procedureRoute = (p: AircraftProcedure) => `manual/aircraft-procedures/${p.airframe}/${p.slug}/`;
export const airframes = [{slug:'f-16c',title:'F-16C Viper'}];
