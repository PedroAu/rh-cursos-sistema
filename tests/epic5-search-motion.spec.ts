import { expect, test } from "@playwright/test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

function readProjectFiles(dir: string, predicate: (path: string) => boolean, acc: string[] = []) {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      readProjectFiles(fullPath, predicate, acc);
      continue;
    }
    if (predicate(fullPath)) acc.push(fullPath);
  }
  return acc;
}

test.describe("epica 5 — busca, loading, motion e imagens", () => {
  test("header público não exibe mais a barra de busca global", async ({ page }) => {
    await page.goto("/contato");

    await expect(page.locator("header").first().getByLabel("Buscar cursos")).toHaveCount(0);
  });

  test(“buscas locais expõem limpar e resumo de resultados”, async ({ page }) => {
    await page.goto(“/cursos?q=esocial”);
    await expect(page.getByRole(“button”, { name: “Limpar busca do catálogo” })).toBeVisible();
    await expect(page.locator('[data-testid=”search-results-label”]').first()).toBeVisible();

    await page.goto(“/agenda?q=brasília”);
    await expect(page.getByRole(“button”, { name: “Limpar busca da agenda” })).toBeVisible();
    await expect(page.locator('[data-testid=”search-results-label”]').first()).toBeVisible();

    await page.goto(“/blog?q=esocial”);
    await expect(page.getByRole(“button”, { name: “Limpar busca do blog” })).toBeVisible();
    await expect(page.locator('[data-testid=”search-results-label”]').first()).toBeVisible();
  });

  test("reduced motion elimina animação essencial no JS", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/");

    const animatedInlineStyles = await page
      .locator('[style*="opacity: 0"], [style*="transform"]')
      .count();
    expect(animatedInlineStyles).toBe(0);

    await context.close();
  });

  test("runtime não reintroduz apple-material em conteúdo nem raw img tags", async () => {
    const sourceFiles = readProjectFiles(join(process.cwd(), "src"), (filePath) => /\.(ts|tsx)$/.test(filePath));

    const rawImgOffenders = sourceFiles.filter((filePath) => /<img\b/i.test(readFileSync(filePath, "utf8")));
    expect(rawImgOffenders).toEqual([]);

    const materialOffenders = sourceFiles.filter((filePath) => {
      if (filePath.endsWith("globals.css")) return false;
      return /apple-material|apple-surface/.test(readFileSync(filePath, "utf8"));
    });
    expect(materialOffenders).toEqual([]);
  });
});
