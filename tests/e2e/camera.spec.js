// Air Pop with a camera: Chrome's fake webcam (an animated test pattern) stands in for a real one.
import { test, expect } from "./fixtures.js";

test.use({
  launchOptions: { args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"] },
  permissions: ["camera"],
});

test("air pop: motion mode turns the camera on, and mouse mode turns it off again", async ({ page }) => {
  await page.goto("playground/airpop.html");
  await page.getByRole("button", { name: "🎥 Motion" }).click();
  await expect(page.locator("#camStatus")).toHaveText(/Camera on · motion detection ready/, { timeout: 20_000 }); // camera start-up can be slow
  await expect(page.getByRole("button", { name: "🎥 Motion" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#privacy")).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.getElementById("video").videoWidth)).toBeGreaterThan(0);

  await page.getByRole("button", { name: "🖱️ Mouse / touch" }).click();
  await expect(page.locator("#camStatus")).toHaveText("");
  expect(await page.evaluate(() => document.getElementById("video").srcObject)).toBeNull();
});

test("air pop: a blocked camera falls back to mouse / touch with an explanation", async ({ page }) => {
  await page.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = () => Promise.reject(new DOMException("denied", "NotAllowedError"));
  });
  await page.goto("playground/airpop.html");
  await page.getByRole("button", { name: "🎥 Motion" }).click();
  await expect(page.locator("#camStatus")).toHaveText(/permission was blocked/);
  await expect(page.getByRole("button", { name: "🖱️ Mouse / touch" })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Start Game" }).click();
  await expect(page.locator("#overlay")).toHaveClass(/hidden/);
});
