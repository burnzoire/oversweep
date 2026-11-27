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
  const missing = await unknown.json();
  assert.deepEqual(missing.ids, []);
  assert.equal(missing.stage, "no_passages");
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
  const revision = "a".repeat(40);
  const response = await handle(request(), { ASK_REVISION: revision, AI: { async run(model, options) {
    assert.equal(model, "@cf/google/gemma-4-26b-a4b-it");
    assert.equal(options.response_format.json_schema.name, "oversweep_answer");
    assert.deepEqual(options.response_format.json_schema.schema.properties.sources.items.enum, [1]);
    assert.deepEqual(options.response_format.json_schema.schema.required, ["answer", "sources"]);
    return { choices: [{ message: { content: '{"answer":"Sochi Tower is 127.0 MHz VHF.","sources":[1]}' } }] };
  } } });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { answer: "Sochi Tower is 127.0 MHz VHF.", ids: [id], topic: [], retrieved: [id], revision, references: [{ id, title: "Sochi · Sim maps" }] });
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


test("structured output uses compatible schema with completion headroom", async()=> {
 const response=await handle(request(),{AI:{async run(_model,options){
 const schema=options.response_format.json_schema.schema;
 assert.equal(schema.properties.sources.maxItems,undefined);
 assert.equal(schema.properties.sources.uniqueItems,undefined);
 assert.equal(schema.properties.answer.maxLength,undefined);
 assert.equal(options.max_completion_tokens,700);
 return {response:JSON.stringify({answer:"127.0 MHz",sources:[1]})};
 }}});assert.equal(response.status,200);
});

test("opt-in reports validate context, respect limits and bypass inference", async t => {
  const info = t.mock.method(console, "info", () => {});
  const report = {
    question: "Does it have an ILS?",
    history: [{ role: "user", content: "Tell me about Sochi." }],
    answer: "I couldn’t find enough on Oversweep to answer that.",
    stage: "no_supported_answer",
    sources: [id, id],
    topic: [id],
    revision: "a".repeat(40),
  };
  const origin = "https://www.oversweep.com";
  const submit = (body = report, headers = { Origin: origin }, method = "POST") =>
    new Request("https://worker.example/ask/report", {
      method, headers, body: method === "POST" ? JSON.stringify(body) : undefined,
    });
  const env = {
    ASK_REPORT_LIMIT: { limit: async () => ({ success: true }) },
    ASK_REVISION: "b".repeat(40),
  };
  const preflight = await handle(submit(report, { Origin: origin }, "OPTIONS"), env);
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get("Access-Control-Allow-Origin"), origin);
  assert.equal((await handle(submit(report, {}), env)).status, 403);
  assert.equal((await handle(submit(report, { Origin: "https://evil.example" }), env)).status, 403);
  for (const invalid of [
    { sources: ["https://unknown.example/"] }, { history: Array(3).fill(report.history[0]) },
    { answer: "x".repeat(1201) }, { stage: "daily_quota" },
  ]) {
    assert.equal((await handle(submit({ ...report, ...invalid }), env)).status, 400);
  }
  assert.equal((await handle(submit(), { ASK_REPORT_LIMIT: { limit: async () => ({ success: false }) } })).status, 429);
  assert.equal(info.mock.callCount(), 0);

  assert.equal((await handle(submit(), env)).status, 204);
  assert.deepEqual(info.mock.calls[0].arguments, [
    { message: "ask_oversweep_report", ...report, sources: [id] },
  ]);
  assert.equal((await handle(submit({ ...report, publicQuestionNotice: 2 }), env)).status, 204);
  assert.deepEqual(info.mock.calls[1].arguments, info.mock.calls[0].arguments);
  assert.equal((await handle(submit({ ...report, publicQuestionNotice: 1 }), env)).status, 204);
  assert.equal(info.mock.calls[2].arguments[0].publicQuestionNotice, 1);
});
