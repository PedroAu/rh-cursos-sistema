import { expect, test } from "@playwright/test";

import {
  assertSafeWritableIntegrationEnv,
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
    for (let attempt = 0; attempt < 3 && !page.url().endsWith("/admin"); attempt += 1) {
      if (attempt > 0) await page.waitForTimeout(1500);
      await page.getByRole("button", { name: "Entrar" }).click();
      try {
        await page.waitForURL("**/admin", { timeout: 5000 });
      } catch {
        // Supabase may take a moment to make the just-updated password available.
      }
    }
    await expect(page).toHaveURL(/\/admin$/);
    } finally {
      await serviceClient.auth.admin.deleteUser(createdUser.id);
    }
  });
});
