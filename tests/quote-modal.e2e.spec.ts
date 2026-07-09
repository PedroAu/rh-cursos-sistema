import { expect, test } from "@playwright/test";

/**
 * E2E do modal global de Orçamento In Company (EP-4.6).
 * Trava o caminho B2B: validação inline e abertura a partir de /in-company.
 *
 * O gatilho pré-preenchido a partir do card de curso em /cursos foi removido
 * (era uma adição fora do escopo do canvas — ver spec-catalogo.md); o fluxo
 * de orçamento pré-preenchido por curso não tem mais ponto de entrada no app.
 */

test.describe("orçamento in company — modal global", () => {
  test("abre sem curso a partir de /in-company e valida campos", async ({ page }) => {
    await page.goto("/in-company");

    await page.getByRole("button", { name: "Solicitar orçamento" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("Orçamento personalizado In Company")).toBeVisible();

    // Enviar vazio deve bloquear com erros inline
    await dialog.getByRole("button", { name: "Enviar solicitação" }).click();
    await expect(dialog.getByText("Informe a empresa ou órgão.")).toBeVisible();
    await expect(dialog.getByText("Informe o CNPJ ou identificação fiscal.")).toBeVisible();
  });
});
