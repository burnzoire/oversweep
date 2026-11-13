import { encyclopediaCategories, manualSubjects } from "../data/catalogue";
import { manualEntries, subjectEntries } from "../data/availability";

export const siteName = "Oversweep";
// Link previews (Discord, Slack, social) show og:site_name above the title, so
// it says who the site is for on every shared page.
export const shareSiteName = "Oversweep · Flight sim reference";
export const audience = { "@type": "Audience", audienceType: "Flight simulator enthusiasts" };
export const defaultDescription =
  "Oversweep explains military flight for flight sim enthusiasts, with interactive figures, trainers and visible sources.";

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
  if (entry) return `${entry.title}, for flight sim pilots: ${sentence(entry.objective)}`;

  const subject = manualSubjects.find((s) => route === `manual/${s.slug}/`);
  if (subject) {
    const titles = subjectEntries(subject.slug).map((e) => e.title);
    return titles.length
      ? `${subject.title} for flight sim enthusiasts, in the Oversweep Manual: ${titles.join(", ")}.`
      : undefined;
  }

  const category = encyclopediaCategories.find((c) => route === `encyclopedia/${c.slug}/`);
  if (category) return `${category.title} for flight sim enthusiasts, in the Oversweep Encyclopedia. ${sentence(category.summary)}`;

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
