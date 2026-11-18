import corpusText from "../../dist/ask-corpus.txt";
import searchText from "../../dist/ask-search.txt";
import { createHandler } from "./handler.mjs";

// Text modules avoid compiling the entire corpus/index as JavaScript literals.
export default { fetch: createHandler(JSON.parse(corpusText), JSON.parse(searchText)) };
