/* ==========================================================================
   NEXUS — Engineering Journey
   A stage rail (ARIA tabs) + "follow a project" selector + evidence panel.
   Evidence comes only from documented timeline entries in projects.js.
   ========================================================================== */
import { JOURNEY_STAGES, PROJECTS } from "../data/projects.js";
import { esc, statusBadge } from "../ui/components.js";
import { icon } from "../ui/icons.js";

const ARTIFACT_ICON = { repo: "github", demo: "external", wireframe: "pen", screenshot: "file", doc: "file", decision: "file", commit: "code" };

export function initJourney(root) {
  const tracked = PROJECTS.filter((p) => p.timeline.length);
  let stage = JOURNEY_STAGES[0].id;
  let projectId = "all";

  root.innerHTML = `
    <div class="nx-jr-follow" role="group" aria-label="Follow a project">
      <span class="nx-jr-follow-label">Follow</span>
      <div class="nx-filter" style="margin:0">
        <button type="button" data-follow="all" aria-pressed="true">All projects</button>
        ${tracked.map((p) => `<button type="button" data-follow="${esc(p.id)}" aria-pressed="false">${esc(p.name)}</button>`).join("")}
      </div>
    </div>

    <div class="nx-jr-rail" role="tablist" aria-label="Engineering stages">
      ${JOURNEY_STAGES.map((s, i) => `
        <button type="button" role="tab" class="nx-jr-stage" id="jr-tab-${s.id}" data-stage="${s.id}"
                aria-controls="jrPanel" aria-selected="false" tabindex="-1">
          <span class="nx-jr-num">${String(i + 1).padStart(2, "0")}</span>
          <span class="nx-jr-dot" aria-hidden="true"><span class="nx-jr-count"></span></span>
          <span class="nx-jr-label">${esc(s.label)}</span>
        </button>`).join("")}
    </div>

    <div class="nx-card nx-jr-panel" id="jrPanel" role="tabpanel" tabindex="0"></div>`;

  const rail = root.querySelector(".nx-jr-rail");
  const tabs = [...rail.querySelectorAll('[role="tab"]')];
  const panel = root.querySelector("#jrPanel");
  const follow = root.querySelector(".nx-jr-follow");

  const entriesAt = (stageId) =>
    (projectId === "all" ? tracked : tracked.filter((p) => p.id === projectId))
      .flatMap((p) => p.timeline.filter((t) => t.stage === stageId).map((t) => ({ project: p, entry: t })));

  function render() {
    // rail state
    tabs.forEach((tab) => {
      const n = entriesAt(tab.dataset.stage).length;
      const on = tab.dataset.stage === stage;
      tab.setAttribute("aria-selected", String(on));
      tab.tabIndex = on ? 0 : -1;
      tab.classList.toggle("is-documented", n > 0);
      tab.querySelector(".nx-jr-count").textContent = projectId === "all" && n ? n : "";
      tab.setAttribute("aria-label", `${tab.querySelector(".nx-jr-label").textContent}: ${n ? `${n} documented` : "nothing documented yet"}`);
    });
    panel.setAttribute("aria-labelledby", `jr-tab-${stage}`);

    // panel
    const i = JOURNEY_STAGES.findIndex((s) => s.id === stage);
    const s = JOURNEY_STAGES[i];
    const items = entriesAt(stage);
    const followed = tracked.find((p) => p.id === projectId);

    panel.innerHTML = `
      <div class="nx-jr-panel-head">
        <span class="nx-jr-step">Stage ${String(i + 1).padStart(2, "0")} / ${String(JOURNEY_STAGES.length).padStart(2, "0")}</span>
        <h3>${esc(s.label)}</h3>
        <p class="nx-soft">${esc(s.summary)}</p>
      </div>
      <div class="nx-jr-evidence">
        <h4>Evidence${followed ? ` · ${esc(followed.name)}` : ""}</h4>
        ${items.length ? `<ul>${items.map(({ project: p, entry: e }) => `
          <li class="nx-jr-item" style="--_hue:var(--nx-lab-${esc(p.lab)})">
            <div class="nx-jr-item-top">
              <a href="project.html?id=${esc(p.id)}#timeline"><strong>${esc(p.name)}</strong></a>
              ${statusBadge(p.status)}
            </div>
            <p>${esc(e.note)}</p>
            ${e.date ? `<span class="nx-jr-date">${esc(e.date)}</span>` : ""}
            ${e.artifacts?.length ? `<div class="nx-jr-artifacts">${e.artifacts.map((a) => {
              const external = /^https?:/.test(a.url);
              return `<a class="nx-tag" href="${esc(a.url)}"${external ? ' target="_blank" rel="noopener"' : ""}>${icon(ARTIFACT_ICON[a.type] || "file", { size: 14 })} ${esc(a.label)}</a>`;
            }).join("")}</div>` : ""}
          </li>`).join("")}</ul>`
        : `<p class="nx-jr-empty">${followed
            ? `This stage isn't documented for ${esc(followed.name)} yet.`
            : "No project has documented this stage yet — wireframes, decisions and milestones will appear here as they're written up."}</p>`}
      </div>`;
  }

  function selectStage(id, focus = false) {
    stage = id;
    render();
    if (focus) tabs.find((t) => t.dataset.stage === id)?.focus();
  }

  rail.addEventListener("click", (e) => {
    const tab = e.target.closest('[role="tab"]');
    if (tab) selectStage(tab.dataset.stage);
  });
  rail.addEventListener("keydown", (e) => {
    const i = tabs.findIndex((t) => t.dataset.stage === stage);
    const map = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: tabs.length - 1 };
    if (!(e.key in map)) return;
    e.preventDefault();
    const next = (map[e.key] + tabs.length) % tabs.length;
    selectStage(tabs[next].dataset.stage, true);
  });

  follow.addEventListener("click", (e) => {
    const b = e.target.closest("[data-follow]");
    if (!b) return;
    projectId = b.dataset.follow;
    follow.querySelectorAll("[data-follow]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    // jump to the furthest documented stage of the followed project
    const p = tracked.find((x) => x.id === projectId);
    if (p) {
      const furthest = Math.max(...p.timeline.map((t) => JOURNEY_STAGES.findIndex((s) => s.id === t.stage)));
      stage = JOURNEY_STAGES[furthest].id;
    }
    render();
  });

  render();
}

