// English-only Whisper: no language or task option is permitted.
// Whisper prompting needs the special start-of-previous-context token; plain
// tokenized vocabulary is not an equivalent prompt. Support is runtime-dependent.
export function buildWhisperPromptIds(transcriber, context) {
 const tokenizer=transcriber?.tokenizer;
 if(!context||!tokenizer)return null;
 const phrase=String(context).trim();
 if(!phrase)return null;
 let ids;
 if(typeof tokenizer.get_prompt_ids==='function') {
  ids=tokenizer.get_prompt_ids(phrase);
 }else if(typeof tokenizer.encode==='function') {
  // Mirrors WhisperTokenizer.get_prompt_ids, which prepends <|startofprev|>.
  ids=tokenizer.encode('<|startofprev|> '+phrase,{add_special_tokens:false});
  const special=tokenizer.encode('<|startofprev|>',{add_special_tokens:false});
  if(!Array.isArray(special)||special.length!==1||ids?.[0]!==special[0])return null;
 }else return null;
 if(ArrayBuffer.isView(ids))ids=Array.from(ids);
 if(!Array.isArray(ids)||!ids.length||!ids.every(Number.isInteger))return null;
 // Preserve the special prefix and the most relevant first 179 context tokens.
 return ids.length>180?[ids[0],...ids.slice(1,180)]:ids;
}
export async function transcribeEnglishOnly(transcriber,samples,context) {
 let promptIds=null,warning='';
 try{promptIds=buildWhisperPromptIds(transcriber,context);}
 catch{warning='Could not prepare vocabulary context; transcribing locally without conditioning.';}
 if(promptIds){
  try{
   const response=await transcriber(samples,{prompt_ids:promptIds});
   return {text:String(response?.text??'').trim(),contextApplied:true,warning};
  }catch{
   warning='Whisper prompt tokens were rejected; retried locally without conditioning.';
  }
 }
 const response=await transcriber(samples);
 return {text:String(response?.text??'').trim(),contextApplied:false,warning};
}
