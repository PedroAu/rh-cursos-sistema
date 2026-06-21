"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import {
  createCharge,
  createCustomer,
  getBoletoIdentification,
  getPixQrCode,
} from "@/lib/asaas/client";
import { toAmountCents, toAsaasValue } from "@/lib/asaas/money";
import type { AsaasBillingType } from "@/lib/asaas/types";
import { resolveCourseForPayment, type CourseForPayment } from "@/lib/payments/course-identity";
import {
  assertPaymentStatusTokenConfigured,
  createPaymentStatusToken,
} from "@/lib/payments/status-token";

export type CreatePixOrBoletoChargeInput = {
  // FLAG-A: the live checkout flow only carries a course slug / legacy text
  // id (curso.id), never the real courses.id uuid. Either may be supplied;
  // the action ALWAYS re-resolves the real uuid + preco from `courses` by
  // slug before trusting anything else.
  courseId?: string;
  courseSlug?: string;
  enrollmentRef?: string;
  billingType: "PIX" | "BOLETO";
  // Accepted but NEVER used to derive the charge amount (FR-5 / AC-8 / NFR-5).
  amount?: number;
};

export type CreatePixOrBoletoChargeResult =
  | {
      error: string;
      success: false;
    }
  | {
      error: null;
      success: true;
	      chargeId: string;
	      statusToken: string;
	      status: string;
      billingType: "PIX" | "BOLETO";
      pix?: { qrImage: string; payload: string };
      boleto?: { url: string | null; linhaDigitavel: string };
    };

const DUE_DATE_DAYS_AHEAD = 3;

function buildDueDate() {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + DUE_DATE_DAYS_AHEAD);
  return date.toISOString().slice(0, 10);
}

async function ensureAsaasCustomer(input: {
  name: string;
  cpfCnpj: string;
}) {
  const customer = await createCustomer(input);
  return customer.id;
}

export async function createPixOrBoletoCharge(
  input: CreatePixOrBoletoChargeInput,
  customer: { name: string; cpfCnpj: string },
): Promise<CreatePixOrBoletoChargeResult> {
  if (input.billingType !== "PIX" && input.billingType !== "BOLETO") {
    return { error: "Método de pagamento inválido.", success: false };
  }

  try {
    assertPaymentStatusTokenConfigured();
  } catch {
    return { error: "Configuração de pagamento indisponível.", success: false };
  }

  const supabase = createAdminClient();

  let course: CourseForPayment;
  try {
    course = await resolveCourseForPayment(supabase, {
      courseId: input.courseId,
      courseSlug: input.courseSlug,
    });
  } catch (resolveError) {
    return {
      error:
        resolveError instanceof Error
          ? resolveError.message
          : "Não foi possível identificar o curso para cobrança.",
      success: false,
    };
  }

  // Amount is ALWAYS server-derived from courses.preco — input.amount (if
  // present) is intentionally never read past this point (FR-5 / AC-8).
  const amountCents = toAmountCents(course.preco);
  const value = toAsaasValue(amountCents);

  let asaasCustomerId: string;
  try {
    asaasCustomerId = await ensureAsaasCustomer(customer);
  } catch {
    return { error: "Não foi possível criar o cliente no Asaas.", success: false };
  }

  const billingType: AsaasBillingType = input.billingType;

  let charge;
  try {
    charge = await createCharge({
      customer: asaasCustomerId,
      billingType,
      value,
      dueDate: buildDueDate(),
      externalReference: input.enrollmentRef,
    });
  } catch {
    return { error: "Não foi possível criar a cobrança no Asaas.", success: false };
  }

  const paymentRow: Record<string, unknown> = {
    enrollment_ref: input.enrollmentRef ?? null,
    course_id: course.id,
    amount_cents: amountCents,
    course_preco_snapshot: course.preco,
    asaas_charge_id: charge.id,
    asaas_customer_id: asaasCustomerId,
    billing_type: billingType,
    status: "PENDING",
  };

  let pix: { qrImage: string; payload: string } | undefined;
  let boleto: { url: string | null; linhaDigitavel: string } | undefined;

  try {
    if (billingType === "PIX") {
      const qr = await getPixQrCode(charge.id);
      pix = { qrImage: qr.encodedImage, payload: qr.payload };
      paymentRow.pix_qrcode_image = qr.encodedImage;
      paymentRow.pix_payload = qr.payload;
    } else {
      const identification = await getBoletoIdentification(charge.id);
      boleto = {
        url: charge.bankSlipUrl ?? null,
        linhaDigitavel: identification.identificationField,
      };
      paymentRow.boleto_url = charge.bankSlipUrl ?? null;
      paymentRow.boleto_linha_digitavel = identification.identificationField;
    }
  } catch {
    return {
      error: "Cobrança criada, mas não foi possível obter os dados de pagamento.",
      success: false,
    };
  }

  const insertResult = await supabase.from("payments").insert(paymentRow);

  if (insertResult.error) {
    return {
      error: "Não foi possível registrar a cobrança.",
      success: false,
    };
  }

	  return {
	    error: null,
	    success: true,
	    chargeId: charge.id,
	    statusToken: createPaymentStatusToken(charge.id),
	    status: charge.status,
    billingType,
    pix,
    boleto,
  };
}
