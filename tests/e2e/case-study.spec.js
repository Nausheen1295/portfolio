import { test, expect } from "./fixtures.js";

const IDS = ["securevault-ai", "nexa", "mindscape-ai", "insightforge", "earthpulse", "floramind-ai",
  "playground", "playfair-cipher", "packet-sniffer", "northstar-analysis"];

test.describe("case studies", () => {
  for (const id of IDS) {
    test(`${id} renders with per-project SEO`, async ({ page }) => {
      await page.goto(`project.html?id=${id}`);
      await expect(page.locator(".nx-cs-title")).toBeVisible();
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`project\\.html\\?id=${id}$`));
      const ld = JSON.parse(await page.locator('script[type="application/ld+json"]').last().textContent());
      expect(ld.author.name).toBe("Nausheen Haleelur Rahman");
    });
  }

  test("SecureVault AI shows real sections, screenshots and honest gaps", async ({ page }) => {
    await page.goto("project.html?id=securevault-ai");
    await expect(page.getByRole("link", { name: /Live demo/ })).toHaveAttribute("href", "https://securevaultai-brown.vercel.app");
    for (const h of ["Overview", "Features", "Screenshots", "Technologies", "Architecture", "Security", "Development timeline"]) {
      await expect(page.getByRole("heading", { level: 2, name: h })).toBeVisible();
    }
    await expect(page.locator(".nx-cs-gallery img")).toHaveCount(4);
    const img = page.locator(".nx-cs-gallery img").first();
    await img.scrollIntoViewIfNeeded();
    await expect.poll(() => img.evaluate((el) => el.naturalWidth)).toBe(960);
    await expect(page.locator(".nx-cs-missing")).toContainText("My role");
  });

  test("architecture diagram explains components on click", async ({ page }) => {
    await page.goto("project.html?id=securevault-ai#architecture");
    const detail = page.locator(".nx-arch-detail");
    await expect(detail).toContainText("User");
    await page.getByRole("button", { name: "Encryption engine" }).click();
    await expect(detail).toContainText("PBKDF2");
    await expect(page.getByRole("button", { name: "Encryption engine" })).toHaveAttribute("aria-pressed", "true");
    expect(await page.locator(".nx-arch-edges path.is-active").count()).toBeGreaterThan(0);
    await detail.getByRole("button", { name: "React + Vite app" }).click();
    await expect(detail.getByRole("heading", { name: "React + Vite app" })).toBeVisible();
  });

  test("concept case study is clearly marked as a plan", async ({ page }) => {
    await page.goto("project.html?id=nexa");
    await expect(page.getByText("This project hasn't been built yet.")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Planned architecture" })).toBeVisible();
    await expect(page.locator(".nx-cs-missing")).toHaveCount(0);
  });

  test("unknown id shows a friendly not-found state", async ({ page }) => {
    await page.goto("project.html?id=carwa");
    await expect(page).toHaveTitle(/not found/i);
    await expect(page.getByRole("link", { name: "Explore NEXUS" })).toBeVisible();
  });

  test("pager moves between projects", async ({ page }) => {
    await page.goto("project.html?id=securevault-ai");
    await page.getByRole("link", { name: /Next/ }).click();
    await expect(page).toHaveURL(/id=nexa/);
  });
});
