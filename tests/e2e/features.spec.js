import { test, expect, ready } from "./fixtures.js";

/* ---------------------------------------------------------------- Journey */
test.describe("engineering journey", () => {
  test("stages behave as tabs with evidence", async ({ page }) => {
    await page.goto("./#journey");
    const tabs = page.getByRole("tablist", { name: "Engineering stages" }).getByRole("tab");
    await expect(tabs).toHaveCount(9);
    await expect(tabs.first()).toHaveAttribute("aria-selected", "true");
    await tabs.first().focus();
    await page.keyboard.press("ArrowRight");
    await expect(tabs.nth(1)).toBeFocused();
    await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("End");
    await expect(page.locator("#jrPanel")).toContainText("Iteration");
    await expect(page.locator("#jrPanel")).toContainText("No project has documented this stage yet");
  });

  test("following a project jumps to its furthest stage", async ({ page }) => {
    await page.goto("./#journey");
    await page.getByRole("group", { name: "Follow a project" }).getByRole("button", { name: "SecureVault AI" }).click();
    await expect(page.locator("#jrPanel")).toContainText("Deployment");
    await expect(page.locator("#jrPanel").getByRole("link", { name: /Live demo/ })).toBeVisible();
  });
});

/* ---------------------------------------------------------------- NEXA */
test.describe("NEXA (offline: documentation search)", () => {
  test("reports offline and never imitates AI", async ({ page }) => {
    await page.goto("./#nexa");
    await expect(page.locator(".nx-nexa-status")).toContainText("Offline");
    await page.getByLabel("Ask NEXA a question").fill("Why did you use AES-256-GCM?");
    await page.keyboard.press("Enter");
    const reply = page.locator(".nx-msg--doc").last();
    await expect(reply).toContainText("Documentation search · not an AI answer");
    await expect(reply).toContainText("Engineering decisions (SecureVault AI): not documented yet");
    await expect(reply.getByRole("link", { name: "SecureVault AI" })).toHaveAttribute("href", /project\.html\?id=securevault-ai/);
  });

  test("modes, suggestions, context and clear work", async ({ page }) => {
    await page.goto("./#nexa");
    await page.getByRole("group", { name: "Answer mode" }).getByRole("button", { name: "Interview" }).click();
    await expect(page.locator(".nx-nexa-hint")).toContainText("Nausheen's voice");
    await page.locator(".nx-nexa-context select").selectOption("floramind-ai");
    await page.locator("[data-suggest]").first().click();
    await expect(page.locator(".nx-msg--doc").last()).toContainText("FloraMind AI");
    await page.getByRole("button", { name: "Clear" }).click();
    await expect(page.locator(".nx-chat-log .nx-msg")).toHaveCount(1);
  });

  test("user input is escaped, never rendered as HTML", async ({ page }) => {
    await page.goto("./#nexa");
    await page.getByLabel("Ask NEXA a question").fill('<img src=x onerror="window.__xss=1">');
    await page.keyboard.press("Enter");
    await expect(page.locator(".nx-msg--user").last()).toContainText("<img");
    expect(await page.evaluate(() => window.__xss)).toBeUndefined();
    await expect(page.locator(".nx-chat-log img")).toHaveCount(0);
  });
});

