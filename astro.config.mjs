import { defineConfig } from "astro/config";
import { seoFiles } from "./scripts/seo-files.mjs";

export default defineConfig({
  output: "static",
  trailingSlash: "always",
  devToolbar: { enabled: false },
  integrations: [seoFiles()],
});
