/* ==========================================================================
   NEXUS — certificate viewer (native <dialog>)
   Opens from any [data-view-cert="<id>"] element or a #certificate-<id> link.
   Shows the real certificate image, its details, the PDF and prev/next.
   ========================================================================== */
import { CERTIFICATIONS } from "../data/certificates.js";
import { esc } from "./components.js";
import { icon } from "./icons.js";

export function initCertViewer() {
  const dialog = document.createElement("dialog");
  dialog.className = "nx-modal nx-cert-viewer";
  dialog.id = "certViewer";
  dialog.setAttribute("aria-labelledby", "cvTitle");
  dialog.innerHTML = `
    <div class="nx-modal-head">
      <div><span class="nx-kicker" id="cvKicker"></span><h2 id="cvTitle"></h2></div>
      <button class="nx-btn nx-btn--icon nx-btn--sm" type="button" data-cv-close aria-label="Close">${icon("close", { size: 18 })}</button>
    </div>
    <div class="nx-modal-body nx-cv-body">
      <figure class="nx-cv-figure"><img id="cvImage" alt="" decoding="async" /></figure>
      <div class="nx-cv-details" id="cvDetails"></div>
    </div>
    <div class="nx-cv-foot">
      <button class="nx-btn nx-btn--sm" type="button" data-cv-step="-1" aria-label="Previous certificate">← Previous</button>
      <span class="nx-cv-count" id="cvCount" aria-live="polite"></span>
      <button class="nx-btn nx-btn--sm" type="button" data-cv-step="1" aria-label="Next certificate">Next →</button>
    </div>`;
  document.body.append(dialog);

  const $ = (sel) => dialog.querySelector(sel);
  let index = 0;

  function show(i) {
    index = (i + CERTIFICATIONS.length) % CERTIFICATIONS.length;
    const c = CERTIFICATIONS[index];
    $("#cvKicker").textContent = [c.issuer, c.partner].filter(Boolean).join(" × ");
    $("#cvTitle").textContent = c.title;
    const image = $("#cvImage");
    image.src = c.image.src;
    image.width = c.image.width;
    image.height = c.image.height;
    image.alt = `${c.title} certificate issued to Nausheen Haleelur Rahman by ${c.issuer}`;
    $("#cvCount").textContent = `${index + 1} of ${CERTIFICATIONS.length}`;

    const actions = [
      c.pdf && `<a class="nx-btn nx-btn--primary nx-btn--sm" href="${esc(c.pdf)}" target="_blank" rel="noopener">${icon("file", { size: 16 })} Open PDF</a>`,
      `<a class="nx-btn nx-btn--sm" href="${esc(c.image.src)}" target="_blank" rel="noopener">${icon("external", { size: 16 })} Full size</a>`,
      c.credentialUrl && `<a class="nx-btn nx-btn--sm" href="${esc(c.credentialUrl)}" target="_blank" rel="noopener">Verify credential</a>`,
    ].filter(Boolean).join("");

    $("#cvDetails").innerHTML = `
      <dl class="nx-cv-meta">
        <div><dt>Issued</dt><dd>${esc(c.dateLabel)}</dd></div>
        ${c.credentialId ? `<div><dt>Credential ID</dt><dd><code class="nx-cv-id">${esc(c.credentialId)}</code>
          <button class="nx-btn nx-btn--quiet nx-btn--sm" type="button" data-cv-copy="${esc(c.credentialId)}">Copy</button></dd></div>` : ""}
      </dl>
      ${c.highlights?.length ? `<ul class="nx-cv-highlights">${c.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>` : ""}
      <div class="nx-tags">${c.topics.map((t) => `<span class="nx-tag">${esc(t)}</span>`).join("")}</div>
      <div class="nx-row">${actions}</div>`;

    history.replaceState(null, "", `#certificate-${c.id}`);
  }

  function open(id) {
    const i = CERTIFICATIONS.findIndex((c) => c.id === id);
    if (i < 0) return;
    show(i);
    if (!dialog.open) dialog.showModal();
  }

  dialog.addEventListener("click", async (e) => {
    if (e.target === dialog || e.target.closest("[data-cv-close]")) return dialog.close();
    const step = e.target.closest("[data-cv-step]");
    if (step) return show(index + Number(step.dataset.cvStep));
    const copy = e.target.closest("[data-cv-copy]");
    if (copy) {
      try { await navigator.clipboard.writeText(copy.dataset.cvCopy); copy.textContent = "Copied"; }
      catch { copy.textContent = "Select & copy"; }
      setTimeout(() => { copy.textContent = "Copy"; }, 1600);
    }
  });
  dialog.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); show(index + 1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); show(index - 1); }
  });
  dialog.addEventListener("close", () => {
    if (location.hash.startsWith("#certificate-")) history.replaceState(null, "", "#certifications");
  });

  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-view-cert]");
    if (!t) return;
    e.preventDefault();
    open(t.dataset.viewCert);
  });

  const m = location.hash.match(/^#certificate-(.+)$/);
  if (m) open(m[1]);

  return { open };
}
