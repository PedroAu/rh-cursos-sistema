import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getSessionSecret,
  SESSION_COOKIE,
  encodeSession,
  decodeSession,
  type DemoSession,
} from '@/lib/auth';
import { shouldRotateSession } from '@/lib/auth-session';

describe('Auth Utilities', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.useRealTimers();
  });

  describe('SESSION_COOKIE', () => {
    it('should have correct cookie name', () => {
      expect(SESSION_COOKIE).toBe('rh_cursos_demo_session');
    });
  });

  describe('getSessionSecret', () => {
    it('should return secret from environment', () => {
      process.env.AUTH_SESSION_SECRET = 'test-secret-with-32-chars-at-least-1234567890';
      const secret = getSessionSecret();
      expect(secret).toBe('test-secret-with-32-chars-at-least-1234567890');
    });

    it('should return fallback in development when not set', () => {
      delete process.env.AUTH_SESSION_SECRET;
      vi.stubEnv('NODE_ENV', 'development');
      const secret = getSessionSecret();
      expect(secret).toBe('dev-insecure-fallback-change-in-production');
    });

    it('should throw in production when not set', () => {
      delete process.env.AUTH_SESSION_SECRET;
      vi.stubEnv('NODE_ENV', 'production');
      expect(() => getSessionSecret()).toThrow('AUTH_SESSION_SECRET environment variable is required in production');
    });

    it('should throw if secret is too short', () => {
      process.env.AUTH_SESSION_SECRET = 'short';
      expect(() => getSessionSecret()).toThrow('AUTH_SESSION_SECRET must be at least 32 characters');
    });
  });

  describe('Session encoding and decoding', () => {
    const testSession: DemoSession = {
      role: 'admin',
      email: 'admin@rhcursos.demo',
      name: 'Test Admin',
    };

    it('should encode and decode session', async () => {
      const encoded = await encodeSession(testSession);
      expect(typeof encoded).toBe('string');
      expect(encoded.includes('.')).toBe(true);

      const decoded = await decodeSession(encoded);
      expect(decoded).toEqual(testSession);
    });

    it('should return null for undefined session', async () => {
      const decoded = await decodeSession(undefined);
      expect(decoded).toBeNull();
    });

    it('should return null for empty session', async () => {
      const decoded = await decodeSession('');
      expect(decoded).toBeNull();
    });

    it('should return null for malformed session', async () => {
      const decoded = await decodeSession('invalid.format.extra');
      expect(decoded).toBeNull();
    });

    it('should return null if signature is tampered', async () => {
      const encoded = await encodeSession(testSession);
      const parts = encoded.split('.');
      const tampered = parts[0] + '.invalidsignature';
      const decoded = await decodeSession(tampered);
      expect(decoded).toBeNull();
    });

    it('should return null if payload is missing required fields', async () => {
      const incompleteSession = {
        role: 'admin',
        // missing email and name
      };
      const encoded = await encodeSession(incompleteSession as any);
      const decoded = await decodeSession(encoded);
      expect(decoded).toBeNull();
    });

    it('should preserve all session fields', async () => {
      const session: DemoSession = {
        role: 'admin',
        email: 'test@example.com',
        name: 'Test User',
      };

      const encoded = await encodeSession(session);
      const decoded = await decodeSession(encoded);

      expect(decoded).toEqual(session);
      expect(decoded?.role).toBe('admin');
      expect(decoded?.email).toBe('test@example.com');
      expect(decoded?.name).toBe('Test User');
    });

    it('should support explicit instructor and student roles in signed sessions', async () => {
      const instructorSession: DemoSession = {
        role: 'instructor',
        email: 'instrutor@example.com',
        name: 'Instrutor',
      };
      const studentSession: DemoSession = {
        role: 'student',
        email: 'aluno@example.com',
        name: 'Aluno',
      };

      await expect(decodeSession(await encodeSession(instructorSession))).resolves.toEqual(instructorSession);
      await expect(decodeSession(await encodeSession(studentSession))).resolves.toEqual(studentSession);
    });

    it('should reject expired sessions issued with ttl', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-06-24T12:00:00.000Z'));

      const encoded = await encodeSession(testSession, 1_000);
      vi.advanceTimersByTime(1_001);

      await expect(decodeSession(encoded)).resolves.toBeNull();
    });

    it('should mark sessions near expiration for rotation', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-06-24T12:00:00.000Z'));

      expect(shouldRotateSession({ exp: Date.now() + 4 * 60 * 1000 })).toBe(true);
      expect(shouldRotateSession({ exp: Date.now() + 10 * 60 * 1000 })).toBe(false);
    });
  });

});
