// One canonical registration shared by Manual and Training Library.
export const caseIII = {
  id: 'experience.case-iii-tomcat',
  manualId: 'manual.case-iii-tomcat',
  revision: 5,
  title: 'Case III — Tomcat recovery exercise',
  route: 'manual/naval-operations/case-iii/',
  assets: 'review/case-iii/',
  subject: 'naval-operations',
  maturity: 'Drafted — not technically validated',
  objective: 'Practise modeled navigation, timing, radio choices and configuration in a synthetic recovery scenario.',
  applicability: 'F-14B / DCS-oriented educational exercise; simulator version not verified.',
  prerequisites: ['Magnetic headings and radials', 'TACAN bearing and DME', 'Basic carrier terminology'],
  publication: 'excluded',
} as const;

// Explicit local review builds only. Not an aviation validation or publication bypass.
export const reviewTrainers = import.meta.env.DEV || process.env.OVERSWEEP_REVIEW_TRAINERS === '1';
