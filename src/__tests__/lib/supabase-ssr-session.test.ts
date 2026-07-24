import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';

import {
  buildSsrCookieOptions,
  readSSRSession,
  signInSSR,
  signOutSSR,
} from '@/lib/supabase/session';

/**
 * Testes de contrato da sessão SSR (REC-202 — D2/D3 do ADR-016).
 *
 * Foco: AAL2 fail-closed (SEC-104) e atributos de cookie SSR. Todos os cenários
 * usam um cliente Supabase mockado — nenhuma chamada de rede real, nenhum toque
 * na conta administrativa real nem no projeto remoto de produção.
 */

type MockFactor = { id: string; factor_type?: string; status?: string };

function makeClient(config?: {
  user?: Record<string, unknown> | null;
  signInError?: boolean;
  factors?: MockFactor[];
  challengeError?: boolean;
  verifyError?: boolean;
  currentLevel?: 'aal1' | 'aal2';
  getUserUser?: Record<string, unknown> | null;
}) {
  const signOut = vi.fn().mockResolvedValue({ error: null });
  const user =
    config?.user === undefined
      ? { email: 'admin@rhcursos.demo', app_metadata: { role: 'admin' }, user_metadata: { name: 'Admin' } }
      : config.user;

  const client = {
    auth: {
      signInWithPassword: vi.fn().mockResolvedValue(
        config?.signInError ? { data: null, error: { message: 'bad' } } : { data: { user }, error: null }
      ),
      signOut,
      getUser: vi.fn().mockResolvedValue({
        data: { user: config?.getUserUser === undefined ? user : config.getUserUser },
        error: null,
      }),
      mfa: {
        listFactors: vi.fn().mockResolvedValue({
          data: { all: config?.factors ?? [], totp: config?.factors ?? [] },
          error: null,
        }),
        challenge: vi.fn().mockResolvedValue(
          config?.challengeError ? { data: null, error: { message: 'ch' } } : { data: { id: 'ch-1' }, error: null }
        ),
        verify: vi.fn().mockResolvedValue(
          config?.verifyError ? { data: null, error: { message: 'vf' } } : { data: {}, error: null }
        ),
        getAuthenticatorAssuranceLevel: vi.fn().mockResolvedValue({
          data: { currentLevel: config?.currentLevel ?? 'aal2', nextLevel: 'aal2' },
          error: null,
        }),
      },
    },
  };

  return { client: client as unknown as SupabaseClient, signOut };
}

const activeTotp: MockFactor = { id: 'factor-1', factor_type: 'totp', status: 'verified' };

describe('signInSSR — AAL2 fail-closed (D3 / SEC-104)', () => {
  it('conta SEM MFA → emite sessão em AAL1', async () => {
    const { client, signOut } = makeClient({ factors: [] });
    const result = await signInSSR(client, { email: 'admin@rhcursos.demo', password: 'pw' });

    expect(result).toMatchObject({ status: 'authenticated', aal: 'aal1', role: 'admin' });
    expect(signOut).not.toHaveBeenCalled();
  });

  it('conta COM MFA e SEM challenge → nega sessão (fail-closed) e encerra a sessão de senha', async () => {
    const { client, signOut } = makeClient({ factors: [activeTotp] });
    const result = await signInSSR(client, { email: 'admin@rhcursos.demo', password: 'pw' });

    expect(result).toMatchObject({ status: 'mfa_required', factorId: 'factor-1' });
    expect(signOut).toHaveBeenCalledTimes(1);
  });

  it('conta COM MFA e challenge completo (AAL2) → emite sessão em AAL2', async () => {
    const { client, signOut } = makeClient({ factors: [activeTotp], currentLevel: 'aal2' });
    const result = await signInSSR(client, {
      email: 'admin@rhcursos.demo',
      password: 'pw',
      mfaCode: '123456',
    });

    expect(result).toMatchObject({ status: 'authenticated', aal: 'aal2', role: 'admin' });
    expect(signOut).not.toHaveBeenCalled();
  });

  it('conta COM MFA e código inválido (verify falha) → mfa_failed (fail-closed)', async () => {
    const { client, signOut } = makeClient({ factors: [activeTotp], verifyError: true });
    const result = await signInSSR(client, {
      email: 'admin@rhcursos.demo',
      password: 'pw',
      mfaCode: '000000',
    });

    expect(result).toMatchObject({ status: 'mfa_failed' });
    expect(signOut).toHaveBeenCalledTimes(1);
  });

  it('conta COM MFA, verify ok mas nível não sobe a AAL2 → mfa_failed (fail-closed)', async () => {
    const { client, signOut } = makeClient({ factors: [activeTotp], currentLevel: 'aal1' });
    const result = await signInSSR(client, {
      email: 'admin@rhcursos.demo',
      password: 'pw',
      mfaCode: '123456',
    });

    expect(result).toMatchObject({ status: 'mfa_failed' });
    expect(signOut).toHaveBeenCalledTimes(1);
  });

  it('challenge falha → mfa_failed (fail-closed)', async () => {
    const { client, signOut } = makeClient({ factors: [activeTotp], challengeError: true });
    const result = await signInSSR(client, {
      email: 'admin@rhcursos.demo',
      password: 'pw',
      mfaCode: '123456',
    });

    expect(result).toMatchObject({ status: 'mfa_failed' });
    expect(signOut).toHaveBeenCalledTimes(1);
  });
});

