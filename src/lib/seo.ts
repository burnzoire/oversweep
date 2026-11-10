import { encyclopediaCategories, manualSubjects } from "../data/catalogue";
import { manualEntries, subjectEntries } from "../data/availability";

export const siteName = "Oversweep";
export const defaultDescription =
  "Oversweep explains military flight concepts with interactive figures and visible sources.";

// A page's route without the base path, such as "manual/navigation/".
export function routeOf(pathname: string, base: string): string {
  const prefix = base.replace(/\/+$/, "");
  const path = prefix && pathname.startsWith(prefix) ? pathname.slice(prefix.length) : pathname;
  const trimmed = path.replace(/^\/+|\/+$/g, "");
  return trimmed ? `${trimmed}/` : "";
}

const sentence = (text: string) => (/[.!?]$/.test(text.trim()) ? text.trim() : `${text.trim()}.`);

// Pages that pass no description of their own get one from the registries, so
// module, subject and category pages each say something different in search
// results instead of repeating the site-wide line.
export function describeRoute(route: string): string | undefined {
  const entry = manualEntries.find((e) => e.href === route);
  if (entry) return `${entry.title}: ${sentence(entry.objective)}`;

  const subject = manualSubjects.find((s) => route === `manual/${s.slug}/`);
  if (subject) {
    const titles = subjectEntries(subject.slug).map((e) => e.title);
    return titles.length
      ? `${subject.title} in the Oversweep Manual, with interactive figures and sources: ${titles.join(", ")}.`
      : undefined;
  }

  const category = encyclopediaCategories.find((c) => route === `encyclopedia/${c.slug}/`);
  if (category) return `${category.title} in the Oversweep Encyclopedia. ${sentence(category.summary)}`;

  return undefined;
}

// The module a route teaches, for its LearningResource structured data.
export const entryForRoute = (route: string) => manualEntries.find((e) => e.href === route);

// Search engines show about 155-160 characters; cut long summaries at a word.
export function clip(text: string, limit = 160): string {
  const plain = text.replace(/\s+/g, " ").trim();
  if (plain.length <= limit) return plain;
  const cut = plain.slice(0, limit - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[\s,;:.–—-]+$/, "")}…`;
}
