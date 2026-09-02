import { expect, test } from "@playwright/test";

const route = "/lp/departamento-pessoal-do-zero";
const checkoutPath = "/lp/departamento-pessoal-do-zero/checkout";
const ctaLabel = "Quero me preparar para vagas de DP";

for (const viewport of [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1440, height: 900 },
]) {
  test(`LP Departamento Pessoal do Zero permanece responsiva em ${viewport.name}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    const response = await page.goto(route, { waitUntil: "domcontentloaded" });

    expect(response?.status()).toBeLessThan(400);
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "As vagas pedem experiência. Você pode começar criando prática demonstrável.",
      }),
    ).toBeVisible();

    const ctas = page.getByRole("link", { name: ctaLabel });
    expect(await ctas.count()).toBeGreaterThanOrEqual(3);
    await expect(ctas.first()).toBeVisible();
    await expect(ctas.first()).toHaveAttribute("href", checkoutPath);

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(hasHorizontalOverflow).toBe(false);
  });
}

test("checkout DP Zero solicita apenas dados necessários antes de abrir o Asaas", async ({ page }) => {
  const response = await page.goto(checkoutPath, { waitUntil: "domcontentloaded" });

  expect(response?.status()).toBeLessThan(400);
  await expect(page.getByRole("heading", { name: "Complete seus dados" })).toBeVisible();
  await expect(page.getByLabel("Nome completo")).toBeVisible();
  await expect(page.getByLabel("E-mail")).toBeVisible();
  await expect(page.getByLabel("CPF")).toBeVisible();
  await expect(page.getByLabel("Telefone")).toBeVisible();
  await expect(page.getByText("Pix", { exact: true })).toBeVisible();
  await expect(page.getByText("Cartão à vista", { exact: true })).toBeVisible();
  await expect(page.locator('input[name*="card" i]')).toHaveCount(0);
});
