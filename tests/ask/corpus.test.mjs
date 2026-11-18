import {test} from 'node:test';
import assert from 'node:assert/strict';
import {addAskSections} from '../../scripts/search-index.mjs';
import {createRetriever} from '../../workers/ask-oversweep/retrieval.mjs';
test('airfield rows beyond the old cutoff retain labels and canonical anchors',()=>{
 const html='<main><h1>Example theatre</h1><h2 id="map-airfields-title">Airfields</h2><p>'+ 'Intro '.repeat(1000)+'</p><table><thead><tr><th>Airfield</th><th>Tower (MHz)</th></tr></thead><tbody><tr id="af-example"><th scope="row"><a href="/encyclopedia/locations/example/">Example</a><span class="cell-note">36° N</span></th><td>120.5</td></tr></tbody></table></main>';
 const corpus={};addAskSections(corpus,html,{u:'/encyclopedia/locations/dcs-example/',t:'DCS: Example'});
 const row=corpus['/encyclopedia/locations/dcs-example/#af-example'];
 assert.equal(row.name,'Example');
 assert.equal(row.record,'/encyclopedia/locations/example/');
 assert.match(row.text,/Airfield: Example 36° N/);
 assert.match(row.text,/Tower \(MHz\): 120\.5/);
});
test('long passages use a bounded relevant window with the source introduction',()=>{
 const id='/manual/example/#section';const corpus={[id]:{title:'Example section',text:'Simulator scope: example. '+ 'Introduction. '.repeat(1000)+' Rarekeyword is the requested value. '+ 'End. '.repeat(1000)}};
 const result=createRetriever(corpus)('What is Rarekeyword?');
 assert.match(result.passages[0].text,/Rarekeyword is the requested value/);
 assert.match(result.passages[0].text,/Simulator scope/);
 assert.ok(result.passages.reduce((sum,p)=>sum+p.text.length,0)<=14000);
});
