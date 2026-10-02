import { test, expect } from "./fixtures.js";

test.describe("universe map", () => {
  test("selecting a lab updates the panel and connection", async ({ page }) => {
    await page.goto("./#universe");
    const panel = page.locator("#uniPanel");
    await expect(panel).toContainText("NEXUS Core");
    await page.locator('.nx-uni-node[data-lab="security"]').click();
    await expect(panel.getByRole("heading", { name: "Security Lab" })).toBeVisible();
    await expect(panel).toContainText("SecureVault AI");
    await expect(page.locator('.nx-uni-spoke[data-lab="security"]')).toHaveClass(/is-active/);
    await page.locator("[data-core]").click();
    await expect(panel).toContainText("NEXUS Core");
  });

  test("arrow keys move around the ring", async ({ page }) => {
    await page.goto("./#universe");
    await page.locator('.nx-uni-node[data-lab="security"]').focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.locator('.nx-uni-node[data-lab="ai"]')).toBeFocused();
    await expect(page.locator('.nx-uni-node[data-lab="ai"]')).toHaveAttribute("aria-pressed", "true");
    await page.keyboard.press("End");
    await expect(page.locator('.nx-uni-node[data-lab="experimental"]')).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(page.locator('.nx-uni-node[data-lab="security"]')).toBeFocused();
  });

  test("deep link #lab-data selects the Data Lab", async ({ page }) => {
    await page.goto("./#lab-data");
    await expect(page.locator('.nx-uni-node[data-lab="data"]')).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("#uniPanel")).toContainText("Data Lab");
  });

  test("'Show in projects' filters the project grid", async ({ page }) => {
    await page.goto("./#universe");
    await page.locator('.nx-uni-node[data-lab="security"]').click();
    await page.locator("#uniPanel").getByRole("button", { name: /Show in projects/ }).click();
    await expect(page.locator("#projectFilter").getByRole("button", { name: "Security Lab" })).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("#projectGrid .nx-project")).toHaveCount(3);
  });
});

test.describe("projects", () => {
  test("all projects listed with honest status badges", async ({ page }) => {
    await page.goto("./#projects");
    const cards = page.locator("#projectGrid .nx-project");
    await expect(cards).toHaveCount(10);
    await expect(page.locator('[data-project="securevault-ai"] .nx-badge')).toHaveText("Live");
    for (const id of ["nexa", "mindscape-ai", "insightforge", "earthpulse", "floramind-ai"]) {
      await expect(page.locator(`[data-project="${id}"] .nx-badge`)).toHaveText("Concept");
      await expect(page.locator(`[data-project="${id}"]`)).toContainText("planned");
    }
  });

  test("filter chips narrow the grid", async ({ page }) => {
    await page.goto("./#projects");
    await page.locator("#projectFilter").getByRole("button", { name: "Data Lab" }).click();
    await expect(page.locator("#projectGrid .nx-project")).toHaveCount(2);
    await page.locator("#projectFilter").getByRole("button", { name: "All" }).click();
    await expect(page.locator("#projectGrid .nx-project")).toHaveCount(10);
  });

  test("quick view opens, links to the case study, closes with Escape", async ({ page }) => {
    await page.goto("./#projects");
    await page.locator('[data-project="securevault-ai"]').getByRole("button", { name: "SecureVault AI" }).click();
    const dialog = page.locator("#projectModal");
    await expect(dialog).toBeVisible();
    await expect(page).toHaveURL(/#project-securevault-ai$/);
    await expect(dialog.getByRole("link", { name: /Full case study/ })).toHaveAttribute("href", "project.html?id=securevault-ai");
    await expect(dialog).toContainText("AES-256-GCM");
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(page).not.toHaveURL(/#project-/);
  });

  test("concept quick view says it isn't built", async ({ page }) => {
    await page.goto("./#project-earthpulse");
    await expect(page.locator("#projectModal")).toContainText("This project hasn't been built yet");
  });

  test("skills link to the projects that prove them", async ({ page }) => {
    await page.goto("./#skills");
    await expect(page.locator("#skillGrid .nx-skill")).toHaveCount(8);
    await expect(page.locator("#skillGrid")).not.toContainText("%");
    await page.locator("#skillGrid").getByRole("button", { name: "Packet Sniffer" }).click();
    await expect(page.locator("#projectModal")).toContainText("Scapy");
  });
});
