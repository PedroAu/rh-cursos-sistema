import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const wcagTags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];
const shouldSkipVisualBaselines = !!process.env.CI || process.platform !== "darwin";
const publicTestBaselineStorageKey = "rh_cursos_public_test_baseline";

const a11yRoutes = [
  "/",
  "/cursos?q=lgpd",
  "/agenda?q=bras%C3%ADlia",
  "/contato",
  "/falar-com-especialista",
  "/login?status=required&next=/admin"
];

async function waitForStableUi(page: import("@playwright/test").Page) {
  await page.locator("body").waitFor({ state: "visible" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(700);
}

async function waitForMotionSettle(page: import("@playwright/test").Page) {
  await page.waitForFunction(
    () => {
      const elements = Array.from(document.body.querySelectorAll<HTMLElement>("*"));
      const snapshot = `${elements.length}:${elements
        .map((element) => getComputedStyle(element).opacity)
        .join("|")}`;
      const previous = document.body.dataset.motionOpacitySnapshot;
      const stableFrames =
        previous === snapshot
          ? Number(document.body.dataset.motionOpacityStableFrames ?? "0") + 1
          : 0;

      document.body.dataset.motionOpacitySnapshot = snapshot;
      document.body.dataset.motionOpacityStableFrames = String(stableFrames);
      return stableFrames >= 3;
    },
    undefined,
    { timeout: 10_000 }
  );

  await page.evaluate(() => {
    delete document.body.dataset.motionOpacitySnapshot;
    delete document.body.dataset.motionOpacityStableFrames;
  });
}

async function gotoStable(page: import("@playwright/test").Page, route: string) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(route, { waitUntil: "domcontentloaded" });
  await waitForStableUi(page);

  if (route === "/") {
    await expect(page.locator("main")).toBeVisible();
  }
  if (route.startsWith("/cursos")) {
    await expect(page.getByText(/\d+ cursos no catálogo/i)).toBeVisible();
  }

  await waitForMotionSettle(page);
}

async function normalizeScreenshotHeight(locator: import("@playwright/test").Locator) {
  try {
    // Tenta normalizar com timeout curto (2s) para SSR mismatch
    await locator.evaluate((element) => {
      const height = element.getBoundingClientRect().height;
      (element as HTMLElement).style.minHeight = `${Math.ceil(height)}px`;
    }, { timeout: 2000 });
  } catch {
    // Se não encontrar ou timeout, ignora (elemento pode não estar disponível em SSR)
  }
}

test.describe("epica 6 — governanca de design", () => {
  test.use({ reducedMotion: "reduce" });

  test.beforeEach(async ({ context, page }) => {
    await page.addInitScript(() => {
      document.cookie = "rh_cursos_public_test_baseline=1; path=/";
    });
    await page.goto("/", { waitUntil: "commit" });
    await context.addCookies([
      {
        name: publicTestBaselineStorageKey,
        value: "1",
        url: new URL("/", page.url()).toString()
      }
    ]);
    await page.addInitScript((storageKey) => {
      window.localStorage.setItem(storageKey, "1");
    }, publicTestBaselineStorageKey);
  });

  test("rotas críticas passam no gate de acessibilidade WCAG A/AA", async ({ page }) => {
    for (const route of a11yRoutes) {
      await gotoStable(page, route);

      const results = await new AxeBuilder({ page }).withTags(wcagTags).analyze();
      expect(results.violations, `Violacoes axe em ${route}`).toEqual([]);
    }
  });

  test("hero da home mantém baseline visual", async ({ page }) => {
    test.skip(shouldSkipVisualBaselines, "Baselines visuais são mantidos fora do runner CI/Linux.");
    await gotoStable(page, "/");

    await expect(page.getByTestId("ui-hero-home")).toHaveScreenshot("home-hero-governance.png");
  });

  test("home completa mantém baseline visual", async ({ page }) => {
    test.skip(shouldSkipVisualBaselines, "Baselines visuais são mantidos fora do runner CI/Linux.");
    await gotoStable(page, "/");

    await expect(page).toHaveScreenshot("home-page-governance.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.02
    });
  });

  test("home mobile completa mantém baseline visual", async ({ page }) => {
    test.skip(shouldSkipVisualBaselines, "Baselines visuais são mantidos fora do runner CI/Linux.");
    await page.setViewportSize({ width: 375, height: 667 });
    await gotoStable(page, "/");

    await expect(page).toHaveScreenshot("home-page-mobile-governance.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.02
    });
  });

  test("painel de filtros do catálogo mantém baseline visual", async ({ page }) => {
    test.skip(shouldSkipVisualBaselines, "Baselines visuais são mantidos fora do runner CI/Linux.");
    await gotoStable(page, "/cursos?q=lgpd");

    await expect(page.getByTestId("ui-courses-filters")).toHaveScreenshot(
      "courses-filters-governance.png",
      { maxDiffPixels: 12 }
    );
  });

  test("painel de filtros da agenda mantém baseline visual", async ({ page }) => {
    test.skip(shouldSkipVisualBaselines, "Baselines visuais são mantidos fora do runner CI/Linux.");
    await gotoStable(page, "/agenda");

    const filters = page.getByTestId("ui-agenda-filters");
    await normalizeScreenshotHeight(filters);
    await expect(filters).toHaveScreenshot("agenda-filters-governance.png", {
      maxDiffPixelRatio: 0.02,
      timeout: 10000
    });
  });

  test("formulário de contato mantém baseline visual", async ({ page }) => {
    test.skip(shouldSkipVisualBaselines, "Baselines visuais são mantidos fora do runner CI/Linux.");
    await gotoStable(page, "/contato");

    const contactForm = page.getByTestId("ui-contact-form");
    await page.evaluate(() => {
      const spacer = document.createElement("div");
      spacer.dataset.visualTestSpacer = "contact-form";
      spacer.style.height = `${window.innerHeight}px`;
      spacer.setAttribute("aria-hidden", "true");
      document.body.appendChild(spacer);
    });
    await contactForm.evaluate((element) => {
      const top = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, top);
    });
    await expect(contactForm).toHaveScreenshot("contact-form-governance.png");
  });

  test("card de login mantém baseline visual", async ({ page }) => {
    test.skip(shouldSkipVisualBaselines, "Baselines visuais são mantidos fora do runner CI/Linux.");
    await gotoStable(page, "/login?status=required&next=/admin");

    await expect(page.getByTestId("ui-login-card")).toHaveScreenshot("login-card-governance.png");
  });
});
