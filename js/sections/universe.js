/* ==========================================================================
   NEXUS — Universe map
   Desktop: a constellation (NEXUS Core + 7 lab nodes + detail panel).
   Mobile:  a swipeable carousel of lab "stations" with colour-coded dots.
   Both layouts render from projects.js. CSS shows one per breakpoint.
   ========================================================================== */
import { LABS, PROJECTS, projectsInLab, getProject } from "../data/projects.js";
import { esc, statusBadge } from "../ui/components.js";
import { icon } from "../ui/icons.js";
import { exploreLab } from "../core/achievements.js";

const STATUS_ORDER = ["live", "complete", "in-development", "concept", "experimental"];
const byStatus = (a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);

/* node positions on an ellipse around the core (percent of map box) */
const position = (i) => {
  const a = ((-90 + (360 / LABS.length) * i) * Math.PI) / 180;
  return { x: 50 + 39 * Math.cos(a), y: 50 + 39 * Math.sin(a) };
};

/* ---------- shared panel content ---------- */
function labPanel(lab) {
  const projects = projectsInLab(lab.id).sort(byStatus);
  const flagship = getProject(lab.flagship);
  return `
    <div class="nx-uni-panel-head" style="--_hue:var(--nx-lab-${lab.id})">
      <span class="nx-lab-icon">${icon(lab.icon)}</span>
      <div>
        <span class="nx-lab-code">${esc(lab.code)}</span>
        <h3>${esc(lab.name)}</h3>
      </div>
    </div>
    <p class="nx-soft">${esc(lab.tagline)}</p>
    ${flagship ? `<p class="nx-uni-flagship"><span>Flagship</span>${esc(flagship.name)} — ${esc(flagship.tagline)}</p>` : ""}
    <ul class="nx-uni-projects">
      ${projects.map((p) => `
        <li>
          <button type="button" data-open-project="${esc(p.id)}">
            <span class="nx-uni-pname">${esc(p.name)}</span>
            ${statusBadge(p.status)}
          </button>
        </li>`).join("")}
    </ul>
    <button class="nx-btn nx-btn--sm" type="button" data-filter-lab="${esc(lab.id)}">
      Show in projects ${icon("arrow", { size: 16 })}
    </button>`;
}

function corePanel() {
  const counts = STATUS_ORDER
    .map((s) => [s, PROJECTS.filter((p) => p.status === s).length])
    .filter(([, n]) => n > 0);
  return `
    <div class="nx-uni-panel-head">
      <span class="nx-orb" aria-hidden="true"></span>
      <div>
        <span class="nx-lab-code" style="color:var(--nx-accent)">CORE</span>
        <h3>NEXUS Core</h3>
      </div>
    </div>
    <p class="nx-soft">The hub that connects every lab. Select a lab on the map to see what's been built there and what's on the way.</p>
    <dl class="nx-uni-stats">
      ${counts.map(([s, n]) => `<div><dt>${statusBadge(s)}</dt><dd>${n}</dd></div>`).join("")}
    </dl>
    <div class="nx-row">
      <a class="nx-btn nx-btn--sm nx-btn--primary" href="#nexa">Meet NEXA</a>
      <a class="nx-btn nx-btn--sm" href="#projects">All projects</a>
    </div>`;
}

/* ---------- desktop constellation ---------- */
function mapMarkup() {
  const pts = LABS.map((_, i) => position(i));
  const ring = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const spokes = LABS.map((lab, i) =>
    `<line class="nx-uni-spoke" data-lab="${lab.id}" style="--_hue:var(--nx-lab-${lab.id})" x1="50" y1="50" x2="${pts[i].x}" y2="${pts[i].y}"/>`).join("");

  const nodes = LABS.map((lab, i) => {
    const projects = projectsInLab(lab.id).sort(byStatus);
    const sats = projects.map((p) => `<i style="background:var(--nx-status-${p.status === "in-development" ? "development" : p.status})"></i>`).join("");
    return `
      <button type="button" class="nx-uni-node" data-lab="${lab.id}" aria-pressed="false" aria-controls="uniPanel"
              style="left:${pts[i].x}%;top:${pts[i].y}%;--_hue:var(--nx-lab-${lab.id})">
        <span class="nx-uni-node-dot">${icon(lab.icon)}</span>
        <span class="nx-uni-node-label"><span class="nx-uni-node-code">${esc(lab.code)}</span>${esc(lab.name)}</span>
        <span class="nx-uni-sats" aria-hidden="true">${sats}</span>
        <span class="sr-only">, ${projects.length} project${projects.length === 1 ? "" : "s"}</span>
      </button>`;
  }).join("");

  return `
    <div class="nx-uni">
      <div class="nx-uni-map" role="group" aria-label="Research lab map. Use arrow keys to move between labs.">
        <svg class="nx-uni-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <polygon class="nx-uni-ring" points="${ring}"/>
          ${spokes}
        </svg>
        <button type="button" class="nx-uni-core" data-core aria-pressed="true" aria-controls="uniPanel">
          <span class="nx-orb" style="--_size:56px" aria-hidden="true"></span>
          <span class="nx-uni-core-label">NEXUS<br><small>CORE</small></span>
        </button>
        ${nodes}
      </div>
      <aside class="nx-card nx-uni-panel" id="uniPanel" aria-live="polite"></aside>
    </div>`;
}

