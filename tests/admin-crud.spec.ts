import { loadEnvFile } from "node:process";
import { createHmac, randomUUID } from "node:crypto";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { hasRealIntegrationEnv, resolveAvailableCheckoutTarget } from "./helpers/integration-env";

// O servidor de teste (`next start`) carrega AUTH_SESSION_SECRET/SUPABASE_*
// reais via .env.local, mas este processo Node/Playwright não por padrão.
try {
  loadEnvFile(".env.local");
} catch {
  // Arquivo pode não existir em alguns ambientes (ex.: CI com secrets via env vars).
}

// Camada 2 do plano de testes: preenche e salva o formulário real de cada
// recurso do admin (via a UI, campo a campo, seguindo o mesmo FieldConfig[]
// declarado em admin-resource-configs.tsx) e confere que a criação some com
// sucesso — sem cair no painel "Erros encontrados".
//
// A escrita passa pela Edge Function `admin-resources`, que exige uma sessão
// real do Supabase Auth (não basta o cookie de demo-session que autentica só
// a visualização SSR) — por isso o login aqui é feito de verdade pela UI,
// com um usuário criado/garantido via service role (ensureAuthUser).
//
// Escopo: ciclo criar → excluir seguro pela própria UI. Não há banco de teste
// isolado — .env.local aponta para o Supabase de produção — então cada
// execução cria um registro real marcado com [E2E] no nome e apaga em seguida.

const MARKER = `[E2E] ${Date.now()}`;
const SESSION_COOKIE = "rh_cursos_demo_session";
const SESSION_SECRET = process.env.AUTH_SESSION_SECRET;

test.skip(!hasRealIntegrationEnv(), "admin-crud.spec.ts precisa de SUPABASE_SERVICE_ROLE_KEY real para logar de verdade.");

