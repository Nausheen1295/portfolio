// Playwright config — runs against your installed Chrome (no browser download needed).
import { defineConfig, devices } from "@playwright/test";

// E2E_PORT + SITE_ROOT let you test a different copy of the site, e.g. a staged deploy.
const PORT = Number(process.env.E2E_PORT || 4173);
// BASE_URL runs the suite against a deployed site instead, e.g.
//   BASE_URL=https://nausheen1295.github.io/portfolio/ npx playwright test
const BASE_URL = process.env.BASE_URL;

export default defineConfig({
  testDir: "e2e",
  timeout: 30_000,
  fullyParallel: true,
  reporter: [["list"]],
  use: { baseURL: BASE_URL || `http://localhost:${PORT}/portfolio/`, channel: "chrome" },
  webServer: BASE_URL ? undefined : { command: `node serve.mjs ${PORT}`, url: `http://localhost:${PORT}/portfolio/`, reuseExistingServer: true },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], channel: "chrome", viewport: { width: 1280, height: 860 } }, testIgnore: /mobile.spec/ },
    { name: "mobile", use: { ...devices["Pixel 7"], channel: "chrome" }, testMatch: /mobile\.spec/ },
  ],
});
