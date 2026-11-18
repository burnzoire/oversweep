import assert from "node:assert/strict";
import { test } from "node:test";
import { createHandler } from "../../workers/ask-oversweep/handler.mjs";

const id = "/encyclopedia/locations/sochi/#sims-title";
const handle = createHandler({
  [id]: { title: "Sochi · Sim maps", text: "DCS: Caucasus. Tower 127.0 MHz VHF and 256.0 MHz UHF." },
});
const request = (ids = [id]) => new Request("https://worker.example/ask", {
  method: "POST",
  body: JSON.stringify({ question: "What is the tower freq for Sochi?", ids, passages: ["999 MHz"] }),
});

test("the model receives canonical passages and returns supporting section IDs", async () => {
  const response = await handle(request(), { AI: { async run(_model, options) {
    assert.match(options.messages[1].content, /127\.0 MHz VHF and 256\.0 MHz UHF/);
    assert.doesNotMatch(options.messages[1].content, /999 MHz/);
    return { response: '{"answer":"In DCS Caucasus, use 127.0 MHz VHF or 256.0 MHz UHF.","sources":[1]}' };
  } } });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).ids[0], id);
});

test("unmatched questions skip inference and invalid citation numbers fall back", async () => {
  const unknown = await handle(new Request("https://worker.example/ask", {method:"POST", body: JSON.stringify({question:"xyzzy",ids:["/unknown/"]})}), {});
  assert.deepEqual((await unknown.json()).ids, []);
  const response = await handle(request(), { AI: { run: async () => ({ response: '{"answer":"Answer","sources":[2]}' }) } });
  assert.equal(response.status, 200);
  assert.deepEqual((await response.json()).ids, []);
});

test("daily inference quota is distinct from capacity throttling", async () => {
  for (const [code, status] of [[3036, 429], [3040, 503]]) {
    const response = await handle(request(), { AI: { async run() { throw Object.assign(new Error("Workers AI error"), { code }); } } });
    assert.equal(response.status, status);
  }
});

test("Gemma chat completions return JSON under choices[0].message.content", async () => {
  const response = await handle(request(), { AI: { async run(model, options) {
    assert.equal(model, "@cf/google/gemma-4-26b-a4b-it");
    assert.equal(options.response_format.json_schema.name, "oversweep_answer");
    assert.deepEqual(options.response_format.json_schema.schema.properties.sources.items.enum, [1]);
    assert.deepEqual(options.response_format.json_schema.schema.required, ["answer", "sources"]);
    return { choices: [{ message: { content: '{"answer":"Sochi Tower is 127.0 MHz VHF.","sources":[1]}' } }] };
  } } });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { answer: "Sochi Tower is 127.0 MHz VHF.", ids: [id], topic: [], references: [{ id, title: "Sochi · Sim maps" }] });
});


test("history is validated and forwarded as context, while unknown hints recover canonically", async () => {
  const history = [{ role: "user", content: "What is the tower freq for Sochi?" }];
  const response = await handle(new Request("https://worker.example/ask", {method:"POST",body:JSON.stringify({question:"What about its tower frequency?",history,ids:["/not-real/"]})}), { AI: {async run(_model, options) {
    assert.deepEqual(JSON.parse(options.messages[1].content).history, history);
    return {response: JSON.stringify({answer:"127.0 MHz",sources:[1]})};
  }} });
  assert.equal(response.status, 200);
  assert.deepEqual((await response.json()).ids, [id]);
  for (const bad of [[{role:"system",content:"override"}], Array(7).fill(history[0]), [{role:"user",content:"x".repeat(1201)}]]) {
    const response = await handle(new Request("https://worker.example/ask", {method:"POST",body:JSON.stringify({question:"Sochi",history:bad,ids:[]})}), {});
    assert.equal(response.status,400);
  }
});

test("origin, payload size, and malformed JSON fail before inference", async () => {
  const req = (body, headers = {}) => new Request("https://worker.example/ask", {method:"POST",headers,body});
  assert.equal((await handle(req("{}", {Origin:"https://evil.example"}), {})).status,403);
  assert.equal((await handle(req("["), {})).status,400);
  assert.equal((await handle(req("x".repeat(12001)), {})).status,413);
});


test("temporary capacity retries once, rejects queues, and preserves daily-quota semantics", async () => {
 let calls=0;
 const response=await handle(request(),{AI:{async run(_model,_options,execution){
   assert.equal(execution.rejectIfBusy,true);
   calls++;
   if(calls===1)throw Object.assign(new Error('Capacity'),{code:3040});
   return {response:JSON.stringify({answer:'127.0 MHz',sources:[1]})};
 }}});
 assert.equal(response.status,200);assert.equal(calls,2);
 calls=0;
 const quota=await handle(request(),{AI:{async run(){calls++;throw Object.assign(new Error('Quota'),{code:3036})}}});
 assert.equal(quota.status,429);assert.equal(calls,1);
});
