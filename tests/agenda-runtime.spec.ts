import { expect, test } from "@playwright/test";

test("agenda renders after navigation without tripping the error boundary", async ({ page }) => {
  const runtimeErrors: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      runtimeErrors.push(message.text());
    }
  });

  page.on("pageerror", (error) => {
    runtimeErrors.push(error.stack ?? error.message);
  });

  await page.goto("/");
  await page.getByRole("link", { name: /^Ver agenda de cursos/ }).first().click();

  await expect(page).toHaveURL(/\/agenda/);
  await expect(page.getByRole("heading", { name: /Próximas turmas, em ordem de data/i })).toBeVisible();
  expect(runtimeErrors).toEqual([]);
});