describe('signInSSR — autorização de papel', () => {
  it('credenciais inválidas → invalid_credentials', async () => {
    const { client } = makeClient({ signInError: true });
    const result = await signInSSR(client, { email: 'x@y.z', password: 'pw' });
    expect(result).toMatchObject({ status: 'invalid_credentials' });
  });

  it('sem papel autorizado no app_metadata → unauthorized e encerra a sessão', async () => {
    const { client, signOut } = makeClient({
      user: { email: 'a@b.c', app_metadata: {}, user_metadata: {} },
      factors: [],
    });
    const result = await signInSSR(client, { email: 'a@b.c', password: 'pw' });
    expect(result).toMatchObject({ status: 'unauthorized' });
    expect(signOut).toHaveBeenCalledTimes(1);
  });

  it('papel solicitado diverge do papel real → unauthorized', async () => {
    const { client } = makeClient({ factors: [] });
    const result = await signInSSR(client, {
      email: 'admin@rhcursos.demo',
      password: 'pw',
      role: 'student',
    });
    expect(result).toMatchObject({ status: 'unauthorized' });
  });
});

describe('readSSRSession', () => {
  it('sessão ativa → retorna identidade e AAL', async () => {
    const { client } = makeClient({ currentLevel: 'aal2' });
    const read = await readSSRSession(client);
    expect(read).toMatchObject({ status: 'active', role: 'admin', aal: 'aal2' });
  });

  it('sem usuário → status none', async () => {
    const { client } = makeClient({ getUserUser: null });
    const read = await readSSRSession(client);
    expect(read).toMatchObject({ status: 'none' });
  });
});

describe('signOutSSR', () => {
  it('solicita revogação global sem expor tokens ao cliente', async () => {
    const { client } = makeClient();
    await expect(signOutSSR(client)).resolves.toBe(true);
    expect(client.auth.signOut).toHaveBeenCalledWith({ scope: 'global' });
  });

  it('retorna false quando o Supabase não consegue revogar a sessão', async () => {
    const { client } = makeClient();
    client.auth.signOut = vi.fn().mockResolvedValue({ error: { message: 'unavailable' } });
    await expect(signOutSSR(client)).resolves.toBe(false);
  });
});

describe('buildSsrCookieOptions — atributos SSR (D2)', () => {
  let originalEnv: NodeJS.ProcessEnv;
  beforeEach(() => {
    originalEnv = { ...process.env };
  });
  afterEach(() => {
    process.env = originalEnv;
  });

  it('emite httpOnly, SameSite=lax, path=/', () => {
    const opts = buildSsrCookieOptions();
    expect(opts.httpOnly).toBe(true);
    expect(opts.sameSite).toBe('lax');
    expect(opts.path).toBe('/');
  });

  it('secure=true apenas em produção', () => {
    vi.stubEnv('NODE_ENV', 'production');
    expect(buildSsrCookieOptions().secure).toBe(true);
    vi.stubEnv('NODE_ENV', 'development');
    expect(buildSsrCookieOptions().secure).toBe(false);
    vi.unstubAllEnvs();
  });
});

describe('createSupabaseSSRClient — dependência de configuração', () => {
  afterEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it('retorna null quando o SSR não está configurado', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', '');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '');
    vi.resetModules();
    const mod = await import('@/lib/supabase/session');
    expect(mod.isSupabaseSsrConfigured).toBe(false);
    expect(mod.createSupabaseSSRClient({ getAll: () => [], setAll: () => {} })).toBeNull();
  });

  it('cria um cliente SSR ligado ao adaptador de cookies quando configurado', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://127.0.0.1:54321');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'anon-key-for-test-only-not-a-secret');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-key-for-test-only-not-a-secret');
    vi.resetModules();
    const mod = await import('@/lib/supabase/session');
    expect(mod.isSupabaseSsrConfigured).toBe(true);

    const getAll = vi.fn().mockReturnValue([{ name: 'sb-x', value: 'v' }]);
    const client = mod.createSupabaseSSRClient({ getAll, setAll: () => {} });
    expect(client).not.toBeNull();
    expect(client?.auth).toBeDefined();
  });
});
