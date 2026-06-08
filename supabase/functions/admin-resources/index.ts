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
  toDbEnrollmentStatus,
  toDbLeadStatus,
} from "../_shared/admin-mappers.ts";
import {
  blogPostSchema,
  classSchema,
  courseSchema,
  deleteIdSchema,
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
  | { resource: ResourceKey; action: "upsert"; payload: Record<string, unknown> }
  | { resource: ResourceKey; action: "delete"; id: string }
  | { resource: ResourceKey; action: "update-status"; id: string; status: string };

function validateMutation(mutation: AdminMutation): string | null {
  try {
    if (mutation.action === "list") return null;

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

  if (mutation.action === "delete") {
    const tableByResource: Record<string, string> = {
      courses: "curso",
      classes: "turma",
      instructors: "instrutor",
      blog: "post_blog",
    };
    const table = tableByResource[mutation.resource];
    if (!table) return { skipped: true };

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
    const { error } = await supabase.from("turma").upsert(classToUpsert(p));
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
    const { error } = await supabase.from("post_blog").upsert(blogPostToUpsert(p));
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
  const rate = checkRateLimit(`admin:${session.email}:${ip}`, rateLimitConfigs.admin);
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
    const message = error instanceof Error ? error.message : "Erro ao persistir recurso.";
    console.error("admin-resources error:", message);
    return jsonResponse({ ok: false, error: message }, 500, request);
  }
});
