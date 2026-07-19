import { NextResponse } from "next/server";

import { logger } from "@/lib/logger";
import { applyNoStore } from "@/lib/security-headers";
import { requireAdminApi } from "@/lib/supabase/admin-api-auth";
import { listCourses, normalizeCatalogListParams } from "@/lib/supabase/admin-catalog-read-models";

/**
 * Read model administrativo de CURSOS (REC-304 — continua FND-08).
 *
 * Rota same-origin NET-NEW, autorizada server-side por `requireAdminApi`
 * (`requireServerRole`/REC-203 sobre a sessão SSR de REC-202). Reload,
 * paginação e busca por título retornam dados autorizados. O HMAC de produção
 * permanece intocado — ver nota em `admin-api-auth.ts`.
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
    const params = normalizeCatalogListParams(new URL(request.url).searchParams);
    const result = await listCourses(guard.adminClient, params);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    logger.error("api/admin/courses.list error", {
      err: error,
      route: "api/admin/courses",
    });
    return NextResponse.json({ ok: false, error: "Erro ao listar cursos." }, { status: 500 });
  }
}
