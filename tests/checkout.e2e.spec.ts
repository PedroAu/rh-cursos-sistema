import { expect, test } from "@playwright/test";

/**
 * Baseline E2E do fluxo de receita (checkout/inscrição) — criado ANTES do reskin
 * Executive Precision (EP-3.2) para travar o comportamento crítico de conversão.
 *
 * Complementa `public-journeys.spec.ts` (caminho feliz) cobrindo os caminhos de
 * risco que o reskin não pode regredir: validação por etapa, navegação para trás,
 * turma obrigatória, deeplink `?checkout=1` e seleção de pagamento.
 */

const coursePath =
  "/cursos/introducao-as-licitacoes-e-contratos-administrativos-nocoes-essenciais-para-o-setor-publico";

async function fillPersonalStep(page: import("@playwright/test").Page) {
  await page.getByLabel("Nome completo").fill("Carlos Pereira");
  await page.getByLabel("E-mail").fill("carlos@empresa.com.br");
  await page.getByLabel("Telefone / WhatsApp").fill("61999990000");
  await page.getByLabel("CPF").fill("98765432100");
}

test.describe("checkout — baseline de receita", () => {
  test("bloqueia avanço da etapa de turma sem seleção e conclui após escolher", async ({ page }) => {
    await page.goto(coursePath);

    await page.getByRole("button", { name: "Inscrever-se agora" }).first().click();
    await expect(page.getByRole("dialog")).toBeVisible();

    // Etapa 1 → 2
    await fillPersonalStep(page);
    await page.getByRole("button", { name: "Avançar" }).click();

    // Etapa 2 → 3 (pessoa física: empresa/cargo opcionais)
    await page.getByRole("button", { name: "Avançar" }).click();

    // Etapa 3: avançar sem turma deve bloquear com erro inline
    await page.getByRole("button", { name: "Avançar" }).click();
    await expect(page.getByText("Escolha uma turma antes de avançar.")).toBeVisible();
    await expect(page.getByText("Resumo do pedido")).toBeHidden();

    // Seleciona turma e avança até confirmação
    await page.locator("button").filter({ hasText: /vaga\(s\)/ }).first().click();
    await page.getByRole("button", { name: "Avançar" }).click();
    await expect(page.getByText("Resumo do pedido")).toBeVisible();

    await page.getByRole("button", { name: "Confirmar inscrição" }).click();
    await expect(page).toHaveURL(/\/inscricao-confirmada/);
  });

  test("voltar preserva os dados já preenchidos", async ({ page }) => {
    await page.goto(coursePath);
    await page.getByRole("button", { name: "Inscrever-se agora" }).first().click();

    await fillPersonalStep(page);
    await page.getByRole("button", { name: "Avançar" }).click();

    // Etapa 2 visível → volta para etapa 1
    await page.getByRole("button", { name: "Voltar" }).click();
    await expect(page.getByLabel("Nome completo")).toHaveValue("Carlos Pereira");
    await expect(page.getByLabel("E-mail")).toHaveValue("carlos@empresa.com.br");
  });

  test("inscrição corporativa exige empresa e cargo", async ({ page }) => {
    await page.goto(coursePath);
    await page.getByRole("button", { name: "Inscrever-se agora" }).first().click();

    await fillPersonalStep(page);
    await page.getByRole("button", { name: "Avançar" }).click();

    // Troca tipo de inscrição para Empresa → campos passam a ser obrigatórios
    await page.getByRole("combobox").first().click();
    await page.getByRole("option", { name: "Empresa" }).click();
    await page.getByRole("button", { name: "Avançar" }).click();

    await expect(page.getByText("Informe a empresa ou órgão responsável pela inscrição.")).toBeVisible();
    await expect(page.getByText("Informe o cargo ou área de atuação.")).toBeVisible();
  });

  test("deeplink ?checkout=1 abre o modal automaticamente", async ({ page }) => {
    await page.goto(`${coursePath}?checkout=1`);
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText("Inscrição guiada")).toBeVisible();
  });

  test("fechar o modal com Cancelar mantém o usuário na página do curso", async ({ page }) => {
    await page.goto(coursePath);
    await page.getByRole("button", { name: "Inscrever-se agora" }).first().click();
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.getByRole("button", { name: "Cancelar" }).click();
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(page).toHaveURL(new RegExp(coursePath.replace(/[/-]/g, "\\$&")));
  });
});