test.describe("NEXA (online: mocked backend)", () => {
  async function mockBackend(page, chat) {
    const cors = { "access-control-allow-origin": "*", "access-control-allow-headers": "content-type, accept", "access-control-allow-methods": "GET, POST" };
    await page.route("**/js/nexa/config.js", (r) => r.fulfill({
      contentType: "text/javascript",
      body: 'export const NEXA_CONFIG = { endpoint: "https://nexa.test/v1", timeoutMs: 5000, maxQuestionLength: 500, maxHistory: 8 };',
    }));
    await page.route("https://nexa.test/v1/**", async (r) => {
      if (r.request().method() === "OPTIONS") return r.fulfill({ status: 204, headers: cors });
      if (r.request().url().endsWith("/health")) return r.fulfill({ json: { status: "ok" }, headers: cors });
      return chat(r, cors);
    });
  }

  test("shows online status, grounded answer and sources", async ({ page }) => {
    let body;
    await mockBackend(page, (r, headers) => {
      body = r.request().postDataJSON();
      return r.fulfill({ headers, json: { answer: "SecureVault AI encrypts files locally with AES-256-GCM.", sources: [{ title: "SecureVault AI — security", url: "https://nausheen1295.github.io/portfolio/project.html?id=securevault-ai#security" }], grounded: true } });
    });
    await page.goto("./#nexa");
    await expect(page.locator(".nx-nexa-status")).toContainText("Online");
    await page.getByRole("group", { name: "Answer mode" }).getByRole("button", { name: "Developer" }).click();
    await page.getByLabel("Ask NEXA a question").fill("How is data encrypted?");
    await page.keyboard.press("Enter");
    const reply = page.locator(".nx-msg--nexa").last();
    await expect(reply).toContainText("AES-256-GCM");
    await expect(reply.getByRole("link", { name: "SecureVault AI — security" })).toBeVisible();
    expect(body).toMatchObject({ question: "How is data encrypted?", mode: "developer", projectId: null });
  });

  test("unsafe source URLs from the API are dropped", async ({ page }) => {
    await mockBackend(page, (r, headers) => r.fulfill({ headers, json: {
      answer: "ok", grounded: true,
      sources: [{ title: "evil", url: "javascript:alert(1)" }, { title: "data", url: "data:text/html,x" }, { title: "good", url: "https://example.com/doc" }],
    } }));
    await page.goto("./#nexa");
    await expect(page.locator(".nx-nexa-status")).toContainText("Online");
    await page.getByLabel("Ask NEXA a question").fill("anything");
    await page.keyboard.press("Enter");
    const links = page.locator(".nx-msg--nexa").last().locator(".nx-doc-sources a");
    await expect(links).toHaveCount(1);
    await expect(links).toHaveAttribute("href", "https://example.com/doc");
  });

  test.describe(() => {
  test.use({ allowErrors: [/status of (429|500)/] });
  test("rate limiting and errors are shown politely", async ({ page }) => {
    let n = 0;
    await mockBackend(page, (r, headers) => (++n === 1
      ? r.fulfill({ status: 429, headers, json: { error: "slow down", retryAfter: 30 } })
      : r.fulfill({ status: 500, headers, body: "oops" })));
    await page.goto("./#nexa");
    await expect(page.locator(".nx-nexa-status")).toContainText("Online");
    const ask = async (q) => { await page.getByLabel("Ask NEXA a question").fill(q); await page.keyboard.press("Enter"); };
    await ask("one");
    await expect(page.locator(".nx-msg--error").last()).toContainText("try again shortly");
    await ask("two");
    await expect(page.locator(".nx-msg--error").last()).toContainText("couldn't answer right now");
  });
  });
});

/* ---------------------------------------------------------------- Command Center */
test.describe("command center", () => {
  test("opens with Ctrl+K and '/', searches projects", async ({ page }) => {
    await page.goto("./");
    await ready(page);
    await page.keyboard.press("Control+k");
    const box = page.getByRole("combobox", { name: "Search or run a command" });
    await expect(box).toBeFocused();
    await box.fill("Cybersecurity");
    await expect(page.locator(".nx-cmd-item-label").first()).toHaveText("SecureVault AI");
    await page.keyboard.press("Escape");
    await page.keyboard.press("/");
    await expect(box).toBeFocused();
    await box.fill("Computer Vision");
    await expect(page.locator(".nx-cmd-item-label").first()).toHaveText("FloraMind AI");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/project\.html\?id=floramind-ai/);
  });

  test("> open security lab", async ({ page }) => {
    await page.goto("./");
    await ready(page);
    await page.keyboard.press("Control+k");
    await page.keyboard.type("> open security lab");
    await page.keyboard.press("Enter");
    await expect(page.locator('.nx-uni-node[data-lab="security"]')).toHaveAttribute("aria-pressed", "true");
  });

  test("> explain securevault from a case study hands off to NEXA", async ({ page }) => {
    await page.goto("project.html?id=nexa");
    await page.getByRole("button", { name: "Search and commands" }).click();
    await page.keyboard.type("> explain securevault");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#nexa$/);
    await expect(page.locator(".nx-msg--user").last()).toHaveText("Explain SecureVault AI");
    await expect(page.locator(".nx-nexa-context select")).toHaveValue("securevault-ai");
  });

  test("> start interview, help, unknown commands", async ({ page }) => {
    await page.goto("./");
    await ready(page);
    await page.keyboard.press("Control+k");
    await page.keyboard.type("> help");
    await page.keyboard.press("Enter");
    await expect(page.locator(".nx-cmd-output")).toContainText("open <lab> lab");
    await page.getByRole("combobox", { name: "Search or run a command" }).fill("> flibbertigibbet");
    await page.keyboard.press("Enter");
    await expect(page.locator(".nx-cmd-output")).toContainText("Unknown command");
    await page.getByRole("combobox", { name: "Search or run a command" }).fill("> start interview");
    await page.keyboard.press("Enter");
    await expect(page.getByRole("group", { name: "Answer mode" }).getByRole("button", { name: "Interview" })).toHaveAttribute("aria-pressed", "true");
  });

  test("arrow keys move the highlighted option", async ({ page }) => {
    await page.goto("./");
    await ready(page);
    await page.keyboard.press("Control+k");
    const box = page.getByRole("combobox", { name: "Search or run a command" });
    await expect(box).toHaveAttribute("aria-activedescendant", "nxCmdOpt0");
    await page.keyboard.press("ArrowDown");
    await expect(box).toHaveAttribute("aria-activedescendant", "nxCmdOpt1");
    await expect(page.locator("#nxCmdOpt1")).toHaveAttribute("aria-selected", "true");
  });
});

