import { expect, test, type Page } from "@playwright/test";
import { loginWithSsrSession } from "./helpers/integration-env";

// Crawl de fumaça: visita cada rota conhecida do app (pública, portal e admin)
// e falha se a página cair no error boundary ("Algo deu errado") ou disparar
// erro de console/página. Não valida conteúdo de negócio — isso fica para os
// specs de jornada (public-journeys.spec.ts, admin-polish.spec.ts etc).
// Ao adicionar uma rota nova em app/**/page.tsx, adicione o path na lista
// correspondente abaixo.

const ERROR_BOUNDARY_TEXT = "Algo deu errado";

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
  "/inscricao-confirmada",
  "/falar-com-especialista"
];

// O catálogo de produção e o baseline determinístico têm slugs diferentes.
// Ambos precisam apontar para conteúdo publicado; slugs obsoletos devem falhar
// como 404, não ser aceitos pelo smoke crawl.
const dynamicPaths = process.env.PLAYWRIGHT_TEST_BUILD === "1"
  ? [
      "/cursos/introducao-as-licitacoes-e-contratos-administrativos-nocoes-essenciais-para-o-setor-publico",
      "/blog/3-alertas-para-revisar-antes-de-enviar-eventos-do-esocial"
    ]
  : ["/cursos/auditoria-da-folha-de-pagamento"];

const adminPaths = [
  "/admin",
  "/admin/cursos",
  "/admin/turmas",
  "/admin/alunos",
  "/admin/leads",
  "/admin/inscricoes",
  "/admin/instrutores",
  "/admin/blog",
  "/admin/configuracoes"
];

const portalPaths: Array<{ path: string; role: "student" | "instructor" }> = [
  { path: "/aluno", role: "student" },
  { path: "/instrutor", role: "instructor" }
];

async function crawl(page: Page, path: string, options: { expectAuthenticated?: boolean } = {}) {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });
  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });

  // Evita "networkidle": o app tem polling de sessão em background
  // (syncSession em app-store.tsx) que nunca deixa a rede ficar ociosa.
  const response = await page.goto(path, { waitUntil: "domcontentloaded" });

  expect(response?.status(), `${path} deveria responder 2xx`).toBeLessThan(400);
  await expect(page.locator("body"), `${path} caiu no error boundary`).not.toContainText(
    ERROR_BOUNDARY_TEXT,
    { timeout: 10_000 }
  );
  // Dá tempo para os fetches client-side (catálogo, dashboard) dispararem e,
  // se algo quebrar, para o error boundary/console.error aparecerem.
  await page.waitForTimeout(1500);

  if (options.expectAuthenticated) {
    // Sessão inválida/expirada redireciona silenciosamente para /login — sem
    // esta checagem, o crawl "passa" mesmo tendo caído na tela errada.
    expect(page.url(), `${path} redirecionou para /login — sessão não autenticou`).not.toContain(
      "/login"
    );
  }

  expect(pageErrors, `${path} disparou pageerror: ${pageErrors.join(" | ")}`).toEqual([]);
  expect(consoleErrors, `${path} logou console.error: ${consoleErrors.join(" | ")}`).toEqual([]);
}

test.describe("smoke crawl — páginas públicas", () => {
  for (const path of [...publicPaths, ...dynamicPaths]) {
    test(`${path} carrega sem erro`, async ({ page }) => {
      await crawl(page, path);
    });
  }
});

test.describe("smoke crawl — admin", () => {
  test.beforeEach(async ({ context, baseURL }) => {
    await loginWithSsrSession({
      baseURL: baseURL ?? "http://127.0.0.1:3100",
      context,
      role: "admin",
      name: "Perfil admin"
    });
  });

  for (const path of adminPaths) {
    test(`${path} carrega sem erro`, async ({ page }) => {
      await crawl(page, path, { expectAuthenticated: true });
    });
  }
});

test.describe("smoke crawl — portais aluno/instrutor", () => {
  for (const { path, role } of portalPaths) {
    test(`${path} carrega sem erro`, async ({ page, context, baseURL }) => {
      await loginWithSsrSession({
        baseURL: baseURL ?? "http://127.0.0.1:3100",
        context,
        role,
        name: `Perfil ${role}`
      });

      await crawl(page, path, { expectAuthenticated: true });
    });
  }
});
