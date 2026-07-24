import { expect, test } from "@playwright/test";

import { loginWithSsrSession } from "@tests/helpers/integration-env";
import { attachRuntimeErrorProbe } from "@tests/helpers/runtime-errors";

// Story 15.1 — regressão de fidelidade do Dashboard admin (Trust Keith).
// Autentica pelo contrato Supabase SSR vigente; os tokens permanecem somente
// nos cookies httpOnly geridos pelo BrowserContext.

async function loginAsAdmin(context: import("@playwright/test").BrowserContext, baseURL: string) {
  await loginWithSsrSession({ baseURL, context, name: "Admin E2E" });
}

test.describe("epic 15 — admin dashboard fidelidade total", () => {
  test("falha fechado quando as credenciais SSR são inválidas", async ({ context, baseURL }) => {
    const response = await context.request.post(
      new URL("/api/auth/session", baseURL ?? "http://127.0.0.1:3100").toString(),
      { data: { email: "admin-contract@rhcursos.test", password: "credencial-invalida", role: "admin" } }
    );

    expect(response.status()).toBe(401);
    await expect(response.json()).resolves.toMatchObject({ ok: false });
    expect(await context.cookies()).toEqual([]);
  });

  test("Visão geral renderiza cabeçalho, KPIs e cards do canvas sem erro de runtime", async ({ context, page, baseURL }) => {
    await loginAsAdmin(context, baseURL ?? "http://127.0.0.1:3100");
    const runtimeErrors = attachRuntimeErrorProbe(page);

    await page.goto("/admin");

    await expect(page.getByRole("heading", { name: "Visão geral", level: 1 })).toBeVisible();
    // Regex ancorado ao formato "{dia da semana}, {data} · últimos 30 dias" do
    // subtítulo dinâmico — evita colidir com o texto de empty-state de leads
    // ("Nenhum lead ... nos últimos 30 dias."), que também contém a frase.
    await expect(page.getByText(/,\s*\d{1,2}\s+de\s+\S+\s+de\s+\d{4}\s+·\s+últimos 30 dias/)).toBeVisible();
    await expect(page.getByRole("link", { name: "Ver site →" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Novo curso" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Nova turma" })).toBeVisible();

    await expect(page.getByText("Matrículas no mês", { exact: true })).toBeVisible();
    await expect(page.getByText("Leads novos", { exact: true })).toBeVisible();
    await expect(page.getByText("Turmas abertas", { exact: true })).toBeVisible();
    await expect(page.getByText("Ocupação média", { exact: true })).toBeVisible();

    await expect(page.getByRole("heading", { name: "Leads recentes" })).toBeVisible();
    await expect(page.getByRole("group", { name: "Filtrar leads por origem" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Próximas turmas" })).toBeVisible();

    await expect(page.getByText("Gerenciar Cursos")).toHaveCount(0);
    await expect(page.getByText("Atividades Recentes")).toHaveCount(0);

    await expect(page.getByRole("heading", { name: "Relatório de Performance" })).toBeVisible();

    expect(runtimeErrors.filter((message) => !message.includes("example.supabase.co/realtime"))).toEqual([]);
  });

  test("chip 'Todas' filtra a tabela de leads recentes", async ({ context, page, baseURL }) => {
    await loginAsAdmin(context, baseURL ?? "http://127.0.0.1:3100");
    await page.goto("/admin");

    const allChip = page.getByRole("button", { name: "Todas", exact: true });
    await expect(allChip).toBeVisible();
    await expect(allChip).toHaveAttribute("aria-pressed", "true");
  });

  test("responsivo <1024px reaproveita navegação inferior sem overflow horizontal na página", async ({ context, page, baseURL }) => {
    await loginAsAdmin(context, baseURL ?? "http://127.0.0.1:3100");
    await page.setViewportSize({ width: 900, height: 900 });
    await page.goto("/admin");

    await expect(page.getByRole("heading", { name: "Visão geral", level: 1 })).toBeVisible();

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
    );
    expect(hasHorizontalOverflow).toBe(false);
  });

  test("Cursos preserva conteúdo, busca e ação primária do canvas", async ({ context, page, baseURL }) => {
    await loginAsAdmin(context, baseURL ?? "http://127.0.0.1:3100");
    await page.goto("/admin/cursos");

    await expect(page.getByRole("heading", { name: "Cursos", level: 1 })).toBeVisible();
    await expect(page.getByText(/\d+ cursos? no catálogo · \d+ publicados? no site/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Novo curso" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Buscar cursos" })).toHaveAttribute("placeholder", "Buscar curso ou trilha.");
    await expect(page.getByRole("table", { name: "Cursos" }).getByRole("columnheader")).toHaveText([
      "Curso",
      "Categoria",
      "Modalidade",
      "Carga horária",
      "Turmas ativas",
      "Status",
      "Ações",
    ]);
  });

  test("Turmas preserva agenda, ocupação e responsividade sem overflow de página", async ({ context, page, baseURL }) => {
    await loginAsAdmin(context, baseURL ?? "http://127.0.0.1:3100");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/admin/turmas");

    await expect(page.getByRole("heading", { name: "Turmas", level: 1 })).toBeVisible();
    await expect(page.getByText(/\d+ turmas? abertas? · \d+% de ocupação média/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Nova turma" })).toBeVisible();
    await expect(page.getByRole("table", { name: "Turmas" }).getByRole("columnheader")).toHaveText([
      "Turma",
      "Data",
      "Modalidade",
      "Ocupação",
      "Instrutor",
      "Status",
      "Ações",
    ]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true);
  });
});
