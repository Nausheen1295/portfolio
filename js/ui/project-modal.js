/* ==========================================================================
   NEXUS — project quick view (native <dialog>)
   Renders only documented fields. Undocumented fields are omitted and the
   dialog says so — it never fills gaps with invented detail.
   ========================================================================== */
import { getProject, getLab, STATUS } from "../data/projects.js";
import { esc, statusBadge, tags } from "./components.js";

const list = (items) => `<ul>${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;
const block = (title, html) => (html ? `<section><h3>${esc(title)}</h3>${html}</section>` : "");

export function initProjectModal() {
  const dialog = document.getElementById("projectModal");
  const body = document.getElementById("pmBody");

  function open(id) {
    const p = getProject(id);
    if (!p) return;
    const lab = getLab(p.lab);
    document.getElementById("pmLab").textContent = `${lab?.code ?? ""} · ${lab?.name ?? ""}`;
    document.getElementById("pmTitle").textContent = p.name;

    const isPlan = p.status === "concept" || p.status === "in-development";
    const undocumented = [!p.role && "my role", !p.challenges.length && "challenges", !p.decisions.length && "engineering decisions",
      !p.results && "results"].filter(Boolean);

    const links = [
      p.links.live && `<a class="nx-btn nx-btn--primary" href="${esc(p.links.live)}" target="_blank" rel="noopener">Live demo ↗</a>`,
      p.links.demo && `<a class="nx-btn nx-btn--primary" href="${esc(p.links.demo)}">Try it →</a>`,
      p.links.github && `<a class="nx-btn" href="${esc(p.links.github)}" target="_blank" rel="noopener">GitHub ↗</a>`,
      `<a class="nx-btn" href="project.html?id=${esc(p.id)}">Full case study →</a>`,
    ].filter(Boolean).join("");

    body.innerHTML = `
      <div class="nx-pm">
        <div class="nx-stack">
          <div class="nx-row">${statusBadge(p.status)}<span class="nx-mute" style="font-size:var(--nx-text-sm)">${esc(STATUS[p.status]?.description)}</span></div>
          <p class="nx-pm-lead">${esc(p.summary)}</p>
          <div class="nx-row">${links}</div>
        </div>
        ${isPlan ? `<div class="nx-notice"><span aria-hidden="true">ⓘ</span><span><strong>This project hasn't been built yet.</strong>
          Features and stack below are the plan, and will be updated with real details as development happens.</span></div>` : ""}
        ${block("Problem", p.problem && `<p class="nx-soft">${esc(p.problem)}</p>`)}
        ${block("Solution", p.solution && `<p class="nx-soft">${esc(p.solution)}</p>`)}
        ${block(isPlan ? "Planned features" : "Features", p.features.length && list(p.features))}
        ${block(p.technologiesPlanned ? "Planned technologies" : "Technologies", p.technologies.length && tags(p.technologies))}
        ${block("AI components", p.aiCapabilities.length && list(p.aiCapabilities))}
        ${block("Security", p.security.length && list(p.security))}
        ${block("Architecture", p.architecture && `<ol style="padding-left:1.2em;display:grid;gap:8px;color:var(--nx-text-soft);font-size:var(--nx-text-sm)">${
          p.architecture.nodes.map((n) => `<li><strong style="color:var(--nx-text)">${esc(n.label)}</strong> — ${esc(n.detail)}</li>`).join("")}</ol>`)}
        ${!isPlan && undocumented.length ? `<p class="nx-mute nx-mono" style="font-size:var(--nx-text-xs)">Not documented yet: ${esc(undocumented.join(", "))}.</p>` : ""}
        ${p.sources.length ? `<p class="nx-mute" style="font-size:var(--nx-text-xs)">Source: ${p.sources.map((s) =>
          `<a href="${esc(s)}" target="_blank" rel="noopener" style="text-decoration:underline">${esc(s.replace("https://", ""))}</a>`).join(", ")}</p>` : ""}
      </div>`;

    if (!dialog.open) dialog.showModal();
    body.scrollTop = 0;
    history.replaceState(null, "", `#project-${p.id}`);
  }

  dialog.addEventListener("click", (e) => {
    if (e.target === dialog || e.target.closest("[data-close]")) dialog.close();
  });
  dialog.addEventListener("close", () => {
    if (location.hash.startsWith("#project-")) history.replaceState(null, "", location.pathname + location.search);
  });

  // any element with data-open-project="<id>" opens the quick view
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-open-project]");
    if (!t) return;
    e.preventDefault();
    open(t.dataset.openProject);
  });

  // deep link: #project-securevault-ai
  const m = location.hash.match(/^#project-(.+)$/);
  if (m) open(m[1]);

  return { open };
}
