/* ==========================================================================
   NEXUS — case-study page  (project.html?id=<project-id>)
   One template for every project, driven entirely by projects.js.
   Documented sections render in full; undocumented ones are listed in a
   single honest "not documented yet" note instead of being padded out.
   ========================================================================== */
import { PROJECTS, STATUS, JOURNEY_STAGES, getProject, getLab } from "./data/projects.js";
import { esc, statusBadge, tags } from "./ui/components.js";
import { icon } from "./ui/icons.js";
import { renderArchitecture } from "./ui/architecture.js";
import { initTheme } from "./core/theme.js";
import { initNav } from "./core/nav.js";
import { initCommandCenter } from "./core/command-center.js";
import { exploreLab } from "./core/achievements.js";

document.documentElement.classList.add("nx-ready");
initTheme(document.getElementById("themeBtn"));
initNav();
initCommandCenter();
document.querySelectorAll("span[data-icon]:empty").forEach((el) => { el.innerHTML = icon(el.dataset.icon, { size: 18 }); });

const main = document.getElementById("main");
const project = getProject(new URLSearchParams(location.search).get("id"));


/* ------------------------------------------------------------------------ */

function renderNotFound() {
  document.title = "Project not found — NEXUS";
  main.innerHTML = `
    <section class="nx-container nx-cs-empty">
      <span class="nx-kicker">404 · Signal lost</span>
      <h1>That project isn't in the NEXUS Universe.</h1>
      <p class="nx-soft">It may have been renamed. Browse every lab and project from the map instead.</p>
      <a class="nx-btn nx-btn--primary" href="index.html#universe">Explore NEXUS</a>
    </section>`;
}

const list = (items) => `<ul class="nx-cs-list">${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;
const para = (text) => `<p class="nx-cs-text">${esc(text)}</p>`;

function renderCaseStudy(p) {
  const lab = getLab(p.lab);
  const isPlan = p.status === "concept" || p.status === "in-development";
  const hue = `var(--nx-lab-${lab.id})`;

  setMeta(p, lab);

  /* --- sections: [id, title, html|null] — null means "not documented" --- */
  const sections = [
    ["overview", "Overview", para(p.summary)],
    ["problem", "Problem", p.problem && para(p.problem)],
    ["solution", "Solution", p.solution && para(p.solution)],
    ["features", isPlan ? "Planned features" : "Features", p.features.length ? list(p.features) : null],
    ["screens", "Screenshots", p.media?.length ? gallery(p.media) : false],
    ["role", "My role", p.role && para(p.role)],
    ["stack", p.technologiesPlanned ? "Planned technologies" : "Technologies", p.technologies.length ? tags(p.technologies) : null],
    ["architecture", isPlan ? "Planned architecture" : "Architecture", p.architecture ? `<div id="archMount"></div>` : null],
    ["ai", "AI / ML components", p.aiCapabilities.length ? list(p.aiCapabilities) : false],
    ["database", "Database", p.database && para(p.database)],
    ["security", "Security", p.security.length ? list(p.security) : null],
    ["challenges", "Challenges", p.challenges.length ? list(p.challenges) : null],
    ["decisions", "Engineering decisions", p.decisions.length ? list(p.decisions) : null],
    ["timeline", "Development timeline", p.timeline.length ? timeline(p.timeline) : null],
    ["results", "Results", p.results && para(p.results)],
  ];
  // false = not applicable (hidden silently); null = applicable but undocumented
  const shown = sections.filter(([, , html]) => html);
  const missing = sections.filter(([, , html]) => html === null || html === undefined).map(([, t]) => t);

  const links = [
    p.links.live && `<a class="nx-btn nx-btn--primary" href="${esc(p.links.live)}" target="_blank" rel="noopener">Live demo ${icon("external", { size: 16 })}</a>`,
    p.links.demo && `<a class="nx-btn nx-btn--primary" href="${esc(p.links.demo)}">Try it ${icon("arrow", { size: 16 })}</a>`,
    p.links.github && `<a class="nx-btn" href="${esc(p.links.github)}" target="_blank" rel="noopener">${icon("github", { size: 16 })} Source code</a>`,
  ].filter(Boolean).join("");

  const idx = PROJECTS.indexOf(p);
  const prev = PROJECTS[(idx - 1 + PROJECTS.length) % PROJECTS.length];
  const next = PROJECTS[(idx + 1) % PROJECTS.length];

  main.innerHTML = `
    <header class="nx-cs-hero" style="--_hue:${hue}">
      <div class="nx-container">
        <nav class="nx-crumbs" aria-label="Breadcrumb">
          <ol>
            <li><a href="index.html#universe">Universe</a></li>
            <li><a href="index.html#lab-${esc(lab.id)}">${esc(lab.name)}</a></li>
            <li aria-current="page">${esc(p.name)}</li>
          </ol>
        </nav>
        <div class="nx-row" style="margin-top:var(--nx-space-8)">
          <span class="nx-lab-code" style="color:${hue}">${esc(lab.code)} · ${esc(lab.name.toUpperCase())}</span>
          ${statusBadge(p.status)}
        </div>
        <h1 class="nx-cs-title">${esc(p.name)}</h1>
        <p class="nx-cs-tagline">${esc(p.tagline)}</p>
        ${links ? `<div class="nx-row" style="margin-top:var(--nx-space-8)">${links}</div>` : ""}
        <dl class="nx-cs-meta">
          <div><dt>Status</dt><dd>${esc(STATUS[p.status].label)}</dd></div>
          <div><dt>Lab</dt><dd>${esc(lab.name)}</dd></div>
          <div><dt>${p.technologiesPlanned ? "Planned stack" : "Stack"}</dt><dd>${esc(p.technologies.slice(0, 3).join(" · ") || "—")}</dd></div>
        </dl>
      </div>
    </header>

    <div class="nx-container nx-cs-layout">
      <nav class="nx-cs-toc" aria-label="On this page">
        <span class="nx-cs-toc-title">On this page</span>
        <ol>${shown.map(([id, title]) => `<li><a href="#${id}">${esc(title)}</a></li>`).join("")}</ol>
      </nav>

      <article class="nx-cs-body">
        ${isPlan ? `<div class="nx-notice"><span aria-hidden="true">ⓘ</span><span><strong>This project hasn't been built yet.</strong>
          Everything below is the plan — it will be replaced with real details, decisions and results as development happens.</span></div>` : ""}

        ${shown.map(([id, title, html]) => `
          <section class="nx-cs-section" id="${id}" aria-labelledby="${id}-h">
            <h2 id="${id}-h">${esc(title)}</h2>
            ${html}
          </section>`).join("")}

        ${missing.length && !isPlan ? `
          <section class="nx-cs-section nx-cs-missing" aria-label="Not documented yet">
            <h2>Not documented yet</h2>
            <p class="nx-soft">These parts of the case study haven't been written up. Rather than guess, they're left out until they're documented:</p>
            <div class="nx-tags">${missing.map((m) => `<span class="nx-tag">${esc(m)}</span>`).join("")}</div>
          </section>` : ""}

        ${p.sources.length ? `<p class="nx-cs-sources">Sources: ${p.sources.map((s) =>
          `<a href="${esc(s)}" target="_blank" rel="noopener">${esc(s.replace("https://", ""))}</a>`).join(", ")}</p>` : ""}

        <nav class="nx-cs-pager" aria-label="More projects">
          <a href="project.html?id=${esc(prev.id)}"><span>← Previous</span><strong>${esc(prev.name)}</strong></a>
          <a href="project.html?id=${esc(next.id)}"><span>Next →</span><strong>${esc(next.name)}</strong></a>
        </nav>
      </article>
    </div>`;

  exploreLab(p.lab);
  if (p.architecture) renderArchitecture(document.getElementById("archMount"), p.architecture, { planned: isPlan });
  initTocSpy();
  if (location.hash) document.querySelector(location.hash)?.scrollIntoView();
}

/* Per-project SEO: title, description, canonical URL, Open Graph and JSON-LD. */
function setMeta(p, lab) {
  const url = `https://nausheen1295.github.io/portfolio/project.html?id=${encodeURIComponent(p.id)}`;
  const title = `${p.name} — ${p.tagline} · NEXUS`;
  const set = (sel, attr, value) => document.querySelector(sel)?.setAttribute(attr, value);
  document.title = title;
  set('meta[name="description"]', "content", `${p.name} (${STATUS[p.status].label}): ${p.summary}`);
  set('link[rel="canonical"]', "href", url);
  set('meta[property="og:title"]', "content", title);
  set('meta[property="og:description"]', "content", p.summary);

  const ld = {
    "@context": "https://schema.org",
    "@type": p.links.github ? "SoftwareSourceCode" : "CreativeWork",
    name: p.name,
    description: p.summary,
    url,
    author: { "@type": "Person", name: "Nausheen Haleelur Rahman", url: "https://nausheen1295.github.io/portfolio/" },
    keywords: [...p.keywords, lab.name].join(", "),
    creativeWorkStatus: STATUS[p.status].label,
    ...(p.links.github && { codeRepository: p.links.github }),
    ...(!p.technologiesPlanned && p.technologies.length && { programmingLanguage: p.technologies.slice(0, 5) }),
  };
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(ld);
  document.head.append(script);
}

