import {proposeAtcTranscript} from './lessons/radio/transcript-repair.mjs';
import {loadNeuralVoice,playNeuralVoice,stopNeuralVoice} from './neural-voice.js';
import { selectTranscript, FALCON_GROUND } from './lessons/radio/context.mjs';
import { loadLocalSTT, isSTTReady, isCapturing, startCapture, stopCapture, discardCapture, transcribeLocal } from './local-stt.js';
import { INITIAL, advance, instruction } from './lessons/radio/model.mjs';
const $ = id => document.getElementById(id);
let state = structuredClone(INITIAL);
let recording = false, lastAtc = '', voices = [], audio = null, localEngine = null;
let busySTT = false;
function note(text,kind='') { $('result').textContent=text; $('result').dataset.kind=kind; }
function status(text){ $('status').textContent=text; }
function log(kind,text) {
 const item=document.createElement('div'); item.className='call '+kind;
 const tag=document.createElement('label');tag.textContent=kind==='pilot'?'VIPER 21 · TRANSMIT':'FALCON GROUND · RECEIVE';
 const p=document.createElement('p');p.textContent=text;item.append(tag,p);$('log').append(item);$('log').scrollTop=$('log').scrollHeight;
}
function showState(){$('task').textContent=instruction(state.stage);$('scores').textContent=state.turns+' / '+state.errors;}
function beep() {
 if(!$('key').checked)return;
 try {
  audio??=new (window.AudioContext||window.webkitAudioContext)();
  if(audio.state==='suspended')audio.resume();
  const o=audio.createOscillator(),g=audio.createGain();o.type='square';o.frequency.value=870;
  g.gain.setValueAtTime(0.001,audio.currentTime);g.gain.linearRampToValueAtTime(.012,audio.currentTime+.008);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.07);
  o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+.075);
 }catch(e){console.warn('Radio key sound unavailable',e);}
}
function populateVoices(){
 if(!('speechSynthesis' in window)){ $('voice').checked=false;$('ttsMs').textContent='Unavailable';return; }
 const prev=$('voices').value;
 voices=speechSynthesis.getVoices().filter(v=>v.lang.toLowerCase().startsWith('en'));
 $('voices').replaceChildren(new Option('System default',''));
 for(const v of voices) $('voices').add(new Option(v.name+' · '+v.lang,v.voiceURI));
 if(voices.some(v=>v.voiceURI===prev))$('voices').value=prev;
}
async function speak(text){
 if($('neuralEnabled').checked){
  const start=performance.now();
  try{
   if('speechSynthesis' in window)speechSynthesis.cancel();
   status('SYNTHESISING');
   await playNeuralVoice(text,{voice:$('neuralVoice').value,radio:$('radioFilter').checked,onStart:()=>{
    $('ttsMs').textContent=Math.round(performance.now()-start)+' ms';status('RECEIVING');beep();
   }});
   status('READY');return;
  }catch(e){$('neuralStatus').textContent='Neural synthesis failed: '+e.message+' — using browser voice.';status('READY');}
 }

 if(!$('voice').checked||!('speechSynthesis' in window))return;
 const start=performance.now();
 try {
  speechSynthesis.cancel();
  const utterance=new SpeechSynthesisUtterance(text);
  const voice=voices.find(v=>v.voiceURI===$('voices').value);if(voice)utterance.voice=voice;
  utterance.lang='en-US';utterance.rate=.92;utterance.pitch=.93;
  utterance.onstart=()=>{$('ttsMs').textContent=Math.round(performance.now()-start)+' ms';status('RECEIVING');beep();};
  utterance.onend=()=>status('READY');
  utterance.onerror=e=>{status('READY');note('Audio error: '+e.error+'. Transcript remains available.');};
  speechSynthesis.speak(utterance);
 }catch(e){note('Speech synthesis error: '+e.message);}
}
async function localWording(approved,context) {
 // The deterministic engine always owns the clearance. The LLM is not allowed
 // to replace it with invented headings, runways, instructions or frequencies.
 if(!$('llmEnabled').checked||!localEngine)return approved;
 try {
  const prompt='You are a fictional military ground controller in a technical speech POC. Return only the exact approved radio sentence below, with no commentary, edits or added instructions. Approved sentence: '+approved;
  const result=await localEngine.chat.completions.create({messages:[{role:'system',content:'Do not create instructions. Echo the approved clearance exactly.'},{role:'user',content:prompt}],temperature:0,max_tokens:150});
  const candidate=result.choices?.[0]?.message?.content?.trim()??'';
  // For this initial POC, only literal equivalence is accepted. This deliberately
  // makes LLM usage diagnostic rather than giving it clearance authority.
  if(candidate.replace(/\s+/g,' ').trim()===approved.replace(/\s+/g,' ').trim())return candidate;
  console.warn('Local LLM output rejected; controller used authoritative clearance.',{context});
  return approved;
 }catch(e){$('llmStatus').textContent='Local LLM generation error: '+e.message+'; deterministic fallback active.';return approved;}
}
let inFlight=false;
async function transmit(text){
 const value=String(text||'').trim();if(!value||inFlight){if(!value)note('No transmission captured. Speak or type a radio call.');return;}
 inFlight=true;$('send').disabled=true;
 beep();log('pilot',value);
 const started=performance.now(),out=advance(state,value);
 $('modelMs').textContent=Math.round(performance.now()-started)+' ms';
 if(!out.ok){note(out.error);inFlight=false;$('send').disabled=false;return;}
 state=out.state;showState();
 note((out.accepted?'ACCEPTED · ':'RETRY · ')+out.reason,out.accepted?'ok':'warn');
 const controller=await localWording(out.controller,{stage:state.stage,intent:out.intent});
 lastAtc=controller;log('atc',controller);speak(controller);
 $('text').value='';$('send').disabled=false;inFlight=false;
}
function updatePTTState(active) {
 recording=active;
 $('ptt').textContent=active?'Release transmission':'Push to talk';
 $('ptt').classList.toggle('recording',active);
}
async function startRecording(){
 if(busySTT)return;
 if(isCapturing()){
  busySTT=true;$('ptt').disabled=true;updatePTTState(false);
  $('micState').textContent='Preparing audio…';status('TRANSCRIBING');
  try{
   const captured=await stopCapture();
   $('micState').textContent='Captured '+captured.duration.toFixed(1)+' seconds of audio';
   const result=await transcribeLocal(captured.samples,state.stage,m=>{$('sttStatus').textContent=m;});
   const text=String(result.text||'').trim();
   $('sttMs').textContent=result.ms+' ms';
   const selected=selectTranscript([{transcript:text,confidence:1}]);
   const repaired=proposeAtcTranscript(selected.transcript,state.stage);
   $('text').value=repaired.text;
   $('sttStatus').textContent=result.contextApplied?'Local Whisper · prompt submitted (accuracy unverified)':'Local Whisper · no prompt conditioning';
   if(result.warning)$('sttStatus').textContent+=' · '+result.warning;
   if(!selected.transcript){
    note('No speech recognised. Hold PTT while speaking, or type a transmission.');
   } else if(repaired.reviewRequired){
    note('Whisper heard: "'+repaired.raw+'". Suggested corrections: '+repaired.changes.map(c=>c.from+' → '+c.to).join('; ')+'. Review the proposed text before selecting Transmit text.');
   } else if(selected.ambiguous){
    note('Ambiguous callsign digits in transcript. Expected callsign: '+FALCON_GROUND.aircraft[0]+'. Review before transmitting.');
   } else {
    note('Local transcription ready. Review the text and select Transmit text.');
   }
  }catch(err){note('Local STT error: '+err.message);$('sttStatus').textContent='Failed; use text input';}
  finally{busySTT=false;$('ptt').disabled=false;status('READY');$('micState').textContent='Not recording';}
  return;
 }
 try {
  await startCapture(message=>{$('micState').textContent=message;});
  updatePTTState(true);$('micState').textContent='Recording on-device; click again to transcribe.';
  $('sttStatus').textContent=isSTTReady()?'Local Whisper model ready':'Local recording; model loads after release';
  status('TRANSMITTING');
 }catch(err){updatePTTState(false);status('READY');note('Microphone error: '+err.message+'. You can still type your transmission.');}
}
async function prepareSTT(){
 $('loadSTT').disabled=true;
 try{
  await loadLocalSTT(message=>{$('sttStatus').textContent=message;});
  $('sttStatus').textContent='Local Whisper ready';
  note('On-device transcription model loaded. Press PTT to record.');
 }catch(err){
  $('sttStatus').textContent='Model unavailable';
  note('Local model loading failed: '+err.message+'. No cloud transcription will be used. You can still type.');
 }finally{$('loadSTT').disabled=false;}
}
async function loadModel(){
 if(localEngine){$('llmStatus').textContent='Local LLM already loaded.';return;}
 if(!navigator.gpu){$('llmStatus').textContent='WebGPU unavailable. Deterministic mode remains fully functional.';return;}
 $('loadLLM').disabled=true;$('llmStatus').textContent='Downloading local WebGPU model. This may consume over 1 GB and take time.';
 try{
  const webllm=await import('https://esm.run/@mlc-ai/web-llm');
  const model='Llama-3.2-1B-Instruct-q4f16_1-MLC';
  localEngine=await webllm.CreateMLCEngine(model,{initProgressCallback:report=>{$('llmStatus').textContent=report.text||'Loading model…';}});
  $('llmStatus').textContent='Local LLM ready. Outputs are checked against the deterministic clearance.';
  $('llmEnabled').checked=true;
 }catch(e){$('llmStatus').textContent='Local LLM unavailable: '+e.message+'. Deterministic controller remains active.';$('llmEnabled').checked=false;}
 finally{$('loadLLM').disabled=false;}
}
$('ptt').addEventListener('click',startRecording);
$('loadSTT').addEventListener('click',prepareSTT);
$('send').addEventListener('click',()=>transmit($('text').value));
$('text').addEventListener('keydown',e=>{if(e.key==='Enter')transmit($('text').value);});
$('loadVoice').addEventListener('click',async()=>{
 $('loadVoice').disabled=true;
 try{
  await loadNeuralVoice(message=>{$('neuralStatus').textContent=message;});
  $('neuralEnabled').disabled=false;$('neuralEnabled').checked=true;
 }catch(e){$('neuralStatus').textContent='Neural voice unavailable: '+e.message+'. Browser voice remains available.';$('neuralEnabled').checked=false;}
 finally{$('loadVoice').disabled=false;}
});
$('reset').addEventListener('click',()=>{stopNeuralVoice();state=structuredClone(INITIAL);discardCapture();updatePTTState(false);if('speechSynthesis' in window)speechSynthesis.cancel();$('log').replaceChildren();$('text').value='';lastAtc='';showState();note('Exercise reset. Contact Falcon Ground when ready.');log('atc','Falcon Ground monitoring.');});
$('replay').addEventListener('click',()=>{if(lastAtc)speak(lastAtc);else note('No previous controller response to replay.');});
$('loadLLM').addEventListener('click',loadModel);
$('llmEnabled').addEventListener('change',()=>{if($('llmEnabled').checked&&!localEngine){$('llmEnabled').checked=false;note('Load the local LLM before enabling it.');}});
if('speechSynthesis' in window){populateVoices();speechSynthesis.addEventListener?.('voiceschanged',populateVoices);}
$('sttStatus').textContent='Local Whisper model not loaded';
showState();log('atc','Falcon Ground monitoring.');
