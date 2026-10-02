/* ==========================================================================
   NEXUS — interactive architecture diagram
   Nodes are grouped into layers (top → bottom). Connections are drawn as
   SVG curves measured from the real DOM, and redrawn on resize.
   Selecting a node shows its explanation and highlights its connections.
   ========================================================================== */
import { LAYERS } from "../data/projects.js";
import { esc } from "./components.js";

let uid = 0;

export function renderArchitecture(container, architecture, { planned = false } = {}) {
  const { nodes, flow } = architecture;
  const id = `arch${++uid}`;
  const layers = LAYERS.filter((l) => nodes.some((n) => n.layer === l.id));
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const neighbours = (nid) => flow.filter(([a, b]) => a === nid || b === nid).map(([a, b]) => (a === nid ? b : a));

  container.innerHTML = `
    <div class="nx-arch${planned ? " is-planned" : ""}">
      <div class="nx-arch-diagram" role="group" aria-label="Architecture diagram — select a component to learn more">
        <svg class="nx-arch-edges" aria-hidden="true">
          <defs>
            <marker id="${id}-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0L10 5L0 10z" fill="currentColor"/>
            </marker>
          </defs>
          <g class="nx-arch-paths"></g>
        </svg>
        ${layers.map((l) => `
          <div class="nx-arch-layer">
            <span class="nx-arch-layer-label">${esc(l.label)}</span>
            <div class="nx-arch-row">
              ${nodes.filter((n) => n.layer === l.id).map((n) =>
                `<button type="button" class="nx-arch-node" data-node="${esc(n.id)}" aria-pressed="false">${esc(n.label)}</button>`).join("")}
            </div>
          </div>`).join("")}
      </div>
      <div class="nx-arch-detail" aria-live="polite"></div>
    </div>`;

  const diagram = container.querySelector(".nx-arch-diagram");
  const svg = container.querySelector(".nx-arch-edges");
  const group = container.querySelector(".nx-arch-paths");
  const detail = container.querySelector(".nx-arch-detail");
  const buttons = new Map([...container.querySelectorAll(".nx-arch-node")].map((b) => [b.dataset.node, b]));
  let selected = nodes[0].id;

  function draw() {
    const box = diagram.getBoundingClientRect();
    svg.setAttribute("viewBox", `0 0 ${box.width} ${box.height}`);
    group.innerHTML = flow.map(([from, to]) => {
      const a = buttons.get(from)?.getBoundingClientRect();
      const b = buttons.get(to)?.getBoundingClientRect();
      if (!a || !b) return "";
      const ax = a.left + a.width / 2 - box.left, bx = b.left + b.width / 2 - box.left;
      let d;
      if (Math.abs(a.top - b.top) < 4) {
        // same row: connect side to side
        const left = ax < bx;
        const x1 = (left ? a.right : a.left) - box.left, x2 = (left ? b.left : b.right) - box.left;
        const y = a.top + a.height / 2 - box.top;
        d = `M${x1},${y} L${x2},${y}`;
      } else {
        const down = b.top > a.top;
        const y1 = (down ? a.bottom : a.top) - box.top, y2 = (down ? b.top : b.bottom) - box.top;
        const mid = (y1 + y2) / 2;
        d = `M${ax},${y1} C${ax},${mid} ${bx},${mid} ${bx},${y2}`;
      }
      return `<path d="${d}" data-from="${esc(from)}" data-to="${esc(to)}" marker-end="url(#${id}-arrow)"/>`;
    }).join("");
    highlight();
  }

  function highlight() {
    group.querySelectorAll("path").forEach((p) =>
      p.classList.toggle("is-active", p.dataset.from === selected || p.dataset.to === selected));
    const linked = new Set(neighbours(selected));
    buttons.forEach((b, nid) => {
      b.setAttribute("aria-pressed", String(nid === selected));
      b.classList.toggle("is-linked", linked.has(nid));
    });
  }

  function select(nid) {
    selected = nid;
    const n = byId.get(nid);
    const layer = LAYERS.find((l) => l.id === n.layer);
    const links = neighbours(nid).map((x) =>
      `<button type="button" class="nx-tag" data-goto="${esc(x)}">${esc(byId.get(x).label)}</button>`).join("");
    detail.innerHTML = `
      <span class="nx-arch-detail-layer">${esc(layer?.label)}</span>
      <h3 class="nx-arch-detail-title">${esc(n.label)}</h3>
      <p>${esc(n.detail)}</p>
      ${links ? `<div class="nx-arch-detail-links"><span>Connects to</span><div class="nx-tags">${links}</div></div>` : ""}`;
    highlight();
  }

  diagram.addEventListener("click", (e) => {
    const b = e.target.closest(".nx-arch-node");
    if (b) select(b.dataset.node);
  });
  detail.addEventListener("click", (e) => {
    const b = e.target.closest("[data-goto]");
    if (!b) return;
    select(b.dataset.goto);
    buttons.get(b.dataset.goto)?.focus();
  });

  new ResizeObserver(draw).observe(diagram);
  document.fonts?.ready.then(draw); // node widths change once web fonts load
  select(selected);
  draw();
}
