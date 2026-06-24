import type { DashboardRole, DemoSession } from "@/lib/auth";

/**
 * Verifica se a sessão atual possui uma das roles permitidas.
 *
 * Camada de autorização app-level — espelha as funções SQL is_admin(),
 * is_instructor() e is_student() (SECURITY DEFINER) usadas nas policies RLS.
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
