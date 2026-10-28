import { encyclopediaCategories, manualSubjects } from './catalogue';
import { experienceFrame, experienceRoute, includedExperiences, type Experience } from './experiences';
import { includedModules, moduleRoute, type Module } from './modules';
import { categoryRecords } from './encyclopedia';
import { carriers } from './carriers';

// What a reader can actually open, derived from the registries. Navigation shows
// destinations without content dimmed and unlinked, so readers only follow links
// that lead somewhere; the empty routes still build so their URLs stay stable.

export interface Entry {
  id: string;
  title: string;
  objective: string;
  applicability: string;
  maturity: string;
  href: string;
  subject: string;
  // Set for modules with a standalone trainer, which opens in its own window.
  trainer?: { title: string; href: string; experience: Experience };
  module?: Module;
  // A subject can split its modules into groups (Flight Fundamentals: fixed
  // and rotor wing); the subject page lists each group under its own heading.
  group?: string;
}

const fromExperience = (e: Experience): Entry => ({
  id: e.id,
  title: e.module?.title ?? e.title,
  objective: e.module?.objective ?? e.objective,
  applicability: e.module?.applicability ?? e.applicability,
  maturity: e.module?.maturity ?? e.maturity,
  href: experienceRoute(e),
  subject: e.subject,
  trainer: { title: e.title, href: experienceFrame(e), experience: e },
  group: e.module && 'group' in e.module ? e.module.group : undefined,
});

const fromModule = (m: Module): Entry => ({
  id: m.id,
  title: m.title,
  objective: m.objective,
  applicability: m.applicability,
  maturity: m.maturity,
  href: moduleRoute(m),
  subject: m.subject,
  module: m,
  group: 'group' in m ? m.group : undefined,
});

export const manualEntries: Entry[] = [
  ...includedExperiences.map(fromExperience),
  ...includedModules.map(fromModule),
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
  training: includedExperiences.length > 0,
};
