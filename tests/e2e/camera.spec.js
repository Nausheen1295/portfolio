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

/* ---------------------------------------------------------------- hands-free scrolling */
// A stand-in for MediaPipe: reports one hand at height window.__handY (null = no hand), open unless window.__fist.
const FAKE_MEDIAPIPE = `
  const hand = (y, fist) => {
    const pts = Array.from({ length: 21 }, () => ({ x: 0.5, y }));
    pts[0] = { x: 0.5, y: y + 0.12 };
    for (const k of [5, 9, 13, 17]) pts[k] = { x: 0.5, y: y - 0.03 };
    for (const p of [6, 10, 14, 18]) pts[p] = { x: 0.5, y: y - 0.08 };
    for (const t of [8, 12, 16, 20]) pts[t] = { x: 0.5, y: fist ? y + 0.02 : y - 0.2 };
    return pts;
  };
  export const FilesetResolver = { forVisionTasks: async () => ({}) };
  export class HandLandmarker {
    static async createFromOptions() { return new HandLandmarker(); }
    detectForVideo() { const y = globalThis.__handY; return { landmarks: y == null ? [] : [hand(y, globalThis.__fist)] }; }
  }`;

test.describe("hands-free scrolling", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("https://cdn.jsdelivr.net/npm/@mediapipe/**", (route) =>
      route.fulfill({ contentType: "text/javascript", headers: { "access-control-allow-origin": "*" }, body: FAKE_MEDIAPIPE }));
  });

  test("open hand low scrolls down, middle holds, fist stops, and it carries to the next page", async ({ page }) => {
    await page.goto("./");
    await page.evaluate(() => { globalThis.__handY = 0.85; });
    const fab = page.getByRole("button", { name: /Hands-free scrolling/ });
    await fab.click();
    const panel = page.getByRole("region", { name: "Hands-free scrolling" });
    await expect(panel).toBeVisible();
    await expect(panel).toContainText("Scrolling down ↓", { timeout: 20_000 });
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(400);

    await page.evaluate(() => { globalThis.__handY = 0.5; });
    await expect(panel).toContainText("Holding");
    await page.evaluate(() => { globalThis.__handY = 0.2; globalThis.__fist = true; });
    await expect(panel).toContainText("Paused");
    await page.waitForTimeout(500); // let it brake to a stop
    const y = await page.evaluate(() => scrollY);
    await page.waitForTimeout(400);
    expect(await page.evaluate(() => scrollY)).toBe(y);

    // stays on when moving to another page in the same visit
    await page.goto("project.html?id=securevault-ai");
    await expect(page.getByRole("button", { name: /Hands-free scrolling/ })).toHaveAttribute("aria-pressed", "true", { timeout: 20_000 });

    await page.getByRole("button", { name: "Turn off hands-free scrolling" }).click();
    await expect(page.getByRole("region", { name: "Hands-free scrolling" })).toBeHidden();
    await expect(page.getByRole("button", { name: /Hands-free scrolling/ })).toHaveAttribute("aria-pressed", "false");
    expect(await page.evaluate(() => sessionStorage.getItem("nx-handsfree"))).toBeNull();
  });

  test("can be turned on from the command center", async ({ page }) => {
    await page.goto("./");
    await page.waitForFunction(() => document.querySelector("dialog.nx-cmd"));
    await page.keyboard.press("Control+k");
    await page.keyboard.type("> hands free");
    await page.keyboard.press("Enter");
    await expect(page.getByRole("button", { name: /Hands-free scrolling/ })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("region", { name: "Hands-free scrolling" })).toBeVisible();
  });

  test("a blocked camera turns it back off with an explanation", async ({ page }) => {
    await page.addInitScript(() => {
      navigator.mediaDevices.getUserMedia = () => Promise.reject(new DOMException("denied", "NotAllowedError"));
    });
    await page.goto("./");
    await page.getByRole("button", { name: /Hands-free scrolling/ }).click();
    await expect(page.locator("#toast")).toContainText("permission was blocked");
    await expect(page.getByRole("button", { name: /Hands-free scrolling/ })).toHaveAttribute("aria-pressed", "false");
  });
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
