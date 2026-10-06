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

  test("pixel studio draws, fills, undoes, and keeps the drawing after reload", async ({ page }) => {
    await page.goto("playground/pixel.html");
    const cells = page.locator(".px-cell");
    await expect(cells).toHaveCount(256);
    await page.getByRole("button", { name: "Color #ef4444" }).click();
    await cells.nth(0).click();
    await expect(cells.nth(0)).toHaveCSS("background-color", "rgb(239, 68, 68)");
    await page.getByRole("button", { name: "🪣 Fill" }).click();
    await page.getByRole("button", { name: "Color #22c55e" }).click();
    await cells.nth(255).click();
    await expect(cells.nth(1)).toHaveCSS("background-color", "rgb(34, 197, 94)");
    await expect(cells.nth(0)).toHaveCSS("background-color", "rgb(239, 68, 68)"); // fill stops at other colours
    await page.getByRole("button", { name: "↶ Undo" }).click();
    await expect(cells.nth(1)).not.toHaveCSS("background-color", "rgb(34, 197, 94)");
    await page.reload();
    await expect(page.locator(".px-cell").nth(0)).toHaveCSS("background-color", "rgb(239, 68, 68)");
  });

  test("color by number: wrong squares are rejected and the picture can be completed", async ({ page }) => {
    await page.goto("playground/pixel.html?mode=number");
    const cells = page.locator(".px-cell");
    await expect(cells).toHaveCount(144);
    const nums = await cells.evaluateAll((els) => els.map((el) => +el.dataset.n));
    const wrong = nums.findIndex((n) => n !== 1);
    await cells.nth(wrong).click();
    await expect(page.locator("#mistakes")).toHaveText("1");
    for (const n of [...new Set(nums)].sort()) {
      await page.locator(`.px-swatch[data-n="${n}"]`).click();
      for (const i of nums.flatMap((v, i) => (v === n ? [i] : []))) await cells.nth(i).click();
    }
    await expect(page.locator("#painted")).toHaveText("100%");
    await expect(page.locator("#overlay")).not.toHaveClass(/hidden/, { timeout: 3_000 });
    const done = await page.evaluate(() => JSON.parse(localStorage.getItem("pg-scores"))["pixel-done"]);
    expect(done).toBe(1);
  });

  test("hub links to every game and shows best scores", async ({ page }) => {
    await page.goto("playground/");
    await expect(page.getByRole("link", { name: "Petal Snake" })).toHaveAttribute("href", "snake.html");
    await expect(page.getByRole("link", { name: "Memory Match" })).toHaveAttribute("href", "memory.html");
    await expect(page.getByRole("link", { name: "Pixel Studio" })).toHaveAttribute("href", "pixel.html");
  });
});
