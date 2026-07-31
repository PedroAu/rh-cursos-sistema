import { expect, test } from "@playwright/test";

import { loginWithSsrSession } from "@tests/helpers/integration-env";

test.describe("epic 20 — evolução operacional do admin", () => {
  test("recursos administrativos exibem paginação e detalhe do registro", async ({ context, page, baseURL }) => {
    await loginWithSsrSession({ baseURL: baseURL ?? "http://127.0.0.1:3100", context, name: "Admin E2E" });
    await page.goto("/admin/cursos");

    await expect(page.getByRole("navigation", { name: "Paginação" })).toBeVisible();
    await expect(page.getByLabel("Itens por página")).toHaveValue("5");
    await expect(page.getByText(/Mostrando \d+–\d+ de \d+/)).toBeVisible();

    const detailButton = page.getByRole("button", { name: /Ver detalhes do item/ }).first();
    await expect(detailButton).toBeVisible();
    await detailButton.click();

    await expect(page.getByRole("heading", { name: /Cursos ·/ })).toBeVisible();
    await expect(page.getByRole("button", { name: "Voltar para a lista" })).toBeVisible();
    await page.getByRole("button", { name: "Voltar para a lista" }).click();
    await expect(page.getByRole("table", { name: "Cursos" })).toBeVisible();
  });

  test("a busca retorna à primeira página e mantém paginação acessível", async ({ context, page, baseURL }) => {
    await loginWithSsrSession({ baseURL: baseURL ?? "http://127.0.0.1:3100", context, name: "Admin E2E" });
    await page.goto("/admin/cursos");

    const search = page.getByRole("textbox", { name: "Buscar cursos" });
    await search.fill("curso que não existe");
    await expect(page.getByText("Mostrando 0–0 de 0")).toBeVisible();
    await expect(page.getByRole("button", { name: "Página anterior" })).toBeDisabled();
  });
});

