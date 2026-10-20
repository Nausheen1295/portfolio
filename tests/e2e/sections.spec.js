import { test, expect, ready } from "./fixtures.js";

test.describe("certifications", () => {
  test("lists all 8 certificates, newest first, with issuers and dates", async ({ page }) => {
    await page.goto("./#certifications");
    const cards = page.locator("#certGrid .nx-cert");
    await expect(cards).toHaveCount(8);
    await expect(cards.first()).toContainText("Web Development Training");
    await expect(cards.first()).toContainText("Corizo × Mood Indigo");
    await expect(page.locator("#cert-forage-cybersecurity")).toContainText("Forage × Mastercard");
    await expect(page.locator("#cert-linkedin-learning-python .nx-cert-date")).toHaveText("16 Aug 2025");
    await expect(page.getByRole("button", { name: /^View certificate:/ })).toHaveCount(8);
  });

  test("View opens the real certificate, with details, PDF and prev/next", async ({ page }) => {
    await page.goto("./#certifications");
    await page.getByRole("button", { name: "View certificate: Learning Python" }).click();
    await expect(page.getByRole("dialog", { name: "Learning Python" })).toBeVisible();
    const viewer = page.locator("#certViewer"); // its accessible name changes as you browse
    await expect(page).toHaveURL(/#certificate-linkedin-learning-python$/);
    const img = viewer.locator("#cvImage");
    await expect.poll(() => img.evaluate((el) => el.complete && el.naturalWidth)).toBe(1600);
    await expect(viewer).toContainText("12549f59f7c4f1730141a43a2f917e7ddcc65e88a2391726284c874dcc12ad7f");
    await expect(viewer.getByRole("link", { name: /Open PDF/ })).toHaveAttribute("href", "assets/certificates/linkedin-learning-python.pdf");
    await page.keyboard.press("ArrowRight");
    await expect(page.locator("#cvTitle")).toHaveText("Digital Learning Training");
    await expect(viewer.getByRole("link", { name: /Open PDF/ })).toHaveCount(0); // image-only certificate
    await viewer.getByRole("button", { name: "Next certificate" }).click();
    await expect(page.locator("#cvTitle")).toHaveText("Web Development Training"); // wraps around
    await page.keyboard.press("Escape");
    await expect(page.locator("#certViewer")).toBeHidden();
    await expect(page).toHaveURL(/#certifications$/);
  });

  test("a #certificate- link opens that certificate directly", async ({ page }) => {
    await page.goto("./#certificate-forage-cybersecurity");
    await expect(page.locator("#cvTitle")).toHaveText("Cybersecurity Job Simulation");
    await expect(page.locator("#cvDetails")).toContainText("Design a phishing email simulation");
  });

  test("is reachable from the nav, quick facts and skills", async ({ page }) => {
    await page.goto("./");
    await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Certifications" }).click();
    await expect(page.locator("#certifications")).toBeInViewport();
    await expect(page.locator("#factsCertCount")).toHaveText(/^8/);
    const security = page.locator("#skillGrid .nx-skill", { hasText: "Cybersecurity" });
    await expect(security).toContainText("Certified:");
    await security.getByRole("button", { name: "Cybersecurity Job Simulation" }).click();
    await expect(page.locator("#cvTitle")).toHaveText("Cybersecurity Job Simulation");
  });

  test("searchable in the Command Center", async ({ page }) => {
    await page.goto("./");
    await ready(page);
    await page.keyboard.press("Control+k");
    await page.getByRole("combobox", { name: "Search or run a command" }).fill("Software Testing");
    await expect(page.locator(".nx-cmd-item-label").first()).toHaveText("Programming Foundations: Software Testing/QA");
    await page.keyboard.press("Enter");
    await expect(page.locator("#cert-linkedin-software-testing")).toBeInViewport();
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
