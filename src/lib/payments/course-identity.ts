import { createAdminClient } from "@/lib/supabase/admin";

export type CourseForPayment = {
  id: string;
  preco: number;
};

export type ResolveCourseForPaymentInput = {
  courseId?: string;
  courseSlug?: string;
};

/**
 * Canonical boundary between the live legacy catalog (`curso`/`turma`) and the
 * payment schema (`courses`/`payments`). Payment creation may receive a public
 * slug or a direct `courses.id`, but it never coerces legacy `curso.id` text
 * values into `payments.course_id`.
 */
export async function resolveCourseForPayment(
  supabase: ReturnType<typeof createAdminClient>,
  input: ResolveCourseForPaymentInput,
): Promise<CourseForPayment> {
  if (input.courseSlug) {
    const result = await supabase
      .from("courses")
      .select("id,preco")
      .eq("slug", input.courseSlug)
      .maybeSingle<CourseForPayment>();

    if (result.error || !result.data) {
      throw new Error(
        `Não foi possível resolver o curso "${input.courseSlug}" para cobrança: nenhuma linha correspondente em courses.`,
      );
    }

    return result.data;
  }

  if (input.courseId) {
    const result = await supabase
      .from("courses")
      .select("id,preco")
      .eq("id", input.courseId)
      .maybeSingle<CourseForPayment>();

    if (!result.error && result.data) {
      return result.data;
    }

    throw new Error(
      "Não foi possível resolver o curso para cobrança: o identificador informado não corresponde a courses.id.",
    );
  }

  throw new Error(
    "Não foi possível identificar o curso para cobrança: forneça um courseSlug válido ou um courses.id válido.",
  );
}
