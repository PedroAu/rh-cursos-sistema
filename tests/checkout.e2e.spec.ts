import { expect, test } from "@playwright/test";
import {
  annotateCanonicalDoc,
  cleanupEnrollmentArtifacts,
  createServiceRoleClient,
  createUniqueEmail,
  hasRealIntegrationEnv,
  getCanonicalDocs,
  resolveAvailableCheckoutTarget,
} from "./helpers/integration-env";

/**
 * Baseline E2E do fluxo de receita (checkout/inscrição) — criado ANTES do reskin
 * Executive Precision (EP-3.2) para travar o comportamento crítico de conversão.
 *
 * Complementa `public-journeys.spec.ts` (caminho feliz) cobrindo os caminhos de
 * risco que o reskin não pode regredir: validação por etapa, navegação para trás,
 * turma obrigatória, deeplink `?checkout=1` e seleção de pagamento.
 */

function createUniqueCpf() {
  return Date.now().toString().slice(-11).padStart(11, "0");
}

async function fillPersonalStep(
  page: import("@playwright/test").Page,
  email = "carlos@empresa.com.br",
  cpf = "98765432100"
) {
  await page.getByLabel("Nome completo").fill("Carlos Pereira");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Telefone").fill("61999990000");
  await page.getByLabel("CPF").fill(cpf);
}

test.describe("checkout — baseline de receita", () => {
  test("valida os dados, exige aceite dos termos e conclui com o backend real", async ({ page }, testInfo) => {
    test.skip(!hasRealIntegrationEnv(), "Checkout baseline requer ambiente Supabase real.");
    test.setTimeout(60_000);
    annotateCanonicalDoc(testInfo, getCanonicalDocs().edgeFunctions);
    const enrollmentEmail = createUniqueEmail("checkout-e2e");
    const enrollmentCpf = createUniqueCpf();
    const supabase = createServiceRoleClient();

    await cleanupEnrollmentArtifacts(enrollmentEmail);

    try {
      const checkoutTarget = await resolveAvailableCheckoutTarget();
      await page.goto(checkoutTarget.coursePath);

      await page.getByRole("button", { name: "Inscrever-se agora" }).first().click();
      await expect(page.getByRole("dialog")).toBeVisible();

      await fillPersonalStep(page, enrollmentEmail, enrollmentCpf);
      await page.getByRole("button", { name: "Continuar para pagamento →" }).click();

      await expect(page.getByText("Forma de pagamento")).toBeVisible();
      await expect(page.getByText("Resumo do pedido")).toBeVisible();

      await page.getByRole("button", { name: "Finalizar compra →" }).click();
      await expect(page.getByText("Você precisa aceitar os termos para finalizar a compra.")).toBeVisible();

      await page.getByText("Li e aceito os termos de uso e a política de cancelamento").click();
      await page.getByRole("button", { name: "Pix" }).click();
      await page.getByRole("button", { name: "Finalizar compra →" }).click();
      await expect(page).toHaveURL(/\/inscricao-confirmada/);

      let studentId: string | null = null;
      await expect
        .poll(async () => {
          const { data, error } = await supabase
            .from("aluno")
            .select("id")
            .ilike("email", enrollmentEmail);

          if (error) throw error;
          studentId = data?.[0]?.id ?? null;
          return studentId ? 1 : 0;
        })
        .toBe(1);

      const { data: enrollments, error: enrollmentLookupError } = await supabase
        .from("inscricao")
        .select("id")
        .eq("aluno_id", studentId!);

      if (enrollmentLookupError) throw enrollmentLookupError;
      expect(enrollments?.length ?? 0).toBeGreaterThan(0);
    } finally {
      await cleanupEnrollmentArtifacts(enrollmentEmail);
    }
  });

  test("voltar preserva os dados já preenchidos", async ({ page }) => {
    test.skip(!hasRealIntegrationEnv(), "Checkout baseline requer ambiente Supabase real.");
    const checkoutTarget = await resolveAvailableCheckoutTarget();
    await page.goto(checkoutTarget.coursePath);
    await page.getByRole("button", { name: "Inscrever-se agora" }).first().click();

    await fillPersonalStep(page);
    await page.getByRole("button", { name: "Continuar para pagamento →" }).click();

    await page.getByRole("button", { name: "← Voltar" }).click();
    await expect(page.getByLabel("Nome completo")).toHaveValue("Carlos Pereira");
    await expect(page.getByLabel("E-mail")).toHaveValue("carlos@empresa.com.br");
  });

  test("inscrição corporativa exige razão social, CNPJ e responsável", async ({ page }) => {
    test.skip(!hasRealIntegrationEnv(), "Checkout baseline requer ambiente Supabase real.");
    const checkoutTarget = await resolveAvailableCheckoutTarget();
    await page.goto(checkoutTarget.coursePath);
    await page.getByRole("button", { name: "Inscrever-se agora" }).first().click();

    await page.getByRole("button", { name: "Pessoa jurídica (nota fiscal)" }).click();
    await page.getByLabel("Telefone").fill("61999990000");
    await page.getByLabel("E-mail").fill("compras@empresa.com.br");
    await page.getByLabel("CPF do responsável").fill("98765432100");
    await page.getByRole("button", { name: "Continuar para pagamento →" }).click();

    await expect(page.getByText("Informe a razão social.")).toBeVisible();
    await expect(page.getByText("CNPJ deve ter 14 dígitos.")).toBeVisible();
    await expect(page.getByText("Informe o nome do responsável.")).toBeVisible();
  });

  test("deeplink ?checkout=1 abre o modal automaticamente", async ({ page }) => {
    test.skip(!hasRealIntegrationEnv(), "Checkout baseline requer ambiente Supabase real.");
    const checkoutTarget = await resolveAvailableCheckoutTarget();
    await page.goto(`${checkoutTarget.coursePath}?checkout=1`);
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Finalizar inscrição" })).toBeVisible();
  });

  test("fechar o modal mantém o usuário na página do curso", async ({ page }) => {
    test.skip(!hasRealIntegrationEnv(), "Checkout baseline requer ambiente Supabase real.");
    const checkoutTarget = await resolveAvailableCheckoutTarget();
    await page.goto(checkoutTarget.coursePath);
    await page.getByRole("button", { name: "Inscrever-se agora" }).first().click();
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.getByRole("button", { name: "Fechar" }).click();
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(page).toHaveURL(new RegExp(checkoutTarget.coursePath.replace(/[/-]/g, "\\$&")));
  });
});
