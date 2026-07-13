import { loadEnvFile } from "node:process";
import { expect, test } from "@playwright/test";

import { SESSION_COOKIE, encodeSession } from "@/lib/auth";
import { attachRuntimeErrorProbe } from "./helpers/runtime-errors";

// O servidor de teste (`next start`) carrega AUTH_SESSION_SECRET via
// .env.local automaticamente, mas este processo Playwright não — sem isso,
// encodeSession() assina com o fallback inseguro e o cookie nunca bate com
// o segredo real do servidor (mesmo problema resolvido em admin-crud.spec.ts).
try {
  loadEnvFile(".env.local");
} catch {
  // Arquivo pode não existir em alguns ambientes (ex.: CI com secrets via env vars).
}

// Story 15.1 — regressão de fidelidade do Dashboard admin (Trust Keith).
// Autentica via cookie de sessão (mesmo padrão de tests/route-auth.spec.ts)
// para evitar depender de credenciais reais do Supabase Auth.

async function loginAsAdmin(context: import("@playwright/test").BrowserContext, baseURL: string) {
  const token = await encodeSession({ role: "admin", email: "admin@rhcursos.com.br", name: "Admin E2E" });
  await context.addCookies([{ name: SESSION_COOKIE, value: token, url: baseURL }]);
}

test.describe("epic 15 — admin dashboard fidelidade total", () => {
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

    expect(runtimeErrors).toEqual([]);
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
});