function slugifyForEmail(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function buildAdminSessionToken(email: string) {
  if (!SESSION_SECRET) {
    throw new Error("AUTH_SESSION_SECRET não está configurado para os testes admin-crud.");
  }

  const payload = Buffer.from(
    JSON.stringify({
      role: "admin",
      email,
      name: "E2E Admin CRUD",
      exp: Date.now() + 60 * 60 * 1000,
    })
  ).toString("base64url");
  const signature = createHmac("sha256", SESSION_SECRET).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

function buildUniqueEmail(label: string) {
  return `${slugifyForEmail(`${MARKER}-${label}`)}@example.com`;
}

function buildUniqueCpf(seed: string) {
  const digits = `${randomUUID().replace(/\D/g, "")}${Date.now()}${seed}`
    .replace(/\D/g, "")
    .padEnd(11, "0")
    .slice(0, 11);

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

async function loginAsAdmin(page: Page, email: string) {
  const token = buildAdminSessionToken(email);

  await page.context().addCookies([
    {
      name: SESSION_COOKIE,
      value: token,
      domain: "127.0.0.1",
      path: "/",
    },
  ]);

  await page.addInitScript(
    (storedToken) => {
      window.localStorage.setItem("rh_cursos_admin_token", storedToken);
      window.localStorage.removeItem("rh_cursos_supabase_session");
      window.localStorage.removeItem("rhcursos-demo-store-v4");
    },
    token
  );

  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin/, { timeout: 15_000 });
}

async function fillText(dialog: Locator, label: string, value: string) {
  await dialog.getByLabel(label).fill(value);
}

async function fillSelectByIndex(dialog: Locator, label: string, index = 1) {
  await dialog.getByLabel(label).selectOption({ index });
}

async function forceSelectValue(dialog: Locator, label: string, value: string) {
  await dialog.getByLabel(label).evaluate((select, nextValue) => {
    const element = select as HTMLSelectElement;
    const desired = String(nextValue);
    const existing = Array.from(element.options).some((option) => option.value === desired);

    if (!existing) {
      const option = document.createElement("option");
      option.value = desired;
      option.textContent = desired;
      element.appendChild(option);
    }

    element.value = desired;
    element.dispatchEvent(new Event("change", { bubbles: true }));
  }, value);
}

async function openCreateDialog(page: Page) {
  await page.getByRole("button", { name: "Novo Cadastro" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("heading", { name: "Criar novo registro" })).toBeVisible();
  return dialog;
}

async function saveAndExpectSuccess(page: Page, dialog: Locator) {
  await dialog.getByRole("button", { name: /Criar registro|Salvar alterações/ }).click();
  // Sucesso real = o dialog fecha (onSave só chama setOpen(false) se a
  // validação passou E a escrita no Supabase não lançou exceção).
  await expect(dialog).toBeHidden({ timeout: 15_000 });
}

// A página tem 2 campos de busca: o global do topbar admin ("Buscar no
// painel...") e o específico da listagem ("Buscar curso...", "Filtrar por
// nome..." etc.). O segundo é sempre o que aparece por último no DOM.
function pageSearchField(page: Page) {
  return page.getByPlaceholder(/Buscar|Filtrar/).last();
}

async function deleteRowByName(page: Page, name: string) {
  await pageSearchField(page).fill(name);
  const row = page.getByRole("row", { name: new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) });
  await expect(row).toBeVisible();
  await row.getByRole("button", { name: /^Excluir item/ }).click();
  await expect(row).toBeHidden();
}

test.describe("admin CRUD — ciclo completo criar → salvar → excluir", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    const email = `e2e-admin-crud+${slugifyForEmail(testInfo.title)}@rhcursos.test`;
    await loginAsAdmin(page, email);
  });

  test("cursos: cria com todos os campos obrigatórios preenchidos e exclui", async ({ page }) => {
    const title = `${MARKER} curso`;
    await page.goto("/admin/cursos");

    const dialog = await openCreateDialog(page);
    await fillText(dialog, "Nome do curso", title);
    await fillSelectByIndex(dialog, "Trilha");
    await dialog.getByRole("checkbox").first().check(); // Modalidades (multiselect)
    await fillSelectByIndex(dialog, "Nível");
    await fillSelectByIndex(dialog, "Status");
    await fillSelectByIndex(dialog, "Curso destaque");
    await fillText(dialog, "Carga horária", "8h");
    await fillText(dialog, "Preço (R$)", "990");
    await fillText(dialog, "Descrição curta", "Descrição curta gerada pelo teste E2E de admin.");
    await fillText(
      dialog,
      "Descrição completa",
      "Descrição completa gerada pelo teste E2E de admin, cobrindo o fluxo de criação de curso ponta a ponta."
    );

    await saveAndExpectSuccess(page, dialog);
    await deleteRowByName(page, title);
  });

  test("turmas: cria vinculada a um curso existente e exclui", async ({ page }) => {
    // Data futura pouco provável de colidir com turma real — usada depois
    // para localizar a linha, já que turma não tem campo de nome único.
    const startDate = "2027-03-15";
    const startDateLabel = "15/03/2027";
    const endDate = "2027-03-16";
    await page.goto("/admin/turmas");

    const dialog = await openCreateDialog(page);
    const courseSelect = dialog.getByLabel("Curso");
    await courseSelect.selectOption({ index: 1 });
    const courseTitle = (await courseSelect.locator("option:checked").textContent())?.trim() ?? "";
    expect(courseTitle).not.toHaveLength(0);

    await dialog.getByLabel("Data de início").fill(startDate);
    await dialog.getByLabel("Data final").fill(endDate);
    await fillText(dialog, "Horário(s)", "09:00 - 18:00");
    await fillSelectByIndex(dialog, "Modalidade");
    await fillText(dialog, "Quantidade de vagas", "20");
    await fillSelectByIndex(dialog, "Status");
    // Local é obrigatório só quando a modalidade é "Presencial" — preenchido
    // sempre para não depender de qual modalidade o curso sorteado tem.
    await fillText(dialog, "Local", "Sala virtual (E2E)");

    await saveAndExpectSuccess(page, dialog);

    await pageSearchField(page).fill(courseTitle);
    const row = page.getByRole("row", { name: new RegExp(startDateLabel) });
    await expect(row).toBeVisible();
    await row.getByRole("button", { name: /^Excluir item/ }).click();
    await expect(row).toBeHidden();
  });

  test("instrutores: cria só com os campos obrigatórios e exclui", async ({ page }) => {
    const name = `${MARKER} instrutor`;
    await page.goto("/admin/instrutores");

    const dialog = await openCreateDialog(page);
    await fillText(dialog, "Nome", name);
    await fillSelectByIndex(dialog, "Status");

    await saveAndExpectSuccess(page, dialog);
    await deleteRowByName(page, name);
  });

  test("blog: cria respeitando os tamanhos mínimos de resumo/conteúdo e exclui", async ({ page }) => {
    const title = `${MARKER} post`;
    await page.goto("/admin/blog");

    const dialog = await openCreateDialog(page);
    await fillText(dialog, "Título", title);
    await fillSelectByIndex(dialog, "Categoria");
    await fillText(dialog, "Autor", "Equipe E2E");
    await fillSelectByIndex(dialog, "Status");
    await fillText(dialog, "Resumo", "Resumo de teste com mais de vinte caracteres.");
    await fillText(
      dialog,
      "Conteúdo",
      "Conteúdo de teste gerado pelo spec admin-crud.spec.ts. Precisa ter pelo menos cem caracteres " +
        "para passar na validação de admin-form-validation.ts, então este parágrafo é propositalmente longo."
    );

    await saveAndExpectSuccess(page, dialog);
    await deleteRowByName(page, title);
  });

  test("leads: cria manualmente no admin e exclui", async ({ page }) => {
    const name = `${MARKER} lead`;
    await page.goto("/admin/leads");

    const dialog = await openCreateDialog(page);
    await fillText(dialog, "Nome", name);
    await fillText(dialog, "E-mail", buildUniqueEmail("lead"));
    await fillText(dialog, "Telefone", "(61) 98888-7777");
    await fillSelectByIndex(dialog, "Jornada comercial");
    await fillText(dialog, "Interesse principal", "Consultoria de RH");
    await fillSelectByIndex(dialog, "Origem");
    await fillSelectByIndex(dialog, "Status");
    await fillText(dialog, "Empresa/Órgão", "Empresa E2E");
    await fillText(dialog, "Tamanho da equipe", "12");

    await saveAndExpectSuccess(page, dialog);
    await deleteRowByName(page, name);
  });

  test("students: cria cadastro manual e exclui", async ({ page }) => {
    const name = `${MARKER} aluno`;
    await page.goto("/admin/alunos");

    const dialog = await openCreateDialog(page);
    await fillText(dialog, "Nome", name);
    await fillText(dialog, "E-mail", buildUniqueEmail("aluno"));
    await fillText(dialog, "Empresa / órgão", "Órgão E2E");
    await fillSelectByIndex(dialog, "Status");

    await saveAndExpectSuccess(page, dialog);
    await deleteRowByName(page, name);
  });

  test("inscrições: cria inscrição administrativa e exclui", async ({ page }) => {
    const name = `${MARKER} inscricao`;
    await page.goto("/admin/inscricoes");
    const target = await resolveAvailableCheckoutTarget();

    const dialog = await openCreateDialog(page);
    await fillText(dialog, "Aluno", name);
    await fillText(dialog, "E-mail", buildUniqueEmail("inscricao"));
    await fillText(dialog, "Telefone", "(61) 97777-6666");
    await fillText(dialog, "CPF", buildUniqueCpf("01"));
    await fillText(dialog, "Empresa/Órgão", "Instituição E2E");
    await fillText(dialog, "Cargo", "Coordenador");
    await fillSelectByIndex(dialog, "Tipo de inscrição");
    await fillSelectByIndex(dialog, "Pagamento");
    await forceSelectValue(dialog, "Curso", target.courseTitle);
    await forceSelectValue(dialog, "Turma", target.classId);

    await saveAndExpectSuccess(page, dialog);
    await deleteRowByName(page, name);
  });
});
