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
  ,"/lp/departamento-pessoal-do-zero"
];

// O baseline determinístico controla os próprios slugs. No smoke conectado ao
// catálogo real, a rota de curso é descoberta em `/cursos`: slugs editoriais
// mudam e não devem bloquear um deploy saudável por ficarem obsoletos no teste.
const deterministicDynamicPaths = process.env.PLAYWRIGHT_TEST_BUILD === "1"
  ? [
      "/cursos/introducao-as-licitacoes-e-contratos-administrativos-nocoes-essenciais-para-o-setor-publico",
      "/blog/3-alertas-para-revisar-antes-de-enviar-eventos-do-esocial"
    ]
  : [];

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

async function discoverPublishedCoursePath(page: Page): Promise<string> {
  const response = await page.goto("/cursos", { waitUntil: "domcontentloaded" });
  expect(response?.status(), "/cursos deveria responder 2xx durante a descoberta").toBeLessThan(400);

  const courseLinks = page.locator('a[href^="/cursos/"]');
  await expect(
    courseLinks.first(),
    "O catálogo público deve expor ao menos um link para um curso publicado"
  ).toBeAttached({ timeout: 10_000 });

  const hrefs = await courseLinks.evaluateAll((links) =>
    links
      .map((link) => link.getAttribute("href"))
      .filter((href): href is string => Boolean(href))
  );
  const canonicalCourseHrefs = hrefs.filter((href) => /^\/cursos\/[^/?#]+\/?$/.test(href));
  // Admin CRUD tests run in parallel and briefly expose generated E2E slugs
  // while their cleanup is still in flight. Prefer a stable editorial course
  // so this smoke assertion validates the public catalog, not a transient row.
  const coursePath = canonicalCourseHrefs.find((href) => !/^\/cursos\/e2e-/i.test(href)) ?? canonicalCourseHrefs[0];

  expect(
    coursePath,
    "O catálogo público não expôs uma rota canônica de detalhe de curso publicada"
  ).toBeDefined();

  return coursePath!;
}

test.describe("smoke crawl — páginas públicas", () => {
  for (const path of [...publicPaths, ...deterministicDynamicPaths]) {
    test(`${path} carrega sem erro`, async ({ page }) => {
      await crawl(page, path);
    });
  }

  test("uma rota de curso publicada descoberta pelo catálogo carrega sem erro", async ({ context, page }) => {
    test.skip(
      process.env.PLAYWRIGHT_TEST_BUILD === "1",
      "O baseline determinístico já valida seu slug de curso conhecido"
    );

    const discoveryPage = await context.newPage();
    let coursePath: string;
    try {
      coursePath = await discoverPublishedCoursePath(discoveryPage);
    } finally {
      await discoveryPage.close();
    }

    await crawl(page, coursePath);
  });
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
