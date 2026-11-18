import fs from 'node:fs/promises';
import crypto from 'node:crypto';
const repo=process.env.GITHUB_REPOSITORY,branch='codex/ask-conversation-evidence';
const base='https://api.github.com/repos/'+repo;
async function api(route,method='GET',body){
 const r=await fetch(base+route,{method,headers:{Authorization:'Bearer '+process.env.GITHUB_TOKEN,Accept:'application/vnd.github+json','Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
 if(!r.ok)throw Error('GitHub API '+route+' '+r.status);
 return r.status===204?{}:r.json();
}
let parent;
try{parent=(await api('/git/ref/heads/'+branch)).object.sha}catch{
 parent=(await api('/git/ref/heads/main')).object.sha;
 await api('/git/refs','POST',{ref:'refs/heads/'+branch,sha:parent});
}
const old=await api('/git/commits/'+parent),tree=[],files=[];
for(const name of await fs.readdir('evidence')){
 if(!/\.(png|json|log)$/.test(name))continue;
 const data=await fs.readFile('evidence/'+name);
 const blob=await api('/git/blobs','POST',{encoding:'base64',content:data.toString('base64')});
 const expected=crypto.createHash('sha1').update('blob '+data.length+'\0').update(data).digest('hex');
 if(blob.sha!==expected)throw Error('Upload hash mismatch');
 const target='docs/screenshots/ask-oversweep/'+process.env.ASK_REVISION+'/'+name;
 tree.push({path:target,mode:'100644',type:'blob',sha:blob.sha});
 files.push({name,path:target,sha:blob.sha,bytes:data.length});
}
const validation={sourceRevision:process.env.GITHUB_SHA,workerRevision:process.env.ASK_REVISION,run:'https://github.com/'+repo+'/actions/runs/'+process.env.GITHUB_RUN_ID,checks:process.env.CHECK_OUTCOME,docs:process.env.DOCS_OUTCOME,live:process.env.LIVE_OUTCOME,noHints:process.env.NOHINTS_OUTCOME,browser:process.env.BROWSER_OUTCOME,files};
tree.push({path:'docs/screenshots/ask-oversweep/'+process.env.ASK_REVISION+'/validation.json',mode:'100644',type:'blob',content:JSON.stringify(validation,null,2)});
const nextTree=await api('/git/trees','POST',{base_tree:old.tree.sha,tree});
const commit=await api('/git/commits','POST',{message:'Record actual Ask Oversweep branch validation and screenshots',tree:nextTree.sha,parents:[parent]});
await api('/git/refs/heads/'+branch,'PATCH',{sha:commit.sha,force:false});
console.log('Evidence commit '+commit.sha);
