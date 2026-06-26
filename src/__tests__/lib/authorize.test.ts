import { describe, it, expect } from 'vitest';
import { authorize } from '@/lib/authorize';
import type { DemoSession } from '@/lib/auth';

describe('authorize', () => {
  it('returns false when session is null', () => {
    expect(authorize(null, 'admin')).toBe(false);
  });

  it('returns true when the session role matches a single allowed role string', () => {
    const session: DemoSession = { role: 'admin', email: 'test@test.com', name: 'Test' };

    expect(authorize(session, 'admin')).toBe(true);
  });

  it('returns false when the session role does not match the single allowed role string', () => {
    const session: DemoSession = { role: 'admin', email: 'test@test.com', name: 'Test' };

    expect(authorize(session, 'instructor')).toBe(false);
  });

  it('returns true when the session role is included in an array of allowed roles', () => {
    const session: DemoSession = { role: 'instructor', email: 'test@test.com', name: 'Test' };

    expect(authorize(session, ['student', 'instructor'])).toBe(true);
  });

  it('returns false when the session role is not included in an array of allowed roles', () => {
    const session: DemoSession = { role: 'student', email: 'test@test.com', name: 'Test' };

    expect(authorize(session, ['admin', 'instructor'])).toBe(false);
  });

  it('accepts allowedRoles as either a single role or an array of roles (type-level)', () => {
    const session: DemoSession = { role: 'admin', email: 'test@test.com', name: 'Test' };

    const resultWithString = authorize(session, 'admin');
    const resultWithArray = authorize(session, ['admin']);

    expect(resultWithString).toBe(true);
    expect(resultWithArray).toBe(true);
  });

  it('fails closed when an allowed role array is empty', () => {
    const session: DemoSession = { role: 'admin', email: 'test@test.com', name: 'Test' };

    expect(authorize(session, [])).toBe(false);
  });
});
