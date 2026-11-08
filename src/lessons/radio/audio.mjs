// Pure audio utilities. Native microphone rate is usually 44.1 or 48 kHz;
// Whisper requires mono 16 kHz Float32 samples.
export const TARGET_RATE = 16000;
export function concatChunks(chunks) {
 const total=chunks.reduce((n,a)=>n+a.length,0);
 const samples=new Float32Array(total);let offset=0;
 for(const c of chunks){samples.set(c,offset);offset+=c.length;}
 return samples;
}
// Area-weighted resampling with a simple box low-pass filter. No fabricated
// audio length or duplicate samples. Input must be finite Float32 PCM.
export function downsample(samples,from,to=TARGET_RATE) {
 if(!(samples instanceof Float32Array)||!Number.isFinite(from)||!Number.isFinite(to)||from<=0||to<=0||from<to)
  throw new RangeError('Expected mono Float32 audio and a source rate >= target rate.');
 if(from===to)return samples.slice();
 const ratio=from/to;
 const result=new Float32Array(Math.floor(samples.length/ratio));
 for(let i=0;i<result.length;i++){
  const begin=i*ratio,end=(i+1)*ratio;
  let sum=0;
  const first=Math.floor(begin),last=Math.ceil(end);
  for(let j=first;j<last;j++){
   const weight=Math.max(0,Math.min(end,j+1)-Math.max(begin,j));
   sum+=(samples[j]||0)*weight;
  }
  result[i]=sum/ratio;
 }
 return result;
}
export function durationSeconds(samples,rate) {
 return samples.length/rate;
}
