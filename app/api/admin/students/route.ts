import { NextResponse } from "next/server";

import { logger } from "@/lib/logger";
import { applyNoStore } from "@/lib/security-headers";
import { requireAdminApi } from "@/lib/supabase/admin-api-auth";
import { listStudents, normalizeListParams } from "@/lib/supabase/admin-read-models";

/**
 * Read model administrativo de ALUNOS (REC-303 — fecha FND-08).
 *
 * Rota same-origin NET-NEW, autorizada server-side por `requireAdminApi`
 * (primeira ativação real de `requireServerRole`/REC-203). Reload, paginação e
 * filtros (turma, status, busca por nome/email) retornam dados autorizados.
 * O HMAC de produção permanece intocado — ver nota em `admin-api-auth.ts`.
 */
// REC-408: dados administrativos autenticados são `no-store` (AC4), inclusive
// as respostas de negação (401/403/503) devolvidas por `requireAdminApi` e o 500.
export async function GET(request: Request) {
  return applyNoStore(await handleGet(request));
}

async function handleGet(request: Request) {
  const guard = await requireAdminApi();
  if (!guard.ok) {
    return guard.response;
  }

  try {
    const params = normalizeListParams(new URL(request.url).searchParams);
    const result = await listStudents(guard.adminClient, params);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    logger.error("api/admin/students.list error", {
      err: error,
      route: "api/admin/students",
    });
    return NextResponse.json({ ok: false, error: "Erro ao listar alunos." }, { status: 500 });
  }
}
