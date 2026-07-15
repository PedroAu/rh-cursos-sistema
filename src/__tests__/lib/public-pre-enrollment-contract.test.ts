import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

describe("REC-301 public pre-enrollment contract", () => {
  const checkout = source("src/views/public/CourseCheckout.tsx");
  const checkoutRoute = source("app/cursos/[slug]/checkout/page.tsx");
  const courseDetail = source("src/views/public/CourseDetail.tsx");
  const publicFaq = source("src/components/common/faq-accordion.tsx");
  const success = source("src/views/public/EnrollmentSuccess.tsx");
  const browserValidation = source("src/lib/validation.ts");
  const edgeValidation = source("supabase/functions/_shared/validation.ts");
  const routeHandler = source("app/api/enrollments/route.ts");
  const edgeHandler = source("supabase/functions/enrollments/index.ts");
  const legacyClient = source("src/lib/supabase/rh-cursos-api.ts");
  const appStore = source("src/lib/app-store.tsx");

  it("does not collect or simulate financial data in the public journey", () => {
    for (const forbidden of [
      "cardName",
      "cardNumber",
      "cardExpiry",
      "cardCvv",
      "installments",
      "couponCode",
      "VALID_COUPON",
      "Forma de pagamento",
      "Finalizar compra",
      "Compra 100% segura",
      "Continuar para pagamento",
      "código de pagamento",
    ]) {
      expect(checkout, forbidden).not.toContain(forbidden);
    }

    expect(checkout).toContain("Pré-inscrição");
    expect(checkout).toContain("valor de referência");
  });

  it("removes checkout and simulated-payment claims from public entry points", () => {
    expect(checkoutRoute).toContain('title: `Pré-inscrição • ${course.title} | RH Cursos`');
    expect(checkoutRoute).not.toContain('title: `Checkout •');
    expect(courseDetail).not.toContain("conclua o checkout guiado");
    expect(courseDetail).not.toContain("até 6x sem juros");
    expect(courseDetail).not.toContain("Garantia de satisfação.");
    expect(publicFaq).not.toContain("checkout simulado");
    expect(publicFaq).not.toContain("Pix, cartão, boleto");
  });

  it("uses strict public schemas without payment fields", () => {
    for (const validation of [browserValidation, edgeValidation]) {
      const enrollmentSchema = validation.slice(
        validation.indexOf("export const enrollmentSchema"),
        validation.indexOf("export type EnrollmentInput"),
      );

      expect(enrollmentSchema).not.toContain("paymentMethod");
      expect(enrollmentSchema).toContain(".strict()");
    }
  });

  it("persists public requests without a selected payment method", () => {
    expect(routeHandler).toContain("p_forma_pagamento: null");
    expect(edgeHandler).toContain("p_forma_pagamento: null");
    expect(legacyClient).toContain("p_forma_pagamento: null");
    expect(routeHandler).not.toContain("data.paymentMethod");
    expect(edgeHandler).not.toContain("data.paymentMethod");
    expect(legacyClient).not.toContain("payload.paymentMethod");
  });

  it("requires a canonical receipt instead of inventing local success", () => {
    const publicCreate = appStore.slice(
      appStore.indexOf("const createEnrollment ="),
      appStore.indexOf("const createStudent ="),
    );

    expect(publicCreate).toContain("enrollmentId");
    expect(publicCreate).toContain("status: \"Pendente\"");
    expect(publicCreate).not.toContain("enrollment-${Date.now()}");
    expect(publicCreate).not.toContain("apenas nesta sessão de desenvolvimento");
    expect(publicCreate).not.toContain("status: \"Confirmada\"");
  });

  it("keeps PII out of the success URL and fails closed without a receipt", () => {
    expect(checkout).not.toContain("studentName: buyerName");
    expect(checkout).not.toContain("paymentMethod: form.paymentMethod");
    expect(success).not.toContain('params.get("studentName")');
    expect(success).not.toContain('params.get("paymentMethod")');
    expect(success).not.toContain("enrollments[0]");
    expect(success).toContain("enrollmentId");
    expect(success).toContain("Nenhuma pré-inscrição recente");
  });
});
