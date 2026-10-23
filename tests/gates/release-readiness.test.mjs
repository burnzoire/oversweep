import assert from 'node:assert/strict';
import test from 'node:test';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { requiresCaseIIIRelease, evaluateCaseIIIRelease, changedFiles } from '../../scripts/check_release_readiness.mjs';

const marker = 'data-experience-id="experience.case-iii-tomcat"';
const index = `<section ${marker}><a href="/manual/naval-operations/case-iii/">Open</a></section>`;
const included = {
  wrapper: `<section ${marker}>Technically Validated</section><iframe src="/review/case-iii/"></iframe>`,
  frame: `<body ${marker}>Validated</body>`,
  manual: index,
  library: index,
  assets: { 'app.js': 'script', 'style.css': 'style', 'model.cjs': 'model', 'embed.js': 'embed' },
};

test('Case III changes require release readiness even when review output works', () => {
  assert(requiresCaseIIIRelease(['src/experiences/case-iii/app.js']));
  assert(requiresCaseIIIRelease(['src/data/experiences.ts']));
  for (const file of ['src/pages/training/index.astro', 'src/pages/manual/[slug].astro', 'src/components/ExperienceCard.astro'])
    assert(requiresCaseIIIRelease([file]), file);
  assert(!requiresCaseIIIRelease(['README.md']));
});

test('current production exclusion blocks release with actionable missing-output findings', () => {
  const result = evaluateCaseIIIRelease({ wrapper: null, frame: null, manual: '', library: '', assets: { 'app.js': null } });
  assert.equal(result.ready, false);
  assert(result.blockers.some(item => item.includes('excluded')));
  assert(result.blockers.some(item => item.includes('library')));
  assert(result.blockers.some(item => item.includes('app.js')));
});

test('a review build containing all assets still fails when content is Drafted', () => {
  const result = evaluateCaseIIIRelease({ ...included, frame: included.frame + 'DRAFTED — NOT TECHNICALLY VALIDATED' });
  assert.equal(result.ready, false);
  assert(result.blockers.some(item => item.includes('draft or unvalidated')));
});

test('partial inclusion, missing links and missing assets fail', () => {
  assert.equal(evaluateCaseIIIRelease({ ...included, library: 'Coming soon' }).ready, false);
  assert.equal(evaluateCaseIIIRelease({ ...included, wrapper: marker }).ready, false);
  assert.equal(evaluateCaseIIIRelease({ ...included, assets: { 'style.css': '' } }).ready, false);
  assert.equal(evaluateCaseIIIRelease({ ...included, assets: {} }).ready, false);
});

test('included non-draft production output passes only this production-inclusion check', () => {
  assert.deepEqual(evaluateCaseIIIRelease(included), { ready: true, blockers: [] });
});

test('base-only trainer changes do not block a divergent documentation PR', () => {
  const cwd = mkdtempSync(join(tmpdir(), 'oversweep-gate-'));
  const git = (...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  const commit = message => { git('add', '.'); git('commit', '-m', message); return git('rev-parse', 'HEAD'); };
  try {
    git('init'); git('config', 'user.name', 'Gate test'); git('config', 'user.email', 'gate@example.invalid');
    writeFileSync(join(cwd, 'README.md'), 'Base');
    const ancestor = commit('common base');
    writeFileSync(join(cwd, 'README.md'), 'Documentation only');
    const head = commit('PR documentation');
    git('checkout', '--detach', ancestor);
    // Use an actual gate-sensitive path on main, without putting it in the PR.
    mkdirSync(join(cwd, 'src/data'), { recursive: true });
    writeFileSync(join(cwd, 'src/data/experiences.ts'), 'New base-only content');
    const base = commit('main moved');
    assert.deepEqual(changedFiles(base, head, cwd), ['README.md']);
    assert.equal(requiresCaseIIIRelease(changedFiles(base, head, cwd)), false);
  } finally { rmSync(cwd, { recursive: true, force: true }); }
});
