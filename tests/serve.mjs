#!/usr/bin/env node
/* ==========================================================================
   Tiny static server that mirrors GitHub Pages:
   - the site is served under /portfolio/ (and at / for convenience)
   - unknown paths return 404.html with status 404
   Usage: node tests/serve.mjs [port]      (default 4173; SITE_ROOT=<dir> to serve another copy)
   ========================================================================== */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// SITE_ROOT lets the suite test another copy of the site (e.g. a staged deployment).
const ROOT = path.resolve(process.env.SITE_ROOT || path.join(path.dirname(fileURLToPath(import.meta.url)), ".."));
const PORT = Number(process.argv[2] || process.env.PORT || 4173);
const TYPES = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png",
  ".webp": "image/webp", ".pdf": "application/pdf", ".xml": "application/xml", ".ico": "image/x-icon", ".txt": "text/plain",
};
const BLOCKED = /(^|\/)(\.venv|node_modules|\.git)(\/|$)/;

createServer(async (req, res) => {
  let rel = decodeURIComponent(new URL(req.url, "http://x").pathname).replace(/^\/portfolio(?=\/|$)/, "");
  if (rel.endsWith("/")) rel += "index.html";
  const file = path.join(ROOT, rel);
  try {
    if (!file.startsWith(ROOT) || BLOCKED.test(rel)) throw new Error("forbidden");
    const info = await stat(file);
    if (info.isDirectory()) { res.writeHead(301, { Location: `${req.url.split("?")[0]}/` }); return res.end(); }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream", "Cache-Control": "no-store" });
    res.end(await readFile(file));
  } catch {
    res.writeHead(404, { "Content-Type": TYPES[".html"] });
    res.end(await readFile(path.join(ROOT, "404.html")));
  }
}).listen(PORT, () => console.log(`NEXUS test server → http://localhost:${PORT}/portfolio/`));
