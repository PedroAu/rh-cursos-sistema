import { test, expect } from "@playwright/test";
import { E2E_COURSE_SLUG, E2E_COURSE_TITLE } from "./fixtures";

// Dedicated fixture seeded into the isolated Supabase project before this suite.
// NOTE: this specific course's price is "Sob consulta", so its detail-page
// CTA is "Falar com especialista" -> /especialista, NOT a link to
// /inscricao/<slug>. There is therefore no real in-app link from this
// course's detail page to its enrollment page. We navigate to /inscricao
// directly by URL for that last hop and assert that the rest of the
// real link path (home -> catalog -> course detail) works as a user would
// actually click it.
const COURSE_SLUG = E2E_COURSE_SLUG;

test.describe("enrollment flow navigation", () => {
  test("user can reach the course detail page via real links from home", async ({ page }) => {
    await page.goto("/");

    // Real link: home -> catalog
    await page.getByRole("link", { name: "Ver Trilhas de Conhecimento" }).click();
    await expect(page).toHaveURL("/cursos");

    // Real link: catalog -> course detail ("Ver detalhes" card link)
    await page
      .locator(`a[href="/cursos/${COURSE_SLUG}"]`)
      .filter({ hasText: "Ver detalhes" })
      .click();
    await expect(page).toHaveURL(`/cursos/${COURSE_SLUG}`);
    await expect(
      page.getByRole("heading", { level: 1, name: E2E_COURSE_TITLE }),
    ).toBeVisible();
  });

  test("course detail page CTA for this course leads to /especialista, not /inscricao (price is sob consulta)", async ({
    page,
  }) => {
    await page.goto(`/cursos/${COURSE_SLUG}`);

    // Documents real behavior: this course has no direct "Inscreva-se agora"
    // link because its price is consultative. Asserting this honestly
    // instead of assuming every course links to /inscricao.
    await expect(page.getByRole("link", { name: "Falar com especialista" }).first()).toHaveAttribute(
      "href",
      "/especialista",
    );
    await expect(page.getByRole("link", { name: "Inscreva-se agora" })).toHaveCount(0);
  });
});

test.describe("public enrollment form", () => {
  test.beforeEach(async ({ page }) => {
    // No real in-app link reaches this page for this course (see above),
    // so we navigate directly by URL as instructed when the link path
    // doesn't exist.
    await page.goto(`/inscricao/${COURSE_SLUG}`);
  });

  // The page also renders a floating "Enviar e-mail" contact widget whose
  // accessible name overlaps with the form's "E-mail" field, so locators
  // below are scoped to the <form> to avoid strict-mode ambiguity.

  test("renders essential identification fields", async ({ page }) => {
    const form = page.locator("form");
    await expect(form.getByLabel("Nome Completo")).toBeVisible();
    await expect(form.getByLabel("E-mail")).toBeVisible();
    await expect(form.getByLabel("CPF")).toBeVisible();
  });

  test("renders payment method selection with all options", async ({ page }) => {
    const form = page.locator("form");
    await expect(form.getByRole("radio", { name: "Cartão" })).toBeAttached();
    await expect(form.getByRole("radio", { name: "PIX" })).toBeAttached();
    await expect(form.getByRole("radio", { name: "Boleto" })).toBeAttached();
    await expect(form.getByRole("radio", { name: "Empenho" })).toBeAttached();

    // The radio labels render as visible selectable cards even though the
    // native <input> itself is visually hidden (sr-only) for styling.
    // Scoped to the payment fieldset, since "Cartão" also appears as plain
    // text in the review summary section further down the form.
    const paymentGroup = form.getByRole("group");
    await expect(paymentGroup.getByText("Cartão", { exact: true })).toBeVisible();
    await expect(paymentGroup.getByText("PIX", { exact: true })).toBeVisible();
    await expect(paymentGroup.getByText("Boleto", { exact: true })).toBeVisible();
    await expect(paymentGroup.getByText("Empenho", { exact: true })).toBeVisible();
  });

  test("defaults to card payment and shows card number field", async ({ page }) => {
    const form = page.locator("form");
    await expect(form.getByRole("radio", { name: "Cartão" })).toBeChecked();
    await expect(form.getByLabel("Número do Cartão")).toBeVisible();
  });

  test("selecting Empenho hides the card number field", async ({ page }) => {
    const form = page.locator("form");
    await expect(form.getByLabel("Número do Cartão")).toBeVisible();

    // The native radio is visually hidden (sr-only) in favor of a styled
    // label; click the visible label text to select it like a real user.
    await form.getByText("Empenho", { exact: true }).click();

    await expect(form.getByRole("radio", { name: "Empenho" })).toBeChecked();
    await expect(form.getByLabel("Número do Cartão")).toHaveCount(0);
    await expect(form.getByLabel("Observações para empenho")).toBeVisible();
  });

  test("selecting Empenho then Cartão again shows the card number field once more", async ({
    page,
  }) => {
    const form = page.locator("form");
    await form.getByText("Empenho", { exact: true }).click();
    await expect(form.getByLabel("Número do Cartão")).toHaveCount(0);

    await form.getByText("Cartão", { exact: true }).click();

    await expect(form.getByRole("radio", { name: "Cartão" })).toBeChecked();
    await expect(form.getByLabel("Número do Cartão")).toBeVisible();
  });

  test("submit button is present and no submission is triggered (page stays on /inscricao)", async ({
    page,
  }) => {
    // We deliberately do not fill the full form or submit it: a real
    // submit would call the submitEnrollmentAction server action, which
    // hits Supabase/Asaas. We only assert the button exists and the page
    // has not navigated away pre-submit.
    await expect(
      page.getByRole("button", { name: /FINALIZAR INSCRIÇÃO AGORA|FINALIZANDO/i }),
    ).toBeVisible();
    await expect(page).toHaveURL(`/inscricao/${COURSE_SLUG}`);
  });
});
