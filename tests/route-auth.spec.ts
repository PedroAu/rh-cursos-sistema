import { expect, test } from "@playwright/test";

// Modelo estático + backend em Supabase Edge Functions.
// No export estático não há middleware/proxy de servidor nem rotas /api:
// - todas as páginas (inclusive /admin) são servidas como HTML estático (200);
// - a proteção do /admin é client-side (redirect via app-store após hidratação);
// - autenticação e mutações vivem nas Edge Functions (testadas à parte).

const publicPaths = [
  "/",
  "/cursos",
  "/agenda",
  "/blog",
  "/in-company",
  "/sobre",
  "/contato",
  "/login",
  "/admin"
];

// Páginas dinâmicas (SSG) — slugs reais presentes no export. Se os dados de
// catálogo mudarem, atualizar para slugs existentes em out/cursos e out/blog.
const dynamicPaths = [
  "/cursos/introducao-as-licitacoes-e-contratos-administrativos-nocoes-essenciais-para-o-setor-publico",
  "/blog/3-alertas-para-revisar-antes-de-enviar-eventos-do-esocial"
];

test.describe("rotas publicas", () => {
  for (const path of [...publicPaths, ...dynamicPaths]) {
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

test.describe("protecao do admin no export estatico", () => {
  // O HTML do /admin é servido estaticamente (200), mas o AdminGuard redireciona
  // para /login quando não há sessão admin após a hidratação. A proteção dos
  // DADOS permanece na Edge Function `admin-resources` (token HMAC).
  test("/admin sem sessao redireciona para /login (client-side)", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login/);
  });

  test("rotas de portal aluno e instrutor nao existem nesta publicacao", async ({ request }) => {
    await expect.poll(async () => (await request.get("/aluno")).status()).toBe(404);
    await expect.poll(async () => (await request.get("/instrutor")).status()).toBe(404);
  });
});
