// Fictional military ground exercise. No operational phraseology validation claimed.
// Pure functions; explicit input and deterministic state changes.
export const INITIAL = Object.freeze({ stage: 'parked', turns: 0, errors: 0, history: [] });
export const FREQUENCY = '275.800';
export const CALLSIGN = 'Viper Two One';
export const AGENCY = 'Falcon Ground';
const has = (s, pattern) => new RegExp(pattern, 'i').test(s);
const clean = (s) => String(s ?? '').toLowerCase().replace(/[.,?!:;-]/g, ' ').replace(/\s+/g, ' ').trim();
const callsign = (s) => has(s, '\\bviper\\s*(?:two\\s*one|twenty\\s*one|two\\s*1|2\\s*1|21)\\b');
const runway = (s) => has(s, '(?:runway\\s*)?(?:two\\s*seven|twenty\\s*seven|2\\s*7|27)');
export function interpret(input) {
  const s = clean(input);
  if (!s) return { kind: 'empty' };
  if (has(s,'\\b(?:say again|repeat|say that again)\\b')) return { kind: 'repeat' };
  if (has(s,'\\b(?:unable|negative|cannot|can t)\\b')) return { kind: 'unable' };
  if (has(s,'\\b(?:emergency|mayday|pan pan)\\b')) return { kind: 'emergency' };
  if (has(s,'\\b(?:request|ready|taxi|departure)\\b') && has(s,'\\btaxi\\b')) return { kind: 'request-taxi', callsign: callsign(s) };
  if (has(s,'\\bhold\\s*short\\b')) return { kind: 'readback', callsign: callsign(s), runway: runway(s), viaAlpha: has(s,'\\balpha\\b') };
  if (has(s,'\\b(?:ready|departure|takeoff)\\b')) return { kind: 'ready', callsign: callsign(s), runway: runway(s) };
  return { kind: 'other', callsign: callsign(s), runway: runway(s) };
}
const answer = (stage, text, accepted, reason, next) => ({stage,text,accepted,reason,next:next??stage});
export function advance(state, transmission) {
  if (!state || !['parked','taxi-clearance','hold-short','complete'].includes(state.stage)) return {ok:false,error:'Invalid state'};
  const text=String(transmission??'').trim().slice(0,500);
  const intent=interpret(text);
  let result;
  if(intent.kind==='empty') result=answer(state.stage,'No transmission received.',false,'Empty transmission');
  else if(intent.kind==='repeat') {
    const last=[...state.history].reverse().find(h=>h.controller);
    result=answer(state.stage,last?.controller??'Viper Two One, Falcon Ground. Say again your request.',false,'Repeat requested');
  } else if(intent.kind==='emergency') result=answer(state.stage,'Viper Two One, Falcon Ground. State the nature of your emergency.',false,'Emergency diversion not modelled; remain in exercise');
  else if(intent.kind==='unable') result=answer(state.stage,'Viper Two One, roger unable. Say intentions.',false,'Unable acknowledged');
  else if(state.stage==='parked'){
    result=intent.kind==='request-taxi'&&intent.callsign
      ?answer(state.stage,'Viper Two One, Falcon Ground. Taxi to Runway Two Seven via Alpha. Hold short of Runway Two Seven.',true,'Taxi request accepted','taxi-clearance')
      :answer(state.stage,'Aircraft calling Falcon Ground, say callsign, position and request.',false,'Initial taxi request or callsign not recognised');
  } else if(state.stage==='taxi-clearance'){
    result=intent.kind==='readback'&&intent.callsign&&intent.runway&&intent.viaAlpha
      ?answer(state.stage,'Viper Two One, readback correct. Taxi via Alpha and hold short Runway Two Seven.',true,'Readback accepted','hold-short')
      :answer(state.stage,'Viper Two One, negative. Read back Runway Two Seven via Alpha, hold short Runway Two Seven.',false,'Missing runway, taxiway, callsign or hold-short readback');
  } else if(state.stage==='hold-short'){
    result=intent.kind==='ready'&&intent.callsign&&intent.runway
      ?answer(state.stage,'Viper Two One, roger. Hold position. Contact Falcon Tower, Three One One decimal Zero.',true,'Handoff issued','complete')
      :answer(state.stage,'Viper Two One, remain holding short. Say your request.',false,'Ready call with runway and callsign expected');
  } else result=answer(state.stage,'Viper Two One, switch Tower for departure.',false,'Demonstration complete');
  const next={
    stage:result.next, turns:state.turns+1, errors:state.errors+(result.accepted?0:1),
    history:[...state.history,{pilot:text,controller:result.text,accepted:result.accepted,reason:result.reason}].slice(-50)
  };
  return {ok:true,state:next,controller:result.text,accepted:result.accepted,reason:result.reason,intent};
}
export function instruction(stage) {
 return ({
 parked:'You are parked on the north ramp. Contact Falcon Ground and request taxi.',
 'taxi-clearance':'Read back the taxi clearance, including runway, Alpha and the hold-short restriction.',
 'hold-short':'At the holding point, report ready for departure on Runway Two Seven.',
 complete:'Ground portion complete. Further ATC procedures are intentionally outside this initial POC.'
 })[stage] ?? 'Invalid stage';
}
