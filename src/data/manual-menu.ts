import { subjectEntries } from './availability';
import { manualSubjects } from './catalogue';
import { visibleProcedures, procedureRoute } from './aircraft-procedures';
import { cockpits, cockpitRoute, panelRoute } from './cockpit/f16c/index.ts';

// The Manual menu: three sub-areas (General Flight, Tactics, Aircraft). Built
// pages link; pages not written yet are listed grey and unlinked, so the
// tree shows the plan without sending readers anywhere empty. Modules come from
// the module registry, the F-16C tree from the cockpit catalogue and the
// procedure list. Issue #429 holds the structure.

export interface MenuNode {
  id: string;
  title: string;
  href?: string;
  /** One line for the card on the parent's landing page. */
  summary?: string;
  /** Listed but not written: shown grey and unlinked. */
  planned?: boolean;
  children?: MenuNode[];
}

const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const plan = (title: string, children?: (string | MenuNode)[]): MenuNode => ({
  id: slugify(title),
  title,
  planned: true,
  children: children?.map(c => (typeof c === 'string' ? plan(c) : c)),
});
const group = (id: string, title: string, children: MenuNode[], href?: string, summary?: string): MenuNode => ({ id, title, href, summary, children });

// ---- General Flight and Tactics: subjects, each with its modules -------------

interface SubjectSpec { subject: string; title?: string; only?: string[]; skip?: string[]; summary?: string }
const subjectNode = (spec: SubjectSpec): MenuNode => {
  const subject = manualSubjects.find(s => s.slug === spec.subject)!;
  const entries = subjectEntries(spec.subject).filter(e => (!spec.only || spec.only.includes(e.id)) && !spec.skip?.includes(e.id));
  const children = entries.map(e => ({ id: e.id, title: e.title, href: e.href }));
  const whole = !spec.only && !spec.skip;
  return {
    id: `subject-${spec.subject}-${spec.title ? slugify(spec.title) : 'all'}`,
    title: spec.title ?? subject.title,
    summary: spec.summary,
    href: whole && children.length ? `manual/${subject.slug}/` : undefined,
    planned: children.length === 0,
    children,
  };
};

const generalFlight: SubjectSpec[] = [
  { subject: 'flight-fundamentals', summary: 'How aircraft fly: forces, stability and control, for fixed-wing and rotor-wing.' },
  { subject: 'instrument-flight', summary: 'Flying by reference to the instruments, and instrument procedures.' },
  { subject: 'navigation', summary: 'Finding your way: charts, radio navigation and dead reckoning.' },
  { subject: 'radio-communications', summary: 'Radio procedure and phraseology.' },
  { subject: 'airfield-operations', summary: 'The airfield, the traffic pattern, takeoff and landing.' },
  { subject: 'naval-operations', summary: 'Operating from carriers and amphibious ships.' },
  { subject: 'formation-flying', summary: 'Flying close to other aircraft, from two-ship to display formations.' },
  { subject: 'air-to-air-refuelling', summary: 'Taking fuel from a tanker in flight.' },
  { subject: 'flight-planning', summary: 'Planning a sortie, weather and performance.' },
  { subject: 'abnormal-operations', skip: ['module.threat-avoidance'], summary: 'Emergencies and what to do when something goes wrong.' },
];
const tactics: SubjectSpec[] = [
  { subject: 'air-combat', summary: 'Fighting other aircraft, within and beyond visual range.' },
  { subject: 'air-to-ground-operations', summary: 'Attacking ground targets: weapons delivery, close air support, SEAD.' },
  { subject: 'sensors-situational-awareness', summary: 'Radar, warning receivers and building the picture.' },
  { subject: 'abnormal-operations', title: 'Threat Avoidance', only: ['module.threat-avoidance'], summary: 'Staying out of reach of enemy air defences, and defeating them when you cannot.' },
];

// ---- Aircraft: the F-16C guide ----------------------------------------------

const F16C_HREF = 'manual/aircraft-procedures/f-16c/';

