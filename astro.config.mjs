import { defineConfig } from "astro/config";
import { seoFiles } from "./scripts/seo-files.mjs";

// The site is served from the custom domain at the root, over HTTPS. Canonical,
// Open Graph, JSON-LD, sitemap and robots.txt URLs all derive from this.
export default defineConfig({
  site: "https://www.oversweep.com",
  output: "static",
  trailingSlash: "always",
  devToolbar: { enabled: false },
  integrations: [seoFiles()],
});
