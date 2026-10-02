#!/usr/bin/env node
/* ==========================================================================
   Writes sitemap.xml from the site's project data. Re-run after adding projects:
     node tools/build-sitemap.mjs
   ========================================================================== */
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://nausheen1295.github.io/portfolio/";
const { PROJECTS } = await import(pathToFileURL(path.join(ROOT, "js/data/projects.js")).href);
const today = new Date().toISOString().slice(0, 10);

const urls = [
  { loc: SITE, priority: "1.0" },
  ...PROJECTS.map((p) => ({
    loc: `${SITE}project.html?id=${p.id}`,
    priority: p.status === "live" ? "0.9" : p.status === "complete" ? "0.7" : "0.6",
  })),
  { loc: `${SITE}playground/`, priority: "0.5" },
  { loc: `${SITE}playground/snake.html`, priority: "0.3" },
  { loc: `${SITE}playground/memory.html`, priority: "0.3" },
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc.replace(/&/g, "&amp;")}</loc><lastmod>${today}</lastmod><priority>${u.priority}</priority></url>`).join("\n")}
</urlset>
`;
await writeFile(path.join(ROOT, "sitemap.xml"), xml);
console.log(`sitemap.xml: ${urls.length} URLs`);
