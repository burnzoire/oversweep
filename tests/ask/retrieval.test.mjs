import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRetriever, prepareCorpus } from '../../workers/ask-oversweep/retrieval.mjs';
const sochi = '/encyclopedia/locations/sochi/';
const ramat = '/encyclopedia/locations/ramat-david/';
const kutaisi = '/encyclopedia/locations/kutaisi/';
const corpus = {
  [sochi]: {title:'Sochi International Airport', text:'An airport in DCS.'},
  [sochi+'#sims-title']: {title:'Sochi · Sim maps',text:'DCS: Caucasus. Tower 127.0 VHF, 256.0 UHF. ILS 111.1 on runway 06.'},
  [ramat]: {title:'Ramat David Airbase',text:'Military airbase.'},
  [ramat+'#sims-title']: {title:'Ramat David · Sim maps',text:'DCS: Syria. VORTAC RMD 84X. Runways 09/27, 11/29 and 15/33.'},
  [kutaisi]: {title:'Kutaisi International Airport',text:'An airport.'},
  [kutaisi+'#sims-title']: {title:'Kutaisi · Sim maps',text:'DCS: Caucasus. Tower 134 MHz.'},
  '/encyclopedia/terminology/#tacan':{title:'TACAN',text:'Tactical air navigation.'},
  '/encyclopedia/terminology/#aoa':{title:'AOA',text:'Angle of attack. Angle between chord and relative wind.'},
  '/encyclopedia/terminology/#attack-angle':{title:'Attack angle',text:'Laser to target and seeker geometry.'},
  '/manual/flight-fundamentals/principles-of-flight/#lift':{title:'Principles of flight · Lift',text:'Flaps change airfoil camber and increase lift.'},
};
const retrieve = createRetriever(corpus);
test('re-searches the current subject on follow-ups and clears it for explicit switches', () => {
  const first = retrieve('What is the VORTAC for Ramat David?');
  const follow = retrieve('What runways are available?',{topic:first.topic,ids:[sochi+'#sims-title']});
  assert.equal(follow.subject,'Ramat David Airbase');
  assert.ok(follow.passages.some(p=>p.text.includes('09/27')));
  assert.ok(!follow.passages.some(p=>p.id.startsWith(sochi)));
  assert.equal(retrieve('What freq is Sochi tower?',{topic:first.topic}).subject,'Sochi International Airport');
});
test('pronouns keep the airfield instead of making TACAN the new topic', () => {
  assert.equal(retrieve('Does it have a TACAN?',{previous:'What freq is Sochi tower?'}).subject,'Sochi International Airport');
});
test('canonical glossary aliases preserve word order', () => {
  const result = retrieve('What is angle of attack?');
  assert.equal(result.subject,'AOA');
  assert.ok(result.passages.some(p=>p.text.includes('chord')));
  assert.ok(!result.passages.some(p=>p.id.endsWith('#attack-angle')));
});
test('independent questions release prior topic and comparisons include every named record', () => {
  const result = retrieve('How do flaps affect lift?', {topic:[sochi]});
  assert.ok(!result.passages.some(p=>p.id.startsWith(sochi)));
  const comparison = retrieve('What tower frequencies do Sochi and Kutaisi use?');
  assert.ok(comparison.passages.some(p=>p.id.startsWith(sochi)));
  assert.ok(comparison.passages.some(p=>p.id.startsWith(kutaisi)));
});
test('topic IDs preserve context beyond the bounded history and reset prevents leakage', () => {
  assert.equal(retrieve('What about ILS?',{topic:[sochi],history:[]}).subject,'Sochi International Airport');
  assert.equal(retrieve('What about ILS?',{topic:[],history:[]}).subject,undefined);
});

test('generic attribute words do not match a simulator theatre name', () => {
  const r = createRetriever({...corpus,'/encyclopedia/locations/dcs-the-channel/':{title:'DCS: The Channel',text:'World War II theatre.'}});
  const result = r('And the VORTAC channel again?',{topic:[ramat]});
  assert.equal(result.subject,'Ramat David Airbase');
  assert.ok(result.passages.some(p=>p.text.includes('84X')));
});

test('aircraft nicknames preserve a topic and include the factual record', () => {
  const id='/encyclopedia/aircraft/f-14/';
  const r = createRetriever({...corpus,[id]:{title:'F-14 Tomcat',text:'Powerplant F-14A TF30; F-14B F110-GE-400.'},[id+'#history']:{title:'F-14 Tomcat · History',text:'The engines changed.'}});
  const result=r('What engines does the Tomcat have?');
  assert.deepEqual(result.topic,[id]);
  assert.ok(result.passages.some(p=>p.text.includes('F110-GE-400')));
});

test('airfield table rows retain context without mistaking directions for names', () => {
  const id='/encyclopedia/locations/dcs-syria/#af-kuweires';
  const r=createRetriever({...corpus,[id]:{title:'Kuweires · DCS: Syria',name:'Kuweires',text:'DCS Syria. Tower: VHF 120.5; Runways: 10/28.'},'/encyclopedia/locations/dcs-normandy/#af-west-malling':{title:'West Malling · DCS: Normandy',name:'West Malling',text:'Runways 01/19.'}});
  const first=r('What is the tower frequency for Kuweires?');
  assert.deepEqual(first.topic,[id]);
  assert.deepEqual(r('What runways are available?',{topic:first.topic}).passages.map(p=>p.id),[id]);
  assert.equal(r('Which one runs east-west?',{topic:[ramat]}).subject,'Ramat David Airbase');
});

