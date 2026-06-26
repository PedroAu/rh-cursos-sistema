import { expect, test } from "@playwright/test";

test.describe("API docs page", () => {
  test("renderiza a UI navegavel gerada a partir da spec versionada", async ({ page }) => {
    await page.goto("/api-docs.html");

    await expect(page).toHaveTitle("RH Cursos API");
    await expect(page.getByRole("heading", { name: "RH Cursos API" })).toBeVisible();
    await expect(page.getByText("docs/api/openapi.yaml").first()).toBeVisible();
    await expect(page.getByText("/api/auth/session")).toBeVisible();
    await expect(page.getByText("/functions/v1/admin-resources")).toBeVisible();
  });
});
