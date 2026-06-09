// Edge Function: leads
// Substitui app/api/leads/route.ts no deploy estático.
// Cria um lead no Supabase (RLS permite insert anônimo conforme policy).

import { handleOptions, jsonResponse, isOriginAllowed } from "../_shared/cors.ts";
import { anonClient } from "../_shared/supabase.ts";
import { checkRateLimit, clientIp, rateLimitConfigs } from "../_shared/rate-limit.ts";

type LeadPayload = {
  name?: string;
  email?: string;
  phone?: string;
  organization?: string;
  teamSize?: number;
  courseInterest?: string;
  origin?: string;
  message?: string;
};

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
  const rate = checkRateLimit(`lead:${ip}`, rateLimitConfigs.lead);
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
    const supabase = anonClient();
    const { error } = await supabase
      .from("lead")
      .insert({
        nome: payload.name,
        email: payload.email,
        telefone: payload.phone,
        orgao: payload.organization,
        num_participantes: payload.teamSize,
        tema_interesse: payload.courseInterest,
        origem: payload.origin,
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
