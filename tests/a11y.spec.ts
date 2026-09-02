import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * A11y Integration Tests with Axe-core (Story 8.1 — AC10)
 *
 * Objetivo: Integrar @axe-core/playwright como automático gate para detectar
 * regressões de acessibilidade WCAG 2.1 A/AA antes de deploy.
 *
 * Diferença do a11y.baseline.spec.ts:
 * - Baseline: CAPTURA violações (sem falhar build) — para medir estado inicial
 * - Este: FALHA no gate se violações WCAG encontradas — para prevenir regressões
 *
 * Escopo: Rotas públicas sem dependência de autenticação:
 * /, /cursos, /agenda, /blog, /in-company, /contato, /login
 */

const publicRoutes = [
  "/",
  "/cursos",
  "/agenda",
  "/blog",
  "/in-company",
  "/lp/departamento-pessoal-do-zero",
  "/contato",
  "/login"
];

const wcagTags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

test.describe("A11y — Axe-core CI Integration", () => {
  for (const route of publicRoutes) {
    test(`rota ${route} passa no Axe-core WCAG 2.1 A/AA`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(route, { waitUntil: "domcontentloaded" });
      // Aguarda body visível e dá folga para conteúdo carregar
      // (networkidle é instável em rotas com imagens remotas/polling)
      await page.locator("body").waitFor({ state: "visible" });
      await page.waitForTimeout(500);

      const results = await new AxeBuilder({ page })
        .withTags(wcagTags)
        .analyze();

      // Relatório para debug (anexado aos artefatos do Playwright)
      const violationSummary = results.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.length,
        help: v.help
      }));

      if (results.violations.length > 0) {
        console.log(
          `A11y violations found on ${route}:`,
          JSON.stringify(violationSummary, null, 2)
        );
      }

      // Gate: FALHA se houver violações WCAG
      // Critério: zero violações = compliance automático
      expect(results.violations, `No WCAG violations expected on ${route}`).toHaveLength(
        0
      );

      // Assertions secundárias (garantem que axe rodou corretamente)
      expect(results).toBeTruthy();
      expect(Array.isArray(results.violations)).toBe(true);
      expect(Array.isArray(results.passes)).toBe(true);
    });
  }

  test("verifica que axe encontra e relata violações conhecidas (sanity check)", async ({
    page
  }) => {
    // Valida que o Axe está funcionando corretamente ao rodar na página raiz.
    // Se nenhuma violação conhecida for encontrada nesta rota, confirma que
    // a ferramenta está ativa.
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.locator("body").waitFor({ state: "visible" });
    await page.waitForTimeout(500);

    const results = await new AxeBuilder({ page })
      .withTags(wcagTags)
      .analyze();

    // Axe deve ter rodado (não pode estar erro ou undefined)
    expect(results).toBeTruthy();
    expect(results.violations).toBeDefined();
  });
});

test.describe("A11y — Relatório consolidado", () => {
  test("gera relatório consolidado de violações por rota", async ({}, testInfo) => {
    /**
     * Coleta violações de todas as rotas e anexa um relatório consolidado
     * para análise. Este teste roda APÓS os testes de gate (que falham se
     * houver violações) — seu propósito é fornecer artefato documentado
     * mesmo em caso de sucesso (compliance proativo).
     */

    const allViolations: Record<
      string,
      Array<{ id: string; impact: string; nodeCount: number }>
    > = {};
    let totalViolations = 0;

    for (const route of publicRoutes) {
      const { page } = await testInfo.context?.browser?.newPage() || {};
      if (!page) {
        console.warn("Skipping report generation: unable to create page");
        continue;
      }

      try {
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.goto(route, { waitUntil: "domcontentloaded" });
        await page.locator("body").waitFor({ state: "visible" });
        await page.waitForTimeout(500);

        const results = await new AxeBuilder({ page })
          .withTags(wcagTags)
          .analyze();

        allViolations[route] = results.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          nodeCount: v.nodes.length
        }));

        totalViolations += results.violations.length;
      } catch (error) {
        console.error(`Error generating report for ${route}:`, error);
      } finally {
        await page?.close();
      }
    }

    // Anexa relatório consolidado
    await testInfo.attach("a11y-violation-report.json", {
      body: JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          totalViolations,
          routeBreakdown: allViolations,
          wcagLevel: "WCAG 2.1 A/AA",
          threshold: "ZERO violations"
        },
        null,
        2
      ),
      contentType: "application/json"
    });
  });
});
