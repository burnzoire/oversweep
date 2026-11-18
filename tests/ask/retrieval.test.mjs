import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRetriever } from '../../workers/ask-oversweep/retrieval.mjs';
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
  assert.equal(retrieve('What about ILS?',{topic:[],history:[{role:'user',content:'Sochi tower?'}]}).subject,undefined);
});
