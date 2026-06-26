import { expect, test } from "@playwright/test";
import { SESSION_COOKIE, encodeSession } from "@/lib/auth";

// Modelo híbrido:
// - páginas públicas seguem acessíveis por SSR/SSG;
// - login usa rota interna `/api/auth/session`;
// - `/admin` exige sessão no servidor e redireciona antes de renderizar o painel;
// - mutações administrativas continuam nas Edge Functions do Supabase.

const publicPaths = [
  "/",
  "/cursos",
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

  test("exibe capas locais nos cards de cursos", async ({ page }) => {
    await page.goto("/cursos");
    await expect(
      page.locator('img[src^="/images/courses/"], img[src*="%2Fimages%2Fcourses%2F"]').first()
    ).toBeVisible();
  });
});

test.describe("protecao server-side do admin", () => {
  test("/admin sem sessao redireciona para /login (server-side)", async ({ page, request }) => {
    const response = await request.get("/admin/", { maxRedirects: 0 });
    expect(response.status()).toBe(307);
    expect(response.headers().location).toContain("/login?status=required&next=/admin");

    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login\?status=required&next=\/admin/);
  });

  test("rotas de portal aluno e instrutor nao existem nesta publicacao", async ({ request }) => {
    await expect.poll(async () => (await request.get("/aluno")).status()).toBe(404);
    await expect.poll(async () => (await request.get("/instrutor")).status()).toBe(404);
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

  test("GET com sessao nao-admin responde 401", async ({ request }) => {
    const token = await issueSessionToken("student");
    const response = await request.get("/api/auth/session", {
      headers: { cookie: cookieHeader(token) }
    });

    expect(response.status()).toBe(401);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "Sessao invalida ou expirada."
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
