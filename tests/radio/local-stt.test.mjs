import test from 'node:test';
import assert from 'node:assert/strict';
import {concatChunks,downsample,durationSeconds,TARGET_RATE} from '../../src/lessons/radio/audio.mjs';
import {atcPrompt} from '../../src/experiences/radio-trainer/local-stt.js';
test('audio samples concatenate without padding or gaps',()=>{
 const result=concatChunks([Float32Array.of(1,2),Float32Array.of(3),Float32Array.of(4,5)]);
 assert.deepEqual(Array.from(result),[1,2,3,4,5]);
});
test('48 kHz microphone data downsampled to 16 kHz with expected duration',()=>{
 const input=Float32Array.from({length:48000},(_,i)=>Math.sin(i/30));
 const out=downsample(input,48000);
 assert.equal(out.length,16000);
 assert.equal(durationSeconds(out,TARGET_RATE),1);
 assert(out.every(Number.isFinite));
});
test('44.1 kHz samples resample to 16 kHz with stable zero signal',()=>{
 const out=downsample(new Float32Array(44100),44100);
 assert.equal(out.length,16000);
 assert(out.every(x=>x===0));
});
test('resampler rejects incorrect input rates',()=>{
 assert.throws(()=>downsample(new Float32Array(10),8000),RangeError);
 assert.throws(()=>downsample([1,2],48000),RangeError);
});
test('Whisper prefix context prioritizes airfield, agency, callsign, runway and stage',()=>{
 const prompt=atcPrompt('taxi-clearance');
 for(const phrase of ['Falcon Air Base','Viper Two One','Falcon Ground','Runway','Alpha','north ramp','two seven','hold short']) {
  assert.match(prompt,new RegExp(phrase,'i'),phrase);
 }
 assert.notEqual(prompt,atcPrompt('hold-short'));
});
