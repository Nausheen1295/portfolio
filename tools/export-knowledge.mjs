#!/usr/bin/env node
/* ==========================================================================
   NEXA knowledge export
   Turns the site's single source of truth (js/data/*.js) — and optionally the
   projects' GitHub READMEs — into retrieval chunks for the NEXA backend.

   Usage:
     node tools/export-knowledge.mjs              # site data only
     node tools/export-knowledge.mjs --readmes    # + fetch README.md for projects with a GitHub link

   Output: nexa-backend/knowledge/portfolio.json
   Every chunk carries the project's STATUS in its text, so a model can never
   lose track of what's real (live/complete) versus planned (concept).
   ========================================================================== */
import { writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://nausheen1295.github.io/portfolio/";
const OUT = path.join(ROOT, "nexa-backend", "knowledge", "portfolio.json");
const withReadmes = process.argv.includes("--readmes");

const load = (rel) => import(pathToFileURL(path.join(ROOT, rel)).href);
const { PROJECTS, LABS, STATUS, JOURNEY_STAGES } = await load("js/data/projects.js");
const { PROFILE, SKILL_GROUPS } = await load("js/data/profile.js");
const { CERTIFICATIONS, formatMonth } = await load("js/data/certificates.js");
const { STORE } = await load("js/data/store.js");

const chunks = [];
const add = (c) => chunks.push({ projectId: null, ...c, text: c.text.replace(/\s+\n/g, "\n").trim() });
const bullets = (items) => items.map((i) => `- ${i}`).join("\n");
const caseUrl = (p, section) => `${SITE}project.html?id=${p.id}${section ? `#${section}` : ""}`;

/* ---------------- profile ---------------- */
add({
  id: "profile:about", title: `About ${PROFILE.name}`, section: "about", url: `${SITE}#about`,
  text: `${PROFILE.name} — ${PROFILE.role}.\n${PROFILE.headline}\nBased in ${PROFILE.location}. Status: ${PROFILE.status}.\n` +
    `Spoken languages: ${PROFILE.spokenLanguages.join(", ")}.`,
});
add({
  id: "profile:education", title: "Education", section: "about", url: `${SITE}#about`,
  text: PROFILE.education.map((e) => `${e.degree}, ${e.school} (${e.period}). ${e.detail}`).join("\n"),
});
add({
  id: "profile:experience", title: "Experience", section: "about", url: `${SITE}#about`,
  text: PROFILE.experience.map((e) => `${e.title} at ${e.org}${e.period ? ` (${e.period})` : " (dates not documented)"}. ${e.detail}`).join("\n"),
});
add({
  id: "profile:skills", title: "Skills", section: "skills", url: `${SITE}#skills`,
  text: SKILL_GROUPS.map((g) => {
    const ev = g.evidence.map((id) => PROJECTS.find((p) => p.id === id)?.name).filter(Boolean);
    return `${g.name}: ${g.items.join(", ")}.${ev.length ? ` Evidence: ${ev.join(", ")}.` : ""}`;
  }).join("\n"),
});
add({
  id: "profile:certifications", title: "Certifications", section: "certifications", url: `${SITE}#certifications`,
  text: "Certifications (source: résumé):\n" + CERTIFICATIONS.map((c) =>
    `- ${c.title} — ${c.issuer}, ${formatMonth(c.date)}. Topics: ${c.topics.join(", ")}.${c.credentialUrl ? ` Verify: ${c.credentialUrl}` : ""}`).join("\n"),
});
add({
  id: "profile:products", title: "Products I sell (future enhancement)", section: "store", url: `${SITE}#store`,
  text: "Products I sell is a FUTURE ENHANCEMENT. Nothing is on sale yet and no prices exist. " +
    "Visitors can register interest (\"Notify me\"). Planned products:\n" +
    STORE.map((p) => `- ${p.name} (${p.status}): ${p.description}`).join("\n"),
});
add({
  id: "profile:contact", title: "Contact", section: "contact", url: `${SITE}#contact`,
  text: `Email: ${PROFILE.links.email}. GitHub: ${PROFILE.links.github}. LinkedIn: ${PROFILE.links.linkedin}. Résumé: ${SITE}${PROFILE.links.resume}.`,
});
add({
  id: "nexus:labs", title: "NEXUS research labs", section: "universe", url: `${SITE}#universe`,
  text: LABS.map((l) => {
    const ps = PROJECTS.filter((p) => p.lab === l.id).map((p) => `${p.name} (${STATUS[p.status].label})`);
    return `${l.code} ${l.name}: ${l.tagline} Projects: ${ps.join(", ") || "none yet"}.`;
  }).join("\n"),
});

/* ---------------- projects ---------------- */
for (const p of PROJECTS) {
  const lab = LABS.find((l) => l.id === p.lab);
  const status = STATUS[p.status];
  const planned = p.status === "concept" || p.status === "in-development";
  // Every chunk starts with this header so status survives retrieval in isolation.
  const head = `Project: ${p.name} (${lab.name}). Status: ${status.label} — ${status.description}` +
    (planned ? " Everything below is a PLAN, not a built feature." : "");
  const base = { projectId: p.id };

  add({ ...base, id: `${p.id}:overview`, title: `${p.name} — overview`, section: "overview", url: caseUrl(p),
    text: `${head}\n${p.tagline}. ${p.summary}` +
      `${p.links.github ? `\nSource code: ${p.links.github}` : ""}${p.links.live ? `\nLive demo: ${p.links.live}` : ""}` });

  if (p.problem || p.solution) add({ ...base, id: `${p.id}:problem-solution`, title: `${p.name} — problem & solution`,
    section: "problem", url: caseUrl(p, p.problem ? "problem" : "solution"),
    text: `${head}\n${p.problem ? `Problem: ${p.problem}\n` : ""}${p.solution ? `Solution: ${p.solution}` : ""}` });

  if (p.features.length) add({ ...base, id: `${p.id}:features`, title: `${p.name} — ${planned ? "planned features" : "features"}`,
    section: "features", url: caseUrl(p, "features"), text: `${head}\n${planned ? "Planned features" : "Features"}:\n${bullets(p.features)}` });

  if (p.technologies.length) add({ ...base, id: `${p.id}:stack`, title: `${p.name} — technologies`, section: "stack", url: caseUrl(p, "stack"),
    text: `${head}\n${p.technologiesPlanned ? "Planned technologies (not final)" : "Technologies used"}: ${p.technologies.join(", ")}.` });

  if (p.aiCapabilities.length) add({ ...base, id: `${p.id}:ai`, title: `${p.name} — AI components`, section: "ai", url: caseUrl(p, "ai"),
    text: `${head}\nAI / ML components:\n${bullets(p.aiCapabilities)}` });

  if (p.security.length) add({ ...base, id: `${p.id}:security`, title: `${p.name} — security`, section: "security", url: caseUrl(p, "security"),
    text: `${head}\nSecurity:\n${bullets(p.security)}` });

  if (p.architecture) add({ ...base, id: `${p.id}:architecture`, title: `${p.name} — architecture`, section: "architecture",
    url: caseUrl(p, "architecture"),
    text: `${head}\n${planned ? "Planned architecture" : "Architecture"} components:\n` +
      p.architecture.nodes.map((n) => `- ${n.label} (${n.layer}): ${n.detail}`).join("\n") +
      `\nData flow: ${p.architecture.flow.map(([a, b]) => `${a} → ${b}`).join("; ")}.` });

  for (const [field, label] of [["challenges", "Challenges"], ["decisions", "Engineering decisions"]]) {
    if (p[field].length) add({ ...base, id: `${p.id}:${field}`, title: `${p.name} — ${label.toLowerCase()}`, section: field,
      url: caseUrl(p, field), text: `${head}\n${label}:\n${bullets(p[field])}` });
  }
  if (p.role) add({ ...base, id: `${p.id}:role`, title: `${p.name} — role`, section: "role", url: caseUrl(p, "role"), text: `${head}\nRole: ${p.role}` });
  if (p.database) add({ ...base, id: `${p.id}:database`, title: `${p.name} — database`, section: "database", url: caseUrl(p, "database"), text: `${head}\nDatabase: ${p.database}` });
  if (p.results) add({ ...base, id: `${p.id}:results`, title: `${p.name} — results`, section: "results", url: caseUrl(p, "results"), text: `${head}\nResults: ${p.results}` });

  if (p.timeline.length) add({ ...base, id: `${p.id}:timeline`, title: `${p.name} — development timeline`, section: "timeline",
    url: caseUrl(p, "timeline"),
    text: `${head}\nDocumented development stages:\n` + p.timeline.map((t) =>
      `- ${JOURNEY_STAGES.find((s) => s.id === t.stage)?.label}${t.date ? ` (${t.date})` : ""}: ${t.note}`).join("\n") });

  // Explicit "not documented" chunk — lets NEXA answer "that isn't documented" with a citation.
  const missing = [
    !p.problem && "the problem it solves", !p.role && "Nausheen's role", !p.database && "database choice",
    !p.challenges.length && "technical challenges", !p.decisions.length && "engineering decisions / why choices were made",
    !p.results && "results or metrics", !p.timeline.length && "development timeline",
  ].filter(Boolean);
  if (missing.length) add({ ...base, id: `${p.id}:undocumented`, title: `${p.name} — not yet documented`, section: "undocumented",
    url: caseUrl(p),
    text: `${head}\nNOT YET DOCUMENTED for ${p.name}: ${missing.join("; ")}. Do not guess these — say they are not documented yet.` });
}

/* ---------------- optional: GitHub READMEs ---------------- */
if (withReadmes) {
  for (const p of PROJECTS.filter((x) => x.links.github)) {
    const repo = p.links.github.replace("https://github.com/", "");
    try {
      const res = await fetch(`https://raw.githubusercontent.com/${repo}/HEAD/README.md`);
      if (!res.ok) { console.warn(`  · ${p.name}: no README (${res.status})`); continue; }
      const md = (await res.text())
        .replace(/<[^>]+>/g, " ")                 // strip inline HTML
        .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")   // strip images / badges
        .replace(/\n{3,}/g, "\n\n");
      // split on headings, keep sections of useful size
      const sections = md.split(/\n(?=#{1,3} )/).map((s) => s.trim()).filter((s) => s.replace(/[#\s-]/g, "").length > 40);
      sections.forEach((s, i) => {
        const heading = (s.match(/^#{1,3} (.+)/) || [, "README"])[1].replace(/[^\w &/().-]/g, "").trim() || "README";
        add({ projectId: p.id, id: `${p.id}:readme:${i}`, title: `${p.name} — README: ${heading}`, section: "readme",
          url: `${p.links.github}#readme`,
          text: `Project: ${p.name}. Status: ${STATUS[p.status].label}. Source: project README.\n${s.slice(0, 2500)}` });
      });
      console.log(`  · ${p.name}: ${sections.length} README sections`);
    } catch (e) {
      console.warn(`  · ${p.name}: README fetch failed (${e.message})`);
    }
  }
}

/* ---------------- write ---------------- */
const ids = new Set();
for (const c of chunks) { if (ids.has(c.id)) throw new Error(`duplicate chunk id ${c.id}`); ids.add(c.id); }

await mkdir(path.dirname(OUT), { recursive: true });
await writeFile(OUT, JSON.stringify({
  version: 1,
  site: SITE,
  generatedFrom: ["js/data/projects.js", "js/data/profile.js", ...(withReadmes ? ["GitHub READMEs"] : [])],
  chunks,
}, null, 2) + "\n");
console.log(`Wrote ${chunks.length} chunks → ${path.relative(ROOT, OUT)}`);
