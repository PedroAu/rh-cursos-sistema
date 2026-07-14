import { loadEnvFile } from "node:process";
import { createHmac, randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { expect, test, type Locator, type Page } from "@playwright/test";
import {
  assertSafeWritableIntegrationEnv,
  createUniqueIp,
  ensureAuthUser,
  getIntegrationEnv,
  resolveAvailableCheckoutTarget,
  resolveAvailableTrainingPath,
} from "./helpers/integration-env";

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
// Escopo: ciclo criar → excluir pela própria UI somente em projeto Supabase
// explicitamente identificado como isolado. A guarda abaixo falha fechado;
// produção nunca é aceita como fallback, ainda que o teste tenha cleanup.

const MARKER = `[E2E] ${Date.now()}`;
const SESSION_COOKIE = "rh_cursos_demo_session";
const SESSION_SECRET = process.env.AUTH_SESSION_SECRET;
const ADMIN_EMAIL = "e2e-admin-crud@rhcursos.test";
const ADMIN_SESSION_CACHE_FILE = ".test-cache/admin-crud-session.json";
const ADMIN_SESSION_CACHE_TTL_MS = 20 * 60 * 1000;

test.beforeAll(() => {
  assertSafeWritableIntegrationEnv();
});

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

async function readCachedAdminSessionToken(email: string) {
  try {
    const raw = await readFile(ADMIN_SESSION_CACHE_FILE, "utf8");
    const cached = JSON.parse(raw) as { email?: string; token?: string; createdAt?: number };

    if (
      cached.email === email &&
      typeof cached.token === "string" &&
      typeof cached.createdAt === "number" &&
      Date.now() - cached.createdAt < ADMIN_SESSION_CACHE_TTL_MS
    ) {
      return cached.token;
    }
  } catch {
    // Cache ausente/legado: segue para reautenticar.
  }

  return null;
}

async function writeCachedAdminSessionToken(email: string, token: string) {
  await mkdir(dirname(ADMIN_SESSION_CACHE_FILE), { recursive: true });
  await writeFile(
    ADMIN_SESSION_CACHE_FILE,
    JSON.stringify({ email, token, createdAt: Date.now() }, null, 2),
    "utf8"
  );
}

async function loginAsAdmin(page: Page, email: string) {
  const { adminPassword, functionsBaseUrl, publishableKey } = getIntegrationEnv();

  await ensureAuthUser({
    email,
    name: "E2E Admin CRUD",
    password: adminPassword,
    role: "admin",
  });

  let sessionToken = await readCachedAdminSessionToken(email);

  if (!sessionToken) {
    const response = await fetch(`${functionsBaseUrl}/auth-session`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${publishableKey}`,
        apikey: publishableKey,
        Origin: "http://127.0.0.1:3100",
        "Content-Type": "application/json",
        "x-forwarded-for": createUniqueIp("admin-crud-auth"),
        "x-real-ip": createUniqueIp("admin-crud-auth-real"),
      },
      body: JSON.stringify({
        role: "admin",
        email,
        password: adminPassword,
      }),
    });

    if (!response.ok) {
      throw new Error(`Falha ao obter sessão admin real: ${response.status}`);
    }

    const session = (await response.json()) as { token?: string };
    if (!session.token) {
      throw new Error("auth-session não retornou token para o admin.");
    }

    sessionToken = session.token;
    await writeCachedAdminSessionToken(email, sessionToken);
  }

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
    sessionToken
  );

  await page.goto("/admin");
  await page.evaluate((storedToken) => {
    window.localStorage.setItem("rh_cursos_admin_token", storedToken);
    window.localStorage.removeItem("rh_cursos_supabase_session");
    window.localStorage.removeItem("rhcursos-demo-store-v4");
  }, sessionToken);
  await expect(page).toHaveURL(/\/admin/, { timeout: 15_000 });
}

async function fillText(dialog: Locator, label: string, value: string) {
  await dialog.getByLabel(label).fill(value);
}

async function waitForSelectOptions(dialog: Locator, label: string, minimumCount: number) {
  const select = dialog.getByLabel(label);
  await expect
    .poll(async () => {
      return select.locator("option").count();
    })
    .toBeGreaterThan(minimumCount);
  return select;
}

async function fillSelectByIndex(dialog: Locator, label: string, index = 1) {
  const select = await waitForSelectOptions(dialog, label, index);
  await select.selectOption({ index });
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

async function openEditDialogForRow(page: Page, name: string) {
  await pageSearchField(page).fill(name);
  const row = page.getByRole("row", { name: new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) });
  await expect(row).toBeVisible();
  await row.getByRole("button", { name: /^Editar item/ }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("heading", { name: "Editar registro" })).toBeVisible();
  return dialog;
}

type ExpectedAdminMutation = {
  resource?: string;
  action?: string;
  requireId?: boolean;
};

async function saveAndExpectSuccess(
  page: Page,
  dialog: Locator,
  expected: ExpectedAdminMutation = {}
) {
  const mutationResponsePromise = page.waitForResponse(
    (response) => {
      const request = response.request();
      if (request.method() !== "POST" || !response.url().includes("/api/functions/admin-resources")) {
        return false;
      }

      try {
        const body = request.postDataJSON() as { resource?: string; action?: string };
        if (expected.resource && body.resource !== expected.resource) return false;
        if (expected.action && body.action !== expected.action) return false;
        return body.action !== "list";
      } catch {
        return false;
      }
    },
    { timeout: 30_000 }
  );

  await dialog.getByRole("button", { name: /Criar registro|Salvar alterações/ }).click();
  const mutationResponse = await mutationResponsePromise;
  const body = (await mutationResponse.json().catch(() => null)) as {
    ok?: unknown;
    data?: { id?: unknown };
  } | null;

  if (!mutationResponse.ok() || body?.ok !== true) {
    const failureKind = mutationResponse.ok() ? "application" : "http";
    await expect(page.getByText(/Erro ao salvar:/).first()).toBeVisible({ timeout: 5_000 });
    throw new Error(
      `admin-resources falhou (${failureKind}) em ${expected.resource ?? "recurso"}:${expected.action ?? "mutação"}; HTTP ${mutationResponse.status()}; ok=${String(body?.ok === true)}`
    );
  }

  const id = typeof body.data?.id === "string" ? body.data.id.trim() : "";
  if (expected.requireId && !id) {
    throw new Error(`${expected.resource ?? "recurso"}:${expected.action ?? "mutação"} retornou sucesso sem ID.`);
  }

  const validationBox = dialog.getByText("Erros encontrados");
  const saveErrorToast = page.getByText(/Erro ao salvar:/);

  await expect
    .poll(
      async () => {
        if (!(await dialog.isVisible())) return "closed";
        if (await validationBox.count()) return `validation:${(await validationBox.locator("..").textContent()) ?? ""}`;
        if (await saveErrorToast.count()) return `toast:${(await saveErrorToast.first().textContent()) ?? ""}`;
        return "pending";
      },
      {
        timeout: 30_000,
        message: "O modal não fechou nem exibiu um erro explícito após salvar.",
      }
    )
    .toBe("closed");

  return { id };
}

async function addArrayItem(dialog: Locator, label: string, value: string) {
  const field = dialog.getByText(label, { exact: true }).locator("..");
  const input = field.locator("input").last();
  await input.fill(value);
  await input.press("Enter");
}

async function readArraySuggestions(dialog: Locator, label: string) {
  const field = dialog.getByText(label, { exact: true }).locator("..");
  const input = field.locator("input").last();

  return input.evaluate((element) => {
    const listId = element.getAttribute("list");
    if (!listId) return [];
    const datalist = document.getElementById(listId);
    if (!(datalist instanceof HTMLDataListElement)) return [];
    return Array.from(datalist.options)
      .map((option) => option.value.trim())
      .filter(Boolean);
  });
}

async function readArrayValues(dialog: Locator, label: string) {
  const field = dialog.getByText(label, { exact: true }).locator("..");
  return field.locator("input").evaluateAll((elements) =>
    elements
      .map((element) => (element instanceof HTMLInputElement ? element.value.trim() : ""))
      .filter(Boolean)
  );
}

async function findCourseByTitle(title: string) {
  const { supabaseUrl, serviceRoleKey } = getIntegrationEnv();
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await supabase
    .from("curso")
    .select("id, titulo, status")
    .eq("titulo", title)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

async function findBlogPostByTitle(title: string) {
  const { supabaseUrl, serviceRoleKey } = getIntegrationEnv();
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await supabase
    .from("post_blog")
    .select("id, titulo")
    .eq("titulo", title)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

async function findLeadByEmail(email: string) {
  const { supabaseUrl, serviceRoleKey } = getIntegrationEnv();
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await supabase
    .from("lead")
    .select("id, email, created_at")
    .ilike("email", email)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

async function findStudentByEmail(email: string) {
  const { supabaseUrl, serviceRoleKey } = getIntegrationEnv();
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await supabase
    .from("aluno")
    .select("id, email")
    .ilike("email", email)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

async function findInstructorByName(name: string) {
  const { supabaseUrl, serviceRoleKey } = getIntegrationEnv();
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await supabase
    .from("instrutor")
    .select("id, nome, created_at")
    .eq("nome", name)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

async function deleteCourseById(id: string) {
  const { supabaseUrl, serviceRoleKey } = getIntegrationEnv();
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error } = await supabase.from("curso").delete().eq("id", id);
  if (error) {
    throw error;
  }
}

async function deleteBlogPostById(id: string) {
  const { supabaseUrl, serviceRoleKey } = getIntegrationEnv();
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error } = await supabase.from("post_blog").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  if (error) {
    throw error;
  }
}

async function deleteLeadById(id: string) {
  const { supabaseUrl, serviceRoleKey } = getIntegrationEnv();
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error } = await supabase.from("lead").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  if (error) {
    throw error;
  }
}

async function deleteStudentById(id: string) {
  const { supabaseUrl, serviceRoleKey } = getIntegrationEnv();
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error } = await supabase.from("aluno").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  if (error) {
    throw error;
  }
}

async function deleteInstructorById(id: string) {
  const { supabaseUrl, serviceRoleKey } = getIntegrationEnv();
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error } = await supabase.from("instrutor").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  if (error) {
    throw error;
  }
}

// A página tem 2 campos de busca: o global do topbar admin ("Buscar no
// painel...") e o específico da listagem ("Buscar curso...", "Filtrar por
// nome..." etc.). O segundo é sempre o que aparece por último no DOM.
function pageSearchField(page: Page) {
  return page.getByPlaceholder(/Buscar|Filtrar/).last();
}

async function deleteRowByName(page: Page, name: string) {
  await pageSearchField(page).fill(name);
  const rowName = new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const row = page.getByRole("row", { name: rowName });
  await expect(row).toBeVisible();
  await row.getByRole("button", { name: /^Excluir item/ }).click();

  await expect
    .poll(
      async () => {
        await page.reload({ waitUntil: "networkidle" });
        await pageSearchField(page).fill(name);
        return page.getByRole("row", { name: rowName }).count();
      },
      { timeout: 15_000, intervals: [250, 500, 1_000] }
    )
    .toBe(0);
}

test.describe("admin CRUD — ciclo completo criar → salvar → excluir", () => {
  test.beforeEach(async ({ page }) => {
    const email = ADMIN_EMAIL;
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

  test("cursos: salva categoria sugerida + nova categoria livre e persiste na edição", async ({ page }) => {
    const title = `${MARKER} curso categorias`;
    const newCategory = `${MARKER} Categoria Nova`;
    const trainingPath = await resolveAvailableTrainingPath();
    await page.goto("/admin/cursos");

    const dialog = await openCreateDialog(page);
    await fillText(dialog, "Nome do curso", title);
    await forceSelectValue(dialog, "Trilha", trainingPath.id);
    await dialog.getByRole("checkbox").first().check();
    await fillSelectByIndex(dialog, "Nível");
    await fillSelectByIndex(dialog, "Status");
    await fillSelectByIndex(dialog, "Curso destaque");
    await fillText(dialog, "Carga horária", "8h");
    await fillText(dialog, "Preço (R$)", "990");
    await fillText(dialog, "Descrição curta", "Curso de teste validando categorias sugeridas e novas.");
    await fillText(
      dialog,
      "Descrição completa",
      "Curso de teste E2E para validar que o formulário aceita categorias sugeridas do banco e uma nova categoria livre."
    );

    await expect
      .poll(async () => (await readArraySuggestions(dialog, "Categorias")).length, { timeout: 10_000 })
      .toBeGreaterThan(0);
    const suggestions = await readArraySuggestions(dialog, "Categorias");
    await addArrayItem(dialog, "Categorias", suggestions[0]!);
    await addArrayItem(dialog, "Categorias", newCategory);

    await saveAndExpectSuccess(page, dialog);

    const editDialog = await openEditDialogForRow(page, title);
    await expect.poll(async () => readArrayValues(editDialog, "Categorias")).toEqual(
      expect.arrayContaining([suggestions[0]!, newCategory])
    );
    await saveAndExpectSuccess(page, editDialog);

    await deleteRowByName(page, title);
  });

  test("cursos: preserva módulos ao clicar fora do modal e salva o conteúdo programático", async ({ page }) => {
    test.slow();
    const title = `${MARKER} curso módulos`;
    const trainingPath = await resolveAvailableTrainingPath();
    await page.goto("/admin/cursos");

    const dialog = await openCreateDialog(page);
    await fillText(dialog, "Nome do curso", title);
    await forceSelectValue(dialog, "Trilha", trainingPath.id);
    await dialog.getByRole("checkbox").first().check();
    await fillSelectByIndex(dialog, "Nível");
    await fillSelectByIndex(dialog, "Status");
    await fillSelectByIndex(dialog, "Curso destaque");
    await fillText(dialog, "Carga horária", "12h");
    await fillText(dialog, "Preço (R$)", "1490");
    await fillText(dialog, "Descrição curta", "Curso de teste validando persistência de módulos.");
    await fillText(
      dialog,
      "Descrição completa",
      "Curso de teste E2E para validar que módulos e tópicos não se perdem ao clicar fora do modal."
    );

    await page.getByText("Adicionar módulo", { exact: true }).click();
    await dialog.getByPlaceholder("Ex.: Introdução à legislação").fill("Introdução ao módulo");
    await dialog.getByPlaceholder("Resumo do conteúdo e objetivo do módulo").fill("Resumo do conteúdo do módulo.");
    await dialog.getByPlaceholder("Ex.: 8 horas").fill("8 horas");
    await dialog.getByPlaceholder("Ex.: Casos reais, checklist e boas práticas").fill("Tópico 1");

    await page.mouse.click(5, 5);
    await expect(dialog).toBeVisible();
    await expect(dialog.getByPlaceholder("Ex.: Introdução à legislação")).toHaveValue("Introdução ao módulo");
    await expect(dialog.getByPlaceholder("Resumo do conteúdo e objetivo do módulo")).toHaveValue(
      "Resumo do conteúdo do módulo."
    );
    await expect(dialog.getByPlaceholder("Ex.: 8 horas")).toHaveValue("8 horas");
    await expect(dialog.getByPlaceholder("Ex.: Casos reais, checklist e boas práticas")).toHaveValue("Tópico 1");

    await saveAndExpectSuccess(page, dialog);
    const editDialog = await openEditDialogForRow(page, title);
    await expect(editDialog.getByPlaceholder("Ex.: Introdução à legislação")).toHaveValue("Introdução ao módulo");
    await expect(editDialog.getByPlaceholder("Resumo do conteúdo e objetivo do módulo")).toHaveValue(
      "Resumo do conteúdo do módulo."
    );
    await expect(editDialog.getByPlaceholder("Ex.: 8 horas")).toHaveValue("8 horas");
    await expect(editDialog.getByPlaceholder("Ex.: Casos reais, checklist e boas práticas")).toHaveValue("Tópico 1");

    await saveAndExpectSuccess(page, editDialog);
    const rowPattern = new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    await expect.poll(async () => page.getByRole("row", { name: rowPattern }).count(), {
      timeout: 15_000
    }).toBeGreaterThan(0);
    await deleteRowByName(page, title);
  });

  test("cursos: salva status Rascunho sem vazar no catálogo público", async ({ page }) => {
    const title = `${MARKER} curso rascunho`;
    const trainingPath = await resolveAvailableTrainingPath();
    const { supabaseUrl, serviceRoleKey } = getIntegrationEnv();
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const slug = `${slugifyForEmail(title)}-${Date.now()}`;
    const { data: insertedCourse, error: insertError } = await supabase
      .from("curso")
      .insert({
        titulo: title,
        slug,
        descricao_curta: "Curso rascunho criado pelo teste E2E.",
        descricao:
          "Curso rascunho criado pelo teste E2E para validar o path da Edge Function e o não vazamento no catálogo público.",
        ementa: [],
        objetivos: [],
        beneficios: [],
        publico_alvo: [],
        carga_horaria: 8,
        modalidade: "Online",
        modalidades: ["Online"],
        nivel: "Basico",
        categoria: trainingPath.shortName ?? trainingPath.name ?? null,
        trilha_id: trainingPath.id,
        trilha_nome: trainingPath.name,
        preco_base: 990,
        status: "Rascunho",
        destaque: false,
        rating: 0,
        total_alunos: 0,
      })
      .select("id, titulo, status")
      .single();

    if (insertError) {
      throw insertError;
    }

    await expect.poll(async () => findCourseByTitle(title), { timeout: 15_000 }).not.toBeNull();
    const savedDraft = await findCourseByTitle(title);
    expect(savedDraft?.status).toBe("Rascunho");
    expect(savedDraft).not.toBeNull();

    const publicPage = await page.context().newPage();
    await publicPage.goto("/cursos");
    await expect(publicPage.getByText(title)).toHaveCount(0);
    await publicPage.close();

    if (insertedCourse?.id) {
      await deleteCourseById(insertedCourse.id);
    }
  });

  test("turmas: cria vinculada a um curso existente e exclui", async ({ page }) => {
    // Data futura pouco provável de colidir com turma real — usada depois
    // para localizar a linha, já que turma não tem campo de nome único.
    const startDate = "2027-03-15";
    const startDateLabel = "15/03/2027";
    const endDate = "2027-03-16";
    await page.goto("/admin/turmas");

    const dialog = await openCreateDialog(page);
    const courseSelect = dialog.getByRole("combobox", { name: /^Curso/ });
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

    await dialog.getByRole("button", { name: /Criar registro|Salvar alterações/ }).click();
    await expect
      .poll(
        async () => {
          const created = await findInstructorByName(name);
          return created ?? null;
        },
        { timeout: 60_000, intervals: [250, 500, 1_000, 2_000] }
      )
      .not.toBeNull();

    const created = await findInstructorByName(name);
    expect(created?.id).toBeTruthy();
    await deleteInstructorById(created!.id);
  });

  test("blog: cria respeitando os tamanhos mínimos de resumo/conteúdo e exclui", async ({ page }) => {
    const title = `${MARKER} post ${Date.now()}`;
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

    await dialog.getByRole("button", { name: /Criar registro|Salvar alterações/ }).click();
    await expect
      .poll(
        async () => {
          const created = await findBlogPostByTitle(title);
          return created ?? null;
        },
        { timeout: 30_000, intervals: [250, 500, 1_000] }
      )
      .not.toBeNull();

    const created = await findBlogPostByTitle(title);
    expect(created?.id).toBeTruthy();
    await deleteBlogPostById(created!.id);
  });

  test("leads: cria manualmente no admin e exclui", async ({ page }) => {
    const name = `${MARKER} lead`;
    const email = buildUniqueEmail("lead");
    await page.goto("/admin/leads");

    const dialog = await openCreateDialog(page);
    await fillText(dialog, "Nome", name);
    await fillText(dialog, "E-mail", email);
    await fillText(dialog, "Telefone", "(61) 98888-7777");
    await forceSelectValue(dialog, "Jornada comercial", "Curso");
    await fillText(dialog, "Interesse principal", "Consultoria de RH");
    await forceSelectValue(dialog, "Origem", "Site");
    await forceSelectValue(dialog, "Status", "Novo");
    await fillText(dialog, "Empresa/Órgão", "Empresa E2E");
    await fillText(dialog, "Tamanho da equipe", "12");

    await dialog.getByRole("button", { name: /Criar registro|Salvar alterações/ }).click();
    await expect
      .poll(
        async () => {
          const created = await findLeadByEmail(email);
          return created ?? null;
        },
        { timeout: 30_000, intervals: [250, 500, 1_000] }
      )
      .not.toBeNull();

    const created = await findLeadByEmail(email);
    expect(created?.id).toBeTruthy();
    await deleteLeadById(created!.id);
  });

  test("students: cria cadastro manual e exclui", async ({ page }, testInfo) => {
    const name = `${MARKER} aluno`;
    const email = buildUniqueEmail("aluno");
    let createdStudentId: string | undefined;
    let primaryError: unknown;
    await page.goto("/admin/alunos");

    try {
      const dialog = await openCreateDialog(page);
      await fillText(dialog, "Nome", name);
      await fillText(dialog, "E-mail", email);
      await fillText(dialog, "Empresa / órgão", "Órgão E2E");
      await forceSelectValue(dialog, "Status", "Pendente");

      const result = await saveAndExpectSuccess(page, dialog, {
        resource: "students",
        action: "create",
        requireId: true,
      });
      createdStudentId = result.id;
      await expect(page.getByText("Aluno criado.", { exact: true })).toBeVisible();

      const created = await findStudentByEmail(email);
      expect(created?.id).toBe(createdStudentId);
    } catch (error) {
      primaryError = error;
      throw error;
    } finally {
      try {
        const cleanupId = createdStudentId ?? (await findStudentByEmail(email))?.id;
        if (cleanupId) {
          await deleteStudentById(cleanupId);
        }
      } catch (cleanupError) {
        const message = cleanupError instanceof Error
          ? cleanupError.message
          : "Falha desconhecida no cleanup do aluno E2E.";
        await testInfo.attach("student-cleanup-error", {
          body: Buffer.from(message),
          contentType: "text/plain",
        });
        if (!primaryError) {
          throw cleanupError;
        }
      }
    }
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
    await forceSelectValue(dialog, "Tipo de inscrição", "Empresa");
    await forceSelectValue(dialog, "Pagamento", "Pix");
    await forceSelectValue(dialog, "Curso", target.courseTitle);
    await forceSelectValue(dialog, "Turma", target.classId);

    await saveAndExpectSuccess(page, dialog);
    await deleteRowByName(page, name);
  });
});
