/* ==========================================================================
   NEXUS — data-driven sections of index.html
   ========================================================================== */
import { LABS, PROJECTS, getProject } from "../data/projects.js";
import { PROFILE, SKILL_GROUPS } from "../data/profile.js";
import { STORE, STORE_ROADMAP } from "../data/store.js";
import { CERTIFICATIONS, formatMonth } from "../data/certificates.js";
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
const certs = (groupId) => {
  const list = CERTIFICATIONS.filter((c) => c.relatedSkills.includes(groupId));
  return list.length
    ? `<div class="nx-evidence"><span>Certified:</span>${list.map((c) => `<a href="#cert-${esc(c.id)}">${esc(c.issuer)}</a>`).join("<span aria-hidden='true'>·</span>")}</div>`
    : "";
};
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
        ${certs(g.id)}
      </article>`;
  }).join("");
  reveal(grid);
}

/* ---------- certifications ---------- */
export function renderCertifications() {
  const grid = document.getElementById("certGrid");
  grid.innerHTML = CERTIFICATIONS.map((c, i) => `
    <article class="nx-card nx-cert nx-reveal" id="cert-${esc(c.id)}" style="--nx-delay:${(i % 3) * 70}ms">
      <div class="nx-cert-top">
        <span class="nx-cert-icon" aria-hidden="true">${icon("award")}</span>
        <time class="nx-cert-date" datetime="${esc(c.date)}">${esc(formatMonth(c.date))}</time>
      </div>
      <h3>${esc(c.title)}</h3>
      <p class="nx-cert-issuer">${esc(c.issuer)}</p>
      <div class="nx-tags">${c.topics.map((t) => `<span class="nx-tag">${esc(t)}</span>`).join("")}</div>
      ${c.credentialUrl
        ? `<a class="nx-cert-verify" href="${esc(c.credentialUrl)}" target="_blank" rel="noopener">Verify credential ${icon("external", { size: 14 })}</a>`
        : ""}
    </article>`).join("");
  const facts = document.getElementById("factsCertCount");
  if (facts) facts.textContent = `${CERTIFICATIONS.length} — see all`;
  reveal(grid);
}

/* ---------- products I sell (future enhancement) ---------- */
export function renderStore() {
  document.getElementById("storeRoadmap").innerHTML = STORE_ROADMAP.map((r) => `
    <li><span class="nx-store-step">${esc(r.step)}</span><strong>${esc(r.label)}</strong><span>${esc(r.detail)}</span></li>`).join("");

  const grid = document.getElementById("storeGrid");
  grid.innerHTML = STORE.map((item, i) => {
    const available = item.status === "available" && item.buyUrl;
    const mail = `mailto:${PROFILE.links.email}?subject=${encodeURIComponent(`Notify me: ${item.name}`)}` +
      `&body=${encodeURIComponent(`Hi Nausheen,\n\nPlease let me know when "${item.name}" is available.\n`)}`;
    return `
      <article class="nx-card nx-product nx-reveal" style="--nx-delay:${(i % 4) * 70}ms">
        <span class="nx-product-icon" aria-hidden="true">${item.icon}</span>
        <h3>${esc(item.name)}</h3>
        <p class="nx-soft">${esc(item.description)}</p>
        <div class="nx-product-foot">
          ${available
            ? `<span class="nx-price">${esc(item.price || "")}</span><a class="nx-btn nx-btn--sm nx-btn--primary" href="${esc(item.buyUrl)}" target="_blank" rel="noopener">Buy</a>`
            : `<span class="nx-badge" data-status="concept" title="Planned — not on sale yet">Planned</span>
               <a class="nx-btn nx-btn--sm" href="${esc(mail)}" aria-label="Notify me when ${esc(item.name)} launches">Notify me</a>`}
        </div>
      </article>`;
  }).join("");
  reveal(grid);
}

/* ---------- static [data-icon] placeholders → inline SVG ---------- */
export function hydrateIcons(scope = document) {
  scope.querySelectorAll("[data-icon]:empty").forEach((el) => { el.innerHTML = icon(el.dataset.icon, { size: 18 }); });
}