const proc = (slug: string, fallback?: string): MenuNode => {
  const p = visibleProcedures.find(x => x.slug === slug);
  return p
    ? { id: `proc-${slug}`, title: p.title.replace(/^F-16C — /, ''), href: procedureRoute(p) }
    : plan(fallback ?? slug);
};

const buildF16c = (): MenuNode => {
const cockpit = cockpits[0];
const cockpitNode = group('f16c-cockpit', 'Cockpit', cockpit.areas.map(area => group(`cockpit-${area.id}`, area.title, area.panels.map(panel => (panel.spec
  ? { id: `panel-${panel.id}`, title: panel.title, href: panelRoute(cockpit, panel.id) }
  : plan(panel.title))))), cockpitRoute(cockpit), 'Every panel, by where it sits in the cockpit.');

const systems = group('f16c-systems', 'Systems', [
  cockpitNode,
  { ...proc('hts'), title: 'HARM Targeting System (HTS)', summary: 'Find and rank enemy radars on the HAD page and hand them to the HARM.', children: [proc('hts-targeting'), plan('TDOA')] },
  plan('TGP / Sniper pod'),
  plan('Radar (APG-68)', ['RWS: range while search', 'TWS: track while scan', 'Single target track', 'ACM modes', 'Ground map, expand and DBS', 'Ground moving target', 'Sea mode']),
  plan('Fire control and SMS'),
  plan('RWR and countermeasures'),
  plan('Navigation and INS'),
  plan('Radios and datalink'),
  plan('Flight control system', ['Autopilot modes']),
  plan('HMCS', ['HMCS alignment', 'Radar and ground designation with HMCS']),
  plan('Datalink and IFF', ['Datalink set-up', 'IFF set-up and interrogation']),
  plan('Engine and fuel management', ['Engine relight']),
  plan('Aerodynamics and limits'),
  plan('Fuel system'),
  plan('Electrical, hydraulic and EPU'),
], `${F16C_HREF}systems/`, 'The cockpit, sensors, weapons systems and aircraft systems.');

// Normal procedures sit directly under the aircraft, one group per phase of the sortie.
const phases: MenuNode[] = [
  group('phase-ground', 'Ground', [proc('engine-start'), proc('before-taxi'), proc('before-takeoff'), plan('Taxi and lineup'), plan('Takeoff'), plan('After landing and shutdown')], `${F16C_HREF}ground/`, 'Engine start to takeoff.'),
  group('phase-navigation', 'Navigation', [proc('steerpoint-entry'), proc('tacan-navigation', 'TACAN navigation'), plan('INS alignment modes'), plan('HSD and route management'), plan('Markpoints'), plan('Reference points (VIP, VRP, PUP, OAP)'), plan('Bullseye'), plan('CRUS and DEST pages'), plan('INS drift: altitude calibration and fix'), plan('ILS approach set-up')], `${F16C_HREF}navigation/`, 'Setting up and using the navigation systems.'),
  group('phase-enroute', 'Enroute', [plan('Air-to-air refuelling')], `${F16C_HREF}enroute/`, 'Procedures between takeoff and recovery.'),
  group('phase-recovery', 'Recovery', [plan('Overhead break'), plan('Instrument approach'), plan('Landing')], `${F16C_HREF}recovery/`, 'Returning to the field and landing.'),
];

const emergency = plan('Emergency procedures', ['Engine failure and flameout', 'Engine relight', 'Engine fire', 'Electrical failure', 'Hydraulic failure', 'FLCS failure', 'EPU activation', 'Fuel system malfunction', 'Landing gear malfunction', 'Ejection decision']);

const weapons = group('f16c-weapons', 'Weapons and tactics', [
  group('weapons-sead', 'SEAD', [plan('AGM-88 HARM', ['POS shot', 'HAS shot', 'HTS handoff shot'])]),
  group('weapons-air-to-air', 'Air-to-air weapons', [
    plan('Dogfight and missile override modes', ['Dogfight mode', 'Missile override mode']),
    plan('AIM-120 AMRAAM', ['Pre-planned and maddog shot', 'Defensive shot']),
    plan('AIM-9 Sidewinder', ['Boresight and slaved shot', 'AIM-9X with HMCS']),
    plan('M61 gun', ['EEGS without radar', 'EEGS with radar']),
  ]),
  group('weapons-air-to-ground', 'Air-to-ground weapons', [
    plan('GBU-12 Paveway II', ['TGP laser delivery']),
    plan('GBU-31/38 JDAM', ['Pre-planned and TOO']),
    plan('AGM-65 Maverick', ['Boresight and lock', 'Slaved to TGP']),
    plan('Unguided bombs, low and high drag', ['CCIP', 'CCRP', 'Offset pop-up', 'Loft (toss)']),
    plan('Rockets', ['CCIP']),
    plan('Cluster munitions', ['CBU-87 CCIP', 'CBU-105 CCRP']),
    plan('AGM-154 JSOW', ['Pre-planned delivery']),
    plan('Ordnance jettison', ['Selective jettison', 'Emergency stores jettison']),
  ]),
  group('weapons-self-protection', 'Self-protection', [plan('Chaff and flares', ['Manual and programmed dispense']), plan('ECM pod', ['Mode selection'])]),
], `${F16C_HREF}weapons-and-tactics/`, 'Employing the Viper\'s weapons: SEAD, air-to-air and air-to-ground.');

return group('f16c', 'F-16C Viper', [systems, ...phases, emergency, weapons], F16C_HREF, 'Cockpit, systems, procedures and weapons for the DCS F-16C Block 50.');
};

