import { expect, test } from "@playwright/test";
import { SESSION_COOKIE, encodeSession } from "@/lib/auth";
import { ensureAuthUser, hasRealIntegrationEnv } from "./helpers/integration-env";

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

// Páginas dinâmicas (SSG) — slugs reais presentes no export. Se os dados de
// catálogo mudarem, atualizar para slugs existentes em out/cursos e out/blog.
const dynamicPaths = [
  "/cursos/introducao-as-licitacoes-e-contratos-administrativos-nocoes-essenciais-para-o-setor-publico",
  "/blog/3-alertas-para-revisar-antes-de-enviar-eventos-do-esocial"
];

async function issueSessionToken(role: "admin" | "instructor" | "student", ttlMs?: number) {
  return encodeSession(
    {
      role,
      email: `${role}@rhcursos.com.br`,
      name: `Perfil ${role}`
    },
    ttlMs
  );
}

function cookieHeader(token: string) {
  return `${SESSION_COOKIE}=${token}`;
}

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

  test("cada portal aceita apenas a role correspondente", async ({ request }) => {
    const studentToken = await issueSessionToken("student");
    const instructorToken = await issueSessionToken("instructor");
    const adminToken = await issueSessionToken("admin");

    const studentPortal = await request.get("/aluno", {
      headers: { cookie: cookieHeader(studentToken) }
    });
    expect(studentPortal.status()).toBe(200);

    const instructorPortal = await request.get("/instrutor", {
      headers: { cookie: cookieHeader(instructorToken) }
    });
    expect(instructorPortal.status()).toBe(200);

    const blockedStudent = await request.get("/aluno", {
      headers: { cookie: cookieHeader(instructorToken) },
      maxRedirects: 0
    });
    expect(blockedStudent.status()).toBe(307);

    const blockedInstructor = await request.get("/instrutor", {
      headers: { cookie: cookieHeader(adminToken) },
      maxRedirects: 0
    });
    expect(blockedInstructor.status()).toBe(307);
  });

  test("/admin com sessao nao-admin falha fechado e redireciona para /login", async ({
    context,
    page,
    request
  }) => {
    const token = await issueSessionToken("student");
    const response = await request.get("/admin/", {
      headers: { cookie: cookieHeader(token) },
      maxRedirects: 0
    });

    expect(response.status()).toBe(307);
    expect(response.headers().location).toContain("/login?status=required&next=/admin");

    await context.addCookies([
      {
        name: SESSION_COOKIE,
        value: token,
        url: "http://127.0.0.1:3100"
      }
    ]);

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

  test("GET rejeita cookie adulterado com 401", async ({ request }) => {
    const token = await issueSessionToken("admin");
    const tamperedToken = `${token.slice(0, -1)}${token.endsWith("a") ? "b" : "a"}`;
    const response = await request.get("/api/auth/session", {
      headers: { cookie: cookieHeader(tamperedToken) }
    });

    expect(response.status()).toBe(401);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "Sessao invalida ou expirada."
    });
  });

  test("GET com sessao nao-admin valida a sessao e preserva a role", async ({ context, page }) => {
    test.skip(!hasRealIntegrationEnv(), "Validação de sessão real requer ambiente Supabase real.");
    const credentials = await ensureAuthUser({
      email: "student@rhcursos.com.br",
      name: "Perfil student",
      role: "student"
    });
    const loginResponse = await page.request.post("/api/auth/session", {
      data: {
        role: "student",
        email: credentials.email,
        password: credentials.password
      }
    });
    expect(loginResponse.status()).toBe(200);
    const loginPayload = await loginResponse.json() as { token?: string | null };
    expect(loginPayload.token).toBeTruthy();

    await context.addCookies([
      {
        name: SESSION_COOKIE,
        value: loginPayload.token!,
        url: "http://127.0.0.1:3100"
      }
    ]);

    await page.goto("/");
    const sessionPayload = await page.evaluate(async () => {
      const response = await fetch("/api/auth/session");
      return {
        status: response.status,
        body: await response.json()
      };
    });

    expect(sessionPayload.status).toBe(200);
    expect(sessionPayload.body).toMatchObject({
      ok: true,
      session: {
        role: "student",
        email: "student@rhcursos.com.br",
        name: "Perfil student"
      }
    });
  });

  test("DELETE sem access token encerra apenas a sessao local e expira o cookie", async ({
    request
  }) => {
    const response = await request.delete("/api/auth/session", {
      data: {}
    });

    expect(response.status()).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      mode: "local-only",
      revoked: false
    });
    expect(response.headers()["set-cookie"]).toContain(`${SESSION_COOKIE}=`);
    expect(response.headers()["set-cookie"].toLowerCase()).toContain("max-age=0");
  });
});
