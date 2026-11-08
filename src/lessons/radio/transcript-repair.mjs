// Scenario-aware transcript repair. These are review suggestions, never
// automatically transmitted, and are grounded in the active airfield data.
import { FALCON_GROUND } from './context.mjs';

function editDistance(a,b) {
 const prev=Array.from({length:b.length+1},(_,i)=>i);
 for(let i=1;i<=a.length;i++){
  let diagonal=prev[0];prev[0]=i;
  for(let j=1;j<=b.length;j++){
   const above=prev[j],cost=a[i-1]===b[j-1]?0:1;
   prev[j]=Math.min(prev[j]+1,prev[j-1]+1,diagonal+cost);
   diagonal=above;
  }
 }
 return prev[b.length];
}
const lower=s=>s.toLowerCase().replace(/[.,!?]/g,'').replace(/\s+/g,' ').trim();
const clearTaxiIntent=s=>/\b(?:request|ready)\s+(?:for\s+)?taxi\b/i.test(s);
const clearActiveAgency=s=>/\bfalcon\s+ground\b/i.test(s);
const explicitCallsign=s=>/\bviper\s*(?:two\s*one|twenty\s*one|2\s*1|21)\b/i.test(s);
const numericAlias=/\b(?:521|5\s*21|five\s*two\s*one)\b/i;

/** Return a proposed transcript for confirmation; never infer unrelated numbers. */
export function proposeAtcTranscript(raw,stage='parked',scenario=FALCON_GROUND) {
 const original=String(raw??'').trim();
 if(!original)return {raw:original,text:original,changes:[],reviewRequired:false};
 let text=original;
 const changes=[];
 const agency=scenario.agencies[0];
 const words=agency.split(/\s+/);
 if(words.length===2) {
  const agencyMatch=text.match(/^\s*(Falcon)\s+([A-Za-z]+)\b/i);
  if(agencyMatch && agencyMatch[1].toLowerCase()===words[0].toLowerCase()
     && (editDistance(lower(agencyMatch[2]),lower(words[1]))<=2 || /^(grant|grand|grounds|grind)$/i.test(agencyMatch[2]))
     && lower(agencyMatch[2])!==lower(words[1])) {
   const replacement=agencyMatch[1]+' '+words[1];
   text=text.replace(agencyMatch[0],agencyMatch[0].replace(agencyMatch[1]+' '+agencyMatch[2],replacement));
   changes.push({field:'controller',from:agencyMatch[1]+' '+agencyMatch[2],to:replacement});
  }
 }
 // Bare 521 is not a trustworthy callsign. Suggest only for the specifically
 // configured pilot, with active Ground + taxi request, never a readback.
 if(stage==='parked' && clearTaxiIntent(text) && clearActiveAgency(text)
     && !explicitCallsign(text) && scenario.aircraft.includes('Viper 21')
     && numericAlias.test(text)) {
  const match=text.match(numericAlias);
  text=text.replace(numericAlias,'Viper 21');
  changes.push({field:'callsign',from:match[0],to:'Viper 21'});
 }
 return {raw:original,text,changes,reviewRequired:changes.length>0};
}
