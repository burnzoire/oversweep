import corpus from "../../dist/ask-corpus.json";
import search from "../../dist/ask-search.json";
import { createHandler } from "./handler.mjs";

export default { fetch: createHandler(corpus, search) };
