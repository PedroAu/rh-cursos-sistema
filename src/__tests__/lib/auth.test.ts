import { describe, it, expect, afterEach, vi } from 'vitest';
import { getCookieOptions, isDashboardRole, normalizeDashboardRole } from '@/lib/auth';
import { shouldRotateSession } from '@/lib/auth-session';

/**
 * REC-204 Fase B: o verificador HMAC próprio (`encodeSession`/`decodeSession`/
 * `getSessionSecret`/`SESSION_COOKIE`) foi REMOVIDO de `@/lib/auth` — a
 * autoridade de sessão admin passou a ser exclusivamente a sessão Supabase SSR.
 * Estes testes cobrem apenas os helpers que sobreviveram ao cutover.
 */
describe('Auth Utilities (pós-cutover SSR)', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  describe('isDashboardRole / normalizeDashboardRole', () => {
    it('reconhece papéis válidos', () => {
      expect(isDashboardRole('admin')).toBe(true);
      expect(isDashboardRole('instructor')).toBe(true);
      expect(isDashboardRole('student')).toBe(true);
    });

    it('rejeita valores inválidos', () => {
      expect(isDashboardRole('root')).toBe(false);
      expect(isDashboardRole(undefined)).toBe(false);
      expect(normalizeDashboardRole('root')).toBeNull();
      expect(normalizeDashboardRole('admin')).toBe('admin');
    });
  });

  describe('getCookieOptions', () => {
    it('retorna cookie httpOnly/SameSite=Lax com maxAge derivado do TTL', () => {
      const options = getCookieOptions(60_000);
      expect(options.httpOnly).toBe(true);
      expect(options.sameSite).toBe('lax');
      expect(options.path).toBe('/');
      expect(options.maxAge).toBe(60);
    });
  });

  describe('shouldRotateSession', () => {
    it('marca sessões próximas da expiração para rotação', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-06-24T12:00:00.000Z'));

      expect(shouldRotateSession({ exp: Date.now() + 4 * 60 * 1000 })).toBe(true);
      expect(shouldRotateSession({ exp: Date.now() + 10 * 60 * 1000 })).toBe(false);
    });
  });
});
