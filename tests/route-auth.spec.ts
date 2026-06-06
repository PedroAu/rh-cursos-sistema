import { expect, test } from "@playwright/test";

const publicPaths = [
  "/",
  "/cursos",
  "/agenda",
  "/blog",
  "/in-company",
  "/sobre",
  "/contato",
  "/login",
  "/cursos/esocial-na-administracao-publica",
  "/blog/3-sinais-de-que-seu-esocial-precisa-de-revisao"
];

const protectedPaths = [
  { path: "/admin", role: "admin", email: "admin@rhcursos.demo", password: "admin123" }
];

test.describe("rotas publicas", () => {
  for (const path of publicPaths) {
    test(`${path} responde 200`, async ({ request }) => {
      const response = await request.get(path);
      expect(response.status()).toBe(200);
    });
  }

  test("nao exibe codigos internos das trilhas", async ({ page }) => {
    for (const path of ["/", "/cursos"]) {
      await page.goto(path);
      await expect(page.locator("body")).not.toContainText(/\bT0[1-6]\b/);
    }
  });

  test("exibe capas locais nos cards de cursos", async ({ page }) => {
    await page.goto("/cursos");
    await expect(page.locator('img[src^="/images/courses/"]').first()).toBeVisible();
  });
});

test.describe("autenticacao por papel", () => {
  for (const { path } of protectedPaths) {
    test(`${path} redireciona sem sessao`, async ({ request }) => {
      const response = await request.get(path, { maxRedirects: 0 });
      expect(response.status()).toBe(307);
      expect(response.headers().location).toContain("/login?status=required");
    });
  }

  for (const session of protectedPaths) {
    test(`${session.path} permite papel correto`, async ({ request }) => {
      const login = await request.post("/api/auth/session", {
        data: {
          role: session.role,
          email: session.email,
          password: session.password
        }
      });

      expect(login.status()).toBe(200);

      const response = await request.get(session.path, { maxRedirects: 0 });
      expect(response.status()).toBe(200);
    });
  }

  test("rejeita papeis fora do escopo de publicacao", async ({ request }) => {
    const login = await request.post("/api/auth/session", {
      data: {
        role: "student",
        email: "ana.silva1@mockmail.com",
        password: "aluno123"
      }
    });

    expect(login.status()).toBe(400);
  });

  test("rotas de portal aluno e instrutor nao existem nesta publicacao", async ({ request }) => {
    await expect.poll(async () => (await request.get("/aluno")).status()).toBe(404);
    await expect.poll(async () => (await request.get("/instrutor")).status()).toBe(404);
  });
});
