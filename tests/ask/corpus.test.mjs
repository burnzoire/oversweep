import {test} from 'node:test';
import assert from 'node:assert/strict';
import {addAskSections} from '../../scripts/search-index.mjs';
import {createRetriever, prepareCorpus} from '../../workers/ask-oversweep/retrieval.mjs';
import {createHandler} from '../../workers/ask-oversweep/handler.mjs';
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

const aircraft = '/encyclopedia/aircraft/f-16/';
const takeoff = '/manual/aircraft-procedures/f-16c/takeoff/';
const summary = takeoff + '#procedure-summary-h';
const beforeTakeoff = '/manual/aircraft-procedures/f-16c/before-takeoff/';
const reportedQuestion = 'How do I take off in an f-16?';
const procedureCorpus = {
  [aircraft]: { title: 'F-16 Fighting Falcon', text: 'Aircraft history and variants.' },
  '/encyclopedia/aircraft/f-14/': { title: 'F-14 Tomcat', text: 'Aircraft history.' },
  [beforeTakeoff]: { title: 'F-16C — Before Takeoff', text: 'DCS checklist before takeoff.' },
};
addAskSections(procedureCorpus,
  '<main><h1>F-16C — Takeoff</h1><p>Interactive DCS walkthrough.</p>' +
  '<h3 id="procedure-summary-h">What you learned</h3><p>This passage summarises the full walkthrough.</p></main>',
  { u: takeoff, t: 'F-16C — Takeoff' });
const prepared = JSON.parse(JSON.stringify(prepareCorpus(procedureCorpus)));

test('the indexed procedure summary handles the reported question and spelling variants', () => {
  const retrieve = createRetriever(procedureCorpus, prepared);
  for (const question of [
    reportedQuestion, 'F-16C takeoff', 'F-16C take-off', 'F-16C takeoff checklist',
    'How do I take-off in the F-16C?', 'How do I perform a takeoff in an F-16C?',
  ]) {
    const result = retrieve(question, { ids: [beforeTakeoff] });
    assert.deepEqual(result.topic, [aircraft]);
    assert.deepEqual(result.passages.map(passage => passage.id), [summary, takeoff]);
    assert.equal(result.passages[0].scope, 'DCS F-16C Viper');
  }
  for (const question of [
    'How do I take off in an F-14?',
    'When did the first F-16 take off?', 'What is the takeoff weight of the F-16?',
  ]) {
    assert.equal(retrieve(question).guide, undefined, question);
  }
  for (const question of [
    'How do I take off in the F-16 in BMS?', 'Takeoff checklist in BMS',
    'What should I check before takeoff in the F-16?', 'How do I take off in an F-16A?', 'F-16D takeoff',
  ]) {
    const result = retrieve(question, { ids: [summary, takeoff] });
    assert.equal(result.guide, undefined, question);
    assert.ok(result.passages.every(passage => passage.id !== summary && passage.id !== takeoff), question);
  }
});

test('the reported question is grounded in the indexed summary and can fall back to the walkthrough', async () => {
  const handler = createHandler(procedureCorpus, prepared);
  const ask = () => new Request('https://worker.example/ask', {
    method: 'POST', body: JSON.stringify({ question: reportedQuestion, ids: [] }),
  });
  for (const [answer, sources, expected] of [
    ['Use the DCS walkthrough.', [1], summary],
    ['Unsupported answer.', [3], takeoff],
    ['', [], takeoff],
  ]) {
    const response = await handler(ask(), { AI: { async run(_model, options) {
      const { passages } = JSON.parse(options.messages[1].content);
      assert.match(passages[0].text, /summarises the full walkthrough/);
      assert.equal(passages[0].scope, 'DCS F-16C Viper');
      return { response: JSON.stringify({ answer, sources }) };
    } } });
    assert.equal(response.status, 200);
    const reply = await response.json();
    assert.deepEqual(reply.ids, [expected]);
    assert.deepEqual(reply.references, [{ id: expected, title: procedureCorpus[expected].title }]);
    assert.equal(reply.answer, expected === summary ? answer : 'Open the Oversweep walkthrough to practise this procedure in the DCS F-16C Viper.');
    assert.equal(reply.stage, expected === summary ? undefined : answer ? 'response_sources' : 'no_supported_answer');
  }
});
