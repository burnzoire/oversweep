import {transcribeEnglishOnly} from './lessons/radio/whisper-inference.mjs';
import {modelFor} from './lessons/radio/whisper-models.mjs';
// No remote transcription. Only JS runtime and model weights are downloaded.
const TRANSFORMERS_CDN='https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1';
let active=null,activeKey=null,loading=null,runtime=null;
function report(id,phase,message,other={}){postMessage({id,phase,message,...other});}
async function getRuntime(){
 if(!runtime)runtime=import(TRANSFORMERS_CDN);
 return runtime;
}
async function ensureLoaded(id,key){
 const {id:modelId,label}=modelFor(key);
 if(active&&activeKey===key)return active;
 if(loading)return loading; // requests are serialized by the page
 loading=(async()=>{
  if(active){
   report(id,'progress','Releasing previous model before switching…');
   try{await active.dispose?.();}finally{active=null;activeKey=null;}
  }
  report(id,'progress','Preparing '+label+' (download on first use)…');
  const {pipeline,env}=await getRuntime();
  env.allowRemoteModels=true; // downloads only; no inference API
  env.allowLocalModels=false;
  const instance=await pipeline('automatic-speech-recognition',modelId,{
   device:'wasm',dtype:'q8',
   progress_callback:p=>{
    if(p?.status==='progress'&&p.total)
     report(id,'progress',label+' · '+(p.file??'weights')+' '+Math.round(p.loaded/p.total*100)+'%');
   },
  });
  active=instance;activeKey=key;
  return instance;
 })();
 try{return await loading;}finally{loading=null;}
}
onmessage=async ({data})=>{
 const {id,type,model='tiny'}=data??{};
 try{
  modelFor(model);
  if(type==='load'){
   await ensureLoaded(id,model);
   report(id,'ready',model+' ready', {model});return;
  }
  if(type!=='transcribe')return;
  const audio=data.samples;
  if(!(audio instanceof Float32Array)||audio.length<3200||audio.length>16000*30)
   throw new Error('Recording must contain 0.2–30 seconds of mono 16 kHz PCM.');
  const transcriber=await ensureLoaded(id,model);
  report(id,'progress','Running '+model+' locally; audio is not uploaded…');
  const start=performance.now();
  const result=await transcribeEnglishOnly(transcriber,audio,data.context);
  report(id,'transcript','Transcribed on device',{
   model,text:result.text,ms:Math.round(performance.now()-start),
   contextApplied:result.contextApplied,warning:result.warning,
  });
 }catch(err){report(id,'error',err?.message??String(err),{model});}
};
