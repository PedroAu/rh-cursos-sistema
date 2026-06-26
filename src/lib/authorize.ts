import type { DashboardRole, DemoSession } from "@/lib/auth";

/**
 * Verifica se a sessão atual possui uma das roles permitidas.
 *
 * Camada de autorização app-level — o contrato esperado é:
 * - `app_metadata.role` no Auth
 * - `profiles.role` no banco
 * - helpers SQL `is_admin()`, `is_instructor()` e `is_student()`
 *
 * Todos devem compartilhar os mesmos valores explícitos de role e falhar
 * fechado quando uma role não autorizada ou desconhecida for apresentada.
 *
 * Preparatório: ainda não usado em nenhuma rota. Será consumido quando as
 * áreas /aluno e /instrutor forem habilitadas em outra epic.
 */
export function authorize(
  session: DemoSession | null,
  allowedRoles: DashboardRole | DashboardRole[]
): boolean {
  if (!session) return false;

  return Array.isArray(allowedRoles)
    ? allowedRoles.includes(session.role)
    : allowedRoles === session.role;
}
