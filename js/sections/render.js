/* ==========================================================================
   NEXUS — data-driven sections of index.html
   ========================================================================== */
import { LABS, PROJECTS, getProject } from "../data/projects.js";
import { PROFILE, SKILL_GROUPS } from "../data/profile.js";
import { STORE } from "../data/store.js";
import { esc, projectCard, avatar } from "../ui/components.js";
import { icon } from "../ui/icons.js";
import { reveal } from "../core/reveal.js";

/* ---------- hero ---------- */
export function renderHero() {
  document.getElementById("heroAvatar").innerHTML = avatar(PROFILE, 240);

  // one orbiting dot per lab, coloured with that lab's hue
  document.getElementById("orbitDots").innerHTML = LABS.map((lab, i) =>
    `<span class="nx-orbit-dot" style="--_a:${(360 / LABS.length) * i}deg;--_hue:var(--nx-lab-${lab.id})"></span>`).join("");

  // every number is computed from the data — nothing hand-typed
  const live = PROJECTS.filter((p) => p.status === "live").length;
  const shipped = PROJECTS.filter((p) => p.status === "live" || p.status === "complete").length;
  const meta = [
    [LABS.length, "Research labs"],
    [live, live === 1 ? "Live product" : "Live products"],
    [shipped, "Shipped projects"],
    ["2026", "BSc (Hons) CS · UWL"],
  ];
  document.getElementById("heroMeta").innerHTML =
    meta.map(([v, k]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("");
}

/* ---------- projects (with lab filter) ---------- */
const ORDER = { "live": 0, "complete": 1, "in-development": 2, "concept": 3, "experimental": 4 };

export function renderProjects() {
  const filter = document.getElementById("projectFilter");
  const grid = document.getElementById("projectGrid");
  const options = [{ id: "all", name: "All" }, ...LABS.filter((l) => PROJECTS.some((p) => p.lab === l.id))];

  filter.innerHTML = options.map((o) =>
    `<button type="button" data-lab="${esc(o.id)}" aria-pressed="${o.id === "all"}">${esc(o.name)}</button>`).join("");

  function show(labId) {
    const list = PROJECTS
      .filter((p) => labId === "all" || p.lab === labId)
      .sort((a, b) => (b.featured - a.featured) || (ORDER[a.status] - ORDER[b.status]));
    grid.innerHTML = list.map(projectCard).join("");
    filter.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lab === labId)));
  }

  filter.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (b) show(b.dataset.lab);
  });
  show("all");
  return { show };
}

/* ---------- skills ---------- */
export function renderSkills() {
  const grid = document.getElementById("skillGrid");
  grid.innerHTML = SKILL_GROUPS.map((g, i) => {
    const evidence = g.evidence.map(getProject).filter(Boolean)
      .map((p) => `<button type="button" data-open-project="${esc(p.id)}">${esc(p.name)}</button>`).join("<span aria-hidden='true'>·</span>");
    return `
      <article class="nx-card nx-skill nx-reveal" style="--nx-delay:${(i % 4) * 70}ms">
        <div class="nx-skill-head"><span class="nx-lab-icon">${icon(g.icon)}</span><h3>${esc(g.name)}</h3></div>
        <div class="nx-tags">${g.items.map((s) => `<span class="nx-tag">${esc(s)}</span>`).join("")}</div>
        ${evidence ? `<div class="nx-evidence"><span>Used in:</span>${evidence}</div>` : ""}
      </article>`;
  }).join("");
  reveal(grid);
}

/* ---------- store ---------- */
export function renderStore() {
  const grid = document.getElementById("storeGrid");
  grid.innerHTML = STORE.map((item, i) => {
    const mail = `mailto:${PROFILE.links.email}?subject=${encodeURIComponent(`Notify me: ${item.name}`)}` +
      `&body=${encodeURIComponent(`Hi Nausheen,\n\nPlease let me know when "${item.name}" is available.\n`)}`;
    return `
      <article class="nx-card nx-product nx-reveal" style="--nx-delay:${(i % 4) * 70}ms">
        <span class="nx-product-icon" aria-hidden="true">${item.icon}</span>
        <h3>${esc(item.name)}</h3>
        <p class="nx-soft">${esc(item.description)}</p>
        <div class="nx-product-foot">
          <span class="nx-badge" data-status="in-development">Coming soon</span>
          <a class="nx-btn nx-btn--sm" href="${esc(mail)}">Notify me</a>
        </div>
      </article>`;
  }).join("");
  reveal(grid);
}

/* ---------- static [data-icon] placeholders → inline SVG ---------- */
export function hydrateIcons(scope = document) {
  scope.querySelectorAll("[data-icon]:empty").forEach((el) => { el.innerHTML = icon(el.dataset.icon, { size: 18 }); });
}