function gallery(media) {
  return `<div class="nx-cs-gallery">${media.map((m) => `
    <figure>
      <a href="${esc(m.src)}" target="_blank" rel="noopener" aria-label="Open full-size: ${esc(m.caption)}">
        <img src="${esc(m.src)}" alt="${esc(m.alt)}" loading="lazy" decoding="async" width="${m.width}" height="${m.height}">
      </a>
      <figcaption>${esc(m.caption)}</figcaption>
    </figure>`).join("")}</div>`;
}

/* Journey tracker: every stage is shown; only documented stages are lit. */
function timeline(entries) {
  const notes = new Map(entries.map((e) => [e.stage, e.note]));
  const current = Math.max(...entries.map((e) => JOURNEY_STAGES.findIndex((s) => s.id === e.stage)));
  return `
    <ol class="nx-journey" aria-label="Development stages">
      ${JOURNEY_STAGES.map((s, i) => `
        <li class="${notes.has(s.id) ? "is-documented" : ""}${i === current ? " is-current" : ""}">
          <span class="nx-journey-dot" aria-hidden="true"></span>
          <span class="nx-journey-label">${esc(s.label)}</span>
          ${notes.has(s.id) ? `<span class="nx-journey-note">${esc(notes.get(s.id))}</span>` : ""}
        </li>`).join("")}
    </ol>
    <p class="nx-mute" style="font-size:var(--nx-text-xs);margin-top:var(--nx-space-3)">Highlighted stages are documented; the rest haven't been written up yet.</p>`;
}

function initTocSpy() {
  const links = new Map([...document.querySelectorAll(".nx-cs-toc a")].map((a) => [a.getAttribute("href").slice(1), a]));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => a.removeAttribute("aria-current"));
      links.get(e.target.id)?.setAttribute("aria-current", "true");
    });
  }, { rootMargin: "-30% 0px -60% 0px" });
  links.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
}

/* render last, so every helper above is initialised */
if (!project) renderNotFound();
else renderCaseStudy(project);
