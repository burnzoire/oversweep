import { defineConfig } from "astro/config";
import { searchIndex } from "./scripts/search-index.mjs";
import { seoFiles } from "./scripts/seo-files.mjs";

// The site is served from the custom domain at the root, over HTTPS. Canonical,
// Open Graph, JSON-LD, sitemap and robots.txt URLs all derive from this.
export default defineConfig({
  site: "https://www.oversweep.com",
  output: "static",
  trailingSlash: "always",
  devToolbar: { enabled: false },
  // The radar elevation procedure was folded into the basic radar controls (RWS) one.
  redirects: { "/manual/aircraft-procedures/f-16c/radar-volume/": "/manual/aircraft-procedures/f-16c/radar-rws/" },
  integrations: [seoFiles(), searchIndex()],
});
