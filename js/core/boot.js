/* ==========================================================================
   NEXUS — boot sequence
   Runs once per browser session, ~2.5s, skippable by click, key or button.
   Skipped entirely for reduced-motion users or deep links (decided in the
   inline <head> script, which adds .nx-booting to <html>).
   ========================================================================== */

const root = document.documentElement;

export function runBoot({ projectCount, labCount }) {
  const boot = document.getElementById("boot");
  if (!root.classList.contains("nx-booting") || !boot) return;

  const log = document.getElementById("bootLog");
  const bar = document.getElementById("bootBar");
  // The first line ("INITIALIZING NEXUS…") is static HTML so it paints instantly.
  const steps = [
    { text: "Loading AI Core", ok: "OK", at: 250 },
    { text: "Loading Knowledge Engine", ok: "OK", at: 500 },
    { text: `Mapping ${labCount} research labs`, ok: "OK", at: 750 },
    { text: "Scanning projects", ok: `${projectCount} found`, at: 1000 },
    { text: "NEXUS ONLINE", cls: "is-online", at: 1350 },
    { text: "Welcome to NEXUS Universe.", cls: "is-welcome", at: 1650 },
  ];

  const timers = [];
  let finished = false;

  steps.forEach((s, i) => {
    timers.push(setTimeout(() => {
      const li = document.createElement("li");
      if (s.cls) li.className = s.cls;
      li.textContent = s.text;
      if (s.ok) {
        const ok = document.createElement("span");
        ok.className = "ok";
        ok.textContent = s.ok;
        li.append(ok);
      }
      log.append(li);
      bar.style.width = `${((i + 1) / steps.length) * 100}%`;
    }, s.at));
  });
  timers.push(setTimeout(finish, 2300));

  function finish() {
    if (finished) return;
    finished = true;
    timers.forEach(clearTimeout);
    try { sessionStorage.setItem("nx-booted", "1"); } catch {}
    boot.classList.add("is-done");
    setTimeout(() => root.classList.remove("nx-booting"), 500);
    window.removeEventListener("keydown", finish);
  }

  document.getElementById("bootSkip").addEventListener("click", finish);
  boot.addEventListener("click", finish);
  window.addEventListener("keydown", finish);
}
