import { loadEnvFile } from "node:process";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { SESSION_COOKIE, encodeSession } from "@/lib/auth";

// O servidor de teste (`next start`) carrega AUTH_SESSION_SECRET real via
// .env.local, mas este processo Node/Playwright não — sem isto, encodeSession()
// assina com o fallback inseguro, o servidor rejeita a assinatura e a sessão
// cai silenciosamente para /login (ver tests/smoke-crawl.spec.ts para a
// mesma correção e o diagnóstico completo).
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
// Escopo: apenas recursos com ciclo criar→excluir seguro pela própria UI
// (store.deleteX já existe). Não há banco de teste isolado — .env.local
// aponta para o Supabase de produção — então cada execução cria um registro
// real marcado com [E2E] no nome e apaga em seguida via afterEach. `leads`,
// `students` e `enrollments` ficam de fora aqui (sem delete/create seguro
// pela UI); ver handoff .aiox/handoffs/handoff-aiox-master-to-sm-*.yaml para
// a story que fecha esse gap de produto antes de testá-los.

const MARKER = `[E2E] ${Date.now()}`;

async function issueAdminCookie(context: Awaited<ReturnType<Page["context"]>>) {
  const token = await encodeSession({
    role: "admin",
    email: "admin@rhcursos.com.br",
    name: "Perfil admin"
  });
  await context.addCookies([
    {
      name: SESSION_COOKIE,
      value: token,
      url: test.info().project.use.baseURL as string
    }
  ]);
}

async function fillText(dialog: Locator, label: string, value: string) {
  await dialog.getByLabel(label).fill(value);
}

async function fillSelectByIndex(dialog: Locator, label: string, index = 1) {
  await dialog.getByLabel(label).selectOption({ index });
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

async function deleteRowByName(page: Page, name: string) {
  await page.getByPlaceholder(/Buscar|Filtrar/).fill(name);
  const row = page.getByRole("row", { name: new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) });
  await expect(row).toBeVisible();
  await row.getByRole("button", { name: /^Excluir item/ }).click();
  await expect(row).toBeHidden();
}

test.describe("admin CRUD — ciclo completo criar → salvar → excluir", () => {
  test.beforeEach(async ({ context }) => {
    await issueAdminCookie(context);
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

    await page.getByPlaceholder(/Buscar|Filtrar/).fill(courseTitle);
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
});
