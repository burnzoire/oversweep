// Scenario-specific recognition context. All values originate from the exercise,
// not guesses made after recognising a transmission. Only contextual suggestions,
// not replacements for unrecognised safety-critical numbers.
export const FALCON_GROUND = Object.freeze({
  location: 'Falcon Air Base',
  agencies: ['Falcon Ground', 'Falcon Tower', 'Falcon Approach'],
  aircraft: ['Viper Two One', 'Viper 21'],
  runway: 'Runway Two Seven',
  taxiways: ['Alpha', 'Taxiway Alpha'],
  frequencies: ['Two Seven Five decimal Eight', 'Three One One decimal Zero'],
  phonetics: ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot', 'Golf',
    'Hotel', 'India', 'Juliett', 'Kilo', 'Lima', 'Mike', 'November', 'Oscar',
    'Papa', 'Quebec', 'Romeo', 'Sierra', 'Tango', 'Uniform', 'Victor',
    'Whiskey', 'X-ray', 'Yankee', 'Zulu'],
  terms: ['request taxi', 'taxi to', 'hold short', 'holding short', 'ready for departure',
    'runway', 'via Alpha', 'say again', 'roger', 'affirm', 'negative',
    'unable', 'cleared for takeoff', 'contact Tower', 'readback',
    'north ramp', 'wind two six zero at eight', 'squawk', 'flight'],
});

export function activePhrases(stage, config=FALCON_GROUND) {
  const base=[
    ...config.agencies.map(phrase=>({phrase,boost:5})),
    ...config.aircraft.map(phrase=>({phrase,boost:7})),
    {phrase:config.location,boost:3},
    {phrase:config.runway,boost:6},
    ...config.taxiways.map(phrase=>({phrase,boost:5})),
    ...config.frequencies.map(phrase=>({phrase,boost:3})),
    ...config.phonetics.map(phrase=>({phrase,boost:2})),
    ...config.terms.map(phrase=>({phrase,boost:4})),
  ];
  const phase={
    parked:['Falcon Ground Viper Two One north ramp request taxi'],
    'taxi-clearance':['Runway Two Seven via Alpha hold short Runway Two Seven Viper Two One'],
    'hold-short':['Falcon Ground Viper Two One holding short Runway Two Seven ready departure'],
    complete:['Contact Falcon Tower Three One One decimal Zero'],
  };
  for(const phrase of phase[stage]??[])base.push({phrase,boost:5});
  const seen=new Set();
  return base.filter(x=>{
    const key=x.phrase.toLowerCase();
    if(seen.has(key))return false;
    seen.add(key);return true;
  });
}

export function installRecognitionContext(recognition,stage,environment=globalThis) {
  const Phrase=environment.SpeechRecognitionPhrase||environment.webkitSpeechRecognitionPhrase;
  if(!Phrase||!('phrases' in recognition))return {supported:false,count:0};
  try{
    const phrases=activePhrases(stage).map(({phrase,boost})=>new Phrase(phrase,boost));
    recognition.phrases=phrases;
    return {supported:true,count:phrases.length};
  }catch(e){
    return {supported:false,count:0,error:e?.message??String(e)};
  }
}
const NUMBER_CALLSIGN=/\b(?:5421|54\s*21|five\s*four\s*two\s*one)\b/i;
const KNOWN_CALLSIGN=/\bviper\s*(?:two\s*one|twenty\s*one|2\s*1|21)\b/i;
/** Prefer a clearly recognised callsign among recognition alternatives.
 * A bare number like 5421 is NEVER transformed into a callsign automatically.
 */
export function selectTranscript(alternatives) {
  const candidates=(alternatives??[])
    .map(a=>typeof a==='string'?{transcript:a,confidence:0}:{transcript:a?.transcript??'',confidence:a?.confidence??0})
    .filter(a=>a.transcript.trim());
  if(!candidates.length)return {transcript:'',ambiguous:false,source:'none'};
  const recognised=candidates.find(a=>KNOWN_CALLSIGN.test(a.transcript));
  if(recognised)return {transcript:recognised.transcript,ambiguous:false,source:recognised===candidates[0]?'primary':'alternative'};
  const primary=candidates[0];
  return {transcript:primary.transcript,ambiguous:NUMBER_CALLSIGN.test(primary.transcript),source:'primary'};
}
