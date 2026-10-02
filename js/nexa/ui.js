/* ==========================================================================
   NEXA — chat interface
   Online:  sends questions to nexaClient and renders grounded answers + sources.
   Offline: never imitates AI. Runs a clearly-labelled documentation search over
            projects.js and says plainly when something isn't documented.
   ========================================================================== */
import { PROJECTS, getLab, getProject } from "../data/projects.js";
import { searchProjects } from "../core/search.js";
import { esc, statusBadge } from "../ui/components.js";
import { icon } from "../ui/icons.js";
import { nexaClient, MODES } from "./client.js";
import { NEXA_CONFIG } from "./config.js";

const SUGGESTIONS = {
  recruiter:    ["Explain SecureVault AI like I'm a recruiter", "Which projects use AI?", "Show me Nausheen's cybersecurity work"],
  developer:    ["What technologies does SecureVault AI use?", "Why AES-256-GCM?", "How does the AI threat scanner work?"],
  simple:       ["Explain SecureVault AI simply", "What is NEXA?", "What will FloraMind AI do?"],
  architecture: ["Explain the architecture of SecureVault AI", "How will NEXA's RAG pipeline work?", "Where does encryption happen?"],
  interview:    ["Explain the architecture of SecureVault AI.", "What security mechanisms did you implement?",
                 "Why did you choose your database?", "What was the biggest technical challenge?", "How would you scale this system?"],
};

/* case-study anchors for the fields a match was found in */
const ANCHOR = { features: "features", security: "security", architecture: "architecture", technologies: "stack", "AI components": "ai" };

/* questions about things that may be undocumented → which field answers them */
const INTENTS = [
  [/challeng|difficult|hardest|problem you (faced|solved)/, "challenges", "Technical challenges"],
  [/database|db\b|storage engine|sql/, "database", "Database choice"],
  [/\brole\b|did you (do|build)|team|solo/, "role", "Nausheen's role"],
  [/why .*(choose|chose|use|pick)|decision|trade-?off/, "decisions", "Engineering decisions"],
  [/scal(e|ing|ability)/, null, "Scaling plans"],
  [/result|impact|metric|users/, "results", "Results"],
];

