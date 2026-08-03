import { expect, test } from "@playwright/test";

import {
  assertSafeWritableIntegrationEnv,
  createUniqueIp,
  createServiceRoleClient,
  createUniqueEmail,
  ensureAuthUser,
  hasRealIntegrationEnv,
} from "./helpers/integration-env";

test.describe("recuperação de senha — jornada real", () => {
  test("converte o link do Supabase, atualiza a senha e permite novo login", async ({ page, baseURL }) => {
    test.setTimeout(60_000);
    test.skip(!hasRealIntegrationEnv(), "Recuperação E2E requer ambiente Supabase real.");
    assertSafeWritableIntegrationEnv();
    const appUrl = baseURL ?? "http://127.0.0.1:3100";
    const email = createUniqueEmail("password-recovery");
    const initialPassword = "SenhaInicial#2026";
    const updatedPassword = "SenhaRecuperada#2026";
    const serviceClient = createServiceRoleClient();
    const credentials = await ensureAuthUser({
      email,
      name: "E2E Password Recovery",
      password: initialPassword,
      role: "admin",
    });
    const user = await serviceClient.auth.admin.listUsers({ page: 1, perPage: 200 });
    const createdUser = user.data.users.find((item) => item.email === email);
    if (!createdUser) throw new Error("Usuário E2E de recuperação não foi encontrado.");

    try {
      // O servidor de teste executa toda a suíte em um único host. Isolar este
      // cenário do bucket de rate limit de autenticação evita que tentativas de
      // outros fluxos de UI afetem a confirmação da nova senha.
      await page.setExtraHTTPHeaders({
        "x-forwarded-for": createUniqueIp("password-recovery-login"),
      });

      const generated = await serviceClient.auth.admin.generateLink({
        type: "recovery",
        email: credentials.email,
        options: { redirectTo: new URL("/auth/confirm", appUrl).toString() },
      });
      if (generated.error || !generated.data.properties?.action_link) {
        throw new Error(`Não foi possível gerar o link: ${generated.error?.message ?? "erro desconhecido"}`);
      }

      await page.goto(generated.data.properties.action_link, { waitUntil: "domcontentloaded" });
      const hash = new URL(page.url()).hash;
      expect(hash).toContain("access_token=");
      await page.goto(`${appUrl}/auth/confirm${hash}`, { waitUntil: "domcontentloaded" });
      await page.waitForURL("**/recuperar-senha?mode=update");

      await page.getByLabel(/Nova senha/).fill(updatedPassword);
      await page.getByLabel(/Confirme a nova senha/).fill(updatedPassword);
      await page.getByRole("button", { name: /Atualizar senha/i }).click();
      await page.waitForURL("**/login?status=password-updated");

      await page.getByLabel(/E-mail/).fill(email);
      await page.getByLabel(/Senha/).fill(updatedPassword);
      const loginResponse = page.waitForResponse(
        (response) =>
          new URL(response.url()).pathname === "/api/auth/session" &&
          response.request().method() === "POST"
      );
      await page.getByRole("button", { name: "Entrar" }).click();
      expect((await loginResponse).ok()).toBe(true);
      await page.waitForURL("**/admin");
      await expect(page).toHaveURL(/\/admin$/);
    } finally {
      await serviceClient.auth.admin.deleteUser(createdUser.id);
    }
  });
});
