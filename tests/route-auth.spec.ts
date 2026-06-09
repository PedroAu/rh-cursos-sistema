import { expect, test } from "@playwright/test";

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
  "/login"
];

// Páginas dinâmicas (SSG) — slugs reais presentes no export. Se os dados de
// catálogo mudarem, atualizar para slugs existentes em out/cursos e out/blog.
const dynamicPaths = [
  "/curso?slug=introducao-as-licitacoes-e-contratos-administrativos-nocoes-essenciais-para-o-setor-publico",
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

test.describe("protecao server-side do admin", () => {
  test("/admin sem sessao redireciona para /login (server-side)", async ({ page, request }) => {
    const response = await request.get("/admin/", { maxRedirects: 0 });
    expect(response.status()).toBe(307);
    expect(response.headers().location).toContain("/login?status=required&next=/admin");

    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login\/\?status=required&next=%2Fadmin/);
  });

  test("rotas de portal aluno e instrutor nao existem nesta publicacao", async ({ request }) => {
    await expect.poll(async () => (await request.get("/aluno")).status()).toBe(404);
    await expect.poll(async () => (await request.get("/instrutor")).status()).toBe(404);
  });
});
