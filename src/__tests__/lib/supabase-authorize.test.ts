import { describe, it, expect, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';

import {
  requireServerRole,
  resolveServerRole,
  roleSatisfies,
} from '@/lib/supabase/authorize';

/**
 * Testes de contrato da autorização resolvida no servidor (REC-203 — D1 do ADR-016).
 *
 * Foco: papel resolvido na FONTE a cada chamada (sem cache de payload assinado),
 * de modo que um rebaixamento entre duas chamadas bloqueie a requisição seguinte.
 * Todos os cenários usam um cliente Supabase mockado — nenhuma chamada de rede
 * real, nenhum toque na conta administrativa real nem no projeto de produção.
 */

/**
 * Cria um cliente mockado cujo `auth.getUser()` devolve, em sequência, cada
 * usuário de `users`. Isso permite simular o `app_metadata.role` MUDANDO entre
 * chamadas consecutivas (rebaixamento) e provar que a resolução é sempre fresca.
 */
function makeSequencedClient(users: Array<Record<string, unknown> | null>) {
  const getUser = vi.fn();
  for (const user of users) {
    getUser.mockResolvedValueOnce({ data: { user }, error: null });
  }
  // Após esgotar a sequência, repete o último valor (ou null).
  const last = users.length > 0 ? users[users.length - 1] : null;
  getUser.mockResolvedValue({ data: { user: last }, error: null });

  const client = { auth: { getUser } };
  return { client: client as unknown as SupabaseClient, getUser };
}

function makeErrorClient() {
  const getUser = vi.fn().mockResolvedValue({ data: null, error: { message: 'no session' } });
  const client = { auth: { getUser } };
  return { client: client as unknown as SupabaseClient, getUser };
}

const adminUser = { email: 'admin@rhcursos.demo', app_metadata: { role: 'admin' } };
const studentUser = { email: 'admin@rhcursos.demo', app_metadata: { role: 'student' } };
const noRoleUser = { email: 'nobody@rhcursos.demo', app_metadata: {} };

describe('resolveServerRole — papel vem da fonte no servidor (D1)', () => {
  it('sessão ativa com role admin → resolve "admin"', async () => {
    const { client, getUser } = makeSequencedClient([adminUser]);
    const role = await resolveServerRole(client);
    expect(role).toBe('admin');
    expect(getUser).toHaveBeenCalledTimes(1);
  });

  it('usuário sem sessão (getUser error) → null', async () => {
    const { client } = makeErrorClient();
    expect(await resolveServerRole(client)).toBeNull();
  });

  it('usuário sem role válido no app_metadata → null', async () => {
    const { client } = makeSequencedClient([noRoleUser]);
    expect(await resolveServerRole(client)).toBeNull();
  });

  it('rebaixamento: role muda entre duas chamadas → cada chamada reflete o estado ATUAL, não um valor cacheado', async () => {
    // A MESMA sessão devolve admin na 1ª leitura e student na 2ª (rebaixamento na fonte).
    const { client, getUser } = makeSequencedClient([adminUser, studentUser]);

    const first = await resolveServerRole(client);
    const second = await resolveServerRole(client);

    expect(first).toBe('admin');
    expect(second).toBe('student');
    // Prova de que não há cache: a fonte foi consultada a cada chamada.
    expect(getUser).toHaveBeenCalledTimes(2);
  });
});

describe('roleSatisfies — hierarquia de papéis', () => {
  it('admin satisfaz mínimo admin/instructor/student', () => {
    expect(roleSatisfies('admin', 'admin')).toBe(true);
    expect(roleSatisfies('admin', 'instructor')).toBe(true);
    expect(roleSatisfies('admin', 'student')).toBe(true);
  });

  it('student NÃO satisfaz mínimo admin', () => {
    expect(roleSatisfies('student', 'admin')).toBe(false);
  });

  it('papel ausente (null) nunca satisfaz (fail-closed)', () => {
    expect(roleSatisfies(null, 'student')).toBe(false);
  });
});

describe('requireServerRole — decisão de autorização (fail-closed)', () => {
  it('sem sessão → negado com reason "unauthenticated"', async () => {
    const { client } = makeErrorClient();
    const result = await requireServerRole(client, 'admin');
    expect(result).toEqual({ authorized: false, reason: 'unauthenticated', role: null });
  });

  it('papel insuficiente (student exige admin) → negado com reason "insufficient_role"', async () => {
    const { client } = makeSequencedClient([studentUser]);
    const result = await requireServerRole(client, 'admin');
    expect(result).toEqual({ authorized: false, reason: 'insufficient_role', role: 'student' });
  });

  it('papel suficiente → autorizado', async () => {
    const { client } = makeSequencedClient([adminUser]);
    const result = await requireServerRole(client, 'admin');
    expect(result).toEqual({ authorized: true, role: 'admin' });
  });

  it('rebaixamento bloqueia a requisição SEGUINTE: 1ª chamada autorizada (admin), 2ª negada após virar student', async () => {
    const { client } = makeSequencedClient([adminUser, studentUser]);

    const firstRequest = await requireServerRole(client, 'admin');
    const secondRequest = await requireServerRole(client, 'admin');

    expect(firstRequest).toEqual({ authorized: true, role: 'admin' });
    expect(secondRequest).toEqual({
      authorized: false,
      reason: 'insufficient_role',
      role: 'student',
    });
  });
});
