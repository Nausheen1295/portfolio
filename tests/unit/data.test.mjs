/* ==========================================================================
   Content guardrails for the single source of truth (js/data/*.js).
   These encode the portfolio's honesty rules so they can't silently regress.
   Run: node --test tests/unit/
   ========================================================================== */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const load = (rel) => import(pathToFileURL(path.join(ROOT, rel)).href);
const { PROJECTS, LABS, STATUS, JOURNEY_STAGES, LAYERS, getProject } = await load("js/data/projects.js");
const { PROFILE, SKILL_GROUPS } = await load("js/data/profile.js");
const exists = (rel) => stat(path.join(ROOT, rel)).then(() => true, () => false);

test("project ids are unique slugs", () => {
  const ids = PROJECTS.map((p) => p.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ids) assert.match(id, /^[a-z0-9-]+$/);
});

test("every project belongs to a real lab and has a valid status", () => {
  for (const p of PROJECTS) {
    assert.ok(LABS.some((l) => l.id === p.lab), `${p.id}: unknown lab ${p.lab}`);
    assert.ok(STATUS[p.status], `${p.id}: unknown status ${p.status}`);
  }
});

test("every lab's flagship exists and lives in that lab", () => {
  for (const l of LABS) {
    const f = getProject(l.flagship);
    assert.ok(f, `${l.id}: flagship ${l.flagship} missing`);
    assert.equal(f.lab, l.id, `${l.id}: flagship is in another lab`);
  }
});

test("only SecureVault AI is marked live (the one shipped product)", () => {
  assert.deepEqual(PROJECTS.filter((p) => p.status === "live").map((p) => p.id), ["securevault-ai"]);
});

test("the five future projects are labelled as concepts with a planned stack", () => {
  for (const id of ["nexa", "mindscape-ai", "insightforge", "earthpulse", "floramind-ai"]) {
    const p = getProject(id);
    assert.ok(p, `${id} missing`);
    assert.ok(["concept", "in-development", "experimental"].includes(p.status), `${id} must not claim to be shipped`);
    assert.equal(p.technologiesPlanned, true, `${id}: stack must be marked as planned`);
    assert.equal(p.results, null, `${id}: unbuilt project can't have results`);
    assert.ok(!p.links.live, `${id}: unbuilt project can't have a live demo`);
  }
});

test("shipped work cites its sources", () => {
  for (const p of PROJECTS.filter((x) => x.status === "live" || x.status === "complete")) {
    assert.ok(p.sources.length > 0 || p.links.github, `${p.id}: needs a source or repo link`);
  }
});

test("CARWA never appears anywhere in the site", async () => {
  const hits = [];
  async function walk(dir) {
    for (const e of await readdir(dir, { withFileTypes: true })) {
      if (/^(node_modules|\.venv|\.git|test-results|playwright-report)$/.test(e.name)) continue;
      const full = path.join(dir, e.name);
      if (e.isDirectory()) await walk(full);
      else if (/\.(html|js|mjs|css|json|md|py|xml)$/.test(e.name) && !full.includes(`${path.sep}tests${path.sep}`)) {
        if (/carwa/i.test(await readFile(full, "utf8"))) hits.push(path.relative(ROOT, full));
      }
    }
  }
  await walk(ROOT);
  assert.deepEqual(hits, []);
});

test("links are well-formed (https for external, existing files for local)", async () => {
  for (const p of PROJECTS) {
    for (const [kind, url] of Object.entries(p.links)) {
      if (/^https?:/.test(url)) assert.match(url, /^https:\/\//, `${p.id}.${kind} must be https`);
      else assert.ok(await exists(url.endsWith("/") ? `${url}index.html` : url), `${p.id}.${kind}: ${url} not found`);
    }
    for (const s of p.sources) assert.match(s, /^https:\/\//);
  }
});

test("project media files exist with dimensions and alt text", async () => {
  for (const p of PROJECTS) for (const m of p.media || []) {
    assert.ok(await exists(m.src), `${m.src} missing`);
    assert.ok(m.width > 0 && m.height > 0, `${m.src}: needs width/height`);
    assert.ok(m.alt && m.alt.length > 10, `${m.src}: needs descriptive alt text`);
  }
});

test("architecture graphs are internally consistent", () => {
  for (const p of PROJECTS.filter((x) => x.architecture)) {
    const ids = new Set(p.architecture.nodes.map((n) => n.id));
    assert.equal(ids.size, p.architecture.nodes.length, `${p.id}: duplicate node ids`);
    for (const n of p.architecture.nodes) {
      assert.ok(LAYERS.some((l) => l.id === n.layer), `${p.id}/${n.id}: unknown layer ${n.layer}`);
      assert.ok(n.detail.length > 20, `${p.id}/${n.id}: needs an explanation`);
    }
    for (const [a, b] of p.architecture.flow) assert.ok(ids.has(a) && ids.has(b), `${p.id}: flow ${a}→${b} references a missing node`);
  }
});

test("timeline entries use known stages, and artifacts are valid", () => {
  for (const p of PROJECTS) for (const t of p.timeline) {
    assert.ok(JOURNEY_STAGES.some((s) => s.id === t.stage), `${p.id}: unknown stage ${t.stage}`);
    assert.ok(t.note.length > 5);
    if (t.date) assert.match(t.date, /^\d{4}(-\d{2})?$/);
    for (const a of t.artifacts || []) assert.ok(a.label && a.url && a.type, `${p.id}: incomplete artifact`);
  }
});

test("skills are backed by real projects", () => {
  for (const g of SKILL_GROUPS) {
    for (const id of g.evidence) assert.ok(getProject(id), `${g.id}: evidence ${id} is not a project`);
    assert.ok(g.items.length > 0);
  }
});

test("profile facts are present and links are safe", () => {
  assert.equal(PROFILE.name, "Nausheen Haleelur Rahman");
  assert.match(PROFILE.links.github, /^https:\/\/github\.com\//);
  assert.match(PROFILE.links.linkedin, /^https:\/\/www\.linkedin\.com\//);
  assert.match(PROFILE.links.email, /^[^@\s]+@[^@\s]+$/);
  assert.equal(PROFILE.avatar === null || typeof PROFILE.avatar === "string", true);
});

test("NEXA config never ships secrets and only allows https", async () => {
  const cfg = await readFile(path.join(ROOT, "js/nexa/config.js"), "utf8");
  assert.doesNotMatch(cfg, /sk-ant-|api[_-]?key\s*[:=]\s*["'][^"']+/i);
  const { NEXA_CONFIG } = await load("js/nexa/config.js");
  assert.ok(NEXA_CONFIG.endpoint === null || NEXA_CONFIG.endpoint.startsWith("https://"));
});

test("knowledge export is up to date with projects.js", async () => {
  const kb = JSON.parse(await readFile(path.join(ROOT, "nexa-backend/knowledge/portfolio.json"), "utf8"));
  for (const p of PROJECTS) {
    const overview = kb.chunks.find((c) => c.id === `${p.id}:overview`);
    assert.ok(overview, `knowledge is missing ${p.id} — run: node tools/export-knowledge.mjs --readmes`);
    assert.ok(overview.text.includes(`Status: ${STATUS[p.status].label}`), `${p.id}: stale status in knowledge — re-export`);
  }
});
