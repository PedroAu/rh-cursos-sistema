import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * Baseline de acessibilidade (Story 1.1 — Épica 1).
 *
 * Objetivo: MEDIR o estado atual de a11y antes da modernização visual.
 * Esta suíte registra violações como baseline — NÃO falha o build por
 * violações pré-existentes (decisão D6: capturar, não bloquear ainda).
 * A comparação estrita vira gate na Épica 6 (governança).
 *
 * Escopo: rotas públicas (sem dependência de Supabase) + estado de
 * redirect do /admin. Baseline do /admin autenticado fica na story 1.1b.
 */

const publicRoutes = [
  "/",
  "/cursos",
  "/agenda",
  "/blog",
  "/in-company",
  "/contato",
  "/login"
];

// Tags WCAG 2.1 A/AA — o nível mínimo verificável definido no Apple HIG plan.
const wcagTags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

test.describe("baseline a11y — rotas públicas", () => {
  for (const route of publicRoutes) {
    test(`axe registra baseline em ${route}`, async ({ page }, testInfo) => {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      // networkidle pode nunca resolver em páginas com imagens remotas/polling
      // (achado de baseline). Esperamos o body e damos uma folga curta.
      await page.locator("body").waitFor({ state: "visible" });
      await page.waitForTimeout(500);

      const results = await new AxeBuilder({ page }).withTags(wcagTags).analyze();

      // Anexa o resultado como artefato de baseline (consultável no relatório).
      await testInfo.attach(`a11y-${route.replace(/\//g, "_") || "_root"}.json`, {
        body: JSON.stringify(
          {
            route,
            viewport: testInfo.project.name,
            violations: results.violations.map((v) => ({
              id: v.id,
              impact: v.impact,
              help: v.help,
              nodes: v.nodes.length
            }))
          },
          null,
          2
        ),
        contentType: "application/json"
      });

      // Baseline: a página deve carregar e axe deve rodar. Não falhamos por
      // violações pré-existentes — apenas garantimos que a medição ocorreu.
      expect(results).toBeTruthy();
      expect(Array.isArray(results.violations)).toBe(true);
    });
  }
});

test.describe("baseline a11y — estado do admin (não autenticado)", () => {
  test("/admin redireciona para /login (baseline do guard)", async ({ request }) => {
    const response = await request.get("/admin/", { maxRedirects: 0 });
    expect(response.status()).toBe(307);
    expect(response.headers().location).toContain("/login?status=required&next=/admin");
  });
});
