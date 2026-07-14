import { expect, test } from "@playwright/test";
import { attachRuntimeErrorProbe } from "@tests/helpers/runtime-errors";

test("agenda renders after navigation without tripping the error boundary", async ({ page }) => {
  const runtimeErrors = attachRuntimeErrorProbe(page);

  await page.goto("/");
  const agendaLink = page.getByRole("link", { name: /^Ver agenda de cursos/ }).first();
  await expect(agendaLink).toBeVisible();
  await agendaLink.scrollIntoViewIfNeeded();
  await agendaLink.click({ force: true });

  await expect(page).toHaveURL(/\/agenda/);
  await expect(page.getByRole("heading", { name: /Próximas turmas, em ordem de data/i })).toBeVisible();
  expect(runtimeErrors).toEqual([]);
});