// ---- Aircraft registry --------------------------------------------------------
// One entry per airframe. `build` runs only when a page is on that airframe, so
// a dozen aircraft add a dozen small list rows to every page, not a dozen trees.
// The full tree is built for the current airframe alone (and once for the
// manual landing page counts); see `menuFor`.

interface AircraftMenu { id: string; title: string; href: string; summary: string; build: () => MenuNode }
const once = <T>(f: () => T): (() => T) => { let v: T | undefined; return () => (v ??= f()); };
export const aircraftMenus: AircraftMenu[] = [
  { id: 'f16c', title: 'F-16C Viper', href: F16C_HREF, summary: 'Cockpit, systems, procedures and weapons for the DCS F-16C Block 50.', build: once(buildF16c) },
];

const areas = (aircraft: MenuNode[]): MenuNode[] => [
  group('area-general-flight', 'General Flight', generalFlight.map(subjectNode), 'manual/general-flight/', 'Skills that apply to any aircraft: flying it, navigating, talking, planning and handling emergencies.'),
  group('area-tactics', 'Tactics', tactics.map(subjectNode), 'manual/tactics/', 'Employment and threats: fighting, attacking ground targets, using sensors and staying alive.'),
  group('area-aircraft', 'Aircraft', aircraft, 'manual/aircraft-procedures/', 'One guide per aircraft type: cockpit, systems, procedures and weapons.'),
];

/** Every airframe fully built: the source of truth for tests and the landing page. */
export const manualMenu: MenuNode[] = areas(aircraftMenus.map(a => a.build()));

/** The menu a page renders: only the airframe the page belongs to is expanded;
 *  the others are a single link, however many aircraft there are. */
export function menuFor(route: string): MenuNode[] {
  return areas(aircraftMenus.map(a => (route.startsWith(a.href) ? a.build() : { id: a.id, title: a.title, href: a.href, summary: a.summary })));
}

/** Whether `route` is this node's page or one beneath it (so its branch opens). */
export const containsRoute = (node: MenuNode, route: string): boolean =>
  node.href === route || (node.children ?? []).some(c => containsRoute(c, route));

export const menuHrefs = (nodes: MenuNode[] = manualMenu): string[] =>
  nodes.flatMap(n => [...(n.href ? [n.href] : []), ...menuHrefs(n.children ?? [])]);
