import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

/**
 * Gera o relatório de contraste WCAG AA (AC3 da Story 1.1).
 *
 * Roda a regra `color-contrast` do axe nas rotas públicas e consolida os
 * achados num markdown versionado em docs/diagnosis/. Apenas MEDE o estado
 * atual — não altera tokens (isso é Story 1.2).
 */

const routes = ["/", "/cursos", "/agenda", "/blog", "/in-company", "/contato", "/login"];

// Story 1.2: sem reduced motion, o axe captura texto NO MEIO das animações de
// entrada (framer-motion anima opacity via inline style) e reporta cores
// mescladas que não existem no código — as 70 falsas violações do baseline
// original eram 100% isso. A emulação é feita via page.emulateMedia() dentro
// do teste (test.use({ reducedMotion }) não chegou à página neste setup);
// o MotionProvider lê a preferência e ativa MotionGlobalConfig.skipAnimations.

/** Aguarda todas as opacidades inline (framer-motion) estabilizarem em 0 ou 1. */
async function waitForMotionSettle(page: import("@playwright/test").Page) {
  await page.waitForFunction(
    () =>
      Array.from(document.querySelectorAll<HTMLElement>("[style*='opacity']")).every((el) => {
        const opacity = getComputedStyle(el).opacity;
        return opacity === "0" || opacity === "1";
      }),
    undefined,
    { timeout: 10_000 }
  );
}

type ContrastFinding = {
  route: string;
  selector: string;
  fg: string;
  bg: string;
  ratio: string;
  expected: string;
};

test("gera relatório de contraste WCAG AA (baseline)", async ({ page }) => {
  const findings: ContrastFinding[] = [];

  await page.emulateMedia({ reducedMotion: "reduce" });

  for (const route of routes) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    await page.locator("body").waitFor({ state: "visible" });
    await page.evaluate(() => document.fonts.ready);
    // Espera a hidratação + animações de entrada (com reduced motion são
    // instantâneas; a janela cobre a chegada da hidratação em si).
    await page.waitForTimeout(1500);
    await waitForMotionSettle(page);

    const results = await new AxeBuilder({ page })
      .withRules(["color-contrast"])
      .analyze();

    for (const violation of results.violations) {
      for (const node of violation.nodes) {
        const data = node.any?.[0]?.data as
          | { fgColor?: string; bgColor?: string; contrastRatio?: number; expectedContrastRatio?: string }
          | undefined;
        findings.push({
          route,
          selector: node.target.join(" "),
          fg: data?.fgColor ?? "?",
          bg: data?.bgColor ?? "?",
          ratio: data?.contrastRatio != null ? String(data.contrastRatio) : "?",
          expected: data?.expectedContrastRatio ?? "4.5:1"
        });
      }
    }
  }

  const lines: string[] = [
    "# Relatório de Contraste WCAG AA — Baseline (Story 1.1)",
    "",
    `**Data:** 2026-06-09`,
    `**Ferramenta:** @axe-core/playwright (regra \`color-contrast\`)`,
    `**Escopo:** rotas públicas (${routes.join(", ")})`,
    "",
    "> Este é um relatório de **medição** do estado atual. Nenhum token foi",
    "> alterado nesta story. As correções são responsabilidade das Stories 1.2-1.4.",
    "",
    `## Resumo`,
    "",
    `Total de violações de contraste encontradas: **${findings.length}**`,
    "",
    "## Detalhamento",
    ""
  ];

  if (findings.length === 0) {
    lines.push("Nenhuma violação de contraste de alto nível detectada pelo axe nas rotas públicas. ✅");
    lines.push("");
    lines.push("> Nota: o axe detecta contraste de texto renderizado. Combinações de");
    lines.push("> tokens não exercitadas em tela podem não aparecer aqui — a Story 1.2");
    lines.push("> deve auditar a paleta de tokens diretamente.");
  } else {
    lines.push("| Rota | Seletor | Texto (fg) | Fundo (bg) | Razão atual | Esperado |");
    lines.push("|------|---------|-----------|-----------|-------------|----------|");
    for (const f of findings) {
      lines.push(
        `| ${f.route} | \`${f.selector}\` | ${f.fg} | ${f.bg} | ${f.ratio} | ${f.expected} |`
      );
    }
  }
  lines.push("");

  const outPath = join(process.cwd(), "docs/diagnosis/contrast-baseline-2026-06-09.md");
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, lines.join("\n"), "utf-8");

  // Baseline: o relatório foi gerado. Não falhamos por violações (D6).
  expect(findings).toBeDefined();
});
