import { test, expect } from "./fixtures.js";

const IDS = ["securevault-ai", "nexa", "mindscape-ai", "insightforge", "earthpulse", "floramind-ai",
  "playground", "playfair-cipher", "packet-sniffer", "northstar-analysis",
  "corizo-ecommerce", "corizo-student-management", "stock-price-prediction"];

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

  test("NEXUS lab apps show real case studies with live links", async ({ page }) => {
    for (const [id, slug] of [["nexa", "nexa"], ["mindscape-ai", "mindscape-ai"], ["insightforge", "insightforge"], ["earthpulse", "earthpulse"], ["floramind-ai", "floramind-ai"]]) {
      await page.goto(`project.html?id=${id}`);
      await expect(page.getByText("This project hasn't been built yet.")).toHaveCount(0);
      await expect(page.getByRole("link", { name: /Live demo/ })).toHaveAttribute("href", `https://nausheen1295.github.io/${slug}/`);
      await expect(page.getByRole("link", { name: /Source code/ })).toHaveAttribute("href", `https://github.com/Nausheen1295/${slug}`);
      await expect(page.getByRole("heading", { level: 2, name: "Challenges" })).toBeVisible();
    }
    await page.goto("project.html?id=floramind-ai");
    await expect(page.locator("#results")).toContainText("16 correctly");
  });

  test("unknown id shows a friendly not-found state", async ({ page }) => {
    await page.goto("project.html?id=carwa");
    await expect(page).toHaveTitle(/not found/i);
    await expect(page.getByRole("link", { name: "Explore NEXUS" })).toBeVisible();
  });

  test("pager moves between projects", async ({ page }) => {
    await page.goto("project.html?id=securevault-ai");
    await page.getByRole("link", { name: /Next/ }).click();
    await expect(page).toHaveURL(/id=corizo-ecommerce/);
  });
});

test.describe("Corizo work", () => {
  test("experience timeline lists both Corizo internships with project links", async ({ page }) => {
    await page.goto("./#about");
    const tl = page.getByLabel("Education and experience");
    await expect(tl).toContainText("Web Development Trainee & Intern · Corizo");
    await expect(tl).toContainText("Machine Learning Trainee & Intern · Corizo");
    await tl.getByRole("link", { name: "Stock Price Prediction" }).click();
    await expect(page).toHaveURL(/project\.html\?id=stock-price-prediction$/);
  });

  test("Web Lab holds both Corizo web apps", async ({ page }) => {
    await page.goto("./#lab-web");
    const panel = page.locator("#uniPanel");
    await expect(panel.getByRole("heading", { name: "Web Lab" })).toBeVisible();
    await expect(panel).toContainText("Tech World E-Commerce");
    await expect(panel).toContainText("Student Management App");
  });

  test("in-development project is live and not described as unbuilt", async ({ page }) => {
    await page.goto("project.html?id=corizo-ecommerce");
    await expect(page.getByText("In active development.")).toBeVisible();
    await expect(page.getByText("This project hasn't been built yet.")).toHaveCount(0);
    await expect(page.getByRole("link", { name: /Live demo/ })).toHaveAttribute("href", "https://corizo-store.onrender.com");
    await expect(page.getByRole("heading", { level: 2, name: "Features" })).toBeVisible();
  });

  test("stock prediction case study reports its honest results", async ({ page }) => {
    await page.goto("project.html?id=stock-price-prediction");
    await expect(page.getByRole("heading", { level: 2, name: "Results" })).toBeVisible();
    await expect(page.locator("#results")).toContainText("no model beat the naive baseline");
    await expect(page.getByRole("link", { name: /Source code/ })).toHaveAttribute("href", /projects\/stock-price-prediction$/);
  });
});
