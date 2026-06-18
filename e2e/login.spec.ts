import { test, expect } from "@playwright/test";

// Scope: only what does NOT require a real Supabase user. Authenticated
// redirect-by-role behavior and /admin screens are out of scope here.

test.describe("login page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("renders email and password fields and the submit button", async ({ page }) => {
    await expect(page.getByLabel("E-mail Corporativo")).toBeVisible();
    await expect(page.getByLabel("Senha")).toBeVisible();
    await expect(page.getByRole("button", { name: "Entrar na Plataforma" })).toBeVisible();
  });

  test("submitting with empty required fields does not navigate away from /login", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Entrar na Plataforma" }).click();

    // Native HTML "required" validation on email/password should block
    // submission client-side, so the page must still be on /login.
    await expect(page).toHaveURL("/login");
    await expect(page.getByLabel("E-mail Corporativo")).toBeVisible();
  });

  test("email field is marked as a required, invalid-state-checkable HTML input", async ({
    page,
  }) => {
    const emailInput = page.getByLabel("E-mail Corporativo");
    await expect(emailInput).toHaveAttribute("required", "");
    await expect(emailInput).toHaveAttribute("type", "email");
  });
});
