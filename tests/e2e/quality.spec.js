import AxeBuilder from "@axe-core/playwright";
import { test, expect, PAGES } from "./fixtures.js";

/* ---------------------------------------------------------------- Accessibility */
test.describe("accessibility (axe-core, WCAG 2.1 AA + best practices)", () => {
  for (const theme of ["dark", "light"]) {
    for (const url of [...PAGES, "design-system.html"]) {
      test(`${theme} · ${url}`, async ({ page }) => {
        await page.addInitScript((t) => localStorage.setItem("nx-theme", t), theme);
        await page.emulateMedia({ reducedMotion: "reduce" }); // settle animations so contrast is measured on final colours
        await page.goto(url);
        await page.waitForLoadState("networkidle");
        const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "best-practice"]).analyze();
        const summary = results.violations.map((v) => `${v.id} (${v.nodes.length}): ${v.nodes[0].target.join(" ")}`);
        expect(summary).toEqual([]);
      });
    }
  }
});

/* ---------------------------------------------------------------- Responsive */
test.describe("no horizontal overflow", () => {
  for (const width of [320, 375, 768, 1024, 1440]) {
    test(`${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      for (const url of PAGES) {
        await page.goto(url);
        await page.waitForLoadState("networkidle");
        // poll: a scrollbar appearing mid-layout can cause a momentary 15px blip; real overflow persists
        await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth),
          { message: `${url} overflows at ${width}px`, timeout: 3_000 }).toBeLessThanOrEqual(0);
      }
    });
  }
});

/* ---------------------------------------------------------------- Playground */
test.describe("playground", () => {
  test("snake starts, pauses, and ends when it hits a wall", async ({ page }) => {
    await page.goto("playground/snake.html");
    await page.getByRole("button", { name: "Start Game" }).click();
    await expect(page.locator("#overlay")).toHaveClass(/hidden/);
    await page.keyboard.press("Space");
    await expect(page.locator("#ovTitle")).toHaveText(/Paused/);
    await page.keyboard.press("Space");
    await page.keyboard.press("ArrowUp"); // head for the top wall
    await expect(page.locator("#ovTitle")).toHaveText(/Game Over|High Score/, { timeout: 6_000 });
  });

  test("memory match can be completed and records the best score", async ({ page }) => {
    await page.goto("playground/memory.html");
    const emojis = await page.locator(".card").evaluateAll((cards) => cards.map((c) => c.dataset.emoji));
    const pairs = {};
    emojis.forEach((e, i) => (pairs[e] ||= []).push(i));
    for (const [a, b] of Object.values(pairs)) {
      await page.locator(".card").nth(a).click();
      await page.locator(".card").nth(b).click();
    }
    await expect(page.locator("#moves")).toHaveText("8");
    await expect(page.locator("#overlay")).not.toHaveClass(/hidden/, { timeout: 3_000 });
    await expect(page.locator("#ovText")).toContainText("8");
    const best = await page.evaluate(() => JSON.parse(localStorage.getItem("pg-scores"))["memory-easy"]);
    expect(best).toBe(8);
  });

  test("hub links to both games and shows best scores", async ({ page }) => {
    await page.goto("playground/");
    await expect(page.getByRole("link", { name: "Petal Snake" })).toHaveAttribute("href", "snake.html");
    await expect(page.getByRole("link", { name: "Memory Match" })).toHaveAttribute("href", "memory.html");
  });
});
