// Shared fixture: skips the boot intro (unless a test opts in) and fails on any console error
// except ones a test explicitly expects (e.g. a mocked 429).
import { test as base, expect } from "@playwright/test";

export const test = base.extend({
  boot: [false, { option: true }],
  allowErrors: [[], { option: true }],
  page: async ({ page, boot, allowErrors }, use) => {
    const errors = [];
    const allowed = (msg) => allowErrors.some((re) => re.test(msg));
    page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
    page.on("console", (m) => {
      if (m.type() !== "error" || /fonts\.(googleapis|gstatic)\.com/.test(m.location().url) || allowed(m.text())) return;
      errors.push(`console: ${m.text()}`);
    });
    // Keep tests hermetic: no dependency on Google Fonts (pages fall back to system fonts).
    await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
    if (!boot) await page.addInitScript(() => { try { sessionStorage.setItem("nx-booted", "1"); } catch {} });
    await use(page);
    expect(errors, "no JavaScript errors").toEqual([]);
  },
});
export { expect };

/** Wait until the app's modules have initialised (keyboard shortcuts, renders). */
export async function ready(page) {
  await page.waitForFunction(() => document.documentElement.classList.contains("nx-ready") && document.querySelector("dialog.nx-cmd"));
}

export const PAGES = ["./", "project.html?id=securevault-ai", "project.html?id=nexa", "playground/", "playground/snake.html", "playground/memory.html", "playground/pixel.html"];
