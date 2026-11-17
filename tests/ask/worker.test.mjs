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

test("unknown passages skip inference and invalid citation numbers fall back", async () => {
  const unknown = await handle(request(["/unknown/"]), {});
  assert.deepEqual((await unknown.json()).ids, []);
  const response = await handle(request(), { AI: { run: async () => ({ response: '{"answer":"Answer","sources":[2]}' }) } });
  assert.equal(response.status, 502);
});

test("daily inference quota is distinct from capacity throttling", async () => {
  for (const [code, status] of [[3036, 429], [3040, 502]]) {
    const response = await handle(request(), { AI: { async run() { throw Object.assign(new Error("Workers AI error"), { code }); } } });
    assert.equal(response.status, status);
  }
});
