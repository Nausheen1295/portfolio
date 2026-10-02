/* ==========================================================================
   NEXUS — exploration achievements (subtle, local to this browser)
   One per lab, "NEXUS Explorer" for all seven, plus a hidden one.
   Stored in localStorage; announced with a small, polite notification.
   ========================================================================== */
import { LABS } from "../data/projects.js";

const KEY = "nx-achievements";

export const ACHIEVEMENTS = [
  ...LABS.map((l) => ({ id: `lab:${l.id}`, title: `${l.name.replace(" Lab", "")} Explorer`, hint: `Explore the ${l.name}`, hue: `var(--nx-lab-${l.id})` })),
  { id: "nexus", title: "NEXUS Explorer", hint: "Explore all seven labs", hue: "var(--nx-accent)" },
  { id: "secret", title: "Signal Found", hint: "Hidden", hue: "var(--nx-violet)", hidden: true },
];

const read = () => { try { return new Set(JSON.parse(localStorage.getItem(KEY)) || []); } catch { return new Set(); } };
const write = (set) => { try { localStorage.setItem(KEY, JSON.stringify([...set])); } catch {} };

export const unlocked = () => read();
export const labProgress = () => LABS.filter((l) => read().has(`lab:${l.id}`)).length;

export function unlock(id) {
  const set = read();
  if (set.has(id)) return false;
  set.add(id);
  write(set);
  const a = ACHIEVEMENTS.find((x) => x.id === id);
  if (a) announce(a);
  return true;
}

/** Call whenever a visitor genuinely explores a lab (selects it, reads a case study…). */
export function exploreLab(labId) {
  if (!LABS.some((l) => l.id === labId)) return;
  if (unlock(`lab:${labId}`) && LABS.every((l) => read().has(`lab:${l.id}`))) {
    setTimeout(() => unlock("nexus"), 1600);
  }
}

/* ---------- notification ---------- */
let region;
function announce(a) {
  if (!region) {
    region = document.createElement("div");
    region.className = "nx-achv-region";
    region.setAttribute("role", "status");
    region.setAttribute("aria-live", "polite");
    document.body.append(region);
  }
  const el = document.createElement("div");
  el.className = "nx-achv";
  el.style.setProperty("--_hue", a.hue);
  el.innerHTML = `<span class="nx-achv-dot" aria-hidden="true"></span><span><small>Achievement</small><strong></strong></span>`;
  el.querySelector("strong").textContent = a.title;
  region.append(el);
  requestAnimationFrame(() => el.classList.add("is-in"));
  setTimeout(() => { el.classList.remove("is-in"); setTimeout(() => el.remove(), 400); }, 3200);
}