/* ---------- mobile carousel ---------- */
function carouselMarkup() {
  return `
    <div class="nx-uni-mobile">
      <div class="nx-uni-track" id="uniTrack" tabindex="0" aria-label="Research labs — swipe to explore">
        ${LABS.map((lab) => `
          <article class="nx-card nx-uni-slide" data-lab="${lab.id}" aria-label="${esc(lab.name)}">${labPanel(lab)}</article>`).join("")}
      </div>
      <div class="nx-uni-dots" role="group" aria-label="Jump to lab">
        ${LABS.map((lab) => `<button type="button" data-goto="${lab.id}" style="--_hue:var(--nx-lab-${lab.id})" aria-label="${esc(lab.name)}"></button>`).join("")}
      </div>
    </div>`;
}

/* ---------- init ---------- */
export function initUniverse(root, { onFilter }) {
  root.innerHTML = mapMarkup() + carouselMarkup();

  const map = root.querySelector(".nx-uni-map");
  const panel = root.querySelector("#uniPanel");
  const nodes = [...root.querySelectorAll(".nx-uni-node")];
  const core = root.querySelector(".nx-uni-core");

  function select(labId, userInitiated = true) {
    nodes.forEach((n) => n.setAttribute("aria-pressed", String(n.dataset.lab === labId)));
    core.setAttribute("aria-pressed", String(!labId));
    root.querySelectorAll(".nx-uni-spoke").forEach((s) => s.classList.toggle("is-active", s.dataset.lab === labId));
    map.classList.toggle("has-selection", !!labId);
    const lab = LABS.find((l) => l.id === labId);
    panel.innerHTML = lab ? labPanel(lab) : corePanel();
    panel.style.setProperty("--_hue", lab ? `var(--nx-lab-${lab.id})` : "var(--nx-accent)");
    if (lab && userInitiated) exploreLab(lab.id);
  }

  map.addEventListener("click", (e) => {
    const node = e.target.closest(".nx-uni-node");
    if (node) return select(node.dataset.lab);
    if (e.target.closest("[data-core]")) select(null);
  });

  // arrow keys move (and select) around the ring
  map.addEventListener("keydown", (e) => {
    const i = nodes.indexOf(document.activeElement);
    const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    let next = null;
    if (e.key in keys) next = i < 0 ? 0 : (i + keys[e.key] + nodes.length) % nodes.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = nodes.length - 1;
    if (next === null) return;
    e.preventDefault();
    nodes[next].focus();
    select(nodes[next].dataset.lab);
  });

  // "Show in projects" — from panel or carousel
  root.addEventListener("click", (e) => {
    const b = e.target.closest("[data-filter-lab]");
    if (b) onFilter(b.dataset.filterLab);
  });

  /* carousel: dots ⇄ slides */
  const track = root.querySelector("#uniTrack");
  const dots = [...root.querySelectorAll(".nx-uni-dots button")];
  const slideFor = (id) => track.querySelector(`.nx-uni-slide[data-lab="${id}"]`);
  const setDot = (id) => dots.forEach((d) => d.setAttribute("aria-current", String(d.dataset.goto === id)));

  dots.forEach((d) => d.addEventListener("click", () => {
    const s = slideFor(d.dataset.goto);
    track.scrollTo({ left: s.offsetLeft - track.offsetLeft, behavior: "smooth" });
  }));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      setDot(en.target.dataset.lab);
      if (track.scrollLeft > 0) exploreLab(en.target.dataset.lab); // only once the visitor has swiped
    });
  }, { root: track, threshold: 0.6 });
  track.querySelectorAll(".nx-uni-slide").forEach((s) => io.observe(s));
  setDot(LABS[0].id);

  /* deep links: #lab-security */
  function fromHash() {
    const m = location.hash.match(/^#lab-(.+)$/);
    const lab = m && LABS.find((l) => l.id === m[1]);
    if (!lab) return;
    select(lab.id);
    const s = slideFor(lab.id);
    track.scrollTo({ left: s.offsetLeft - track.offsetLeft });
    document.getElementById("universe").scrollIntoView();
  }
  window.addEventListener("hashchange", fromHash);

  select(null, false);
  fromHash();
  return { select };
}

