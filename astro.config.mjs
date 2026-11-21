import { defineConfig } from "astro/config";
import { searchIndex } from "./scripts/search-index.mjs";
import { seoFiles } from "./scripts/seo-files.mjs";

// The site is served from the custom domain at the root, over HTTPS. Canonical,
// Open Graph, JSON-LD, sitemap and robots.txt URLs all derive from this.
export default defineConfig({
  site: "https://www.oversweep.com",
  output: "static",
  trailingSlash: "always",
  // Pages that moved keep their old address (issue #429).
  redirects: {
    "/manual/aircraft-procedures/f-16c/tacan-recovery/": "/manual/aircraft-procedures/f-16c/tacan-navigation/",
  },
  devToolbar: { enabled: false },
  integrations: [seoFiles(), searchIndex()],
});
