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
      status: string;
      billingType: "PIX" | "BOLETO";
      pix?: { qrImage: string; payload: string };
      boleto?: { url: string | null; linhaDigitavel: string };
    };

type CourseRow = {
  id: string;
  preco: number;
};

const DUE_DATE_DAYS_AHEAD = 3;

function buildDueDate() {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + DUE_DATE_DAYS_AHEAD);
  return date.toISOString().slice(0, 10);
}

/**
 * FLAG-A: resolves the live checkout course identity (slug, or a legacy
 * text id) to a real `courses.id` uuid + `courses.preco`. The live public
 * flow (`src/lib/public-data.ts`, `src/app/actions/public.ts`) reads the
 * legacy `curso`/`turma` tables and never the uuid `courses` table that
 * `payments.course_id` requires. We therefore NEVER trust a client-supplied
 * id as the uuid — we always look it up by slug. If no slug is given, or no
 * matching `courses` row exists, we fail loudly rather than invent a price.
 */
async function resolveCourseForCharge(
  supabase: ReturnType<typeof createAdminClient>,
  input: { courseId?: string; courseSlug?: string },
): Promise<CourseRow> {
  if (input.courseSlug) {
    const result = await supabase
      .from("courses")
      .select("id,preco")
      .eq("slug", input.courseSlug)
      .maybeSingle<CourseRow>();

    if (result.error || !result.data) {
      throw new Error(
        `Não foi possível resolver o curso "${input.courseSlug}" para cobrança: nenhuma linha correspondente em courses.`,
      );
    }

    return result.data;
  }

  // If callers pass a raw id, only accept it when it is ALSO a real
  // courses.id uuid (never assume a legacy curso.id text value is usable).
  if (input.courseId) {
    const result = await supabase
      .from("courses")
      .select("id,preco")
      .eq("id", input.courseId)
      .maybeSingle<CourseRow>();

    if (!result.error && result.data) {
      return result.data;
    }
  }

  throw new Error(
    "Não foi possível identificar o curso para cobrança: forneça um courseSlug válido (FLAG-A).",
  );
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

  const supabase = createAdminClient();

  let course: CourseRow;
  try {
    course = await resolveCourseForCharge(supabase, {
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
    status: charge.status,
    billingType,
    pix,
    boleto,
  };
}
