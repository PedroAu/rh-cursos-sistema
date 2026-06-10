import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const wcagTags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

const a11yRoutes = [
  "/",
  "/cursos?q=esocial",
  "/agenda?q=bras%C3%ADlia",
  "/contato",
  "/login?status=required&next=/admin"
];

async function waitForStableUi(page: import("@playwright/test").Page) {
  await page.locator("body").waitFor({ state: "visible" });
  await page.waitForTimeout(700);
}

test.describe("epica 6 — governanca de design", () => {
  test.use({ reducedMotion: "reduce" });

  test("rotas críticas passam no gate de acessibilidade WCAG A/AA", async ({ page }) => {
    for (const route of a11yRoutes) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await waitForStableUi(page);

      const results = await new AxeBuilder({ page }).withTags(wcagTags).analyze();
      expect(results.violations, `Violacoes axe em ${route}`).toEqual([]);
    }
  });

  test("hero da home mantém baseline visual", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await waitForStableUi(page);

    await expect(page.getByTestId("ui-hero-home")).toHaveScreenshot("home-hero-governance.png");
  });

  test("painel de filtros do catálogo mantém baseline visual", async ({ page }) => {
    await page.goto("/cursos?q=esocial", { waitUntil: "domcontentloaded" });
    await waitForStableUi(page);

    await expect(page.getByTestId("ui-courses-filters")).toHaveScreenshot("courses-filters-governance.png");
  });

  test("painel de filtros da agenda mantém baseline visual", async ({ page }) => {
    await page.goto("/agenda?q=bras%C3%ADlia", { waitUntil: "domcontentloaded" });
    await waitForStableUi(page);

    await expect(page.getByTestId("ui-agenda-filters")).toHaveScreenshot("agenda-filters-governance.png", {
      maxDiffPixelRatio: 0.02
    });
  });

  test("formulário de contato mantém baseline visual", async ({ page }) => {
    await page.goto("/contato", { waitUntil: "domcontentloaded" });
    await waitForStableUi(page);

    await expect(page.getByTestId("ui-contact-form")).toHaveScreenshot("contact-form-governance.png");
  });

  test("card de login mantém baseline visual", async ({ page }) => {
    await page.goto("/login?status=required&next=/admin", { waitUntil: "domcontentloaded" });
    await waitForStableUi(page);

    await expect(page.getByTestId("ui-login-card")).toHaveScreenshot("login-card-governance.png");
  });
});
