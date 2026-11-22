import { encyclopediaCategories, manualSubjects } from './catalogue';
import { experienceFrame, experienceRoute, listedExperiences, type Experience } from './experiences';
import { includedModules, moduleRoute, type Module } from './modules';
import { categoryRecords } from './encyclopedia';
import { carriers } from './carriers';
import { visibleProcedures, procedureRoute } from './aircraft-procedures';
import { cockpits, cockpitRoute } from './cockpit/f16c/index.ts';

// Content availability derived from the registries. Empty Manual groups and
// Encyclopedia categories keep navigable landing pages.

export interface Entry {
  id: string;
  title: string;
  objective: string;
  applicability: string;
  href: string;
  subject: string;
  // Set for modules with a standalone trainer, which opens in its own window.
  trainer?: { title: string; href: string; experience: Experience };
  module?: Module;
  procedureStatus?: (typeof visibleProcedures)[number]['status'];
  // A subject can split its modules into groups (Flight Fundamentals: fixed
  // and rotor wing); the subject page lists each group under its own heading.
  group?: string;
}

const fromExperience = (e: Experience): Entry => ({
  id: e.id,
  title: e.module?.title ?? e.title,
  objective: e.module?.objective ?? e.objective,
  applicability: e.module?.applicability ?? e.applicability,
  href: experienceRoute(e),
  subject: e.subject,
  trainer: { title: e.title, href: experienceFrame(e), experience: e },
  group: (e.module as { group?: string } | undefined)?.group,
});

const fromModule = (m: Module): Entry => ({
  id: m.id,
  title: m.title,
  objective: m.objective,
  applicability: m.applicability,
  href: moduleRoute(m),
  subject: m.subject,
  module: m,
  group: 'group' in m ? m.group : undefined,
});

export const manualEntries: Entry[] = [
  ...listedExperiences.map(fromExperience),
  ...includedModules.map(fromModule),
  ...cockpits.map(c => ({
    id: `cockpit.${c.id}`, title: `${c.title} — Cockpit Familiarization`,
    objective: `Find your way around the ${c.title} cockpit area by area, with every control on each panel working as in the sim.`,
    applicability: c.variant, href: cockpitRoute(c), subject: 'aircraft-procedures', group: 'F-16C Viper',
  })),
  ...visibleProcedures.map(p => ({
    id: p.id, title: p.title, objective: p.objective, applicability: p.applicability,
    procedureStatus: p.status, href: procedureRoute(p), subject: 'aircraft-procedures', group: 'F-16C Viper',
  })),
];

export const subjectEntries = (slug: string) => manualEntries.filter((entry) => entry.subject === slug);
// A subject's entries in registry order, gathered under their group names;
// one unnamed group when the subject does not use groups. Modules come before
// the practice modules that carry a trainer, so a group opens with its theory.
export function subjectGroups(slug: string) {
  const groups = new Map<string | undefined, Entry[]>();
  const entries = subjectEntries(slug);
  for (const entry of [...entries.filter((e) => !e.trainer), ...entries.filter((e) => e.trainer)]) groups.set(entry.group, [...(groups.get(entry.group) ?? []), entry]);
  return [...groups].map(([title, entries]) => ({ title, entries }));
}
export const subjectHasContent = (slug: string) => subjectEntries(slug).length > 0;
export const subjectTitle = (slug: string) => manualSubjects.find((s) => s.slug === slug)?.title ?? slug;

export const categoryHasContent = (slug: string) => (slug === 'carriers' ? carriers.length : categoryRecords(slug).length) > 0;
export const categoryTitle = (slug: string) => encyclopediaCategories.find((c) => c.slug === slug)?.title ?? slug;

export const sectionHasContent = {
  manual: manualSubjects.some((s) => subjectHasContent(s.slug)),
  encyclopedia: encyclopediaCategories.some((c) => categoryHasContent(c.slug)),
  training: listedExperiences.length > 0,
};
