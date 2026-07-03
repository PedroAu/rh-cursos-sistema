import { expect, test } from "@playwright/test";

function attachRuntimeErrorProbe(page: import("@playwright/test").Page) {
  const runtimeErrors: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      runtimeErrors.push(message.text());
    }
  });

  page.on("pageerror", (error) => {
    runtimeErrors.push(error.stack ?? error.message);
  });

  return runtimeErrors;
}

test.describe("epic 14 smoke — mantine removal", () => {
  test("home renderiza sem erro de runtime", async ({ page }) => {
    const runtimeErrors = attachRuntimeErrorProbe(page);

    await page.goto("/");
    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page.getByRole("link", { name: /ver agenda de cursos/i }).first()).toBeVisible();
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

    await page.getByLabel("Nome completo").fill("Ana Souza");
    await page.getByLabel("E-mail corporativo").fill("ana@empresa.com.br");
    await page.getByLabel("Telefone ou WhatsApp").fill("61999998888");
    await page.getByLabel("Nome da empresa").fill("Secretaria de Gestão");
    await page.getByLabel("Tamanho da equipe").fill("35");
    await page.getByRole("combobox", { name: "Área de Interesse" }).click();
    await page.getByRole("option", { name: "Online ao vivo" }).click();
    await page.getByLabel("Objetivo do treinamento").fill("Atualizar a equipe para nova legislação.");
    await page.getByLabel("Tema a ser abordado").fill("eSocial e departamento pessoal.");
    await page.getByLabel("Desafios principais").fill("Reduzir retrabalho e padronizar execução.");
    await page.getByRole("button", { name: /enviar solicitação de proposta/i }).click();

    await expect(page.getByText(/Solicitação registrada\./)).toBeVisible();
  });
});