test('comparison follow-ups retain both the earlier and newly named aircraft', () => {
  const f14='/encyclopedia/aircraft/f-14/',f16='/encyclopedia/aircraft/f-16/';
  const r=createRetriever({...corpus,[f14]:{title:'F-14 Tomcat',text:'Two engines.'},[f16]:{title:'F-16 Fighting Falcon',text:'One engine.'}});
  assert.deepEqual(new Set(r('How does this differ from the F-16?',{topic:[f14]}).topic),new Set([f14,f16]));
});


test('explicit map scope resolves duplicate row names before deduplication',()=>{
 const r=createRetriever({...corpus,
 '/encyclopedia/locations/dcs-syria/':{title:'DCS: Syria',text:'Theatre.'},
 '/encyclopedia/locations/dcs-sinai/':{title:'DCS: Sinai',text:'Theatre.'},
 '/encyclopedia/locations/dcs-syria/#af-hatzerim':{title:'Hatzerim · DCS: Syria',name:'Hatzerim',text:'Tower 128.2'},
 '/encyclopedia/locations/dcs-sinai/#af-hatzerim':{title:'Hatzerim · DCS: Sinai',name:'Hatzerim',text:'Tower 119.75'},
 '/encyclopedia/locations/dcs-syria/#af-king-hussein':{title:'King Hussein Air College · DCS: Syria',name:'King Hussein Air College',text:'Tower 118.3'}});
 assert.deepEqual(r('What is the tower frequency for Hatzerim in Syria?').topic,['/encyclopedia/locations/dcs-syria/#af-hatzerim']);
 assert.equal(r('What is the tower frequency for King Hussein Air College?').topic.length,1);
 assert.equal(r('What is the tower frequency for Hatzerim?').topic.length,2);
});

test('a failed new-subject question supersedes the last successful topic',()=>{
 const result=retrieve('What runways are available?',{topic:[sochi],history:[{role:'user',content:'Sochi tower?'},{role:'assistant',content:'127.0'},{role:'user',content:'What is the tower frequency for Ramat David?'}]});
 assert.equal(result.subject,'Ramat David Airbase');
});


test('build-prepared metadata round-trips without changing retrieval',()=>{
 const prepared=JSON.parse(JSON.stringify(prepareCorpus(corpus)));
 const r=createRetriever(corpus,prepared);
 for(const q of ['What freq is Sochi tower?','What is angle of attack?','Which one runs east-west?']) {
   assert.deepEqual(r(q,{topic:[ramat]}),retrieve(q,{topic:[ramat]}));
 }
});


test('multiple failed dependent questions preserve the latest explicit subject',()=>{
 const result=retrieve('What runways are available?',{topic:[sochi],history:[{role:'user',content:'Sochi tower?'},{role:'assistant',content:'127.0'},{role:'user',content:'What is the tower frequency for Ramat David?'},{role:'user',content:'Does it have a TACAN?'}]});
 assert.equal(result.subject,'Ramat David Airbase');
});

test('explicit simulator scope prefers the matching row over a standalone article',()=>{
 const id='/encyclopedia/locations/dcs-sinai/#af-ramat-david';
 const r=createRetriever({...corpus,'/encyclopedia/locations/dcs-sinai/':{title:'DCS: Sinai',text:'Theatre.'},[id]:{title:'Ramat David · DCS: Sinai',name:'Ramat David',text:'Low VHF tower 38.4'}});
 const result=r('What is the low VHF tower frequency for Ramat David in Sinai?');
 assert.deepEqual(result.topic,[id]);
 assert.ok(result.passages.some(p=>p.text.includes('38.4')));
});


test('standalone articles include their explicitly linked theatre rows',()=>{
 const id='/encyclopedia/locations/dcs-syria/#af-ramat-david';
 const r=createRetriever({...corpus,[id]:{title:'Ramat David · DCS: Syria',name:'Ramat David',record:ramat,text:'Runways 09 (082°) / 27 (262°).'}});
 const result=r('Which one runs east-west?',{topic:[ramat],history:[{role:'user',content:'What runways are available?'}]});
 assert.ok(result.passages.some(p=>p.id===id && p.text.includes('082°')));
});


test('retrieval labels canonical scopes and separates explanations from records',()=>{
 const r=createRetriever({
 '/encyclopedia/locations/dcs-syria/#af-example':{title:'Example · DCS: Syria',name:'Example',text:'Tower 120.5 MHz'},
 '/encyclopedia/aircraft/f-14/':{title:'F-14 Tomcat',text:'Two engines.'},
 '/manual/example/#rule':{title:'Runway rule',text:'Distinctrule explains numbers.'}});
 const record=r('Example tower?').passages[0];assert.equal(record.kind,'simulator_record');assert.equal(record.scope,'DCS: Syria');
 assert.equal(r('F-14 engines?').passages[0].kind,'article');
 assert.equal(r('Distinctrule?').passages[0].kind,'explanation');
});
