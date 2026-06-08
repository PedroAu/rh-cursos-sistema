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

type ResourceKey =
  | "courses"
  | "classes"
  | "students"
  | "leads"
  | "enrollments"
  | "instructors"
  | "blog";

type AdminMutation =
  | { resource: ResourceKey; action: "upsert"; payload: Record<string, unknown> }
  | { resource: ResourceKey; action: "delete"; id: string }
  | { resource: ResourceKey; action: "update-status"; id: string; status: string };

async function applyMutation(mutation: AdminMutation): Promise<{ skipped: boolean }> {
  const supabase = adminClient();

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
  }

  return { skipped: false };
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

  try {
    const result = await applyMutation(mutation);
    return jsonResponse({ ok: true, ...result }, 200, request);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao persistir recurso.";
    console.error("admin-resources error:", message);
    return jsonResponse({ ok: false, error: message }, 500, request);
  }
});
