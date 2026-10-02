/* NEXUS — navigation: scrolled state, mobile menu, scroll-spy */
import { icon } from "../ui/icons.js";

export function initNav() {
  const nav = document.getElementById("nav");
  const links = document.getElementById("navLinks");
  const toggle = document.getElementById("navToggle");

  // scrolled state
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 24);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // mobile menu
  const setOpen = (open) => {
    links.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    toggle.innerHTML = icon(open ? "close" : "menu", { size: 18 });
  };
  toggle.addEventListener("click", () => setOpen(!links.classList.contains("is-open")));
  links.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && links.classList.contains("is-open")) { setOpen(false); toggle.focus(); }
  });
  // composedPath() is captured at dispatch time, so it still works when the clicked
  // icon has been replaced inside the toggle (a detached target would look "outside").
  document.addEventListener("click", (e) => {
    const path = e.composedPath();
    if (links.classList.contains("is-open") && !path.includes(links) && !path.includes(toggle)) setOpen(false);
  });
  setOpen(false);

  // scroll-spy: mark the link of the section currently in view
  const anchors = [...links.querySelectorAll('a[href^="#"]')];
  const byId = new Map(anchors.map((a) => [a.getAttribute("href").slice(1), a]));
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      anchors.forEach((a) => a.removeAttribute("aria-current"));
      byId.get(entry.target.id)?.setAttribute("aria-current", "true");
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  byId.forEach((_, id) => { const sec = document.getElementById(id); if (sec) spy.observe(sec); });
}
