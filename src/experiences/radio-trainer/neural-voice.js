// Optional browser neural speech output. Load on user action only.
// This is an experimental browser integration, not a validated voice backend.
// Avoid the ESM.sh Node polyfill path previously observed to call fs.readFile.
const CDN = 'https://cdn.jsdelivr.net/npm/kokoro-js@1.2.1/+esm';
const MODEL = 'onnx-community/Kokoro-82M-v1.0-ONNX';
let engine = null;
let context = null;
let source = null;
export function ready() {return Boolean(engine);}
export async function loadNeuralVoice(onProgress=()=>{}) {
  if(engine)return engine;
  onProgress('Loading browser TTS module…');
  const {KokoroTTS} = await import(CDN);
  onProgress('Downloading neural voice model (local inference after download)…');
  engine=await KokoroTTS.from_pretrained(MODEL,{dtype:'q8',device:'wasm',progress_callback:p=>{
    if(p?.status==='progress'&&p.total)onProgress('Model '+Math.round(p.loaded/p.total*100)+'%');
  }});
  onProgress('Neural voice ready.');
  return engine;
}
export async function playNeuralVoice(text,{voice='am_michael',radio=true,onStart=()=>{}}={}) {
 if(!engine)throw new Error('Neural model is not loaded');
 if(source){try{source.stop();}catch{}source=null;}
 const audio=await engine.generate(text,{voice,speed:1.04});
 const samples=audio.audio;
 const rate=audio.sampling_rate;
 if(!samples?.length||!rate)throw new Error('Model returned invalid audio');
 context??=new (window.AudioContext||window.webkitAudioContext)();
 if(context.state==='suspended')await context.resume();
 const buffer=context.createBuffer(1,samples.length,rate);
 buffer.copyToChannel(samples,0);
 source=context.createBufferSource();source.buffer=buffer;
 const output=context.createGain();output.gain.value=.8;
 if(radio) {
   const high=context.createBiquadFilter();high.type='highpass';high.frequency.value=320;
   const low=context.createBiquadFilter();low.type='lowpass';low.frequency.value=3200;
   source.connect(high);high.connect(low);low.connect(output);
 } else source.connect(output);
 output.connect(context.destination);
 onStart();
 return await new Promise((resolve,reject)=>{
   source.onended=resolve;
   try{source.start();}catch(e){reject(e);}
 });
}
export function stopNeuralVoice() {
 if(source){try{source.stop();}catch{}source=null;}
}
