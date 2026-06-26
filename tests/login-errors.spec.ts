import { expect, test } from "@playwright/test";
import {
  annotateCanonicalDoc,
  ensureAuthUser,
  getCanonicalDocs,
  getIntegrationEnv,
} from "./helpers/integration-env";

// A suíte mistura contrato real para o caminho feliz e cenários controlados
// para falhas previsíveis da UI. Assim preservamos feedback determinístico sem
// abrir mão da validação ponta a ponta do fluxo principal.

// O Next.js injeta um <div role="alert" id="__next-route-announcer__"> interno
// que está sempre presente. Excluímos esse nó por id para isolar o alerta do
// formulário de login.
const loginAlert = (page: import("@playwright/test").Page) =>
  page.locator('div[role="alert"]:not(#__next-route-announcer__)');

const clickEntrar = (page: import("@playwright/test").Page) =>
  page.getByRole("button", { name: "Entrar", exact: true }).click();

test.describe("mensagens de erro do login", () => {
  test("login bem-sucedido persiste a sessão real e respeita o next informado", async ({
    page
  }, testInfo) => {
    annotateCanonicalDoc(testInfo, getCanonicalDocs().authSession);
    const { adminEmail, adminPassword } = getIntegrationEnv();

    await ensureAuthUser({
      email: adminEmail,
      name: "Administrador RH Cursos",
      password: adminPassword,
      role: "admin",
    });

    await page.goto("/login?next=/cursos");
    await page.getByLabel("E-mail").fill(adminEmail);
    await page.getByLabel("Senha").fill(adminPassword);
    await clickEntrar(page);

    await expect(page).toHaveURL(/\/cursos$/);
    await expect
      .poll(() =>
        page.evaluate(() => window.localStorage.getItem("rh_cursos_admin_token"))
      )
      .toMatch(/\./);
  });

  test("logout encerra a sessão e volta a bloquear /admin", async ({ page }, testInfo) => {
    annotateCanonicalDoc(testInfo, getCanonicalDocs().authSession);
    const { adminEmail, adminPassword } = getIntegrationEnv();

    await ensureAuthUser({
      email: adminEmail,
      name: "Administrador RH Cursos",
      password: adminPassword,
      role: "admin",
    });

    await page.goto("/login?next=/admin");
    await page.getByLabel("E-mail").fill(adminEmail);
    await page.getByLabel("Senha").fill(adminPassword);
    await clickEntrar(page);

    await expect(page).toHaveURL(/\/admin/);
    const logoutResponsePromise = page.waitForResponse((response) =>
      response.url().includes("/api/auth/session") &&
      response.request().method() === "DELETE"
    );
    await page.getByRole("button", { name: "Sair" }).click();
    await expect((await logoutResponsePromise).ok()).toBeTruthy();

    await expect
      .poll(() =>
        page.evaluate(() => window.localStorage.getItem("rh_cursos_admin_token"))
      )
      .toBeNull();

    const sessionCheck = await page.evaluate(async () => {
      const response = await fetch("/api/auth/session", {
        method: "GET",
        headers: { Accept: "application/json" },
        credentials: "include",
      });

      return {
        status: response.status,
        body: await response.json(),
      };
    });

    expect(sessionCheck.status).toBe(401);
    expect(sessionCheck.body).toEqual({
      ok: false,
      error: "Sessao invalida ou expirada.",
    });

    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login/);
  });

  test("campos vazios exibem alerta de validacao", async ({ page }) => {
    await page.goto("/login");
    await clickEntrar(page);

    await expect(loginAlert(page)).toBeVisible();
    await expect(loginAlert(page)).toContainText("Preencha e-mail e senha para continuar.");
  });

  test("credenciais invalidas exibem alerta", async ({ page }) => {
    // Força a rota interna a responder com erro (não-ok).
    await page.route("**/api/auth/session", (route) =>
      route.fulfill({ status: 401, contentType: "application/json", body: "{}" })
    );

    await page.goto("/login");
    await page.getByLabel("E-mail").fill("errado@rhcursos.com.br");
    await page.getByLabel("Senha").fill("senha-incorreta");
    await clickEntrar(page);

    await expect(loginAlert(page)).toBeVisible();
    await expect(loginAlert(page)).toContainText("E-mail ou senha incorretos.");
    // Não navega para o painel quando a autenticação falha.
    await expect(page).toHaveURL(/\/login/);
  });

  test("falha de rede exibe alerta de conexao", async ({ page }) => {
    // Aborta a requisição para simular indisponibilidade de rede.
    await page.route("**/api/auth/session", (route) => route.abort());

    await page.goto("/login");
    await page.getByLabel("E-mail").fill("admin@rhcursos.com.br");
    await page.getByLabel("Senha").fill("alguma-senha");
    await clickEntrar(page);

    await expect(loginAlert(page)).toBeVisible();
    await expect(loginAlert(page)).toContainText("Não foi possível conectar ao servidor.");
  });

  test("alerta desaparece ao digitar novamente", async ({ page }) => {
    await page.goto("/login");
    await clickEntrar(page);
    await expect(loginAlert(page)).toBeVisible();

    await page.getByLabel("E-mail").fill("a");
    await expect(loginAlert(page)).toHaveCount(0);
    await expect(page.getByText("Preencha a senha para continuar.")).toBeVisible();
  });

  test("mostra mensagem de erro apos rate limit (429)", async ({ page }) => {
    // Simula a rota interna retornando 429 (limite de tentativas excedido),
    // sem bater na RPC real do Postgres — evita contaminar contadores de rate
    // limit do banco em execuções de CI.
    await page.route("**/api/auth/session", (route) =>
      route.fulfill({
        status: 429,
        contentType: "application/json",
        body: JSON.stringify({ ok: false, error: "Muitas tentativas. Tente novamente mais tarde." })
      })
    );

    await page.goto("/login");
    await page.getByLabel("E-mail").fill("admin@rhcursos.com.br");
    await page.getByLabel("Senha").fill("qualquer-senha");
    await clickEntrar(page);

    // O cliente trata qualquer `!response.ok` com a mesma mensagem genérica de
    // credenciais — não há tratamento diferenciado para 429 hoje. Este teste
    // documenta o comportamento atual: o alerta aparece e a navegação é bloqueada.
    await expect(loginAlert(page)).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });
});
