import { test, expect, PAGES } from "./fixtures.js";

test.describe("pages load cleanly", () => {
  for (const url of [...PAGES, "design-system.html"]) {
    test(`${url} renders without errors`, async ({ page }) => {
      const res = await page.goto(url);
      expect(res.status()).toBe(200);
      await expect(page.locator("h1").first()).toBeVisible();
    });
  }

  test.describe(() => {
    test.use({ allowErrors: [/status of 404/] });
    test("unknown URLs get the NEXUS 404 page", async ({ page }) => {
    const res = await page.goto("does-not-exist");
    expect(res.status()).toBe(404);
    await expect(page.getByRole("heading", { name: /drifted out of the NEXUS Universe/ })).toBeVisible();
    await expect(page.getByRole("link", { name: "Explore NEXUS" })).toHaveAttribute("href", "/portfolio/#universe");
    });
  });
});

test.describe("boot sequence", () => {
  test.use({ boot: true });

  test("plays on first visit, can be skipped, and not again this session", async ({ page }) => {
    await page.clock.install(); // freeze timers so the intro can't finish by itself mid-test
    await page.goto("./");
    const boot = page.locator("#boot");
    await expect(boot).toBeVisible();
    await expect(page.locator("#bootLog li").first()).toHaveText("INITIALIZING NEXUS…"); // static first line
    await page.getByRole("button", { name: /Skip intro/ }).click({ force: true }); // frozen clock also freezes rAF-based stability checks
    await expect(boot).toBeHidden();
    await page.clock.runFor(1_000);
    await page.reload();
    await expect(boot).toBeHidden();
  });

  test("finishes by itself in under 3 seconds", async ({ page }) => {
    await page.goto("./");
    await expect(page.locator("#bootLog")).toContainText("NEXUS ONLINE");
    await expect(page.locator("#boot")).toBeHidden({ timeout: 3_000 });
  });

  test("is skipped for deep links", async ({ page }) => {
    await page.goto("./#contact");
    await expect(page.locator("#boot")).toBeHidden();
  });
});

test.describe("hero & navigation", () => {
  test("hero shows identity, CTAs and quick links", async ({ page }) => {
    await page.goto("./");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Nausheen\s*Haleelur Rahman/);
    await expect(page.getByText("AI & Software Developer").first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Explore NEXUS/ })).toHaveAttribute("href", "#universe");
    await expect(page.locator("#top").getByRole("link", { name: /Meet NEXA/ })).toHaveAttribute("href", "#nexa");
    const quick = page.getByRole("list", { name: "Quick links" });
    for (const name of ["Résumé", "GitHub", "LinkedIn", "Contact"]) await expect(quick.getByRole("link", { name })).toBeVisible();
    await expect(page.locator("#heroMeta")).toContainText("Research labs");
  });

  test("nav links scroll to sections and mark the current one", async ({ page }) => {
    await page.goto("./");
    const nav = page.getByRole("navigation", { name: "Primary" });
    for (const [name, id] of [["Journey", "journey"], ["Contact", "contact"], ["About", "about"]]) {
      await nav.getByRole("link", { name }).click();
      await expect(page.locator(`#${id}`)).toBeInViewport();
      await expect(nav.getByRole("link", { name })).toHaveAttribute("aria-current", "true");
    }
  });

  test("skip link jumps to main content", async ({ page }) => {
    await page.goto("./");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
  });

  test("theme toggle switches, persists, and carries across pages", async ({ page }) => {
    await page.goto("./");
    const html = page.locator("html");
    await expect(html).toHaveAttribute("data-theme", "dark");
    await page.getByRole("button", { name: "Switch to light theme" }).click();
    await expect(html).toHaveAttribute("data-theme", "light");
    await page.goto("project.html?id=securevault-ai");
    await expect(html).toHaveAttribute("data-theme", "light");
    await page.goto("playground/snake.html");
    await expect(html).toHaveAttribute("data-theme", "light");
    await page.getByRole("button", { name: "Switch to dark theme" }).click();
    await page.goto("./");
    await expect(html).toHaveAttribute("data-theme", "dark");
  });
});

test.describe("resilience", () => {
  test("content is readable with JavaScript disabled", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto("./");
    await page.waitForTimeout(2_800); // inline failsafe removes the JS-only hiding
    for (const id of ["heroName", "aboutTitle", "contactTitle"]) {
      const opacity = await page.locator(`#${id}`).evaluate((el) => getComputedStyle(el).opacity);
      expect(Number(opacity)).toBe(1);
    }
    await expect(page.locator("#contactForm")).toHaveAttribute("action", /formspree\.io/); // form still posts natively
    await ctx.close();
  });

  test("reduced motion skips the boot and animations", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto("./");
    await expect(page.locator("#boot")).toBeHidden();
    const anim = await page.locator("#heroName").evaluate((el) => getComputedStyle(el).animationName);
    expect(anim).toBe("none");
    await ctx.close();
  });
});
