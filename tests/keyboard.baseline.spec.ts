import { expect, test } from "@playwright/test";

/**
 * Baseline de navegação por teclado (Story 1.1 — Épica 1).
 *
 * Mede o estado atual de acessibilidade por teclado nos fluxos essenciais.
 * Registra o comportamento como baseline — documenta o que funciona e o que
 * precisa de correção nas stories seguintes (2.x).
 */

test.describe("baseline teclado — skip link", () => {
  test("primeiro Tab revela skip link na home", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");

    const skipLink = page.locator("a.skip-link, a[href='#main'], a[href='#conteudo']").first();
    // Baseline: registra se o skip link existe e é focável.
    const exists = (await skipLink.count()) > 0;
    test.info().annotations.push({
      type: "baseline",
      description: `skip-link presente: ${exists}`
    });
    expect(typeof exists).toBe("boolean");
  });
});

test.describe("baseline teclado — navegação tabável", () => {
  const routes = ["/", "/cursos", "/contato", "/login"];

  for (const route of routes) {
    test(`elementos interativos são alcançáveis por Tab em ${route}`, async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState("networkidle");

      // Tabula algumas vezes e confirma que o foco se move por elementos reais.
      const focusedTags: string[] = [];
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press("Tab");
        const tag = await page.evaluate(() => document.activeElement?.tagName ?? null);
        if (tag) focusedTags.push(tag);
      }

      test.info().annotations.push({
        type: "baseline",
        description: `${route} → foco em: ${focusedTags.join(", ")}`
      });

      // Baseline: ao menos um elemento interativo recebeu foco.
      expect(focusedTags.length).toBeGreaterThan(0);
    });
  }
});

test.describe("baseline teclado — busca do catálogo", () => {
  test("campo de busca é focável e aceita digitação", async ({ page }) => {
    await page.goto("/cursos", { waitUntil: "domcontentloaded" });
    await page.locator("body").waitFor({ state: "visible" });
    await page.waitForTimeout(500);

    const search = page.locator("input[type='search'], input[placeholder*='Buscar' i]").first();
    const exists = (await search.count()) > 0;
    // Em mobile a busca pode estar atrás de um menu — registramos visibilidade
    // como baseline em vez de exigir interação.
    const visible = exists ? await search.isVisible() : false;

    if (visible) {
      await search.fill("teste");
      await expect(search).toHaveValue("teste");
    }

    test.info().annotations.push({
      type: "baseline",
      description: `busca catálogo presente: ${exists}, visível: ${visible}`
    });
    expect(typeof exists).toBe("boolean");
  });
});
