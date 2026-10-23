import { appendFile, readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// While Case III is awaiting its first release, implementation changes must
// deliver production output. Draft exclusion is a blocker, not a passing release.
export function requiresCaseIIIRelease(files) {
  return files.some(file => file.startsWith('src/experiences/case-iii/') ||
    file === 'src/data/experiences.ts' ||
    file === 'src/pages/training/index.astro' ||
    file === 'src/pages/manual/[slug].astro' ||
    file === 'src/components/ExperienceCard.astro' ||
    file.startsWith('src/pages/manual/naval-operations/') ||
    file.startsWith('src/pages/review/'));
}

const marker = 'data-experience-id="experience.case-iii-tomcat"';
const draft = /Drafted|not technically validated|Local review only|unvalidated review/i;

export function changedFiles(base, head, cwd = process.cwd()) {
  return execFileSync('git', ['diff', '--name-only', '--no-renames', '-z', `${base}...${head}`],
    { cwd, encoding: 'utf8' }).split('\0').filter(Boolean);
}

export function evaluateCaseIIIRelease({ wrapper, frame, manual, library, assets }) {
  const blockers = [];
  if (!wrapper) blockers.push('Case III is excluded from the normal production route.');
  if (!frame) blockers.push('The production trainer frame is missing.');
  for (const [name, html] of Object.entries({ wrapper, frame, manual, library })) {
    if (html && draft.test(html)) blockers.push(`${name} still identifies Case III as draft or unvalidated.`);
  }
  if (wrapper && (!wrapper.includes(marker) || !wrapper.includes('<iframe')))
    blockers.push('The production Manual page does not embed the registered trainer.');
  if (frame && !frame.includes(marker)) blockers.push('The production frame lacks the experience registration.');
  for (const [name, html] of Object.entries({ manual, library })) {
    if (!html?.includes(marker) || !html.includes('/manual/naval-operations/case-iii/'))
      blockers.push(`Case III is missing from the production ${name} index.`);
  }
  for (const name of ['app.js', 'style.css', 'model.cjs', 'embed.js']) {
    const content = assets[name];
    if (!content?.trim()) blockers.push(`Production trainer asset is missing or empty: ${name}.`);
  }
  return { ready: blockers.length === 0, blockers };
}

async function main() {
  const args = process.argv.slice(2);
  const base = args.find(a => a.startsWith('--base='))?.slice(7);
  const head = args.find(a => a.startsWith('--head='))?.slice(7);
  let required = true; // Direct/local invocation checks the release, never silently skips it.
  if (base || head) {
    if (![base, head].every(sha => /^[a-f0-9]{40}$/.test(sha ?? '')))
      throw new Error('Both --base and --head must be full commit SHAs.');
    const files = changedFiles(base, head);
    required = requiresCaseIIIRelease(files);
  }
  let message;
  let ready = true;
  if (!required) {
    message = 'NOT APPLICABLE: no Case III implementation or registration changes.';
  } else {
    if (process.env.OVERSWEEP_REVIEW_TRAINERS === '1')
      throw new Error('Release readiness cannot use OVERSWEEP_REVIEW_TRAINERS=1. Build normal production output.');
    const read = async path => readFile(resolve('dist', path), 'utf8').catch(error => {
      if (error.code === 'ENOENT') return null;
      throw error;
    });
    const assets = {};
    for (const name of ['app.js', 'style.css', 'model.cjs', 'embed.js'])
      assets[name] = await read(`review/case-iii/${name}`);
    const result = evaluateCaseIIIRelease({
      wrapper: await read('manual/naval-operations/case-iii/index.html'),
      frame: await read('review/case-iii/index.html'),
      manual: await read('manual/naval-operations/index.html'),
      library: await read('training/index.html'),
      assets,
    });
    ready = result.ready;
    message = ready ? 'Case III is present in normal production output. Independent SME and UX review remain separate requirements.' :
      result.blockers.map(item => `- ${item}`).join('\n') +
      '\n\nDo not merge this as a completed trainer release. Resolve source evidence and independent SME/UX findings, then enable production inclusion. Passing application tests only confirms draft exclusion works.';
  }
  const summary = `## Release readiness: ${ready ? 'PASS' : 'BLOCKED'}\n\n${message}\n`;
  console.log(summary);
  if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, summary);
  if (!ready) process.exitCode = 1;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  main().catch(async error => {
    const message = `## Release readiness: BLOCKED\n\n${error.message}\n`;
    console.error(message);
    if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, message);
    process.exitCode = 1;
  });
}
