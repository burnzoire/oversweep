// Dedicated local transcription worker. Only model files and JS dependencies are
// downloaded; microphone samples are passed directly to browser inference.
const TRANSFORMERS_CDN = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1/+esm';
const MODEL = 'Xenova/whisper-tiny.en';
let pipe = null;
let loading = null;
function report(id,phase,message){postMessage({id,phase,message});}
async function ensureLoaded(id) {
 if(pipe)return pipe;
 if(!loading) loading=(async()=>{
  report(id,'progress','Importing local Whisper inference runtime…');
  const {pipeline,env}=await import(TRANSFORMERS_CDN);
  // Do not allow any remote inference endpoint; hub fetches are only weights.
  env.allowRemoteModels=true;
  env.allowLocalModels=false;
  report(id,'progress','Downloading Whisper Tiny English model. First use requires internet; audio remains on this device.');
  const instance=await pipeline('automatic-speech-recognition',MODEL,{
   device:'wasm',dtype:'q8',
   progress_callback:status=>{
    if(status?.status==='progress'&&status.total)
      report(id,'progress', 'Downloading '+(status.file??'model')+' · '+Math.round(status.loaded/status.total*100)+'%');
   },
  });
  pipe=instance;
  return instance;
 })();
 try{return await loading;}catch(err){loading=null;throw err;}
}
function promptTokenIds(transcriber,context) {
 // Transformers.js support for Whisper prompt_ids depends on the version/model.
 // If unavailable, do NOT claim the vocabulary has been injected into inference.
 const tokenizer=transcriber.tokenizer;
 if(!context||typeof tokenizer?.encode!=='function')return null;
 const ids=tokenizer.encode(context,{add_special_tokens:false});
 if(!Array.isArray(ids)||!ids.length)return null;
 // Limit Whisper prompt conditioning to a bounded prefix of scenario facts.
 return ids.slice(0,180);
}
onmessage=async ({data})=>{
 const {id,type}=data??{};
 try {
  if(type==='load'){await ensureLoaded(id);report(id,'ready','Whisper is ready for local transcription.');return;}
  if(type!=='transcribe')return;
  const transcriber=await ensureLoaded(id);
  const audio=data.samples;
  if(!(audio instanceof Float32Array)||audio.length<3200||audio.length>16000*30)
    throw new Error('Recording must contain between 0.2 and 30 seconds of mono 16 kHz PCM.');
  report(id,'progress','Transcribing locally · audio is not uploaded…');
  const start=performance.now();
  let response,contextApplied=false,warning='';
  const promptIds=promptTokenIds(transcriber,data.context);
  if(promptIds) {
   try {
    response=await transcriber(audio,{language:'english',task:'transcribe',prompt_ids:promptIds});
    contextApplied=true;
   }catch(err) {
    warning='Context-token prompting unsupported in this runtime; transcribed without it.';
   }
  }
  if(!response)response=await transcriber(audio,{language:'english',task:'transcribe'});
  postMessage({id,phase:'transcript',text:String(response?.text??'').trim(),
   ms:Math.round(performance.now()-start),contextApplied,warning});
 }catch(err){postMessage({id,phase:'error',message:err?.message??String(err)});}
};
