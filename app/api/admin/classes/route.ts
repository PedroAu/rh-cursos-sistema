import { NextResponse } from "next/server";

import { logger } from "@/lib/logger";
import { requireAdminApi } from "@/lib/supabase/admin-api-auth";
import { listClasses, normalizeCatalogListParams } from "@/lib/supabase/admin-catalog-read-models";

/**
 * Read model administrativo de TURMAS (REC-304 — continua FND-08).
 *
 * Rota same-origin NET-NEW, autorizada server-side por `requireAdminApi`
 * (`requireServerRole`/REC-203 sobre a sessão SSR de REC-202). Reload,
 * paginação e busca pelo título do curso retornam dados autorizados. O HMAC de
 * produção permanece intocado — ver nota em `admin-api-auth.ts`.
 */
export async function GET(request: Request) {
  const guard = await requireAdminApi();
  if (!guard.ok) {
    return guard.response;
  }

  try {
    const params = normalizeCatalogListParams(new URL(request.url).searchParams);
    const result = await listClasses(guard.adminClient, params);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    logger.error("api/admin/classes.list error", {
      err: error,
      route: "api/admin/classes",
    });
    return NextResponse.json({ ok: false, error: "Erro ao listar turmas." }, { status: 500 });
  }
}
