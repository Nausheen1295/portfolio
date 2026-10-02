/* NEXUS — toast notification (announced politely to screen readers) */
let timer;
export function toast(message, ms = 2800) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = message;
  el.classList.add("is-visible");
  clearTimeout(timer);
  timer = setTimeout(() => el.classList.remove("is-visible"), ms);
}
