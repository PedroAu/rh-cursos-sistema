import { expect, test } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

/**
 * Baseline visual (Story 1.1 — Épica 1).
 *
 * Decisão D6: CAPTURA + commit do baseline visual, sem falhar o build por
 * diff. Os screenshots são salvos como artefato de referência versionado.
 * A comparação visual estrita (toHaveScreenshot) só vira gate na Épica 6
 * (governança) — aqui apenas CAPTURAMOS, não comparamos, porque páginas com
 * conteúdo dinâmico (ex.: /agenda) têm altura variável e quebrariam um diff
 * estrito, contrariando D6.
 */

const routes = [
  { path: "/", name: "home" },
  { path: "/cursos", name: "cursos" },
  { path: "/agenda", name: "agenda" },
  { path: "/blog", name: "blog" },
  { path: "/in-company", name: "in-company" },
  { path: "/contato", name: "contato" },
  { path: "/login", name: "login" }
];

test.describe("baseline visual — rotas públicas", () => {
  for (const route of routes) {
    test(`captura referência de ${route.name}`, async ({ page }, testInfo) => {
      await page.goto(route.path, { waitUntil: "domcontentloaded" });
      // networkidle pode nunca resolver (imagens remotas/polling). Esperamos o
      // body visível + folga para layout estabilizar antes do screenshot.
      await page.locator("body").waitFor({ state: "visible" });
      await page.waitForTimeout(800);

      // Salva o screenshot como artefato de baseline versionado em
      // tests/baseline/. NÃO comparamos (D6) — apenas registramos o estado.
      const outDir = join(process.cwd(), "tests/baseline");
      mkdirSync(outDir, { recursive: true });
      const filePath = join(outDir, `${route.name}-${testInfo.project.name}.png`);

      const screenshot = await page.screenshot({ fullPage: true, path: filePath });

      // Também anexa ao relatório HTML para consulta rápida.
      await testInfo.attach(`visual-${route.name}-${testInfo.project.name}.png`, {
        body: screenshot,
        contentType: "image/png"
      });

      // Baseline: garante que a captura ocorreu (sem assertir diff visual).
      expect(screenshot.byteLength).toBeGreaterThan(0);
    });
  }
});
