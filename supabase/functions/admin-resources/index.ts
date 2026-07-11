// Edge Function: admin-resources
// Substitui app/api/admin/resources/route.ts no deploy estático.
// Exige sessão admin válida (token HMAC via header x-rh-session) e executa
// mutações com service-role (ignora RLS). Soft-delete via deleted_at.

import { handleOptions, jsonResponse, isOriginAllowed } from "../_shared/cors.ts";
import { adminClient } from "../_shared/supabase.ts";
import { requireAdmin } from "../_shared/auth.ts";
import { checkRateLimit, clientIp, rateLimitConfigs } from "../_shared/rate-limit.ts";
import {
  blogPostToUpsert,
  classToUpsert,
  courseToUpsert,
  instructorToUpsert,
  toDbPaymentMethod,
  toDbStudentType,
  toDbEnrollmentStatus,
  toDbLeadStatus,
} from "../_shared/admin-mappers.ts";
import {
  blogPostSchema,
  classSchema,
  courseSchema,
  deleteIdSchema,
  enrollmentCreateSchema,
  enrollmentStatusSchema,
  instructorSchema,
  leadSchema,
  leadStatusUpdateSchema,
  studentSchema,
} from "../_shared/admin-validation.ts";

type ResourceKey =
  | "courses"
  | "classes"
  | "students"
  | "leads"
  | "enrollments"
  | "instructors"
  | "blog";

type AdminMutation =
  | { resource: ResourceKey; action: "list" }
  | { resource: ResourceKey; action: "create"; payload: Record<string, unknown> }
  | { resource: ResourceKey; action: "upsert"; payload: Record<string, unknown> }
  | { resource: ResourceKey; action: "delete"; id: string }
  | { resource: ResourceKey; action: "update-status"; id: string; status: string };

