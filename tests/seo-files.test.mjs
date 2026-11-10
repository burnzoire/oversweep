import assert from "node:assert/strict";
import { test } from "node:test";
import { indexable } from "../scripts/seo-files.mjs";

test("sitemap leaves out noindex pages and redirects", () => {
  assert.equal(indexable('<head><meta name="description" content="x"></head>'), true);
  assert.equal(indexable('<head><meta name="robots" content="noindex" /></head>'), false);
  assert.equal(indexable('<head><meta http-equiv="refresh" content="0;url=/x/" /></head>'), false);
});
