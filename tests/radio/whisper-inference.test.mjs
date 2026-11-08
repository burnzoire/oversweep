import test from 'node:test';
import assert from 'node:assert/strict';
import {buildWhisperPromptIds,transcribeEnglishOnly} from '../../src/lessons/radio/whisper-inference.mjs';

test('English-only model never receives forbidden language or task options',async()=>{
 const calls=[];
 const englishOnly=async(samples,options={})=>{
   if(options.language!==undefined||options.task!==undefined)
      throw new Error('Cannot specify task or language for an English-only model');
   calls.push(options);
   return {text:' Viper Two One request taxi '};
 };
 englishOnly.tokenizer={encode:text=>text==='<|startofprev|>'?[99]:[99,12,13]};
 const response=await transcribeEnglishOnly(englishOnly,new Float32Array(3200),'Falcon Ground Viper Two One');
 assert.equal(response.text,'Viper Two One request taxi');
 assert.equal(response.contextApplied,true);
 assert.deepEqual(calls,[{prompt_ids:[99,12,13]}]);
});

test('unsupported prompt context is retried locally without multilingual options',async()=>{
 const options=[];
 const englishOnly=async(samples,opts={})=>{
   if('language' in opts||'task' in opts)throw new Error('English-only model rejects multilingual flags');
   options.push(opts);
   if(opts.prompt_ids)throw new Error('prompt_ids not supported');
   return {text:'  Viper 21 request taxi  '};
 };
 englishOnly.tokenizer={encode:()=>[12,13]};
 const response=await transcribeEnglishOnly(englishOnly,new Float32Array(3200),'Viper Two One');
 assert.equal(response.text,'Viper 21 request taxi');
 assert.equal(response.contextApplied,false);
 assert.match(response.warning,/rejected/);
 assert.deepEqual(options,[{prompt_ids:[99,12,13]},{}]);
});

test('model with no tokenizer uses unconditional local transcription',async()=>{
 const calls=[];
 const transcriber=async(samples,options={})=>{calls.push(options);return {text:'Runway two seven'};};
 const result=await transcribeEnglishOnly(transcriber,new Float32Array(3200),'runway 27');
 assert.equal(result.contextApplied,false);
 assert.equal(result.text,'Runway two seven');
 assert.deepEqual(calls,[{}]);
});

test('prompt encoding errors do not prevent local transcription',async()=>{
 const transcriber=async()=>({text:'test'});
 transcriber.tokenizer={encode:()=>{throw new Error('unsupported');}};
 const result=await transcribeEnglishOnly(transcriber,new Float32Array(3200),'airfield');
 assert.equal(result.contextApplied,false);
 assert.match(result.warning,/prepare vocabulary/);
});

test('prompt tokens are bounded and validated',()=>{
 const transcriber={tokenizer:{encode:text=>text==='<|startofprev|>'?[0]:Array.from({length:240},(_,i)=>i)}};
 assert.equal(buildWhisperPromptIds(transcriber,'full context').length,180);
 assert.equal(buildWhisperPromptIds({tokenizer:{encode:()=>['bad']}},'invalid'),null);
});

test('a plain prompt without startofprev is not falsely counted as conditioning',()=>{
 const transcriber={tokenizer:{encode:()=>[12,13]}};
 assert.equal(buildWhisperPromptIds(transcriber,'Falcon Ground Viper Two One'),null);
});
test('use tokenizer-native Whisper get_prompt_ids when available',()=>{
 const transcriber={tokenizer:{get_prompt_ids:()=>[50361,12,13]}};
 assert.deepEqual(buildWhisperPromptIds(transcriber,'Viper Two One'),[50361,12,13]);
});
