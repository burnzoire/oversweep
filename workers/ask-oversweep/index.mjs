import { createHandler } from "./handler.mjs";

const corpusUrl = "https://www.oversweep.com/ask-corpus.json";
const unavailable = createHandler(null);

export default {
  async fetch(request, env) {
    if (request.method !== "POST" || new URL(request.url).pathname !== "/ask" ||
      (request.headers.has("Origin") && request.headers.get("Origin") !== "https://www.oversweep.com")) {
      return unavailable(request, env);
    }
    try {
      const response = await fetch(corpusUrl, { cf: { cacheEverything: true, cacheTtl: 60 }, redirect: "error" });
      if (response.ok) return createHandler(await response.json())(request, env);
    } catch {
      // The client can still return local search results.
    }
    return unavailable(request, env);
  },
};
