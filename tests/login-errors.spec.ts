import { expect, test } from "@playwright/test";

// Mensagens de erro da página de login (/login).
// O export estático serve o HTML; a validação de campos vazios é client-side
// (não chama a Edge Function), enquanto credenciais inválidas e falhas de rede
// dependem da resposta de `auth-session` — interceptada aqui para isolar a UI.

// O Next.js injeta um <div role="alert" id="__next-route-announcer__"> interno
// que está sempre presente. Excluímos esse nó por id para isolar o alerta do
// formulário de login.
const loginAlert = (page: import("@playwright/test").Page) =>
  page.locator('[role="alert"]:not(#__next-route-announcer__)');

const clickEntrar = (page: import("@playwright/test").Page) =>
  page.getByRole("button", { name: "Entrar", exact: true }).click();

test.describe("mensagens de erro do login", () => {
  test("campos vazios exibem alerta de validacao", async ({ page }) => {
    await page.goto("/login");
    await clickEntrar(page);

    await expect(loginAlert(page)).toBeVisible();
    await expect(loginAlert(page)).toContainText("Preencha e-mail e senha para continuar.");
  });

  test("credenciais invalidas exibem alerta", async ({ page }) => {
    // Força a Edge Function a responder com erro (não-ok).
    await page.route("**/functions/v1/auth-session", (route) =>
      route.fulfill({ status: 401, contentType: "application/json", body: "{}" })
    );

    await page.goto("/login");
    await page.getByPlaceholder("E-mail").fill("errado@rhcursos.com.br");
    await page.getByPlaceholder("Senha").fill("senha-incorreta");
    await clickEntrar(page);

    await expect(loginAlert(page)).toBeVisible();
    await expect(loginAlert(page)).toContainText("E-mail ou senha incorretos.");
    // Não navega para o painel quando a autenticação falha.
    await expect(page).toHaveURL(/\/login/);
  });

  test("falha de rede exibe alerta de conexao", async ({ page }) => {
    // Aborta a requisição para simular indisponibilidade de rede.
    await page.route("**/functions/v1/auth-session", (route) => route.abort());

    await page.goto("/login");
    await page.getByPlaceholder("E-mail").fill("admin@rhcursos.com.br");
    await page.getByPlaceholder("Senha").fill("alguma-senha");
    await clickEntrar(page);

    await expect(loginAlert(page)).toBeVisible();
    await expect(loginAlert(page)).toContainText("Não foi possível conectar ao servidor.");
  });

  test("alerta desaparece ao digitar novamente", async ({ page }) => {
    await page.goto("/login");
    await clickEntrar(page);
    await expect(loginAlert(page)).toBeVisible();

    await page.getByPlaceholder("E-mail").fill("a");
    await expect(loginAlert(page)).toHaveCount(0);
  });
});
