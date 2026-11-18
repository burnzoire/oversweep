// Real browser integration test. Only branch static files are intercepted.
// Cloudflare inference requests are never mocked or fulfilled by this test.
import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium} from '/tmp/ask-browser/node_modules/playwright/index.mjs';
const out='evidence', endpoint='https://ask-oversweep.burnzoire.workers.dev/ask';
await fs.mkdir(out,{recursive:true});
const head=await fetch(endpoint,{method:'HEAD'});
if(head.headers.get('x-ask-revision')!==process.env.ASK_REVISION)throw Error('Wrong Worker revision');
const browser=await chromium.launch({headless:true,args:['--no-sandbox'],...(process.env.ASK_CHROME_PATH?{executablePath:process.env.ASK_CHROME_PATH}:{})});
const page=await browser.newPage({viewport:{width:1365,height:1000}});
const evidence=[],findings=[];
await page.route('https://www.oversweep.com/**',async route=>{
 const url=new URL(route.request().url());
 let file=path.resolve('dist','.'+decodeURIComponent(url.pathname));
 if(url.pathname.endsWith('/'))file+='/index.html';
 const types={'.js':'text/javascript','.css':'text/css','.json':'application/json','.wasm':'application/wasm','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.html':'text/html','.woff2':'font/woff2'};
 try{await route.fulfill({body:await fs.readFile(file),contentType:types[path.extname(file)]??'application/octet-stream'})}catch{await route.fulfill({status:404,body:'Not found'})}
});
async function save(){await fs.writeFile(out+'/browser.json',JSON.stringify({sourceRevision:process.env.GITHUB_SHA,workerRevision:process.env.ASK_REVISION,frontend:'Branch build served locally under allowed origin',inference:'Live Cloudflare Worker; no inference interception',browser:browser.version(),evidence,findings},null,2))}
try{
 await page.goto('https://www.oversweep.com/');
 await page.locator('[data-ask-launcher]').click();
 const dialog=page.locator('#ask-dialog');
 async function ask(question){
  const responsePromise=page.waitForResponse(r=>r.url()===endpoint&&r.request().method()==='POST',{timeout:45000});
  await dialog.locator('input').fill(question);
  await dialog.getByRole('button',{name:'Send',exact:true}).click();
  const response=await responsePromise;
  const reply=await response.json();
  const row={question,status:response.status(),revision:response.headers()['x-ask-revision'],request:response.request().postDataJSON(),reply};
  evidence.push(row);await save();
  if(row.revision!==process.env.ASK_REVISION)throw Error('Unexpected live revision');
  await page.waitForFunction(()=>!document.querySelector('#ask-dialog button[aria-label="Send"]').disabled,null,{timeout:45000});
  return row;
 }
 await ask('What freq is Sochi tower?');
 await ask('What about its ILS?');
 await dialog.screenshot({path:out+'/sochi.png'});
 await dialog.getByRole('button',{name:'New chat',exact:true}).click();
 if(await dialog.locator('[data-thread] article').count())throw Error('New chat did not clear messages');
 const tomcat=await ask('What engines does the F-14B have?');
 if(tomcat.request.history.length||tomcat.request.topic.length)throw Error('New chat leaked context');
 await dialog.screenshot({path:out+'/tomcat.png'});
 await page.setViewportSize({width:390,height:844});
 await dialog.screenshot({path:out+'/mobile.png'});
 await dialog.getByRole('button',{name:'Close',exact:true}).click();
 await page.screenshot({path:out+'/closed.png'});
 await page.setViewportSize({width:1365,height:1000});
 await page.locator('[data-ask-launcher]').click();
 await dialog.getByRole('button',{name:'New chat',exact:true}).click();
 await ask('What is the TACAN for Ramat David?');
 const runways=await ask('What runways are available?');
 if(/Falcon BMS[\s\S]*09\/27/i.test(runways.reply.answer??''))findings.push('Review BMS runway assertion: standalone BMS section lists shelters, not runways.');
 await dialog.screenshot({path:out+'/ramat.png'});
 const orientation=await ask('Which one runs east-west?');
 if(/087|267/.test(orientation.reply.answer??''))findings.push('Illustrative bearings assigned to airfield.');
 if(/^none\b|no runway/i.test(orientation.reply.answer??''))findings.push('Overly literal east-west interpretation; question asks which runway is closest to east-west.');
 await dialog.screenshot({path:out+'/orientation.png'});
 await save();
}finally{await save();await browser.close()}
