// Edge Function: enrollments
// Substitui app/api/enrollments/route.ts no deploy estático.
// Valida com Zod e delega a lógica de negócio à RPC registrar_inscricao_publica
// (SECURITY DEFINER — valida turma, vagas e cria aluno + inscrição atomicamente).

import { handleOptions, jsonResponse, isOriginAllowed } from "../_shared/cors.ts";
import { getEnrollmentErrorMessage } from "../_shared/enrollment-errors.ts";
import { resolveEnrollmentClassIdOrThrow } from "../_shared/enrollment-class-resolution.ts";
import { anonClient, adminClient } from "../_shared/supabase.ts";
import { checkRateLimit, clientIp, rateLimitConfigs } from "../_shared/rate-limit.ts";
import { isLockdownActive, LOCKDOWN_RESPONSE_BODY } from "../_shared/lockdown.ts";
import {
  enrollmentReceiptSchema,
  enrollmentSchema,
  type EnrollmentInput,
} from "../_shared/validation.ts";

// REC-107: corpo máximo aceito antes de qualquer parse, defesa contra payload
// excessivo. O maior payload legítimo (todos os campos no limite de
// enrollmentSchema) fica bem abaixo de 8 KiB.
const MAX_BODY_BYTES = 8 * 1024;

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

  if (isLockdownActive()) {
    return jsonResponse(LOCKDOWN_RESPONSE_BODY, 503, request);
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

  // REC-107: body limit — rejeita corpos excessivos antes de qualquer parse.
  // Content-Length pode estar ausente/incorreto (chunked), então o tamanho
  // real do texto lido é sempre validado, não apenas o header.
  const contentLength = request.headers.get("content-length");
  if (contentLength && Number(contentLength) > MAX_BODY_BYTES) {
    return jsonResponse({ ok: false, error: "Corpo da requisição excede o tamanho máximo permitido." }, 413, request);
  }

  const rawBody = await request.text().catch(() => null);
  if (rawBody === null) {
    return jsonResponse({ ok: false, error: "Invalid request body" }, 400, request);
  }
  if (new TextEncoder().encode(rawBody).length > MAX_BODY_BYTES) {
    return jsonResponse({ ok: false, error: "Corpo da requisição excede o tamanho máximo permitido." }, 413, request);
  }

  let payload: unknown = null;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    payload = null;
  }
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

    // REC-107: REC-101 revogou `execute` de `anon`/`authenticated` sobre esta
    // RPC (SEV-0, FND-02). Seguindo o mesmo padrão já aplicado por REC-102 a
    // `leads/index.ts` (endpoint controlado com RPC/insert direto revogado do
    // público), a chamada da RPC usa `adminClient()` (service_role,
    // server-only, já detém `grant execute on all functions in schema public`
    // desde 20260604164120_content_access_alignment.sql — nenhuma migration
    // nova de grant é necessária). As leituras de `turma` acima permanecem em
    // `anonClient()` porque já são publicamente legíveis via RLS/grants de
    // REC-103/REC-104 e não precisam de privilégio elevado (least privilege).
    const { data: enrollmentId, error } = await adminClient().rpc("registrar_inscricao_publica", {
      p_nome_completo: data.studentName,
      p_email: data.email,
      p_cpf: data.cpf,
      p_telefone: data.phone,
      p_cargo: data.jobTitle,
      p_orgao: data.organization,
      p_tipo_aluno: toTipoAluno(data.enrollmentType),
      p_turma_id: resolvedClassId,
      p_tipo_inscricao: data.enrollmentType,
      p_forma_pagamento: null,
      p_observacoes: data.notes,
    });

    if (error) throw error;

    const receipt = enrollmentReceiptSchema.safeParse({
      ok: true,
      enrollmentId,
      classId: resolvedClassId,
    });
    if (!receipt.success) {
      throw new Error("RPC retornou recibo de pré-inscrição inválido.");
    }

    return jsonResponse(receipt.data, 201, request, {
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
