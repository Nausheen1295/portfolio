/* ==========================================================================
   NEXUS — Command Center  (⌘K / Ctrl+K / "/")
   One input, two modes:
     • search    — projects, labs, skills and sections (deterministic, local)
     • > command — "open security lab", "explain securevault", "start interview"…
   Works on every page: actions that need the home page navigate there.
   Accessible combobox: arrow keys move, Enter runs, Esc closes.
   ========================================================================== */
import { LABS, PROJECTS, STATUS, getLab } from "../data/projects.js";
import { SKILL_GROUPS, PROFILE } from "../data/profile.js";
import { CERTIFICATIONS, formatMonth } from "../data/certificates.js";
import { searchProjects } from "./search.js";
import { esc } from "../ui/components.js";
import { icon } from "../ui/icons.js";
import { ACHIEVEMENTS, unlocked, unlock, labProgress } from "./achievements.js";

const PENDING_ASK = "nx-pending-ask";
const onHome = () => !!document.getElementById("universe");
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim();
const short = (p) => norm(p.name).replace(/\s+ai$/, "");          // "securevault ai" → "securevault"
const labWord = (l) => norm(l.name).replace(/\s+lab$/, "");       // "security lab" → "security"

/**
 * @param {{nexa?: {ask: Function, setMode: Function, focus: Function},
 *          projects?: {show: Function}, universe?: {select: Function}}} ctx  home-page hooks (optional)
 */
