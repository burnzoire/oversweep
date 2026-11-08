import {downsample,concatChunks,durationSeconds,TARGET_RATE} from './lessons/radio/audio.mjs';
import {atcPrompt} from './lessons/radio/context.mjs';

const MAX_SECONDS=25;
const requestTimeout=120000;
let worker=null,seq=0,pending=new Map(),current=null,loaded=false;
function promiseRequest(type,payload={},onProgress=()=>{}) {
 if(!worker){
  worker=new Worker(new URL('./whisper-worker.js',import.meta.url),{type:'module'});
  worker.onmessage=({data})=>{
   const task=pending.get(data.id);if(!task)return;
   if(data.phase==='progress'){task.onProgress(data.message);return;}
   pending.delete(data.id);clearTimeout(task.timeout);
   if(data.phase==='error')task.reject(new Error(data.message));
   else task.resolve(data);
  };
  worker.onerror=e=>{
   for(const task of pending.values()){clearTimeout(task.timeout);task.reject(new Error(e.message||'Local STT worker failed'));}pending.clear();
   worker?.terminate();worker=null;loaded=false;
  };
 }
 const id=++seq;
 return new Promise((resolve,reject)=>{
  const timeout=setTimeout(()=>{
   pending.delete(id);reject(new Error('Local speech engine timed out'));worker?.terminate();worker=null;loaded=false;
  },requestTimeout);
  pending.set(id,{resolve,reject,onProgress,timeout});
  worker.postMessage({id,type,...payload},payload.samples?[payload.samples.buffer]:[]);
 });
}
export async function loadLocalSTT(onProgress) {
 if(loaded)return;
 const reply=await promiseRequest('load',{},onProgress);
 if(reply.phase!=='ready')throw new Error('Speech model did not report ready');
 loaded=true;
}
export function isSTTReady(){return loaded;}
export function isCapturing(){return Boolean(current);}
export async function startCapture(onStatus=()=>{}) {
 if(current)throw new Error('Microphone is already recording');
 if(!navigator.mediaDevices?.getUserMedia||!window.AudioWorkletNode)throw new Error('AudioWorklet microphone capture is not supported in this browser');
 // Must request access directly in the PTT button's gesture chain.
 const stream=await navigator.mediaDevices.getUserMedia({audio:{channelCount:1,echoCancellation:true,noiseSuppression:true,autoGainControl:true}});
 let context,source,node;
 try{
  context=new AudioContext();
  await context.audioWorklet.addModule(new URL('./pcm-capture.js',import.meta.url));
  source=context.createMediaStreamSource(stream);
  node=new AudioWorkletNode(context,'oversweep-pcm-recorder');
  const recording={stream,context,source,node,chunks:[],samples:0,rate:context.sampleRate,onStatus};
  current=recording;
  node.port.onmessage=event=>{
   if(current!==recording)return;
   const chunk=new Float32Array(event.data);
   recording.chunks.push(chunk);recording.samples+=chunk.length;
   if(recording.samples/recording.rate>=MAX_SECONDS){
    onStatus('Maximum transmission length reached. Release PTT to transcribe.');
   }
  };
  source.connect(node);node.connect(context.destination);
  if(context.state!=='running')await context.resume();
  return {rate:context.sampleRate};
 }catch(err){
  stream.getTracks().forEach(t=>t.stop());
  try{source?.disconnect();node?.disconnect();await context?.close();}catch{}
  current=null;
  throw err;
 }
}
export async function stopCapture() {
 const capture=current;
 if(!capture)throw new Error('Microphone is not recording');
 current=null;
 capture.node.port.postMessage('stop');
 capture.stream.getTracks().forEach(t=>t.stop());
 capture.source.disconnect();capture.node.disconnect();
 try{await capture.context.close();}catch{}
 const samples=concatChunks(capture.chunks);
 if(durationSeconds(samples,capture.rate)<0.2)throw new Error('Recording too short. Hold push-to-talk while speaking.');
 const limited=samples.subarray(0,Math.floor(MAX_SECONDS*capture.rate));
 const pcm=downsample(limited,capture.rate,TARGET_RATE);
 return {samples:pcm,duration:durationSeconds(pcm,TARGET_RATE),inputRate:capture.rate};
}
export async function discardCapture() {
 if(!current)return;
 const capture=current;current=null;
 capture.node.port.postMessage('stop');capture.stream.getTracks().forEach(t=>t.stop());
 capture.source.disconnect();capture.node.disconnect();capture.chunks.length=0;
 try{await capture.context.close();}catch{}
}
export function atexport async function transcribeLocal(samples,stage,onProgress=()=>{}) {
 if(!loaded)await loadLocalSTT(onProgress);
 return promiseRequest('transcribe',{samples,context:atcPrompt(stage)},onProgress);
}
