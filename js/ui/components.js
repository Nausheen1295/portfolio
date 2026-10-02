/* ==========================================================================
   NEXUS — reusable render functions (data → HTML strings)
   All dynamic text passes through esc() before reaching the DOM.
   ========================================================================== */
import { STATUS, getLab, projectsInLab } from "../data/projects.js";
import { icon } from "./icons.js";

export function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

export const statusBadge = (status) =>
  `<span class="nx-badge" data-status="${esc(status)}" title="${esc(STATUS[status]?.description)}">${esc(STATUS[status]?.label || status)}</span>`;

export const tags = (items = [], { planned = false } = {}) =>
  items.length
    ? `<div class="nx-tags">${items.map((t) => `<span class="nx-tag">${esc(t)}</span>`).join("")}${
        planned ? `<span class="nx-tag" title="Planned stack — subject to change">planned</span>` : ""}</div>`
    : "";

export function labCard(lab) {
  const projects = projectsInLab(lab.id);
  return `
    <article class="nx-card nx-card--interactive nx-lab" data-lab="${esc(lab.id)}">
      <div class="nx-row" style="justify-content:space-between">
        <span class="nx-lab-icon">${icon(lab.icon)}</span>
        <span class="nx-lab-code">${esc(lab.code)}</span>
      </div>
      <h3><a class="nx-stretch" href="#lab-${esc(lab.id)}" data-open-lab="${esc(lab.id)}">${esc(lab.name)}</a></h3>
      <p>${esc(lab.tagline)}</p>
      <div class="nx-lab-foot">
        <span>${projects.length} project${projects.length === 1 ? "" : "s"}</span>
        <span aria-hidden="true">${icon("arrow", { size: 16 })}</span>
      </div>
    </article>`;
}

export function projectCard(p) {
  const lab = getLab(p.lab);
  const links = [
    p.links.live && `<a href="${esc(p.links.live)}" target="_blank" rel="noopener">Live ↗</a>`,
    p.links.demo && `<a href="${esc(p.links.demo)}">Try it →</a>`,
    p.links.github && `<a href="${esc(p.links.github)}" target="_blank" rel="noopener">GitHub ↗</a>`,
    `<a href="project.html?id=${esc(p.id)}">Case study →</a>`,
  ].filter(Boolean).join("");
  return `
    <article class="nx-card nx-card--interactive nx-project" data-project="${esc(p.id)}">
      <div class="nx-project-top">
        <span class="nx-project-lab">${esc(lab?.name || "")}</span>
        ${statusBadge(p.status)}
      </div>
      <h3><button class="nx-stretch nx-linkbtn" type="button" data-open-project="${esc(p.id)}">${esc(p.name)}</button></h3>
      <p>${esc(p.summary)}</p>
      ${tags(p.technologies.slice(0, 5), { planned: p.technologiesPlanned })}
      <div class="nx-project-links">${links}</div>
    </article>`;
}

export function avatar(profile, size = 280) {
  const inner = profile.avatar
    ? `<img src="${esc(profile.avatar)}" alt="Illustrated avatar of ${esc(profile.name)}" width="${size}" height="${size}" decoding="async">`
    : `<span class="nx-avatar-fallback" role="img" aria-label="${esc(profile.name)}"><span class="nx-grad-text" aria-hidden="true">${esc(profile.initials)}</span></span>`;
  return `<div class="nx-avatar nx-float" style="--_size:${size}px">${inner}</div>`;
}

/** Shared "not documented" placeholder used by case studies and NEXA. */
export const notDocumented = (what = "This information") =>
  `<p class="nx-mute nx-mono" style="font-size:var(--nx-text-sm)">${esc(what)} is not documented yet.</p>`;
