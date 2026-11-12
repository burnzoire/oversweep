import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Writes sitemap.xml and robots.txt into the build output. The sitemap lists
// every built page except those that ask not to be indexed (empty
// destinations, unlisted trainers), redirects from moved pages and the 404
// page. The origin is `site` in astro.config.mjs; without one there are no
// absolute URLs, so nothing is written.
export async function htmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const filename = path.join(directory, entry.name);
    return entry.isDirectory() ? htmlFiles(filename) : entry.name === "index.html" ? [filename] : [];
  }));
  return nested.flat();
}

export const indexable = (html) =>
  !/<meta[^>]+name="robots"[^>]+noindex/i.test(html) && !/<meta[^>]+http-equiv="refresh"/i.test(html);

export function seoFiles() {
  let site;
  let base = "/";
  return {
    name: "oversweep-seo-files",
    hooks: {
      "astro:config:done": ({ config }) => {
        site = config.site;
        base = config.base.endsWith("/") ? config.base : `${config.base}/`;
      },
      "astro:build:done": async ({ dir, logger }) => {
        if (!site) {
          logger.info("No site origin; skipping sitemap.xml and robots.txt.");
          return;
        }
        const output = fileURLToPath(dir);
        const urls = [];
        for (const file of (await htmlFiles(output)).sort()) {
          if (!indexable(await readFile(file, "utf8"))) continue;
          const route = path.relative(output, path.dirname(file)).split(path.sep).join("/");
          if (route === "404") continue;
          urls.push(new URL(`${base}${route ? `${route}/` : ""}`, site).href);
        }
        const sitemap = new URL(`${base}sitemap.xml`, site).href;
        await writeFile(path.join(output, "sitemap.xml"), [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
          ...urls.map((url) => `  <url><loc>${url}</loc></url>`),
          "</urlset>",
          "",
        ].join("\n"));
        await writeFile(path.join(output, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`);
        logger.info(`sitemap.xml lists ${urls.length} pages.`);
      },
    },
  };
}
