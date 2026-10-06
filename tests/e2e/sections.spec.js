import { test, expect, ready } from "./fixtures.js";

test.describe("certifications", () => {
  test("lists the résumé certifications with issuers and dates", async ({ page }) => {
    await page.goto("./#certifications");
    const cards = page.locator("#certGrid .nx-cert");
    await expect(cards).toHaveCount(3);
    await expect(cards.first()).toContainText("Be10x AI Tool Workshop");
    await expect(cards.first()).toContainText("BE10x");
    await expect(cards.first().locator("time")).toHaveText("Jan 2026");
    await expect(page.locator("#cert-linkedin-learning")).toContainText("LinkedIn Learning");
    await expect(page.locator("#cert-linkedin-learning .nx-tag")).toHaveText(["Software Design", "AI Foundation", "Python"]);
  });

  test("is reachable from the nav, quick facts and skills", async ({ page }) => {
    await page.goto("./");
    await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Certifications" }).click();
    await expect(page.locator("#certifications")).toBeInViewport();
    await expect(page.locator("#factsCertCount")).toHaveText(/^3/);
    const ai = page.locator("#skillGrid .nx-skill", { hasText: "AI & Machine Learning" });
    await expect(ai).toContainText("Certified:");
    await ai.getByRole("link", { name: "BE10x" }).click();
    await expect(page).toHaveURL(/#cert-be10x-ai-tools$/);
  });

  test("searchable in the Command Center", async ({ page }) => {
    await page.goto("./");
    await ready(page);
    await page.keyboard.press("Control+k");
    await page.getByRole("combobox", { name: "Search or run a command" }).fill("LinkedIn Learning");
    await expect(page.locator(".nx-cmd-item-label").first()).toHaveText("Software Design, AI Foundation, Python");
    await page.keyboard.press("Enter");
    await expect(page.locator("#cert-linkedin-learning")).toBeInViewport();
  });
});

test.describe("products I sell (future enhancement)", () => {
  test("is clearly marked as planned with no prices", async ({ page }) => {
    await page.goto("./#store");
    const section = page.locator("#store");
    await expect(section.getByRole("heading", { name: "Products I sell." })).toBeVisible();
    await expect(section).toContainText("Future enhancement");
    await expect(section).toContainText("Nothing is on sale yet");
    await expect(page.getByRole("list", { name: "Storefront roadmap" }).getByRole("listitem")).toHaveCount(3);
    const products = page.locator("#storeGrid .nx-product");
    await expect(products).toHaveCount(4);
    await expect(page.locator("#storeGrid .nx-badge")).toHaveText(Array(4).fill("Planned"));
    await expect(page.locator("#storeGrid .nx-price")).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Notify me when Figma UI Kit launches" }))
      .toHaveAttribute("href", /^mailto:naus2005official@gmail\.com\?subject=Notify%20me%3A%20Figma%20UI%20Kit/);
  });

  test("is reachable from the nav", async ({ page }) => {
    await page.goto("./");
    await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Products" }).click();
    await expect(page.locator("#store")).toBeInViewport();
  });

  test("> show products works", async ({ page }) => {
    await page.goto("./");
    await ready(page);
    await page.keyboard.press("Control+k");
    await page.keyboard.type("> show products");
    await page.keyboard.press("Enter");
    await expect(page.locator("#store")).toBeInViewport();
  });
});
