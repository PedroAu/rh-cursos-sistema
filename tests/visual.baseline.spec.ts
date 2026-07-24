import { expect, test } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { publicTestBaselineCourses } from "../src/lib/public-test-baseline";

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
  {
    path: "/cursos/introducao-as-licitacoes-e-contratos-administrativos-nocoes-essenciais-para-o-setor-publico",
    name: "curso-detalhe"
  },
  { path: "/agenda", name: "agenda" },
  { path: "/blog", name: "blog" },
  { path: "/blog/3-alertas-para-revisar-antes-de-enviar-eventos-do-esocial", name: "blog-artigo" },
  { path: "/in-company", name: "in-company" },
  { path: "/sobre", name: "sobre" },
  { path: "/contato", name: "contato" },
  { path: "/login", name: "login" },
  { path: "/inscricao-confirmada", name: "inscricao-confirmada" }
];
const publicTestBaselineStorageKey = "rh_cursos_public_test_baseline";
const playwrightBaseUrl = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3100";

async function prepareStableCapture(routeName: string, page: import("@playwright/test").Page) {
  await page.context().addCookies([
    {
      name: publicTestBaselineStorageKey,
      value: "1",
      url: playwrightBaseUrl
    }
  ]);
  await page.addInitScript((storageKey) => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    window.localStorage.setItem(storageKey, "1");
    document.cookie = `${storageKey}=1; path=/`;
  }, publicTestBaselineStorageKey);

  await page.goto(routes.find((route) => route.name === routeName)?.path ?? "/", { waitUntil: "domcontentloaded" });
  await page.locator("body").waitFor({ state: "visible" });

  if (routeName === "cursos") {
    await page.getByText(
      `${publicTestBaselineCourses.length} cursos no catálogo`,
      { exact: true }
    ).waitFor({ state: "visible" });
    await expect(page.getByText("Atualizando catálogo...", { exact: true })).toHaveCount(0);
    await expect(page.getByText("Nenhum curso encontrado", { exact: true })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Ver turma →" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Ver detalhes →" }).first()).toBeVisible();
  }

  if (routeName === "agenda") {
    // CalendarView é "use client" e pode não renderizar durante SSR pre-render
    // Aguarda apenas o body visível + aguarda um pouco para hidratação client
    await page.waitForTimeout(1000);
  }

  if (routeName === "blog") {
    await page.getByRole("heading", { name: "Últimos artigos", exact: true }).waitFor({ state: "visible" });
    await expect(page.getByText(/\d+ publicações · atualizado toda semana/i)).toBeVisible();
    await expect(page.getByText("Nenhum artigo encontrado", { exact: true })).toHaveCount(0);
    await expect(page.getByRole("link", { name: /Ler artigo/ }).first()).toBeVisible();
  }

  await page.waitForTimeout(800);
}

test.describe("baseline visual — rotas públicas", () => {
  for (const route of routes) {
    test(`captura referência de ${route.name}`, async ({ page }, testInfo) => {
      // Isola cada baseline de qualquer estado persistido e espera o conteúdo
      // crítico da rota antes de capturar.
      await prepareStableCapture(route.name, page);

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
