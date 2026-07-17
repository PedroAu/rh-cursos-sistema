import { createHash } from "node:crypto";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { logger } from "@/lib/logger";
import { isLockdownActive, LOCKDOWN_RESPONSE_BODY } from "@/lib/lockdown";
import { buildRateLimitKey, checkRateLimit, clientIp, rateLimitConfigs } from "@/lib/rate-limit";
import {
  createSupabasePublicServerClient,
  createSupabaseServerClient,
  isSupabasePublicServerConfigured,
  isSupabaseServerConfigured,
} from "@/lib/supabase/server";
import {
  createSupabaseSSRClient,
  isSupabaseSsrConfigured,
  readSSRSession,
  type SsrCookieAdapter,
} from "@/lib/supabase/session";
import {
  enrollmentReceiptSchema,
  enrollmentSchema,
  type EnrollmentInput,
} from "@/lib/validation";
import { resolveEnrollmentClassIdOrThrow } from "../../../supabase/functions/_shared/enrollment-class-resolution";
import { getEnrollmentErrorMessage } from "../../../supabase/functions/_shared/enrollment-errors";

// REC-107: corpo máximo aceito antes de qualquer parse, defesa contra payload
// excessivo. O maior payload legítimo (todos os campos no limite de
// enrollmentSchema) fica bem abaixo de 8 KiB.
const MAX_BODY_BYTES = 8 * 1024;

function toTipoAluno(type: EnrollmentInput["enrollmentType"]): "PF" | "PJ" | "Servidor" {
  if (type === "Empresa") return "PJ";
  if (type === "Órgão público") return "Servidor";
  return "PF";
}

// REC-205: adaptador de cookies somente-leitura para a sessão SSR (REC-202).
// A rota de inscrição nunca emite/renova sessão, então `setAll` é no-op — a
// autoridade de sessão SSR continua sendo exclusivamente a rota de auth.
async function getSsrCookieAdapter(): Promise<SsrCookieAdapter> {
  const cookieStore = await cookies();
  return {
    getAll: () => cookieStore.getAll().map((c) => ({ name: c.name, value: c.value })),
    setAll: () => {
      /* somente leitura: esta rota não persiste sessão SSR */
    },
  };
}

// REC-205: lê, de forma best-effort, um identificador estável e não-PII da
// sessão SSR autenticada (REC-202), usado APENAS para tornar a chave de rate
// limit mais específica. Retorna null em qualquer ausência/falha de sessão, o
// que preserva a chave anônima byte-idêntica. NUNCA usado para autorização
// (REC-203 não é consumida aqui) nem altera resposta de requisições anônimas.
async function readRateLimitUserIdentity(): Promise<string | null> {
  if (!isSupabaseSsrConfigured) return null;
  try {
    const supabase = createSupabaseSSRClient(await getSsrCookieAdapter());
    if (!supabase) return null;
    const read = await readSSRSession(supabase);
    if (read.status !== "active" || !read.email) return null;
    // Hash não reversível: mantém a chave mais única sem persistir PII (e-mail)
    // no armazenamento de rate limit.
    return createHash("sha256").update(read.email).digest("hex").slice(0, 16);
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  if (isLockdownActive()) {
    return NextResponse.json(LOCKDOWN_RESPONSE_BODY, { status: 503 });
  }

  if (!isSupabaseServerConfigured || !isSupabasePublicServerConfigured) {
    return NextResponse.json({ ok: false, error: "Pré-inscrição indisponível." }, { status: 503 });
  }

  // REC-205: a chave inclui o usuário autenticado (quando há sessão SSR ativa)
  // apenas para granularidade de bucket. Anônimo => `enrollment:<ip>` (idêntico).
  const userIdentifier = await readRateLimitUserIdentity();
  const rate = await checkRateLimit(
    buildRateLimitKey("enrollment", clientIp(request), userIdentifier),
    rateLimitConfigs.enrollment
  );
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

  // REC-107: body limit — rejeita corpos excessivos antes de qualquer parse.
  // Content-Length pode estar ausente/incorreto (chunked), então o tamanho
  // real do texto lido é sempre validado, não apenas o header.
  const contentLength = request.headers.get("content-length");
  if (contentLength && Number(contentLength) > MAX_BODY_BYTES) {
    return NextResponse.json(
      { ok: false, error: "Corpo da requisição excede o tamanho máximo permitido." },
      { status: 413 }
    );
  }

  const rawBody = await request.text().catch(() => null);
  if (rawBody === null) {
    return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });
  }
  if (new TextEncoder().encode(rawBody).length > MAX_BODY_BYTES) {
    return NextResponse.json(
      { ok: false, error: "Corpo da requisição excede o tamanho máximo permitido." },
      { status: 413 }
    );
  }

  let payload: unknown = null;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    payload = null;
  }
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

  // REC-107: leituras de `turma` usam o cliente público (anon), consistente
  // com REC-104 (least privilege, RLS/grants de REC-103/REC-104 são a
  // barreira real). O cliente privilegiado (`createSupabaseServerClient()`,
  // service_role) fica reservado exclusivamente para a chamada da RPC
  // abaixo, seguindo o mesmo padrão de REC-102 para `leads/index.ts` — a RPC
  // teve `execute` revogado de `anon`/`authenticated` por REC-101 (FND-02) e
  // `service_role` já detém `grant execute on all functions in schema
  // public` desde 20260604164120_content_access_alignment.sql (nenhuma
  // migration nova de grant é necessária).
  const publicSupabase = createSupabasePublicServerClient();
  const adminSupabase = createSupabaseServerClient();
  if (!publicSupabase || !adminSupabase) {
    return NextResponse.json({ ok: false, error: "Pré-inscrição indisponível." }, { status: 503 });
  }

  const data = parsed.data;
  try {
    const { data: directClassRows, error: directClassError } = await publicSupabase
      .from("turma")
      .select("id,curso_id,status,vagas_restantes")
      .eq("id", data.classId)
      .eq("curso_id", data.courseId)
      .limit(1);
    if (directClassError) throw directClassError;

    const directClass = directClassRows?.[0];
    const { data: courseClasses, error: courseClassesError } = await publicSupabase
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

    const { data: enrollmentId, error } = await adminSupabase.rpc("registrar_inscricao_publica", {
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

    return NextResponse.json(
      receipt.data,
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
