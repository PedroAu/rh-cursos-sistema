import { NextResponse } from "next/server";

import { logger } from "@/lib/logger";
import { checkRateLimit, clientIp, rateLimitConfigs } from "@/lib/rate-limit";
import { createSupabaseServerClient, isSupabaseServerConfigured } from "@/lib/supabase/server";
import { enrollmentSchema, type EnrollmentInput } from "@/lib/validation";
import { resolveEnrollmentClassIdOrThrow } from "../../../supabase/functions/_shared/enrollment-class-resolution";
import { getEnrollmentErrorMessage } from "../../../supabase/functions/_shared/enrollment-errors";

function toTipoAluno(type: EnrollmentInput["enrollmentType"]): "PF" | "PJ" | "Servidor" {
  if (type === "Empresa") return "PJ";
  if (type === "Órgão público") return "Servidor";
  return "PF";
}

export async function POST(request: Request) {
  if (!isSupabaseServerConfigured) {
    return NextResponse.json({ ok: false, error: "Checkout indisponivel." }, { status: 503 });
  }

  const rate = await checkRateLimit(`enrollment:${clientIp(request)}`, rateLimitConfigs.enrollment);
  if (!rate.allowed) {
    return NextResponse.json(
      { ok: false, error: "Muitas tentativas. Tente novamente mais tarde." },
      {
        status: 429,
        headers: {
          "Retry-After": String(rate.retryAfter),
        },
      }
    );
  }

  const payload = await request.json().catch(() => null);
  if (!payload) {
    return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });
  }

  const parsed = enrollmentSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "Checkout indisponivel." }, { status: 503 });
  }

  const data = parsed.data;
  try {
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

    return NextResponse.json(
      { ok: true, enrollmentId, classId: resolvedClassId },
      {
        status: 201,
        headers: {
          "X-RateLimit-Remaining": String(rate.remaining),
        },
      }
    );
  } catch (error) {
    logger.error("api/enrollments.create error", { err: error, route: "api/enrollments" });
    return NextResponse.json(
      { ok: false, error: getEnrollmentErrorMessage(error) ?? "Erro ao registrar inscrição." },
      { status: 500 }
    );
  }
}
