import { expect, test } from "@playwright/test";
import { E2E_COURSE_SLUG } from "./fixtures";

const COURSE_SLUG = E2E_COURSE_SLUG;

test.describe("Pix/Boleto checkout", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(
      `/pagamento/${COURSE_SLUG}?e2eMockCheckout=1&enrollmentRef=e2e-enr-1&nome=Cliente%20E2E&cpf=12345678900`,
    );
  });

  test("generates boleto instructions without a real payment gateway call", async ({ page }) => {
    await page.getByRole("tab", { name: "Pagar com Boleto" }).click();

    await expect(page.getByTestId("boleto-panel")).toBeVisible();
    await expect(page.getByLabel("Linha digitável do boleto")).toHaveValue(
      "34191.79001 01043.510047 91020.150008 1 00000000000000",
    );
    await expect(page.getByRole("link", { name: "Abrir boleto em PDF" })).toHaveAttribute(
      "href",
      "https://example.com/boleto-e2e.pdf",
    );
  });

  test("generates Pix copy-and-paste instructions without a real payment gateway call", async ({
    page,
  }) => {
    await page.getByRole("tab", { name: "Pagar com Boleto" }).click();
    await page.getByRole("tab", { name: "Pagar com Pix" }).click();

    await expect(page.getByTestId("pix-panel")).toBeVisible();
    await expect(page.getByLabel("Código Pix copia e cola")).toHaveValue(
      "00020126580014BR.GOV.BCB.PIX0136rh-cursos-e2e-mock",
    );
    await expect(page.getByRole("button", { name: "Copiar código Pix" })).toBeVisible();
  });
});
