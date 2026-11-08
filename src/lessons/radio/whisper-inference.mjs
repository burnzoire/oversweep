// Whisper Tiny English is an English-only model; it rejects explicit language
// and task generate options. Keep the call contract in one testable place.
export function buildWhisperPromptIds(transcriber, context) {
  const tokenizer=transcriber?.tokenizer;
  if(!context || typeof tokenizer?.encode!=='function')return null;
  const ids=tokenizer.encode(context,{add_special_tokens:false});
  if(!Array.isArray(ids)||!ids.length||!ids.every(Number.isInteger))return null;
  return ids.slice(0,180);
}
export async function transcribeEnglishOnly(transcriber, samples, context) {
  let promptIds=null;
  let warning='';
  try{
    promptIds=buildWhisperPromptIds(transcriber,context);
  }catch(error){
    warning='Could not prepare vocabulary context; transcribing locally without conditioning.';
  }
  if(promptIds) {
    try{
      const response=await transcriber(samples,{prompt_ids:promptIds});
      return {text:String(response?.text??'').trim(),contextApplied:true,warning};
    }catch(error){
      warning='Context-token prompting was rejected by the model runtime; retried locally without conditioning.';
    }
  }
  // Crucial: Never pass language='english' or task='transcribe' here.
  const response=await transcriber(samples);
  return {text:String(response?.text??'').trim(),contextApplied:false,warning};
}
