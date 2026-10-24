import registry from './experiences.json';

// The registry is the single source for Manual, Training Library, routes and
// output checks. `publication` decides whether an experience ships in normal
// builds; it is independent of `maturity`, which is always shown to readers.
// `launch: 'window'` experiences open in their own window and are never framed;
// the default embeds them in the Manual page.
export type Experience = (typeof registry)[number] & {
  publication: 'published' | 'excluded';
  launch?: 'embed' | 'window';
};

// Explicit local review builds also include excluded experiences.
// Not an aviation validation or publication bypass.
export const reviewTrainers = import.meta.env.DEV || process.env.OVERSWEEP_REVIEW_TRAINERS === '1';

export const experiences = registry as Experience[];
export const includedExperiences = experiences.filter(e => e.publication === 'published' || reviewTrainers);

export const experienceRoute = (e: Experience) => `manual/${e.subject}/${e.slug}/`;
export const experienceFrame = (e: Experience) => `experiences/${e.slug}/`;

export function getExperience(slug: string): Experience {
  const experience = experiences.find(e => e.slug === slug);
  if (!experience) throw new Error(`Unregistered experience: ${slug}`);
  return experience;
}
