import test from 'node:test';
import assert from 'node:assert/strict';
import { activePhrases, selectTranscript, installRecognitionContext } from '../../src/lessons/radio/context.mjs';

test('context front-loads current callsigns, location, procedures and numeric fields',()=>{
 const p=activePhrases('taxi-clearance').map(x=>x.phrase);
 for(const phrase of ['Falcon Air Base','Falcon Ground','Falcon Tower','Viper Two One','Viper 21','Runway Two Seven','Alpha','Taxiway Alpha','hold short','squawk'])assert(p.includes(phrase),phrase);
 assert(p.some(x=>x.includes('hold short Runway Two Seven Viper Two One')));
});
test('bias is installed only where browser supports contextual recognition',()=>{
 class Phrase {constructor(phrase,boost){this.phrase=phrase;this.boost=boost;}}
 const rec={phrases:[]};
 const x=installRecognitionContext(rec,'parked',{SpeechRecognitionPhrase:Phrase});
 assert(x.supported);assert(x.count>40);assert(rec.phrases.some(x=>x.phrase==='Viper Two One'&&x.boost===7));
 assert.equal(installRecognitionContext({},'parked',{SpeechRecognitionPhrase:Phrase}).supported,false);
});
test('recognition alternatives prefer a grounded callsign',()=>{
 const result=selectTranscript([{transcript:'5421 request taxi',confidence:.9},{transcript:'Viper 2 1 request taxi',confidence:.7}]);
 assert.equal(result.source,'alternative');
 assert.equal(result.transcript,'Viper 2 1 request taxi');
 assert.equal(result.ambiguous,false);
});
test('do not silently rewrite ambiguous digits',()=>{
 const value=selectTranscript([{transcript:'5421 request taxi',confidence:.96}]);
 assert.equal(value.transcript,'5421 request taxi');assert.equal(value.ambiguous,true);
 assert.equal(selectTranscript([{transcript:'Runway 27, 5421',confidence:.9}]).ambiguous,true);
});
test('no callsign bias invents a call from unrelated numeric fields',()=>{
 const v=selectTranscript([{transcript:'Descend 5421 feet',confidence:.9}]);
 assert.equal(v.transcript,'Descend 5421 feet');
});
