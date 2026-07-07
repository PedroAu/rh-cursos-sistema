import { expect, test } from "@playwright/test";
import { attachRuntimeErrorProbe } from "./helpers/runtime-errors";

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

  test("login renderiza e alterna papel sem erro de runtime", async ({ page }) => {
    const runtimeErrors = attachRuntimeErrorProbe(page);
    await page.goto("/login?next=/admin");

    await expect(page.getByRole("heading", { name: "Acesse sua conta" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Administração" })).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("button", { name: /Aluno Acompanhe inscrições/i }).click();
    await expect(page.getByRole("button", { name: /Aluno Acompanhe inscrições/i })).toHaveAttribute("aria-pressed", "true");
    expect(runtimeErrors).toEqual([]);
  });

  test("in-company submete e exibe confirmação inline", async ({ page }) => {
    await page.goto("/in-company");

    await page.getByLabel(/Nome completo/i).fill("Ana Souza");
    await page.getByLabel(/E-mail corporativo/i).fill("ana@empresa.com.br");
    await page.getByLabel(/Telefone ou WhatsApp/i).fill("61999998888");
    await page.getByPlaceholder("Nome da organização").fill("Secretaria de Gestão");
    await page.getByRole("combobox", { name: /Área de interesse/i }).click();
    await page.getByRole("option", { name: /gestão pública/i }).click();
    await page.getByRole("combobox", { name: /Tamanho da equipe/i }).click();
    await page.getByRole("option", { name: /16 a 40 pessoas/i }).click();
    await page.getByLabel("Objetivo do treinamento").fill("Atualizar a equipe para nova legislação.");
    await page.getByLabel("Tema a ser abordado").fill("eSocial e departamento pessoal.");
    await page.getByLabel("Desafios principais").fill("Reduzir retrabalho e padronizar execução.");
    await page.getByText("Ao enviar, você concorda em ser contatado pela equipe da RH Cursos.").click();
    await page.getByRole("button", { name: /enviar solicitação de proposta/i }).click();

    await expect(page.getByText(/Recebemos os seus dados\./)).toBeVisible();
  });
});
