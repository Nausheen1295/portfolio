/* ==========================================================================
   NEXUS — contact form (Formspree). Without JS the form still posts
   natively to the same endpoint, so it works either way.
   ========================================================================== */
import { toast } from "../ui/toast.js";

export function initContact() {
  const form = document.getElementById("contactForm");
  const note = document.getElementById("formNote");
  const button = form.querySelector('button[type="submit"]');

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    button.disabled = true;
    note.textContent = "Sending…";
    try {
      const res = await fetch(form.action, { method: "POST", headers: { Accept: "application/json" }, body: new FormData(form) });
      if (!res.ok) throw new Error(String(res.status));
      const name = form.elements.name.value.trim();
      form.reset();
      note.textContent = `Thank you${name ? `, ${name}` : ""}! Your message has been sent.`;
      toast("Message sent ✓");
    } catch {
      note.innerHTML = 'Something went wrong. Please email me directly at <a href="mailto:naus2005official@gmail.com" style="text-decoration:underline">naus2005official@gmail.com</a>.';
    } finally {
      button.disabled = false;
    }
  });
}
