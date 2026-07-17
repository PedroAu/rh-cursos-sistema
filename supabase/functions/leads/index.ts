// Edge Function: leads
// Substitui app/api/leads/route.ts no deploy estático.
// Cria um lead no Supabase. Persistência via adminClient() (service-role, server-only):
// insert direto por anon/authenticated foi revogado (REC-102), este endpoint é o único
// caminho de escrita, com validação, rate limit e checagem de origem já aplicados abaixo.

import { handleOptions, jsonResponse, isOriginAllowed } from "../_shared/cors.ts";
import { adminClient } from "../_shared/supabase.ts";
import { checkRateLimit, clientIp, rateLimitConfigs } from "../_shared/rate-limit.ts";
import { isLockdownActive, LOCKDOWN_RESPONSE_BODY } from "../_shared/lockdown.ts";

type LeadPayload = {
  name?: string;
  email?: string;
  phone?: string;
  type?: "Curso" | "InCompany" | "Consultoria" | "Newsletter" | "Orçamento" | "Contato";
  organization?: string;
  teamSize?: number;
  courseInterest?: string;
  courseId?: string;
  origin?: string;
  preferredModality?: string;
  trainingObjective?: string;
  trainingTheme?: string;
  mainChallenges?: string;
  message?: string;
};

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
  const rate = await checkRateLimit(`lead:${ip}`, rateLimitConfigs.lead);
  if (!rate.allowed) {
    return jsonResponse(
      { ok: false, error: "Muitas tentativas. Tente novamente mais tarde." },
      429,
      request,
      { "Retry-After": rate.retryAfter.toString() }
    );
  }

  const payload = (await request.json().catch(() => null)) as LeadPayload | null;

  if (!payload?.name || !payload.email || !payload.courseInterest || !payload.origin) {
    return jsonResponse({ ok: false, error: "Campos obrigatórios ausentes." }, 400, request);
  }

  try {
    const supabase = adminClient();
    const { error } = await supabase
      .from("lead")
      .insert({
        nome: payload.name,
        email: payload.email,
        telefone: payload.phone,
        tipo:
          payload.type === "Consultoria"
            ? "Mentoria"
            : payload.type === "Orçamento"
              ? "Orcamento"
              : payload.type ?? "Contato",
        orgao: payload.organization,
        num_participantes: payload.teamSize,
        tema_interesse: payload.courseInterest,
        curso_id: payload.courseId,
        origem: payload.origin,
        modalidade_preferida: payload.preferredModality,
        objetivo_treinamento: payload.trainingObjective,
        tema_treinamento: payload.trainingTheme,
        desafios_principais: payload.mainChallenges,
        mensagem: payload.message,
        status_crm: "Novo",
      });

    if (error) throw error;

    return jsonResponse({ ok: true }, 201, request);
  } catch (error) {
    console.error("leads.create error:", error instanceof Error ? error.message : error);
    return jsonResponse({ ok: false, error: "Erro ao criar lead." }, 500, request);
  }
});
