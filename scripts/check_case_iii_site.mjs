import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
const review = process.argv.includes('--review');
const base = (process.argv.find(a=>a.startsWith('--base='))?.slice(7) ?? '').replace(/\/$/,'');
const route = 'manual/naval-operations/case-iii/index.html';
const assets = ['index.html','app.js','style.css','model.cjs','embed.js'];
const exists = async file => stat(path.join('dist',file)).then(s=>s.isFile(),()=>false);
assert.equal(await exists(route),review,'draft route is emitted only for explicit review');
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
  assert(html.includes(`src="${base}/review/case-iii/index.html"`));
  assert(html.includes('Drafted — not technically validated'));
  const trainer = await readFile('dist/review/case-iii/index.html','utf8');
  for (const asset of assets.filter(a=>a!=='index.html')) assert(trainer.includes(`"${asset}"`));
  assert(trainer.includes('id="briefDialog"'));
  assert(trainer.includes('DRAFTED — NOT TECHNICALLY VALIDATED'));
  assert(trainer.includes('aria-label="Radio history"'));
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
