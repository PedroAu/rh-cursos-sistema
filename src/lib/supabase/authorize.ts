import type { SupabaseClient } from "@supabase/supabase-js";

import { type DashboardRole, normalizeDashboardRole } from "@/lib/auth";

/**
 * Autorização administrativa resolvida no servidor (REC-203 — implementa D1 do ADR-016).
 *
 * D1 exige que o papel (`role`) seja resolvido a partir da FONTE, no servidor, a
 * cada operação protegida — e NUNCA lido de um payload assinado no momento do
 * login (como faz o HMAC de `src/lib/auth.ts`). É essa consulta fresca que torna
 * um rebaixamento/bloqueio de papel efetivo já na requisição SEGUINTE.
 *
 * A fonte reutilizada aqui é a MESMA já usada por `signInSSR`/`readSSRSession`
 * (REC-202): `app_metadata.role` lido via `client.auth.getUser()` sobre o cliente
 * da sessão SSR do Supabase. Nenhuma fonte nova de papel é introduzida (Article IV
 * — No Invention).
 *
 * IMPORTANTE (D5 / anti-lockout): este módulo é INFRAESTRUTURA. Ele NÃO está
 * ligado a nenhuma rota administrativa real nesta story. A autoridade de
 * autorização em produção continua sendo o HMAC (`supabase/functions/_shared/auth.ts`
 * via `requireAdmin`, e `src/lib/auth.ts`). Trocar uma rota real de HMAC para esta
 * checagem é ATIVAÇÃO — escopo de uma story futura (parte de REC-204 ou um passo
 * dedicado), fora do escopo de REC-203. Aqui apenas construímos e testamos o
 * mecanismo; nada em produção muda de comportamento.
 */

/**
 * Hierarquia de papéis para comparação de "papel mínimo exigido".
 * `admin` > `instructor` > `student`. Espelha os valores de
 * `DashboardRole` (coluna `profiles.role`).
 */
const ROLE_RANK: Record<DashboardRole, number> = {
  student: 1,
  instructor: 2,
  admin: 3
};

/**
 * Resolve o papel atual do usuário consultando a FONTE no servidor a cada
 * chamada. Faz uma leitura FRESCA de `client.auth.getUser()` (que valida a
 * sessão SSR e devolve o `app_metadata` corrente) — não há cache nem payload
 * assinado. Duas chamadas consecutivas refletem o estado atual da fonte: se o
 * papel foi rebaixado entre elas, a segunda chamada retorna o papel novo.
 *
 * @returns o papel corrente, ou `null` se não há sessão/usuário autenticado ou
 * se o `app_metadata.role` não é um papel válido.
 */
export async function resolveServerRole(client: SupabaseClient): Promise<DashboardRole | null> {
  const { data, error } = await client.auth.getUser();
  if (error || !data?.user) {
    return null;
  }
  return normalizeDashboardRole(data.user.app_metadata?.role);
}

/**
 * Verifica se `actual` satisfaz o `minimum` exigido segundo a hierarquia de
 * papéis. Ausência de papel (`null`) nunca satisfaz (fail-closed).
 */
export function roleSatisfies(actual: DashboardRole | null, minimum: DashboardRole): boolean {
  if (!actual) {
    return false;
  }
  return ROLE_RANK[actual] >= ROLE_RANK[minimum];
}

export type ServerAuthorization =
  | { authorized: true; role: DashboardRole }
  | { authorized: false; reason: "unauthenticated"; role: null }
  | { authorized: false; reason: "insufficient_role"; role: DashboardRole };

/**
 * Helper de autorização pensado para uma rota real usar no futuro: dado o
 * cliente da sessão SSR e um papel mínimo exigido, resolve o papel na FONTE
 * (via `resolveServerRole`, sempre fresco) e decide autorizado/negado.
 *
 * Contrato (fail-closed):
 * - Sem sessão/usuário → `{ authorized: false, reason: "unauthenticated" }`.
 * - Papel abaixo do mínimo → `{ authorized: false, reason: "insufficient_role" }`.
 * - Papel suficiente → `{ authorized: true, role }`.
 *
 * Como a resolução é fresca a cada chamada, um rebaixamento entre duas
 * requisições BLOQUEIA a requisição seguinte (entrega mensurável de REC-203).
 *
 * NÃO ligado a nenhuma rota real nesta story — ver nota de escopo no topo.
 */
export async function requireServerRole(
  client: SupabaseClient,
  minimumRole: DashboardRole
): Promise<ServerAuthorization> {
  const role = await resolveServerRole(client);
  if (!role) {
    return { authorized: false, reason: "unauthenticated", role: null };
  }
  if (!roleSatisfies(role, minimumRole)) {
    return { authorized: false, reason: "insufficient_role", role };
  }
  return { authorized: true, role };
}