export function initCommandCenter(ctx = {}) {
  /* ---------------- navigation helpers ---------------- */
  function go(hash) {
    close();
    if (onHome() && document.querySelector(hash)) {
      document.querySelector(hash).scrollIntoView({ behavior: "smooth" });
      history.replaceState(null, "", hash);
    } else {
      location.href = `index.html${hash}`;
    }
  }
  function openLab(lab) {
    close();
    if (onHome() && ctx.universe) {
      ctx.universe.select(lab.id);
      document.getElementById("universe").scrollIntoView({ behavior: "smooth" });
    } else {
      location.href = `index.html#lab-${lab.id}`;
    }
  }
  function askNexa(question, opts = {}) {
    close();
    if (ctx.nexa) { ctx.nexa.ask(question, opts); return; }
    try { sessionStorage.setItem(PENDING_ASK, JSON.stringify({ question, ...opts })); } catch {}
    location.href = "index.html#nexa";
  }
  function startInterview() {
    close();
    if (ctx.nexa) {
      ctx.nexa.setMode("interview");
      document.getElementById("nexa").scrollIntoView({ behavior: "smooth" });
      setTimeout(() => ctx.nexa.focus(), 500);
    } else {
      try { sessionStorage.setItem(PENDING_ASK, JSON.stringify({ mode: "interview" })); } catch {}
      location.href = "index.html#nexa";
    }
  }
  function setTheme(t) {
    const root = document.documentElement;
    const next = t === "toggle" ? (root.dataset.theme === "light" ? "dark" : "light") : t;
    root.dataset.theme = next;
    try { localStorage.setItem("nx-theme", next); } catch {}
    document.getElementById("themeBtn")?.dispatchEvent(new Event("nx-theme-sync"));
    return `Theme set to ${next}.`;
  }

  /* ---------------- command registry ---------------- */
  const COMMANDS = [
    { cmd: "meet nexa", desc: "Open the NEXA assistant", run: () => { go("#nexa"); setTimeout(() => ctx.nexa?.focus(), 500); } },
    { cmd: "start interview", desc: "Interview NEXA about the portfolio", run: startInterview },
    { cmd: "show engineering journey", desc: "Idea → iteration, with evidence", run: () => go("#journey") },
    { cmd: "show universe", desc: "The lab map", run: () => go("#universe") },
    { cmd: "show certifications", desc: `${CERTIFICATIONS.length} certifications`, run: () => go("#certifications") },
    { cmd: "show products", desc: "Products I sell — planned", run: () => go("#store") },
    ...LABS.map((l) => ({ cmd: `open ${labWord(l)} lab`, desc: l.tagline, run: () => openLab(l) })),
    ...PROJECTS.map((p) => ({ cmd: `open ${short(p)}`, desc: `${p.name} case study`, run: () => { close(); location.href = `project.html?id=${p.id}`; } })),
    ...PROJECTS.map((p) => ({ cmd: `explain ${short(p)}`, desc: `Ask NEXA about ${p.name}`,
      run: () => askNexa(`Explain ${p.name}`, { mode: "recruiter", projectId: p.id }) })),
    ...LABS.filter((l) => l.id !== "ai" && PROJECTS.some((p) => p.lab === l.id)).map((l) => ({
      cmd: `show ${labWord(l)} projects`, desc: `Filter projects to the ${l.name}`,
      run: () => { if (ctx.projects) { ctx.projects.show(l.id); go("#projects"); } else location.href = `index.html#lab-${l.id}`; } })),
    { cmd: "show ai projects", desc: "Every project with AI components", run: () => setQuery("ai") },
    { cmd: "download resume", desc: "Résumé (PDF)", run: () => { close(); const a = document.createElement("a"); a.href = PROFILE.links.resume; a.download = ""; a.click(); } },
    { cmd: "contact", desc: "Email, LinkedIn, GitHub", run: () => go("#contact") },
    { cmd: "theme dark", desc: "Dark theme", run: () => setTheme("dark") },
    { cmd: "theme light", desc: "Light theme", run: () => setTheme("light") },
    { cmd: "achievements", desc: "Your exploration progress", run: showAchievements },
    { cmd: "help", desc: "List commands", run: showHelp },
    { cmd: "clear", desc: "Clear the output", run: () => { output.innerHTML = ""; } },
  ];
  // Hidden commands — not listed, but they work.
  const SECRET = {
    "sudo hire nausheen": () => { unlock("secret"); go("#contact"); return null; },
    "whoami": () => "visitor@nexus — curious, clearly. Try “> achievements”.",
    "nexa status": () => "NEXA backend: not connected. Documentation search mode is active — answers are never invented.",
    "lab-00": () => { unlock("secret"); return "LAB-00 · Sandbox. Where ideas are tried before they earn a lab. Nothing to see here… yet."; },
  };

  /* ---------------- dialog ---------------- */
  const dialog = document.createElement("dialog");
  dialog.className = "nx-cmd";
  dialog.setAttribute("aria-label", "Command Center");
  dialog.innerHTML = `
    <div class="nx-cmd-head">
      <span class="nx-cmd-icon" aria-hidden="true">${icon("search", { size: 18 })}</span>
      <input class="nx-cmd-input" type="text" role="combobox" aria-expanded="true" aria-controls="nxCmdList"
             aria-autocomplete="list" autocomplete="off" spellcheck="false"
             placeholder="Search projects, skills, labs…  or type > for commands" aria-label="Search or run a command" />
      <kbd class="nx-cmd-esc">Esc</kbd>
    </div>
    <div class="nx-cmd-output" aria-live="polite"></div>
    <ul class="nx-cmd-list" id="nxCmdList" role="listbox" aria-label="Results"></ul>
    <div class="nx-cmd-foot">
      <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span><span><kbd>↵</kbd> open</span><span><kbd>&gt;</kbd> commands</span>
      <span class="nx-cmd-progress"></span>
    </div>`;
  document.body.append(dialog);

  const input = dialog.querySelector(".nx-cmd-input");
  const list = dialog.querySelector(".nx-cmd-list");
  const output = dialog.querySelector(".nx-cmd-output");
  const iconEl = dialog.querySelector(".nx-cmd-icon");
  let items = [];
  let active = 0;

  function open(prefill = "") {
    if (!dialog.open) dialog.showModal();
    input.value = prefill;
    output.innerHTML = "";
    render();
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  }
  function close() { if (dialog.open) dialog.close(); }
  function setQuery(q) { input.value = q; output.innerHTML = ""; render(); input.focus(); }

  /* ---------------- result building ---------------- */
  const item = (group, label, hint, run, extra = {}) => ({ group, label, hint, run, ...extra });

  function searchItems(q) {
    if (!q) {
      return [
        item("Quick actions", "Explore the Universe", "Lab map", () => go("#universe"), { icon: "globe" }),
        item("Quick actions", "Meet NEXA", "AI assistant", COMMANDS[0].run, { icon: "cpu" }),
        item("Quick actions", "Start an interview", "Ask interview questions", startInterview, { icon: "terminal" }),
        item("Quick actions", "Engineering Journey", "Idea → iteration", () => go("#journey"), { icon: "chart" }),
        item("Quick actions", "Download résumé", "PDF", COMMANDS.find((c) => c.cmd === "download resume").run, { icon: "file" }),
        item("Quick actions", "Contact", "Email · LinkedIn · GitHub", () => go("#contact"), { icon: "mail" }),
      ];
    }
    const nq = norm(q);
    const out = [];
    // Certifications: an exact title/issuer match outranks fuzzy project matches ("LinkedIn Learning").
    const certHits = CERTIFICATIONS
      .filter((c) => norm(`${c.title} ${c.issuer} ${c.topics.join(" ")} certification certificate certified`).includes(nq))
      .map((c) => item("Certifications", c.title, `${c.issuer} · ${formatMonth(c.date)}`, () => go(`#cert-${c.id}`), { icon: "award" }));
    const strongCert = CERTIFICATIONS.some((c) => norm(`${c.title} ${c.issuer}`).includes(nq));
    if (strongCert) out.push(...certHits);
    for (const { project: p } of searchProjects(q, { limit: 6 })) {
      out.push(item("Projects", p.name, `${STATUS[p.status].label} · ${getLab(p.lab).name}`,
        () => { close(); location.href = `project.html?id=${p.id}`; }, { icon: getLab(p.lab).icon, hue: `var(--nx-lab-${p.lab})` }));
    }
    for (const l of LABS) {
      if (norm(`${l.name} ${l.code} ${l.tagline}`).includes(nq)) {
        out.push(item("Labs", l.name, l.code, () => openLab(l), { icon: l.icon, hue: `var(--nx-lab-${l.id})` }));
      }
    }
    if (!strongCert) out.push(...certHits);
    const skills = SKILL_GROUPS.flatMap((g) => g.items.filter((s) => norm(s).includes(nq)).map((s) => ({ s, g })));
    for (const { s, g } of skills.slice(0, 4)) {
      out.push(item("Skills", s, g.name, () => go("#skills"), { icon: g.icon }));
    }
    const sections = [["Universe", "#universe"], ["Projects", "#projects"], ["Engineering Journey", "#journey"], ["NEXA", "#nexa"],
      ["About", "#about"], ["Certifications", "#certifications"], ["Skills", "#skills"], ["Capabilities", "#capabilities"], ["Products I sell", "#store"], ["Journal", "#journal"], ["Contact", "#contact"]];
    for (const [name, hash] of sections) if (norm(name).includes(nq)) out.push(item("Sections", name, "Jump to section", () => go(hash), { icon: "arrow" }));
    for (const c of COMMANDS) if (c.cmd.includes(nq) && out.length < 14) out.push(item("Commands", `> ${c.cmd}`, c.desc, c.run, { icon: "terminal" }));
    return out;
  }

  function commandItems(text) {
    const t = norm(text);
    const matches = COMMANDS.filter((c) => !t || c.cmd.includes(t) || t.split(" ").every((w) => c.cmd.includes(w)));
    return matches.slice(0, 12).map((c) => item("Commands", `> ${c.cmd}`, c.desc, c.run, { icon: "terminal" }));
  }

  function render() {
    const raw = input.value;
    const isCmd = raw.trimStart().startsWith(">");
    dialog.classList.toggle("is-command", isCmd);
    iconEl.innerHTML = icon(isCmd ? "terminal" : "search", { size: 18 });
    items = isCmd ? commandItems(raw.replace(/^\s*>/, "")) : searchItems(raw.trim());
    active = 0;

    if (!items.length) {
      list.innerHTML = `<li class="nx-cmd-empty" role="presentation">${isCmd
        ? "No matching command — press Enter to run it anyway, or type “> help”."
        : `Nothing found for “${esc(raw.trim())}”. Try a technology, a lab, or “> help”.`}</li>`;
    } else {
      let last = "";
      list.innerHTML = items.map((it, i) => {
        const head = it.group !== last ? `<li class="nx-cmd-group" role="presentation">${esc(it.group)}</li>` : "";
        last = it.group;
        return `${head}<li class="nx-cmd-item" role="option" id="nxCmdOpt${i}" data-i="${i}" aria-selected="false"${it.hue ? ` style="--_hue:${it.hue}"` : ""}>
          <span class="nx-cmd-item-icon" aria-hidden="true">${icon(it.icon || "arrow", { size: 16 })}</span>
          <span class="nx-cmd-item-label">${esc(it.label)}</span>
          <span class="nx-cmd-item-hint">${esc(it.hint || "")}</span>
        </li>`;
      }).join("");
    }
    highlight();
    dialog.querySelector(".nx-cmd-progress").textContent = `Explored ${labProgress()}/${LABS.length} labs`;
  }

  function highlight() {
    list.querySelectorAll(".nx-cmd-item").forEach((el) => {
      const on = +el.dataset.i === active;
      el.setAttribute("aria-selected", String(on));
      if (on) el.scrollIntoView({ block: "nearest" });
    });
    input.setAttribute("aria-activedescendant", items.length ? `nxCmdOpt${active}` : "");
  }

  function print(lines) {
    if (lines == null) return;
    output.innerHTML = (Array.isArray(lines) ? lines : [lines]).map((l) => `<p>${l}</p>`).join("");
  }

  function runActive() {
    const raw = input.value.trim();
    const isCmd = raw.startsWith(">");
    const t = norm(raw.replace(/^>/, ""));
    // exact (incl. hidden) commands win over the highlighted suggestion
    if (isCmd && SECRET[t]) { print(esc(SECRET[t]() ?? "")); input.value = "> "; render(); return; }
    const exact = isCmd && COMMANDS.find((c) => c.cmd === t);
    const chosen = exact || items[active];
    if (chosen) {
      const result = (exact ? exact.run : chosen.run)();
      if (typeof result === "string") print(esc(result));
      return;
    }
    if (isCmd && t) print(`Unknown command “${esc(t)}”. Type <code>&gt; help</code> to see what NEXUS understands.`);
  }

  function showHelp() {
    print([
      "<strong>Commands</strong> — type them after <code>&gt;</code>:",
      "<code>open &lt;lab&gt; lab</code> · <code>open &lt;project&gt;</code> · <code>explain &lt;project&gt;</code>",
      "<code>show &lt;lab&gt; projects</code> · <code>show ai projects</code> · <code>show engineering journey</code>",
      "<code>meet nexa</code> · <code>start interview</code> · <code>download resume</code> · <code>contact</code>",
      "<code>show certifications</code> · <code>show products</code>",
      "<code>theme dark</code> / <code>theme light</code> · <code>achievements</code> · <code>clear</code>",
      "Without <code>&gt;</code>, just type to search projects, skills and labs.",
    ]);
    return null;
  }

  function showAchievements() {
    const got = unlocked();
    const shown = ACHIEVEMENTS.filter((a) => !a.hidden || got.has(a.id));
    print([`<strong>Exploration</strong> — ${labProgress()}/${LABS.length} labs explored`,
      ...shown.map((a) => `<span class="nx-cmd-ach${got.has(a.id) ? " is-on" : ""}" style="--_hue:${a.hue}">${got.has(a.id) ? "●" : "○"} ${esc(a.title)}</span> <span class="nx-mute">${esc(a.hint)}</span>`)]);
    return null;
  }

  /* ---------------- events ---------------- */
  input.addEventListener("input", () => { output.innerHTML = ""; render(); });
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" && items.length) { e.preventDefault(); active = (active + 1) % items.length; highlight(); }
    else if (e.key === "ArrowUp" && items.length) { e.preventDefault(); active = (active - 1 + items.length) % items.length; highlight(); }
    else if (e.key === "Enter") { e.preventDefault(); runActive(); }
  });
  list.addEventListener("click", (e) => {
    const li = e.target.closest(".nx-cmd-item");
    if (!li) return;
    active = +li.dataset.i;
    const r = items[active].run();
    if (typeof r === "string") print(esc(r));
  });
  list.addEventListener("mousemove", (e) => {
    const li = e.target.closest(".nx-cmd-item");
    if (li && +li.dataset.i !== active) { active = +li.dataset.i; highlight(); }
  });
  dialog.addEventListener("click", (e) => { if (e.target === dialog) close(); });

  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-cmd-open]");
    if (t) { e.preventDefault(); open(t.dataset.cmdOpen || ""); }
  });

  // Focus can linger on our own input after the dialog closes — that doesn't count as typing.
  const typing = (el) => el && !dialog.contains(el) && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
  const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
  let k = 0;
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      dialog.open ? close() : open();
      return;
    }
    if (e.key === "/" && !dialog.open && !typing(document.activeElement)) { e.preventDefault(); open(); return; }

    // easter egg: the Konami code opens the hidden LAB-00
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    k = key === KONAMI[k] ? k + 1 : key === KONAMI[0] ? 1 : 0;
    if (k === KONAMI.length) {
      k = 0;
      e.preventDefault(); // otherwise the final "a" is typed into the input we're about to focus
      open("> ");
      print(esc(SECRET["lab-00"]()));
    }
  });

  /* ---------------- pending NEXA request from another page ---------------- */
  if (ctx.nexa) {
    try {
      const pending = JSON.parse(sessionStorage.getItem(PENDING_ASK) || "null");
      sessionStorage.removeItem(PENDING_ASK);
      if (pending?.question) setTimeout(() => ctx.nexa.ask(pending.question, pending), 600);
      else if (pending?.mode) setTimeout(() => { ctx.nexa.setMode(pending.mode); ctx.nexa.focus(); }, 600);
    } catch {}
  }

  // Show the right shortcut for the visitor's platform.
  const mac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  document.querySelectorAll(".nx-cmd-trigger kbd").forEach((k) => { k.textContent = mac ? "⌘K" : "Ctrl K"; });

  return { open, close };
}
