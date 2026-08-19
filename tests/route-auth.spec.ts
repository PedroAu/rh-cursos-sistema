import { expect, test } from "@playwright/test";
import { loginWithSsrSession } from "./helpers/integration-env";

// Modelo híbrido:
// - páginas públicas seguem acessíveis por SSR/SSG;
// - login usa rota interna `/api/auth/session`;
// - `/admin` exige sessão no servidor e redireciona antes de renderizar o painel;
// - mutações administrativas continuam nas Edge Functions do Supabase.

const publicPaths = [
  "/",
  "/cursos",
  "/consultoria",
  "/agenda",
  "/blog",
  "/in-company",
  "/sobre",
  "/contato",
  "/login",
  "/inscricao-confirmada"
];

// O catálogo de produção e o baseline determinístico têm slugs diferentes;
// em ambos os casos a rota deve apontar para conteúdo realmente publicado.
const dynamicPaths = process.env.PLAYWRIGHT_TEST_BUILD === "1"
  ? [
      "/cursos/introducao-as-licitacoes-e-contratos-administrativos-nocoes-essenciais-para-o-setor-publico",
      "/blog/3-alertas-para-revisar-antes-de-enviar-eventos-do-esocial"
    ]
  : ["/cursos/auditoria-da-folha-de-pagamento"];

test.describe("rotas publicas", () => {
  for (const path of [...publicPaths, ...dynamicPaths]) {
    test(`${path} responde 200`, async ({ request }) => {
      const response = await request.get(path);
      expect(response.status()).toBe(200);
    });
  }

  test("rota legada /curso redireciona para o catalogo", async ({ request }) => {
    const response = await request.get("/curso", { maxRedirects: 0 });
    expect(response.status()).toBe(301);
    expect(response.headers().location).toBe("/cursos");
  });

  test("nao exibe codigos internos das trilhas", async ({ page }) => {
    for (const path of ["/", "/cursos"]) {
      await page.goto(path);
      await expect(page.locator("body")).not.toContainText(/\bT0[1-6]\b/);
    }
  });

  test("exibe cards de turmas com CTA de detalhe no catálogo", async ({ page }) => {
    await page.goto("/cursos");
    await expect(page.getByRole("link", { name: "Ver turma →" }).first()).toBeVisible();
  });
});

test.describe("protecao server-side das areas autenticadas", () => {
  test("/admin sem sessao redireciona para /login (server-side)", async ({ page, request }) => {
    const response = await request.get("/admin/", { maxRedirects: 0 });
    expect(response.status()).toBe(307);
    expect(response.headers().location).toContain("/login?status=required&next=/admin");

    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login\?status=required&next=\/admin/);
  });

  test("portais aluno e instrutor redirecionam sem sessao", async ({ request }) => {
    const studentResponse = await request.get("/aluno", { maxRedirects: 0 });
    expect(studentResponse.status()).toBe(307);
    expect(studentResponse.headers().location).toContain("/login?status=required&next=/aluno");

    const instructorResponse = await request.get("/instrutor", { maxRedirects: 0 });
    expect(instructorResponse.status()).toBe(307);
    expect(instructorResponse.headers().location).toContain("/login?status=required&next=/instrutor");
  });

  test("cada portal aceita apenas a role correspondente", async ({ context, baseURL }) => {
    const origin = baseURL ?? "http://127.0.0.1:3100";
    await loginWithSsrSession({ baseURL: origin, context, role: "student", name: "Perfil student" });
    const studentPortal = await context.request.get("/aluno");
    expect(studentPortal.status()).toBe(200);

    await context.request.delete("/api/auth/session");
    await loginWithSsrSession({ baseURL: origin, context, role: "instructor", name: "Perfil instructor" });
    const instructorPortal = await context.request.get("/instrutor");
    expect(instructorPortal.status()).toBe(200);
    const blockedStudent = await context.request.get("/aluno", { maxRedirects: 0 });
    expect(blockedStudent.status()).toBe(307);

    await context.request.delete("/api/auth/session");
    await loginWithSsrSession({ baseURL: origin, context, role: "admin", name: "Perfil admin" });
    const blockedInstructor = await context.request.get("/instrutor", { maxRedirects: 0 });
    expect(blockedInstructor.status()).toBe(307);
  });

  test("/admin com sessao nao-admin falha fechado e redireciona para /login", async ({
    context,
    page,
    baseURL
  }) => {
    await loginWithSsrSession({
      baseURL: baseURL ?? "http://127.0.0.1:3100",
      context,
      role: "student",
      name: "Perfil student"
    });
    const response = await context.request.get("/admin/", { maxRedirects: 0 });

    expect(response.status()).toBe(307);
    expect(response.headers().location).toContain("/login?status=required&next=/admin");

    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login\?status=required&next=\/admin/);
  });
});

test.describe("contrato da rota /api/auth/session", () => {
  test("GET sem sessao responde 401", async ({ request }) => {
    const response = await request.get("/api/auth/session");

    expect(response.status()).toBe(401);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "Sessao invalida ou expirada."
    });
  });

  test("GET com sessao nao-admin valida a sessao e preserva a role", async ({ context, baseURL }) => {
    const origin = baseURL ?? "http://127.0.0.1:3100";
    await loginWithSsrSession({
      baseURL: origin,
      context,
      role: "student",
      name: "Perfil student"
    });
    const response = await context.request.get(new URL("/api/auth/session", origin).toString());
    expect(response.status()).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      session: {
        role: "student",
        email: "student-contract@rhcursos.test",
        name: "Perfil student"
      }
    });
  });

  test("DELETE encerra a sessao SSR e o GET subsequente falha fechado", async ({
    context,
    baseURL
  }) => {
    await loginWithSsrSession({
      baseURL: baseURL ?? "http://127.0.0.1:3100",
      context,
      role: "student",
      name: "Perfil student"
    });
    const response = await context.request.delete("/api/auth/session");
    expect(response.status()).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ ok: true, mode: "global", revoked: true });
    const read = await context.request.get("/api/auth/session");
    expect(read.status()).toBe(401);
  });
});