/* ---------------------------------------------------------------- Achievements & easter eggs */
test.describe("achievements", () => {
  test("exploring a lab unlocks it; all seven unlock NEXUS Explorer", async ({ page }) => {
    await page.goto("./#universe");
    await page.locator('.nx-uni-node[data-lab="earth"]').click();
    await expect(page.locator(".nx-achv")).toContainText("Earth Explorer");
    for (const lab of ["security", "ai", "knowledge", "data", "bio", "experimental"]) await page.locator(`.nx-uni-node[data-lab="${lab}"]`).click();
    await expect(page.locator(".nx-achv", { hasText: "NEXUS Explorer" })).toBeVisible({ timeout: 5_000 });
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("nx-achievements")));
    expect(stored).toContain("nexus");
  });

  test("Konami code opens LAB-00", async ({ page }) => {
    await page.goto("./");
    await ready(page);
    for (const k of ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"]) await page.keyboard.press(k);
    await expect(page.locator(".nx-cmd-output")).toContainText("LAB-00");
  });
});

/* ---------------------------------------------------------------- Contact */
test.describe("contact form", () => {
  const fill = async (page) => {
    await page.getByLabel("Name").fill("Ada");
    await page.getByLabel("Email").fill("ada@example.com");
    await page.getByLabel("Message").fill("Hello!");
    await page.getByRole("button", { name: /Send message/ }).click();
  };

  test("success path (Formspree mocked)", async ({ page }) => {
    let posted;
    await page.route("https://formspree.io/**", (r) => { posted = r.request().postData(); return r.fulfill({ json: { ok: true } }); });
    await page.goto("./#contact");
    await fill(page);
    await expect(page.locator("#formNote")).toContainText("Thank you, Ada!");
    expect(posted).toContain("ada@example.com");
    await expect(page.getByLabel("Name")).toHaveValue("");
  });

  test.describe(() => {
  test.use({ allowErrors: [/status of 500/] });
  test("failure path offers the email address", async ({ page }) => {
    await page.route("https://formspree.io/**", (r) => r.fulfill({ status: 500, body: "{}" }));
    await page.goto("./#contact");
    await fill(page);
    await expect(page.locator("#formNote").getByRole("link", { name: "naus2005official@gmail.com" })).toBeVisible();
  });
  });

  test("required fields are enforced", async ({ page }) => {
    let called = false;
    await page.route("https://formspree.io/**", (r) => { called = true; return r.fulfill({ json: {} }); });
    await page.goto("./#contact");
    await page.getByRole("button", { name: /Send message/ }).click();
    expect(called).toBe(false);
    expect(await page.getByLabel("Name").evaluate((el) => el.validity.valid)).toBe(false);
  });
});
