/* NEXUS — theme toggle (dark default, persisted, safe if storage is blocked) */
import { icon } from "../ui/icons.js";

const KEY = "nx-theme";
const root = document.documentElement;

export function initTheme(button) {
  const sync = () => {
    const dark = root.dataset.theme !== "light";
    button.innerHTML = icon(dark ? "sun" : "moon", { size: 18 });
    button.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#07080d" : "#f6f7fb");
  };
  button.addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "light" ? "dark" : "light";
    try { localStorage.setItem(KEY, root.dataset.theme); } catch {}
    sync();
  });
  button.addEventListener("nx-theme-sync", sync); // theme changed elsewhere (Command Center)
  sync();
}
