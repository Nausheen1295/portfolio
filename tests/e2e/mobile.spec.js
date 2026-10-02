// Runs on the "mobile" project (Pixel 7 emulation: touch, small viewport).
import { test, expect } from "./fixtures.js";

test("mobile menu opens, navigates, and closes with Escape", async ({ page }) => {
  await page.goto("./");
  const toggle = page.getByRole("button", { name: "Open menu" });
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await toggle.click();
  await expect(page.getByRole("button", { name: "Close menu" })).toHaveAttribute("aria-expanded", "true");
  await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Skills" }).click();
  await expect(page.locator("#skills")).toBeInViewport();
  await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Open menu" })).toHaveAttribute("aria-expanded", "false");
});

test("universe becomes a swipeable carousel with lab dots", async ({ page }) => {
  await page.goto("./#universe");
  await expect(page.locator(".nx-uni-map")).toBeHidden();
  await expect(page.locator(".nx-uni-slide")).toHaveCount(7);
  await page.getByRole("group", { name: "Jump to lab" }).getByRole("button", { name: "Earth Lab" }).click();
  await expect(page.locator('.nx-uni-dots [data-goto="earth"]')).toHaveAttribute("aria-current", "true");
  await expect(page.locator('.nx-uni-slide[data-lab="earth"]')).toBeInViewport();
});

test("case study collapses to one column with chip navigation", async ({ page }) => {
  await page.goto("project.html?id=securevault-ai");
  const toc = page.getByRole("navigation", { name: "On this page" });
  await expect(toc).toBeVisible();
  await toc.getByRole("link", { name: "Architecture" }).click();
  await expect(page.locator("#architecture")).toBeInViewport();
  const [scroll, client] = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
  expect(scroll).toBeLessThanOrEqual(client);
});

test("command center is usable on a phone", async ({ page }) => {
  await page.goto("./");
  await page.getByRole("button", { name: "Search and commands" }).click();
  await page.getByRole("combobox", { name: "Search or run a command" }).fill("encryption");
  await expect(page.locator(".nx-cmd-item-label").first()).toHaveText("SecureVault AI");
});
