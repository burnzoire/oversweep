// One canonical registration shared by Manual and Training Library.
export const caseIII = {
  id: 'experience.case-iii-tomcat',
  manualId: 'manual.case-iii-tomcat',
  revision: 1,
  title: 'Case III — Tomcat procedure trainer',
  route: 'manual/naval-operations/case-iii/',
  assets: 'review/case-iii/',
  subject: 'naval-operations',
  maturity: 'Drafted — not technically validated',
  objective: 'Rehearse navigation to marshal, timing, radio decisions, configuration and recovery.',
  applicability: 'F-14B / DCS-oriented procedural rehearsal; simulator version not verified.',
  prerequisites: ['Magnetic headings and radials', 'TACAN bearing and DME', 'Basic carrier terminology'],
  publication: 'excluded',
} as const;

// Explicit local review builds only. Not an aviation validation or publication bypass.
export const reviewTrainers = import.meta.env.DEV || process.env.OVERSWEEP_REVIEW_TRAINERS === '1';
