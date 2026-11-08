import test from 'node:test';
import assert from 'node:assert/strict';
import { INITIAL, advance, interpret, instruction } from '../../src/lessons/radio/model.mjs';
const call=(s,t)=>{const r=advance(s,t);assert.equal(r.ok,true);return r;};
test('initial state and immutable transition',()=>{
 assert.equal(INITIAL.stage,'parked');
 const r=call(INITIAL,'Falcon Ground, Viper Two One, north ramp, request taxi.');
 assert.equal(r.accepted,true);assert.equal(r.state.stage,'taxi-clearance');
 assert.equal(INITIAL.stage,'parked');
 assert.equal(INITIAL.history.length,0);
});
test('wrong or incomplete transmissions do not advance',()=>{
 const r=call(INITIAL,'request taxi');
 assert.equal(r.accepted,false);assert.equal(r.state.stage,'parked');
 assert.equal(r.state.errors,1);
 const again=call(r.state,'say again');
 assert.equal(again.state.stage,'parked');
});
test('hold short requires runway, taxiway and callsign',()=>{
 const taxi=call(INITIAL,'Falcon Ground, Viper 21 request taxi');
 const bad=call(taxi.state,'Viper 21 hold short runway 27');
 assert.equal(bad.accepted,false);
 const good=call(taxi.state,'Runway Two Seven via Alpha, hold short Runway Two Seven, Viper Two One');
 assert.equal(good.accepted,true);
 assert.equal(good.state.stage,'hold-short');
});
test('readback and handoff preserve expected stages',()=>{
 const a=call(INITIAL,'Viper Two One request taxi');
 const b=call(a.state,'Viper Two One runway 27 via Alpha hold short runway 27');
 const c=call(b.state,'Falcon Ground Viper Two One holding short runway two seven ready departure');
 assert.equal(c.accepted,true);assert.equal(c.state.stage,'complete');
 assert.match(c.controller,/Contact Falcon Tower/);
 assert.match(instruction(c.state.stage),/complete/i);
});
test('emergency does not advance fictional procedure',()=>{
 const a=call(INITIAL,'Mayday Viper Two One');
 assert.equal(a.accepted,false);assert.equal(a.state.stage,'parked');
 assert.match(a.controller,/nature of your emergency/i);
});
test('intent parser handles common callsign forms',()=>{
 assert.equal(interpret('Viper 21 request taxi').callsign,true);
 assert.equal(interpret('Viper Two One request taxi').callsign,true);
 assert.equal(interpret('Viper twenty one request taxi').callsign,true);
});
test('invalid state rejected',()=>{
 assert.equal(advance({stage:'wrong'},'hello').ok,false);
});
