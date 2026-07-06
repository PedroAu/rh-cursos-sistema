import { expect, test } from "@playwright/test";
import {
  cleanupEnrollmentArtifacts,
  createUniqueEmail,
  resolveAvailableCheckoutTarget,
} from "./helpers/integration-env";

const blogArticlePath = "/blog/3-alertas-para-revisar-antes-de-enviar-eventos-do-esocial";

function createUniqueCpf() {
  return Date.now().toString().slice(-11).padStart(11, "0");
}

function buildClassSelectionLabel(startDate: string, time: string) {
  return `Selecionar turma de ${new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(startDate))} às ${time}`;
}

test.describe("epica 4 — jornadas publicas", () => {
  test("home e navegacao deixam as tres jornadas claras sem ocultar descoberta", async ({ page }) => {
    await page.goto("/");
    const mainNav = page.getByRole("navigation", { name: "Navegacao principal" });

    await expect(mainNav).toBeVisible();
    await expect(mainNav.getByRole("link", { name: "Cursos", exact: true })).toBeVisible();
    await expect(mainNav.getByRole("link", { name: "Consultoria", exact: true })).toBeVisible();
    await expect(mainNav.getByRole("link", { name: "In Company", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Fale com um especialista ->" })).toBeVisible();
    await expect(page.getByTestId("ui-hero-home").getByRole("link", { name: "Ver agenda de cursos" })).toBeVisible();

    await expect(page.getByRole("heading", { name: "Escolha como quer avançar" })).toBeVisible();
    await expect(page.getByText("Conteúdo aplicável à legislação vigente e à realidade de organizações públicas e privadas.")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Cursos abertos" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Cursos in-company" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Consultoria" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Ver agenda de cursos →" })).toHaveAttribute("href", "/agenda");
    await expect(page.getByRole("link", { name: "Levar para minha equipe →" })).toHaveAttribute("href", "/in-company");
    await expect(page.getByRole("link", { name: "Solicitar proposta →" }).first()).toHaveAttribute("href", "/falar-com-especialista");
  });

  test("paginas de jornada reforcam posicionamento regulatorio", async ({ page }) => {
    await page.goto("/cursos");
    await expect(page.getByText("Turmas presenciais e online ao vivo, com certificação e conteúdo atualizado às exigências legais e regulatórias")).toBeVisible();

    await page.goto("/in-company");
    await expect(page.getByText("Desenhamos cada programa a partir das exigências legais que se aplicam ao seu órgão ou empresa e da forma como a sua equipe trabalha.")).toBeVisible();

    await page.goto("/consultoria");
    await expect(page.getByText("Consultoria para aplicar norma com clareza operacional.")).toBeVisible();
    await expect(page.getByText("A RH Cursos apoia equipes públicas e privadas a traduzirem exigências legais e regulatórias em processos claros, treinamento aplicável e execução acompanhada.")).toBeVisible();
  });

  test("checkout guiado valida campos e conclui inscrição com resumo", async ({ page }) => {
    const enrollmentEmail = createUniqueEmail("public-journey");
    const enrollmentCpf = createUniqueCpf();
    const checkoutTarget = await resolveAvailableCheckoutTarget();

    await cleanupEnrollmentArtifacts(enrollmentEmail);

    try {
      await page.goto(checkoutTarget.coursePath);

      await page.getByRole("button", { name: "Inscrever-se agora" }).first().click();
      await page.getByRole("button", { name: "Avançar" }).click();

      await expect(page.getByText("Nome deve ter no mínimo 3 caracteres.")).toBeVisible();
      await expect(page.getByText("Informe um e-mail válido.")).toBeVisible();

      await page.getByLabel("Nome completo").fill("Maria Oliveira");
      await page.getByLabel("E-mail").fill(enrollmentEmail);
      await page.getByLabel("Telefone / WhatsApp").fill("61999998888");
      await page.getByLabel("CPF").fill(enrollmentCpf);
      await page.getByRole("button", { name: "Avançar" }).click();

      await page.getByRole("button", { name: "Avançar" }).click();

      await page.getByRole("button", { name: buildClassSelectionLabel(checkoutTarget.startDate, checkoutTarget.time) }).click();
      await page.getByRole("button", { name: "Avançar" }).click();

      await expect(page.getByText("Resumo do pedido")).toBeVisible();
      await page.getByRole("button", { name: "Confirmar inscrição" }).click();

      await expect(page).toHaveURL(/\/inscricao-confirmada/);
      await expect(page.getByText("Tudo pronto para a próxima etapa.")).toBeVisible();
      await expect(page.getByText("Aluno", { exact: true })).toBeVisible();
      await expect(page.getByText("Maria Oliveira", { exact: true })).toBeVisible();
    } finally {
      await cleanupEnrollmentArtifacts(enrollmentEmail);
    }
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
    await page.getByLabel("Telefone ou WhatsApp").fill("61999998888");
    await page.getByPlaceholder("Nome da organização").fill("Secretaria de Gestão");
    await page.getByRole("combobox", { name: /Área de interesse/i }).click();
    await page.getByRole("option", { name: /gestão pública/i }).click();
    await page.getByRole("combobox", { name: /Tamanho da equipe/i }).click();
    await page.getByRole("option", { name: /16 a 40 pessoas/i }).click();
    await page.getByLabel("Objetivo do treinamento").fill("Atualizar a equipe para nova legislação.");
    await page.getByLabel("Tema a ser abordado").fill("eSocial e departamento pessoal.");
    await page.getByLabel("Desafios principais").fill("Reduzir retrabalho e padronizar execução.");
    await page.getByText("Ao enviar, você concorda em ser contatado pela equipe da RH Cursos.").click();
    await page.getByRole("button", { name: "Enviar solicitação de proposta" }).click();

    await expect(page.getByText(/Recebemos os seus dados\./)).toBeVisible();
  });

  test("login deixa a escolha de papel previsível", async ({ page }) => {
    await page.goto("/login?status=required&next=/admin");

    await expect(page.getByRole("button", { name: /Administração/ })).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("button", { name: /Aluno/ }).click();
    await expect(page.getByRole("button", { name: /Aluno/ })).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("button", { name: /Instrutor/ }).click();
    await expect(page.getByRole("button", { name: /Instrutor/ })).toHaveAttribute("aria-pressed", "true");
  });

  test("sobre e artigo reforçam leitura institucional e taxonomia", async ({ page }) => {
    await page.goto("/sobre");
    await expect(page.getByText("Nossa história")).toBeVisible();
    await expect(page.getByText("Missão, visão e filosofia")).toBeVisible();

    await page.goto(blogArticlePath);
    await expect(page.getByText("Leitura guiada")).toBeVisible();
    await expect(page.getByText("Taxonomia")).toBeVisible();
  });
});
