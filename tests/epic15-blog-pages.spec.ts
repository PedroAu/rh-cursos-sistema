import { loadEnvFile } from "node:process";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { SESSION_COOKIE, encodeSession } from "@/lib/auth";

try {
  loadEnvFile(".env.local");
} catch {
  // O segredo pode ser fornecido diretamente pelo ambiente de CI.
}

async function loginAsAdmin(context: import("@playwright/test").BrowserContext, baseURL: string) {
  const token = await encodeSession({ role: "admin", email: "admin@rhcursos.com.br", name: "Admin E2E" });
  await context.addCookies([{ name: SESSION_COOKIE, value: token, url: baseURL }]);
}

test.describe("epic 15.8 — Blog e Páginas", () => {
  test.beforeEach(async ({ context, baseURL }) => {
    await loginAsAdmin(context, baseURL ?? "http://127.0.0.1:3100");
  });

  test("Blog mantém gestão editorial, busca e ação de criação", async ({ page }) => {
    await page.goto("/admin/blog");

    await expect(page.getByRole("heading", { name: "Blog", level: 1 })).toBeVisible();
    await expect(page.getByText(/\d+ posts? no acervo · \d+ publicados? no site/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Novo post" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Buscar registros" })).toBeVisible();
  });

  test("Páginas lista rotas reais sem oferecer edição falsa", async ({ page }) => {
    await page.goto("/admin/paginas");

    await expect(page.getByRole("heading", { name: "Páginas do site", level: 1 })).toBeVisible();
    await expect(page.getByRole("table", { name: "Páginas públicas do site" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Abrir Cursos" })).toHaveAttribute("href", "/cursos");
    await expect(page.getByRole("button", { name: /editar|excluir|nova página/i })).toHaveCount(0);
    await expect(page.getByRole("link", { name: /editar|excluir|nova página/i })).toHaveCount(0);
  });

  test("Páginas é responsiva e passa no gate WCAG 2.1 A/AA", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/admin/paginas");

    await expect(page.getByRole("heading", { name: "Páginas do site", level: 1 })).toBeVisible();
    const layout = await page.evaluate(() => ({
      fits: document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      offenders: Array.from(document.querySelectorAll<HTMLElement>("body *"))
        .filter((element) => element.getBoundingClientRect().right > document.documentElement.clientWidth + 1)
        .slice(0, 8)
        .map((element) => ({ tag: element.tagName, className: element.className, right: element.getBoundingClientRect().right })),
    }));
    expect(layout, JSON.stringify(layout.offenders)).toMatchObject({ fits: true });

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(results.violations).toHaveLength(0);
  });
});
