// Both models are English-only; all recognition is performed locally.
// Sizes are not estimated here: downloaded quantized assets differ by runtime.
export const WHISPER_MODELS = Object.freeze({
 tiny:{id:'Xenova/whisper-tiny.en',label:'Tiny.en'},
 small:{id:'Xenova/whisper-small.en',label:'Small.en'},
});
export function modelFor(key){
 if(!Object.hasOwn(WHISPER_MODELS,key))throw new RangeError('Unknown local Whisper model: '+key);
 return WHISPER_MODELS[key];
}
export function tokens(text){
 return String(text??'').toLowerCase().replace(/[^a-z0-9\s]/g,' ').trim().split(/\s+/).filter(Boolean);
}
export function wordErrorRate(reference,hypothesis){
 const a=tokens(reference),b=tokens(hypothesis);
 if(!a.length)return null;
 let prev=Array.from({length:b.length+1},(_,i)=>i);
 for(let i=1;i<=a.length;i++){
  const next=[i];
  for(let j=1;j<=b.length;j++)
   next[j]=Math.min(prev[j]+1,next[j-1]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));
  prev=next;
 }
 return prev[b.length]/a.length;
}
