import { expect, test } from "@playwright/test";
import { attachRuntimeErrorProbe } from "@tests/helpers/runtime-errors";

test.describe("epic 14 smoke — mantine removal", () => {
  test("home renderiza sem erro de runtime", async ({ page }) => {
    const runtimeErrors = attachRuntimeErrorProbe(page);

    await page.goto("/");
    const consultoriaSection = page.locator("section").filter({ hasText: "A norma aplicada ao seu contexto" });

    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page.getByRole("link", { name: /ver agenda de cursos/i }).first()).toBeVisible();
    await expect(consultoriaSection).toContainText("Diagnóstico do seu contexto normativo e operacional");
    await expect(consultoriaSection).toContainText("Plano de adequação aplicável, com passos priorizados");
    await expect(consultoriaSection).toContainText("Acompanhamento por especialistas com experiência de campo");
    expect(runtimeErrors).toEqual([]);
  });

  test("contato exibe erro zod para email inválido", async ({ page }) => {
    await page.goto("/contato");

    await page.getByLabel("Nome completo").fill("Patricia Lima");
    await page.getByLabel("E-mail").fill("email-invalido");
    await page.getByLabel("Mensagem").fill("Preciso entender quais trilhas atendem a equipe.");
    await page.getByRole("button", { name: /enviar mensagem/i }).click();

    await expect(page.getByLabel("E-mail*")).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByText("Informe um e-mail válido.")).toBeVisible();
  });

  test("login renderiza o card centralizado sem erro de runtime", async ({ page }) => {
    const runtimeErrors = attachRuntimeErrorProbe(page);
    await page.goto("/login?next=/admin");

    await expect(page.getByRole("heading", { name: "Bem-vindo de volta" })).toBeVisible();
    await expect(page.getByLabel("E-mail")).toBeVisible();
    await expect(page.getByLabel("Manter conectado")).toHaveCount(0);
    expect(runtimeErrors).toEqual([]);
  });

  test("in-company submete e exibe confirmação inline", async ({ page }) => {
    await page.goto("/in-company");

    await page.locator("section").first().locator("button").filter({ hasText: /solicitar proposta/i }).click();
    await expect(page.locator("#formulario-in-company")).toBeInViewport();
    await page.getByLabel(/Nome completo/i).fill("Ana Souza");
    await page.getByLabel(/E-mail corporativo/i).fill("ana@empresa.com.br");
    await page.getByLabel(/Telefone ou WhatsApp/i).fill("61999998888");
    await page.getByPlaceholder("Nome da organização").fill("Secretaria de Gestão");
    await page.getByRole("combobox", { name: /Área de interesse/i }).click();
    await page.getByRole("option", { name: /gestão pública/i }).click();
    await page.getByRole("combobox", { name: /Tamanho da equipe/i }).click();
    await page.getByRole("option", { name: /16 a 40 pessoas/i }).click();
    await page.getByLabel("Mensagem").fill("Atualizar a equipe para nova legislação e reduzir retrabalho.");
    await page.getByRole("button", { name: /enviar solicitação de proposta/i }).click();

    await expect(page.getByText(/Recebemos os seus dados\./)).toBeVisible();
  });
});
