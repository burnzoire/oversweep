const fs=require('fs'),vm=require('vm'),assert=require('assert');
// Inside a frame the guard sets oversweepFramed; app.js must not start the simulator.
function run(framed){let frames=0;const element=()=>({value:'',checked:false,innerHTML:'',textContent:'',classList:{toggle(){}},setAttribute(){},addEventListener(){},append(){},showModal(){},close(){}});const ctx=vm.createContext({document:{getElementById:element,createElement:element,createTextNode:t=>t},window:{oversweepFramed:framed},localStorage:{setItem(){}},requestAnimationFrame(){frames++},confirm:()=>true,console});ctx.CaseIIIModel=require('../../src/experiences/case-iii/model.cjs');vm.runInContext(fs.readFileSync('src/experiences/case-iii/app.js','utf8'),ctx);return frames;}
assert.equal(run(true),0,'framed trainer must not start');
assert.equal(run(undefined),1,'standalone trainer starts its frame loop');
console.log('Framed trainer stays stopped; standalone trainer starts: PASS.');
