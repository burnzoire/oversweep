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
const group = (id: string, title: string, children: MenuNode[], href?: string): MenuNode => ({ id, title, href, children });

// ---- General Flight and Tactics: subjects, each with its modules -------------

interface SubjectSpec { subject: string; title?: string; only?: string[]; skip?: string[] }
const subjectNode = (spec: SubjectSpec): MenuNode => {
  const subject = manualSubjects.find(s => s.slug === spec.subject)!;
  const entries = subjectEntries(spec.subject).filter(e => (!spec.only || spec.only.includes(e.id)) && !spec.skip?.includes(e.id));
  const children = entries.map(e => ({ id: e.id, title: e.title, href: e.href }));
  const whole = !spec.only && !spec.skip;
  return {
    id: `subject-${spec.subject}-${spec.title ? slugify(spec.title) : 'all'}`,
    title: spec.title ?? subject.title,
    href: whole && children.length ? `manual/${subject.slug}/` : undefined,
    planned: children.length === 0,
    children,
  };
};

const generalFlight: SubjectSpec[] = [
  { subject: 'flight-fundamentals' },
  { subject: 'instrument-flight' },
  { subject: 'navigation' },
  { subject: 'radio-communications' },
  { subject: 'airfield-operations' },
  { subject: 'naval-operations' },
  { subject: 'formation-flying' },
  { subject: 'air-to-air-refuelling' },
  { subject: 'flight-planning' },
  { subject: 'abnormal-operations', skip: ['module.threat-avoidance'] },
];
const tactics: SubjectSpec[] = [
  { subject: 'air-combat' },
  { subject: 'air-to-ground-operations' },
  { subject: 'sensors-situational-awareness' },
  { subject: 'abnormal-operations', title: 'Threat Avoidance', only: ['module.threat-avoidance'] },
];

// ---- Aircraft: the F-16C guide ----------------------------------------------

const proc = (slug: string, fallback?: string): MenuNode => {
  const p = visibleProcedures.find(x => x.slug === slug);
  return p
    ? { id: `proc-${slug}`, title: p.title.replace(/^F-16C — /, ''), href: procedureRoute(p) }
    : plan(fallback ?? slug);
};

const cockpit = cockpits[0];
const cockpitNode = group('f16c-cockpit', 'Cockpit', cockpit.areas.map(area => group(`cockpit-${area.id}`, area.title, area.panels.map(panel => (panel.spec
  ? { id: `panel-${panel.id}`, title: panel.title, href: panelRoute(cockpit, panel.id) }
  : plan(panel.title))))), cockpitRoute(cockpit));

const systems = group('f16c-systems', 'Systems', [
  cockpitNode,
  { ...proc('hts'), title: 'HARM Targeting System (HTS)', children: [proc('hts-targeting'), plan('TDOA')] },
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
]);

const normal = group('f16c-normal', 'Normal procedures', [
  group('phase-ground', 'Ground', [proc('engine-start'), proc('before-taxi'), proc('before-takeoff'), plan('Taxi and lineup'), plan('Takeoff'), plan('After landing and shutdown')]),
  group('phase-navigation', 'Navigation', [proc('steerpoint-entry'), proc('tacan-navigation', 'TACAN navigation'), plan('INS alignment modes'), plan('HSD and route management'), plan('Markpoints'), plan('Reference points (VIP, VRP, PUP, OAP)'), plan('Bullseye'), plan('CRUS and DEST pages'), plan('INS drift: altitude calibration and fix'), plan('ILS approach set-up')]),
  group('phase-enroute', 'Enroute', [plan('Air-to-air refuelling')]),
  group('phase-recovery', 'Recovery', [plan('Overhead break'), plan('Instrument approach'), plan('Landing')]),
]);

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
]);

const f16c = group('f16c', 'F-16C Viper', [systems, normal, emergency, weapons], 'manual/aircraft-procedures/f-16c/');

export const manualMenu: MenuNode[] = [
  group('area-general-flight', 'General Flight', generalFlight.map(subjectNode)),
  group('area-tactics', 'Tactics', tactics.map(subjectNode)),
  group('area-aircraft', 'Aircraft', [f16c]),
];

/** Built pages under a node, and the planned ones: the progress count beside a group. */
export function progress(node: MenuNode): { built: number; total: number } {
  if (!node.children?.length) return { built: node.planned ? 0 : 1, total: 1 };
  return node.children.map(progress).reduce((a, b) => ({ built: a.built + b.built, total: a.total + b.total }), { built: 0, total: 0 });
}

/** Whether `route` is this node's page or one beneath it (so its branch opens). */
export const containsRoute = (node: MenuNode, route: string): boolean =>
  node.href === route || (node.children ?? []).some(c => containsRoute(c, route));

export const menuHrefs = (nodes: MenuNode[] = manualMenu): string[] =>
  nodes.flatMap(n => [...(n.href ? [n.href] : []), ...menuHrefs(n.children ?? [])]);
