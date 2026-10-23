import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
const review = process.argv.includes('--review');
const base = (process.argv.find(a=>a.startsWith('--base='))?.slice(7) ?? '').replace(/\/$/,'');
const route = 'manual/naval-operations/case-iii/index.html';
const assets = ['app.js','style.css','model.cjs','embed.js'];
const exists = async file => stat(path.join('dist',file)).then(s=>s.isFile(),()=>false);
assert.equal(await exists(route),review,'draft route is emitted only for explicit review');
assert.equal(await exists('review/case-iii/index.html'),review);
for (const asset of assets) assert.equal(await exists(`review/case-iii/${asset}`),review,asset);
const manual = await readFile('dist/manual/naval-operations/index.html','utf8');
const library = await readFile('dist/training/index.html','utf8');
const marker = 'data-experience-id="experience.case-iii-tomcat"';
for (const html of [manual,library]) {
  assert.equal(html.includes(marker),review);
  if (review) assert(html.includes(`href="${base}/manual/naval-operations/case-iii/"`));
}
if (review) {
  const html = await readFile(path.join('dist',route),'utf8');
  assert(html.includes(`src="${base}/review/case-iii/"`));
  assert(html.includes('Drafted — not technically validated'));
  const trainer = await readFile('dist/review/case-iii/index.html','utf8');
  assert(trainer.includes('data-experience-revision="3"'));
  for (const asset of assets.filter(a=>a!=='index.html')) assert(trainer.includes(`"${asset}"`));
  assert(trainer.includes('id="briefDialog"'));
  assert(trainer.includes('DRAFTED — NOT TECHNICALLY VALIDATED'));
  assert(trainer.includes('aria-label="Radio history"'));
  assert(trainer.includes('Trainer setpoints'));
  assert(trainer.includes('<label for="speed">SIM SPEED <span>KIAS*</span></label>'));
  assert(trainer.includes('aria-describedby="scrubHint simSpeedNote"'));
  assert(trainer.includes('id="simSpeedNote"'));
  assert(trainer.includes('outside the hold, numeric KIAS is used as NM/hour for position, not groundspeed'));
  assert(html.includes('not an approved operating procedure or a proficiency assessment'));
  assert(html.includes('not verified Navy phraseology'));
  assert(trainer.includes('not been verified as Navy phraseology'));
  const app = await readFile('dist/review/case-iii/app.js','utf8');
  assert(app.includes('Exercise gate:'));
  assert(app.includes('This is not a verified aircraft limit.'));
  assert(app.includes('not a proficiency score'));
  assert(app.includes('SIM SPEED'));
  assert(app.includes('KIAS*'));
  assert(html.includes('Outside the hold, the simulated KIAS number is also used as NM/hour for position'));
  assert(library.includes('data-experience-revision="3"'));
} else {
  // Fail closed for all output paths and assets, not just navigation links.
  async function walk(dir) {
    for (const entry of await readdir(dir,{withFileTypes:true})) {
      const file=path.join(dir,entry.name);
      if(entry.isDirectory()) await walk(file);
      else {
        const text=await readFile(file,'utf8');
        assert(!text.includes('CaseIIIModel')&&!text.includes('function tickArrestment')&&!text.includes(marker),file);
      }
    }
  }
  await walk('dist');
}
console.log(`Case III output checks: ${review?'review included':'production excluded'}, base ${base||'/'}`);
