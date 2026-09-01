"use server";

import { z } from "zod";

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

const checkoutInputSchema = z.object({
  courseId: z.string().uuid("Identificador do curso inválido.").optional(),
  courseSlug: z
    .string()
    .trim()
    .min(1, "Curso inválido.")
    .max(120, "Curso inválido.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/i, "Curso inválido.")
    .optional(),
  enrollmentRef: z
    .string()
    .trim()
    .max(120, "Referência da inscrição inválida.")
    .regex(/^[A-Za-z0-9_-]+$/, "Referência da inscrição inválida.")
    .optional(),
  billingType: z.enum(["PIX", "BOLETO"]),
});

const customerSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome completo.").max(120, "Nome muito longo."),
  cpfCnpj: z
    .string()
    .transform((value) => value.replace(/\D/g, ""))
    .refine((value) => value.length === 11 || value.length === 14, "CPF ou CNPJ inválido."),
});

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
  const parsedInput = checkoutInputSchema.safeParse(input);
  const parsedCustomer = customerSchema.safeParse(customer);

  if (!parsedInput.success) return { error: "Dados da cobrança inválidos.", success: false };
  if (!parsedCustomer.success) {
    return { error: parsedCustomer.error.issues[0]?.message ?? "Dados do cliente inválidos.", success: false };
  }

  const safeInput = parsedInput.data;
  const safeCustomer = parsedCustomer.data;

  try {
    assertPaymentStatusTokenConfigured();
  } catch {
    return { error: "Configuração de pagamento indisponível.", success: false };
  }

  const supabase = createAdminClient();

  let course: CourseForPayment;
  try {
    course = await resolveCourseForPayment(supabase, {
      courseId: safeInput.courseId,
      courseSlug: safeInput.courseSlug,
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
    asaasCustomerId = await ensureAsaasCustomer(safeCustomer);
  } catch {
    return { error: "Não foi possível criar o cliente no Asaas.", success: false };
  }

  const billingType: AsaasBillingType = safeInput.billingType;

  let charge;
  try {
    charge = await createCharge({
      customer: asaasCustomerId,
      billingType,
      value,
      dueDate: buildDueDate(),
      externalReference: safeInput.enrollmentRef,
    });
  } catch {
    return { error: "Não foi possível criar a cobrança no Asaas.", success: false };
  }

  const paymentRow: Record<string, unknown> = {
    enrollment_ref: safeInput.enrollmentRef ?? null,
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
