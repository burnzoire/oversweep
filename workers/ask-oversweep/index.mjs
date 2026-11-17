import corpus from "../../dist/ask-corpus.json";
import { createHandler } from "./handler.mjs";

export default { fetch: createHandler(corpus) };
