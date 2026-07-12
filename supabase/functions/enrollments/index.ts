// Edge Function: enrollments
// Substitui app/api/enrollments/route.ts no deploy estático.
// Valida com Zod e delega a lógica de negócio à RPC registrar_inscricao_publica
// (SECURITY DEFINER — valida turma, vagas e cria aluno + inscrição atomicamente).

import { handleOptions, jsonResponse, isOriginAllowed } from "../_shared/cors.ts";
import { getEnrollmentErrorMessage } from "../_shared/enrollment-errors.ts";
import { resolveEnrollmentClassIdOrThrow } from "../_shared/enrollment-class-resolution.ts";
import { anonClient } from "../_shared/supabase.ts";
import { checkRateLimit, clientIp, rateLimitConfigs } from "../_shared/rate-limit.ts";
import { enrollmentSchema, type EnrollmentInput } from "../_shared/validation.ts";

function toTipoAluno(type: EnrollmentInput["enrollmentType"]): "PF" | "PJ" | "Servidor" {
  if (type === "Empresa") return "PJ";
  if (type === "Órgão público") return "Servidor";
  return "PF";
}

Deno.serve(async (request) => {
  const preflight = handleOptions(request);
  if (preflight) return preflight;

  if (request.method !== "POST") {
    return jsonResponse({ ok: false, error: "Method not allowed" }, 405, request);
  }

  const origin = request.headers.get("origin");
  if (!isOriginAllowed(origin)) {
    return jsonResponse({ ok: false, error: "Origin not allowed" }, 403, request);
  }

  const ip = clientIp(request);
  const rate = await checkRateLimit(`enrollment:${ip}`, rateLimitConfigs.enrollment);
  if (!rate.allowed) {
    return jsonResponse(
      { ok: false, error: "Muitas tentativas. Tente novamente mais tarde." },
      429,
      request,
      { "Retry-After": rate.retryAfter.toString() }
    );
  }

  const payload = await request.json().catch(() => null);
  if (!payload) {
    return jsonResponse({ ok: false, error: "Invalid request body" }, 400, request);
  }

  const parsed = enrollmentSchema.safeParse(payload);
  if (!parsed.success) {
    return jsonResponse(
      { ok: false, error: "Validation failed", details: parsed.error.flatten() },
      400,
      request
    );
  }

  const data = parsed.data;

  try {
    const supabase = anonClient();
    const { data: directClassRows, error: directClassError } = await supabase
      .from("turma")
      .select("id,curso_id,status,vagas_restantes")
      .eq("id", data.classId)
      .eq("curso_id", data.courseId)
      .limit(1);
    if (directClassError) throw directClassError;

    const directClass = directClassRows?.[0];
    const { data: courseClasses, error: courseClassesError } = await supabase
      .from("turma")
      .select("id,status")
      .eq("curso_id", data.courseId)
      .in("status", ["Aberta", "PoucasVagas"])
      .gt("vagas_restantes", 0)
      .order("data_inicio")
      .limit(10);
    if (courseClassesError) throw courseClassesError;

    const resolvedClassId = resolveEnrollmentClassIdOrThrow({
      directClass:
        directClass && directClass.vagas_restantes > 0
          ? directClass
          : directClass
            ? { id: directClass.id, status: "Encerrada" }
            : null,
      courseClasses: courseClasses ?? [],
    });

    const { data: enrollmentId, error } = await supabase.rpc("registrar_inscricao_publica", {
      p_nome_completo: data.studentName,
      p_email: data.email,
      p_cpf: data.cpf,
      p_telefone: data.phone,
      p_cargo: data.jobTitle,
      p_orgao: data.organization,
      p_tipo_aluno: toTipoAluno(data.enrollmentType),
      p_turma_id: resolvedClassId,
      p_tipo_inscricao: data.enrollmentType,
      p_forma_pagamento: data.paymentMethod === "Cartão" ? "Cartao" : data.paymentMethod,
      p_observacoes: data.notes,
    });

    if (error) throw error;

    return jsonResponse({ ok: true, enrollmentId, classId: resolvedClassId }, 201, request, {
      "X-RateLimit-Remaining": rate.remaining.toString(),
    });
  } catch (error) {
    console.error("enrollments.create error:", error instanceof Error ? error.message : error);
    return jsonResponse(
      { ok: false, error: getEnrollmentErrorMessage(error) ?? "Erro ao registrar inscrição." },
      500,
      request
    );
  }
});
