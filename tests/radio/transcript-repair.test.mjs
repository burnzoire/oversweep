import test from 'node:test';
import assert from 'node:assert/strict';
import {proposeAtcTranscript} from '../../src/lessons/radio/transcript-repair.mjs';

test('observed Falcon Grant 521 request taxi proposes scenario entities and preserves raw',()=>{
 const result=proposeAtcTranscript('Falcon Grant 521 request taxi.','parked');
 assert.equal(result.text,'Falcon Ground Viper 21 request taxi.');
 assert.equal(result.raw,'Falcon Grant 521 request taxi.');
 assert.deepEqual(result.changes.map(x=>x.field),['controller','callsign']);
 assert.equal(result.reviewRequired,true);
});
test('known callsigns and controller pass through unchanged',()=>{
 const result=proposeAtcTranscript('Falcon Ground Viper Two One request taxi.','parked');
 assert.equal(result.text,result.raw);
 assert.equal(result.reviewRequired,false);
});
test('numeric runway or altitude is never rewritten as the aircraft callsign',()=>{
 for(const s of ['Falcon Ground runway 521 request taxi','Falcon Ground descend 521 feet','Runway 521 hold short','Falcon Ground 521 ready departure']) {
  const r=proposeAtcTranscript(s,'hold-short');
  assert.equal(r.text,s,s);
 }
});
test('no 521 callsign inference without active ground taxi call grammar',()=>{
 for(const s of ['521 request taxi','Falcon Ground 521 hold short','Falcon Ground 521 report ready','Falcon Ground runway 521']) {
  assert.equal(proposeAtcTranscript(s,'parked').text,s,s);
 }
});
test('in-scenario alias repair does not apply to different controller',()=>{
 const r=proposeAtcTranscript('Eagle Grant 521 request taxi','parked');
 assert.equal(r.text,'Eagle Grant 521 request taxi');
});
test('does not change actual clearance or handoff text',()=>{
 const s='Falcon Tower cleared to land runway 27, Viper 21';
 assert.equal(proposeAtcTranscript(s,'complete').text,s);
});