export function initNexa(mount) {
  let mode = "recruiter";
  let projectId = "";
  let online = false;
  let pending = false;
  const history = [];

  mount.innerHTML = `
    <div class="nx-chat nx-nexa-app">
      <div class="nx-chat-head">
        <span class="nx-orb" aria-hidden="true"></span>
        <div class="nx-nexa-id">
          <strong>NEXA</strong>
          <span class="nx-nexa-status" data-state="checking"><i aria-hidden="true"></i><span>Checking…</span></span>
        </div>
        <button class="nx-btn nx-btn--quiet nx-btn--sm" type="button" data-act="clear">Clear</button>
      </div>

      <div class="nx-nexa-controls">
        <div class="nx-modes" role="group" aria-label="Answer mode">
          ${MODES.map((m) => `<button type="button" data-mode="${m.id}" aria-pressed="${m.id === mode}">${esc(m.label)}</button>`).join("")}
        </div>
        <div class="nx-nexa-sub">
          <p class="nx-nexa-hint" aria-live="polite"></p>
          <label class="nx-nexa-context">
            <span>Context</span>
            <select class="nx-input">
              <option value="">All projects</option>
              ${PROJECTS.map((p) => `<option value="${esc(p.id)}">${esc(p.name)}</option>`).join("")}
            </select>
          </label>
        </div>
      </div>

      <div class="nx-chat-log" role="log" aria-live="polite" aria-label="Conversation with NEXA"></div>

      <div class="nx-nexa-suggest" aria-label="Suggested questions"></div>

      <form class="nx-chat-form" novalidate>
        <label class="sr-only" for="nexaInput">Ask NEXA a question</label>
        <textarea class="nx-input" id="nexaInput" rows="1" maxlength="${NEXA_CONFIG.maxQuestionLength}"
                  placeholder="Ask about a project, technology or decision…"></textarea>
        <button class="nx-btn nx-btn--primary nx-btn--icon" type="submit" aria-label="Send">${icon("send", { size: 18 })}</button>
      </form>
      <p class="nx-nexa-foot"><span class="nx-nexa-count">0 / ${NEXA_CONFIG.maxQuestionLength}</span> · Enter to send, Shift + Enter for a new line</p>
    </div>`;

  const $ = (s) => mount.querySelector(s);
  const log = $(".nx-chat-log");
  const input = $("#nexaInput");
  const form = $(".nx-chat-form");
  const statusEl = $(".nx-nexa-status");

  /* ---------- rendering helpers ---------- */
  const scrollDown = () => { log.scrollTop = log.scrollHeight; };
  function push(html, cls) {
    const el = document.createElement("div");
    el.className = `nx-msg ${cls}`;
    el.innerHTML = html;
    log.append(el);
    scrollDown();
    return el;
  }

  function intro() {
    log.innerHTML = "";
    push(online
      ? `<p><strong>Hi, I'm NEXA.</strong> Ask me about Nausheen's projects — I answer only from documented sources and I'll tell you when something isn't documented.</p>`
      : `<p><strong>NEXA is in development.</strong> The AI backend isn't connected yet, so I can't generate answers.</p>
         <p>Until it is, your questions run a <strong>documentation search</strong> over the project data — clearly labelled, never invented.</p>`,
      "nx-msg--intro");
  }

  function renderModeUI() {
    mount.querySelectorAll("[data-mode]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mode === mode)));
    $(".nx-nexa-hint").textContent = MODES.find((m) => m.id === mode).hint;
    input.placeholder = mode === "interview" ? "Ask an interview question…" : "Ask about a project, technology or decision…";
    $(".nx-nexa-suggest").innerHTML = SUGGESTIONS[mode].map((q) =>
      `<button type="button" class="nx-tag" data-suggest="${esc(q)}">${esc(q)}</button>`).join("");
  }

  /* ---------- offline: documentation search (not AI) ---------- */
  function docSearch(question) {
    let results = searchProjects(question, { limit: 3, projectId: projectId || undefined });
    const q = question.toLowerCase();
    const intent = INTENTS.find(([re]) => re.test(q));
    // with a project chosen as context, that project is the subject even if no keywords matched
    if (!results.length && projectId) results = [{ project: getProject(projectId), score: 0, matched: ["context"] }];

    let gaps = "";
    if (intent && results[0]) {
      const p = results[0].project;
      const [, field, label] = intent;
      const value = field && p[field];
      const documented = Array.isArray(value) ? value.length > 0 : !!value;
      if (!documented) {
        gaps = `<p class="nx-doc-gap">${icon("file", { size: 14 })} <span><strong>${esc(label)}</strong> (${esc(p.name)}): not documented yet — NEXA won't guess.</span></p>`;
      }
    }

    const head = `<span class="nx-doc-label">${icon("search", { size: 14 })} Documentation search · not an AI answer</span>`;
    if (!results.length) {
      return `${head}<p>Nothing in the documented projects matches that yet. Try a project name, technology (e.g. “Python”, “encryption”) or lab.</p>`;
    }
    return `${head}
      ${mode === "interview" ? `<p>Interview answers need the NEXA backend. Here's the documented material an answer would draw from:</p>` : `<p>Here's what's documented:</p>`}
      ${gaps}
      <ul class="nx-doc-results">
        ${results.map(({ project: p, matched }) => {
          const anchor = matched.map((m) => ANCHOR[m]).find(Boolean);
          return `
          <li>
            <div class="nx-doc-top">
              <a href="project.html?id=${esc(p.id)}${anchor ? `#${anchor}` : ""}"><strong>${esc(p.name)}</strong></a>
              ${statusBadge(p.status)}
            </div>
            <p>${esc(p.summary)}</p>
            <span class="nx-doc-meta">${esc(getLab(p.lab)?.name)} · ${matched[0] === "context" ? "selected context" : `matched in ${esc(matched.slice(0, 3).join(", "))}`}</span>
          </li>`;
        }).join("")}
      </ul>
      ${!projectId && (results.length > 1 || intent) && !PROJECTS.some((p) => q.includes(p.name.toLowerCase()))
        ? `<p class="nx-doc-tip">Tip: choose a project under <strong>Context</strong> to focus the search.</p>` : ""}`;
  }

  /* ---------- online answer ---------- */
  function renderAnswer(r) {
    const paras = esc(r.answer).split(/\n{2,}/).map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`).join("");
    const sources = r.sources.length
      ? `<div class="nx-doc-sources"><span>Sources</span>${r.sources.map((s) =>
          `<a class="nx-tag" href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title || s.url)}</a>`).join("")}</div>` : "";
    return `${paras}${r.grounded ? "" : `<p class="nx-doc-gap">This isn't covered by the documentation yet.</p>`}${sources}`;
  }

  /* ---------- send ---------- */
  async function send(question) {
    question = question.trim();
    if (!question || pending) return;
    push(`<p>${esc(question)}</p>`, "nx-msg--user");
    input.value = ""; autosize(); count();

    if (!online) {
      push(docSearch(question), "nx-msg--doc");
      return;
    }

    pending = true;
    form.querySelector("button").disabled = true;
    const typing = push(`<span class="nx-typing" aria-label="NEXA is thinking"><i></i><i></i><i></i></span>`, "nx-msg--nexa");
    const r = await nexaClient.ask({ question, mode, projectId: projectId || null, history });
    typing.remove();
    pending = false;
    form.querySelector("button").disabled = false;

    if (r.kind === "answer") {
      push(renderAnswer(r), "nx-msg--nexa");
      history.push({ role: "user", content: question }, { role: "nexa", content: r.answer });
    } else if (r.kind === "offline") {
      setOnline(false);
      push(docSearch(question), "nx-msg--doc");
    } else {
      push(`<p>${esc(r.message)}</p>`, "nx-msg--error");
    }
  }

  /* ---------- input behaviour ---------- */
  const autosize = () => { input.style.height = "auto"; input.style.height = `${Math.min(input.scrollHeight, 120)}px`; };
  const count = () => { $(".nx-nexa-count").textContent = `${input.value.length} / ${NEXA_CONFIG.maxQuestionLength}`; };
  input.addEventListener("input", () => { autosize(); count(); });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); send(input.value); }
  });
  form.addEventListener("submit", (e) => { e.preventDefault(); send(input.value); });

  mount.addEventListener("click", (e) => {
    const m = e.target.closest("[data-mode]");
    if (m) { mode = m.dataset.mode; renderModeUI(); return; }
    const s = e.target.closest("[data-suggest]");
    if (s) { send(s.dataset.suggest); return; }
    if (e.target.closest('[data-act="clear"]')) { history.length = 0; intro(); input.focus(); }
  });
  $(".nx-nexa-context select").addEventListener("change", (e) => { projectId = e.target.value; });

  function setOnline(value) {
    online = value;
    statusEl.dataset.state = value ? "online" : "offline";
    statusEl.lastElementChild.textContent = value ? "Online · answers grounded in documentation" : "Offline · documentation search mode";
  }

  /* ---------- boot ---------- */
  renderModeUI();
  setOnline(false);
  intro();
  nexaClient.status().then((s) => { if (s === "online") { setOnline(true); intro(); } });

  /** Public API — lets other features (command center, case studies) open NEXA with a question. */
  return {
    ask(question, opts = {}) {
      if (opts.mode && MODES.some((m) => m.id === opts.mode)) { mode = opts.mode; renderModeUI(); }
      if (opts.projectId !== undefined) { projectId = opts.projectId; $(".nx-nexa-context select").value = projectId; }
      mount.scrollIntoView({ behavior: "smooth", block: "center" });
      send(question);
    },
    setMode(m) { if (MODES.some((x) => x.id === m)) { mode = m; renderModeUI(); } },
    focus() { input.focus({ preventScroll: true }); },
  };
}