async function resolveCourseId(supabase: ReturnType<typeof adminClient>, courseReference: string) {
  const reference = courseReference.trim();
  const normalizedReference = reference
    .replace(/^course-/, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  const referenceTokens = normalizedReference.split(/\s+/).filter(Boolean);

  const { data, error } = await supabase
    .from("curso")
    .select("id,slug,titulo");

  if (error) throw error;

  const resolved = data?.find((row) => {
    const haystack = `${row.slug ?? ""} ${row.titulo ?? ""}`
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ");

    if (referenceTokens.length === 0) {
      return row.id === reference;
    }

    return referenceTokens.every((token) => haystack.includes(token));
  });

  return resolved?.id as string | undefined;
}

async function resolveCourseIdOrThrow(
  supabase: ReturnType<typeof adminClient>,
  courseReference: string
) {
  const resolved = await resolveCourseId(supabase, courseReference);
  if (!resolved) {
    throw new Error("Curso não encontrado.");
  }

  return resolved;
}

async function resolveEnrollmentClassId(
  supabase: ReturnType<typeof adminClient>,
  classReference: string,
  courseReference: string,
  organization?: string | null
) {
  const { data: directClassRows, error: directClassError } = await supabase
    .from("turma")
    .select("id,curso_id,status")
    .eq("id", classReference)
    .limit(1);
  if (directClassError) throw directClassError;

  const directClass = directClassRows?.[0];
  if (directClass?.id && directClass.status !== "Encerrada") {
    return directClass.id as string;
  }

  const resolvedCourseId = await resolveCourseIdOrThrow(supabase, courseReference);
  const { data: courseClasses, error: courseClassesError } = await supabase
    .from("turma")
    .select("id,status")
    .eq("curso_id", resolvedCourseId)
    .in("status", ["Aberta", "PoucasVagas"])
    .order("data_inicio")
    .limit(1);
  if (courseClassesError) throw courseClassesError;

  const existingClassId = courseClasses?.[0]?.id as string | undefined;
  if (existingClassId) {
    return existingClassId;
  }

  const { data: placeholderClass, error: placeholderError } = await supabase
    .from("turma")
    .insert({
      curso_id: resolvedCourseId,
      instrutor_id: null,
      data_inicio: new Date().toISOString().slice(0, 10),
      data_fim: new Date().toISOString().slice(0, 10),
      horario: "09:00 - 18:00",
      local: organization ?? null,
      vagas_total: 30,
      vagas_preenchidas: 0,
      preco_turma: 0,
      modalidade: "Online",
      status: "Aberta",
      observacoes: null,
    })
    .select("id")
    .single();
  if (placeholderError) throw placeholderError;

  return placeholderClass.id as string;
}

async function resolveInstructorId(
  supabase: ReturnType<typeof adminClient>,
  instructorReference: string
) {
  const reference = instructorReference.trim();
  const normalizedReference = reference
    .replace(/^instructor-/, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  const referenceTokens = normalizedReference.split(/\s+/).filter(Boolean);

  const { data, error } = await supabase.from("instrutor").select("id,nome");
  if (error) throw error;

  const resolved = data?.find((row) => {
    const haystack = `${row.nome ?? ""}`
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ");

    if (referenceTokens.length === 0) {
      return row.id === reference;
    }

    return referenceTokens.every((token) => haystack.includes(token));
  });

  return resolved?.id as string | undefined;
}

function validateMutation(mutation: AdminMutation): string | null {
  try {
    if (mutation.action === "list") return null;

    if (mutation.action === "create") {
      if (mutation.resource === "students") studentSchema.parse(mutation.payload);
      else if (mutation.resource === "enrollments") enrollmentCreateSchema.parse(mutation.payload);
      else if (mutation.resource === "leads") leadSchema.parse(mutation.payload);
      else throw new Error("create action not supported for resource");
      return null;
    }

    if (mutation.action === "delete") {
      deleteIdSchema.parse({ id: mutation.id });
      return null;
    }

    if (mutation.action === "update-status") {
      if (mutation.resource === "leads") leadStatusUpdateSchema.parse({ status: mutation.status });
      if (mutation.resource === "enrollments") enrollmentStatusSchema.parse({ status: mutation.status });
      return null;
    }

    const p = mutation.payload;
    if (mutation.resource === "courses") courseSchema.parse(p);
    else if (mutation.resource === "classes") classSchema.parse(p);
    else if (mutation.resource === "students") studentSchema.parse(p);
    else if (mutation.resource === "leads") leadSchema.parse(p);
    else if (mutation.resource === "enrollments") enrollmentStatusSchema.parse(p);
    else if (mutation.resource === "instructors") instructorSchema.parse(p);
    else if (mutation.resource === "blog") blogPostSchema.parse(p);

    return null;
  } catch (err) {
    if (err && typeof err === "object" && "errors" in err) {
      const issues = (err as { errors: Array<{ message: string }> }).errors;
      return issues.map((i) => i.message).join("; ");
    }
    return "Payload inválido.";
  }
}

async function applyMutation(mutation: AdminMutation): Promise<{ skipped: boolean; data?: unknown }> {
  const supabase = adminClient();

  if (mutation.action === "list") {
    if (mutation.resource === "leads") {
      const { data, error } = await supabase
        .from("lead")
        .select("*")
        .is("deleted_at", null)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return { skipped: false, data };
    }
    return { skipped: true };
  }

  if (mutation.action === "create") {
    if (mutation.resource === "students") {
      const payload = mutation.payload as Record<string, any>;
      const email = String(payload.email ?? "").trim();
      const { data: existingRows, error: lookupError } = await supabase
        .from("aluno")
        .select("id")
        .ilike("email", email)
        .is("deleted_at", null)
        .limit(1);

      if (lookupError) throw lookupError;

      const existingId = existingRows?.[0]?.id as string | undefined;
      const row = {
        nome_completo: payload.name,
        email: payload.email,
        cpf: payload.cpf ?? null,
        telefone: payload.phone ?? null,
        cargo: payload.jobTitle ?? null,
        orgao: payload.organization ?? null,
        tipo_aluno: payload.enrollmentType === "Empresa" ? "PJ" : payload.enrollmentType === "Órgão público" ? "Servidor" : "PF",
      };

      if (existingId) {
        const { error } = await supabase.from("aluno").update(row).eq("id", existingId);
        if (error) throw error;
        return { skipped: false, data: { id: existingId } };
      }

      const { data, error } = await supabase.from("aluno").insert(row).select("id").single();
      if (error) throw error;
      return { skipped: false, data };
    }

    if (mutation.resource === "enrollments") {
      const payload = mutation.payload as Record<string, any>;
      const resolvedClassId = await resolveEnrollmentClassId(
        supabase,
        String(payload.classId ?? ""),
        String(payload.courseId ?? ""),
        typeof payload.organization === "string" ? payload.organization : null
      );
      const { data: enrollmentId, error } = await supabase.rpc("registrar_inscricao_publica", {
        p_nome_completo: payload.studentName,
        p_email: payload.email,
        p_cpf: payload.cpf,
        p_telefone: payload.phone,
        p_cargo: payload.jobTitle,
        p_orgao: payload.organization,
        p_tipo_aluno: toDbStudentType(payload.enrollmentType ?? "Pessoa física"),
        p_turma_id: resolvedClassId,
        p_tipo_inscricao: payload.enrollmentType ?? "Pessoa física",
        p_forma_pagamento: toDbPaymentMethod(payload.paymentMethod ?? "Pix"),
        p_observacoes: payload.notes ?? "",
      });
      if (error) throw error;
      return { skipped: false, data: { id: enrollmentId } };
    }

    if (mutation.resource === "leads") {
      const payload = mutation.payload as Record<string, any>;
      const { data, error } = await supabase.from("lead").insert({
        nome: payload.name,
        email: payload.email,
        telefone: payload.phone,
        tipo:
          payload.type === "Consultoria"
            ? "Mentoria"
            : payload.type === "Orçamento"
              ? "Orcamento"
              : payload.type,
        orgao: payload.organization,
        num_participantes: payload.teamSize,
        tema_interesse: payload.courseInterest,
        curso_id: payload.courseId ?? null,
        origem: payload.origin,
        modalidade_preferida: payload.preferredModality,
        objetivo_treinamento: payload.trainingObjective,
        tema_treinamento: payload.trainingTheme,
        desafios_principais: payload.mainChallenges,
        mensagem: payload.message,
        status_crm: "Novo",
      }).select("id,created_at,status_crm").single();
      if (error) throw error;
      return { skipped: false, data };
    }
  }

  if (mutation.action === "delete") {
    const tableByResource: Record<string, string> = {
      courses: "curso",
      classes: "turma",
      students: "aluno",
      instructors: "instrutor",
      blog: "post_blog",
    };
    if (mutation.resource === "leads") {
      const { error } = await supabase.from("lead").delete().eq("id", mutation.id);
      if (error) throw error;
      return { skipped: false };
    }

    if (mutation.resource === "enrollments") {
      const { data: enrollmentRows, error: enrollmentLookupError } = await supabase
        .from("inscricao")
        .select("id,turma_id,status_inscricao")
        .eq("id", mutation.id)
        .limit(1);
      if (enrollmentLookupError) throw enrollmentLookupError;
      const enrollment = enrollmentRows?.[0];
      if (!enrollment) return { skipped: false };

      const occupiesSeat =
        enrollment.status_inscricao === "Confirmada" ||
        enrollment.status_inscricao === "AguardandoPagamento" ||
        enrollment.status_inscricao === "Concluida";
      const countsAsStudent =
        enrollment.status_inscricao === "Confirmada" || enrollment.status_inscricao === "Concluida";

      if (occupiesSeat) {
        const { data: classRows, error: classLookupError } = await supabase
          .from("turma")
          .select("id,curso_id,vagas_preenchidas")
          .eq("id", enrollment.turma_id)
          .limit(1);
        if (classLookupError) throw classLookupError;
        const selectedClass = classRows?.[0];
        if (selectedClass) {
          const { error: classUpdateError } = await supabase
            .from("turma")
            .update({ vagas_preenchidas: Math.max(0, selectedClass.vagas_preenchidas - 1) })
            .eq("id", selectedClass.id);
          if (classUpdateError) throw classUpdateError;

          if (countsAsStudent) {
            const { data: courseRows, error: courseLookupError } = await supabase
              .from("curso")
              .select("id,total_alunos")
              .eq("id", selectedClass.curso_id)
              .limit(1);
            if (courseLookupError) throw courseLookupError;
            const currentTotal = courseRows?.[0]?.total_alunos ?? 0;
            const { error: courseUpdateError } = await supabase
              .from("curso")
              .update({ total_alunos: Math.max(0, currentTotal - 1) })
              .eq("id", selectedClass.curso_id);
            if (courseUpdateError) throw courseUpdateError;
          }
        }
      }

      const { error: deleteError } = await supabase.from("inscricao").delete().eq("id", mutation.id);
      if (deleteError) throw deleteError;
      return { skipped: false };
    }

    const table = tableByResource[mutation.resource];
    if (!table) return { skipped: true };

    if (mutation.resource === "students") {
      const { error } = await supabase
        .from(table)
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", mutation.id);
      if (error) throw error;
      return { skipped: false };
    }

    const { error } = await supabase
      .from(table)
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", mutation.id);
    if (error) throw error;
    return { skipped: false };
  }

  if (mutation.action === "update-status") {
    if (mutation.resource === "leads") {
      const { error } = await supabase
        .from("lead")
        .update({ status_crm: toDbLeadStatus(mutation.status) })
        .eq("id", mutation.id);
      if (error) throw error;
    }
    if (mutation.resource === "enrollments") {
      const { error } = await supabase
        .from("inscricao")
        .update({ status_inscricao: toDbEnrollmentStatus(mutation.status) })
        .eq("id", mutation.id);
      if (error) throw error;
    }
    return { skipped: false };
  }

  // upsert
  const p = mutation.payload;
  if (mutation.resource === "courses") {
    const { error } = await supabase.from("curso").upsert(courseToUpsert(p));
    if (error) throw error;
  } else if (mutation.resource === "classes") {
    const resolvedCourseId = await resolveCourseIdOrThrow(supabase, String(p.courseId ?? ""));
    const resolvedInstructorId = p.instructorId
      ? await resolveInstructorId(supabase, String(p.instructorId ?? ""))
      : undefined;
    const { error } = await supabase.from("turma").upsert(
      classToUpsert({
        ...p,
        courseId: resolvedCourseId,
        instructorId: resolvedInstructorId ?? null,
      })
    );
    if (error) throw error;
  } else if (mutation.resource === "students") {
    const { error } = await supabase
      .from("aluno")
      .update({
        nome_completo: p.name,
        email: p.email,
        orgao: p.organization,
      })
      .eq("id", (p.id as string) ?? "");
    if (error) throw error;
  } else if (mutation.resource === "instructors") {
    const { error } = await supabase.from("instrutor").upsert(instructorToUpsert(p));
    if (error) throw error;
  } else if (mutation.resource === "blog") {
    const relatedCourseId = p.relatedCourseId
      ? await resolveCourseId(supabase, String(p.relatedCourseId))
      : undefined;
    const { error } = await supabase.from("post_blog").upsert(
      blogPostToUpsert({
        ...p,
        relatedCourseId: relatedCourseId ?? null,
      })
    );
    if (error) throw error;
  } else if (mutation.resource === "leads") {
    const update: Record<string, unknown> = {
      nome: p.name,
      email: p.email,
      telefone: p.phone,
      orgao: p.organization,
      num_participantes: p.teamSize,
      tema_interesse: p.courseInterest,
      origem: p.origin,
      modalidade_preferida: p.preferredModality,
      objetivo_treinamento: p.trainingObjective,
      desafios_principais: p.mainChallenges,
    };
    if (typeof p.status === "string") {
      update.status_crm = toDbLeadStatus(p.status);
    }
    const { error } = await supabase
      .from("lead")
      .update(update)
      .eq("id", (p.id as string) ?? "");
    if (error) throw error;
  }

  return { skipped: false };
}

const SENSITIVE_FIELDS = new Set(["cpf", "password", "token", "secret"]);

function sanitizePayloadForAudit(
  payload: Record<string, unknown>
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(payload).filter(([key]) => !SENSITIVE_FIELDS.has(key.toLowerCase()))
  );
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

  const session = await requireAdmin(request);
  if (!session) {
    return jsonResponse({ ok: false, error: "Não autorizado." }, 401, request);
  }

  const ip = clientIp(request);
  const rate = await checkRateLimit(`admin:${session.email}:${ip}`, rateLimitConfigs.admin);
  if (!rate.allowed) {
    return jsonResponse(
      { ok: false, error: "Muitas requisições. Aguarde um momento." },
      429,
      request,
      { "Retry-After": rate.retryAfter.toString() }
    );
  }

  const mutation = (await request.json().catch(() => null)) as AdminMutation | null;
  if (!mutation?.resource || !mutation?.action) {
    return jsonResponse({ ok: false, error: "Mutação inválida." }, 400, request);
  }

  const validationError = validateMutation(mutation);
  if (validationError) {
    return jsonResponse({ ok: false, error: validationError }, 422, request);
  }

  try {
    const result = await applyMutation(mutation);

    // Audit log assíncrono — não bloqueia a resposta nem falha a requisição
    const resourceId =
      mutation.action === "delete" || mutation.action === "update-status"
        ? mutation.id
        : (mutation.payload as Record<string, unknown>)?.id as string | undefined;

    const safePayload =
      mutation.action === "upsert"
        ? sanitizePayloadForAudit(mutation.payload as Record<string, unknown>)
        : null;

    adminClient()
      .from("admin_audit_log")
      .insert({
        admin_email: session.email,
        action: mutation.action,
        resource: mutation.resource,
        resource_id: resourceId ?? null,
        payload: safePayload,
      })
      .then(({ error }) => {
        if (error) console.warn("audit log insert failed:", error.message);
      });

    return jsonResponse({ ok: true, ...result }, 200, request);
  } catch (error) {
    const message = error instanceof Error
      ? error.message
      : (error && typeof error === "object" && "message" in error && typeof error.message === "string")
        ? error.message
        : "Erro ao persistir recurso.";
    console.error("admin-resources error:", message);
    return jsonResponse({ ok: false, error: message }, 500, request);
  }
});
