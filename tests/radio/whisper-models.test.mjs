import test from 'node:test';
import assert from 'node:assert/strict';
import {modelFor,WHISPER_MODELS,tokens,wordErrorRate} from '../../src/lessons/radio/whisper-models.mjs';

test('Whisper models are distinct English-only, local ONNX weights',()=>{
 assert.equal(modelFor('tiny').id,'Xenova/whisper-tiny.en');
 assert.equal(modelFor('small').id,'Xenova/whisper-small.en');
 assert.deepEqual(Object.keys(WHISPER_MODELS),['tiny','small']);
 assert.throws(()=>modelFor('../external'),RangeError);
});
test('WER compares exact spoken reference against unmodified raw output',()=>{
 assert.equal(wordErrorRate('Falcon Ground Viper Two One request taxi',
 'Falcon Ground Viper Two One request taxi'),0);
 assert.equal(wordErrorRate('alpha bravo charlie delta',
 'alpha echo delta'),.5);
 assert.equal(wordErrorRate('One two','One two three'),.5);
 assert.equal(wordErrorRate('','hello'),null);
});
test('tokenizer is case/punctuation insensitive without call sign substitutions',()=>{
 assert.deepEqual(tokens('Viper, TWO ONE!'),['viper','two','one']);
 assert.deepEqual(tokens('Vipah'),['vipah']);
 assert.equal(wordErrorRate('Viper','Vipah'),1);
});
