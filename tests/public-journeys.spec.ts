import { expect, test } from "@playwright/test";

const blogArticlePath = "/blog/3-alertas-para-revisar-antes-de-enviar-eventos-do-esocial";

async function resolveCheckoutCoursePath(page: import("@playwright/test").Page) {
  await page.goto("/agenda");
  const href = await page
    .getByRole("link", { name: "Ver curso" })
    .first()
    .getAttribute("href");

  if (!href) {
    throw new Error("Nenhum curso com turma pública disponível foi encontrado na agenda.");
  }

  return href;
}

test.describe("epica 4 — jornadas publicas", () => {
  test("checkout guiado valida campos e conclui inscrição com resumo", async ({ page }) => {
    const coursePath = await resolveCheckoutCoursePath(page);
    await page.goto(coursePath);

    await page.getByRole("button", { name: "Inscrever-se agora" }).first().click();
    await page.getByRole("button", { name: "Avançar" }).click();

    await expect(page.getByText("Nome deve ter no mínimo 3 caracteres.")).toBeVisible();
    await expect(page.getByText("Informe um e-mail válido.")).toBeVisible();

    await page.getByLabel("Nome completo").fill("Maria Oliveira");
    await page.getByLabel("E-mail").fill("maria@empresa.com.br");
    await page.getByLabel("Telefone / WhatsApp").fill("61999998888");
    await page.getByLabel("CPF").fill("12345678901");
    await page.getByRole("button", { name: "Avançar" }).click();

    await page.getByRole("button", { name: "Avançar" }).click();

    await page.locator("button").filter({ hasText: /vaga\(s\)/ }).first().click();
    await page.getByRole("button", { name: "Avançar" }).click();

    await expect(page.getByText("Resumo do pedido")).toBeVisible();
    await page.getByRole("button", { name: "Confirmar inscrição" }).click();

    await expect(page).toHaveURL(/\/inscricao-confirmada/);
    await expect(page.getByText("Tudo pronto para a próxima etapa.")).toBeVisible();
    await expect(page.getByText("Aluno")).toBeVisible();
  });

  test("contato e in-company exibem confirmação inline após envio", async ({ page }) => {
    await page.goto("/contato");
    await page.getByLabel("Nome completo").fill("Patricia Lima");
    await page.getByLabel("E-mail").fill("patricia@empresa.com.br");
    await page.getByLabel("Empresa / órgão").fill("Prefeitura Exemplo");
    await page.getByLabel("Curso ou tema de interesse").fill("eSocial");
    await page.getByLabel("Mensagem").fill("Preciso entender quais trilhas atendem uma equipe pública.");
    await page.getByRole("button", { name: "Enviar mensagem" }).click();

    await expect(page.getByText(/Mensagem registrada\./)).toBeVisible();

    await page.goto("/in-company");
    await page.getByLabel("Nome completo").fill("Ana Souza");
    await page.getByLabel("E-mail corporativo").fill("ana@empresa.com.br");
    await page.getByLabel("Nome da empresa").fill("Secretaria de Gestão");
    await page.getByLabel("Telefone ou WhatsApp").fill("61999998888");
    await page.getByLabel("Tamanho da equipe").fill("35");
    await page.getByRole("combobox").first().click();
    await page.getByRole("option", { name: "Online ao vivo" }).click();
    await page.getByLabel("Objetivo do treinamento").fill("Atualizar a equipe para nova legislação.");
    await page.getByLabel("Tema a ser abordado").fill("eSocial e departamento pessoal.");
    await page.getByLabel("Desafios principais").fill("Reduzir retrabalho e padronizar execução.");
    await page.getByRole("button", { name: "Enviar solicitação de proposta" }).click();

    await expect(page.getByText(/Solicitação registrada\./)).toBeVisible();
  });

  test("login deixa a escolha de papel previsível", async ({ page }) => {
    await page.goto("/login?status=required&next=/admin");

    await expect(page.getByText("somente o papel administrativo está disponível", { exact: false })).toBeVisible();
    await expect(page.getByRole("button", { name: /Aluno/ })).toBeDisabled();
    await expect(page.getByRole("button", { name: /Instrutor/ })).toBeDisabled();
    await expect(page.getByRole("button", { name: /Administração/ })).toHaveAttribute("aria-pressed", "true");
  });

  test("sobre e artigo reforçam leitura institucional e taxonomia", async ({ page }) => {
    await page.goto("/sobre");
    await expect(page.getByText("Leitura institucional")).toBeVisible();
    await expect(page.getByText("1. Diagnóstico")).toBeVisible();

    await page.goto(blogArticlePath);
    await expect(page.getByText("Leitura guiada")).toBeVisible();
    await expect(page.getByText("Taxonomia")).toBeVisible();
  });
});
