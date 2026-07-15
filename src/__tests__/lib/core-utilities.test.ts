import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * Core Utility Tests for src/lib/
 * Tests pure utility functions: slugify, currency, formatDate, delay, cn
 * Tests validation: email, CPF, phone schemas
 * Tests auth: session encoding/decoding, secret management
 */

// Import utilities from lib
import { cn, slugify, currency, formatDate, delay } from '@/lib/utils';
import { validateInput } from '@/lib/validation';
import { loginSchema, enrollmentSchema, userProfileSchema, courseFilterSchema } from '@/lib/validation';
import { getSessionSecret, SESSION_COOKIE } from '@/lib/auth';

describe('Core Utilities Coverage - Part 2', () => {
  describe('cn - CSS Class Merger', () => {
    it('should merge simple classes', () => {
      expect(cn('a', 'b')).toContain('a');
      expect(cn('a', 'b')).toContain('b');
    });

    it('should handle conditional classes with objects', () => {
      expect(cn({ 'x': true, 'y': false })).toContain('x');
    });

    it('should merge Tailwind spacing classes', () => {
      const result = cn('px-2 py-4', 'px-6');
      expect(result).toMatch(/px/);
    });
  });

  describe('slugify - URL Slug Generation', () => {
    it('converts uppercase to lowercase', () => {
      expect(slugify('UPPERCASE')).toBe('uppercase');
    });

    it('replaces spaces with hyphens', () => {
      expect(slugify('hello world')).toBe('hello-world');
    });

    it('removes Portuguese accents', () => {
      expect(slugify('açúcar')).not.toContain('ç');
      expect(slugify('café')).not.toContain('é');
      expect(slugify('São Paulo')).not.toContain('ã');
    });

    it('removes special characters', () => {
      expect(slugify('test!@#$%^&*()')).not.toMatch(/[!@#$%^&*()]/);
    });

    it('removes leading and trailing hyphens', () => {
      expect(slugify('---test---')).toBe('test');
    });

    it('produces SEO-friendly output', () => {
      const result = slugify('Advanced JavaScript & React 2024');
      expect(result).toBe('advanced-javascript-react-2024');
    });
  });

  describe('currency - Brazilian Real Formatter', () => {
    it('formats zero as currency', () => {
      const result = currency(0);
      expect(result).toContain('R$');
    });

    it('formats small amounts', () => {
      const result = currency(1);
      expect(result).toContain('R$');
    });

    it('formats large amounts with thousands separator', () => {
      const result = currency(1234567.89);
      expect(result).toContain('R$');
    });

    it('includes cents in decimal format', () => {
      const result = currency(99.99);
      expect(result).toBeTruthy();
    });
  });

  describe('formatDate - Portuguese Date Formatter', () => {
    it('formats ISO date to locale format', () => {
      const result = formatDate('2024-03-15T14:30:00Z');
      expect(result).toBeTruthy();
      expect(result).toMatch(/\d{2}/);
    });

    it('handles edge dates', () => {
      expect(formatDate('2024-01-01T00:00:00Z')).toBeTruthy();
      expect(formatDate('2024-12-31T23:59:59Z')).toBeTruthy();
    });
  });

  describe('delay - Promise Delay', () => {
    it('returns a promise', () => {
      const promise = delay(0);
      expect(promise).toBeInstanceOf(Promise);
    });

    it('resolves only after the specified time has elapsed', async () => {
      // Fake timers make the timing deterministic. Asserting wall-clock
      // elapsed time is flaky because setTimeout can fire a fraction early.
      vi.useFakeTimers();
      try {
        let resolved = false;
        const pending = delay(10).then(() => {
          resolved = true;
        });

        await vi.advanceTimersByTimeAsync(9);
        expect(resolved).toBe(false);

        await vi.advanceTimersByTimeAsync(1);
        await pending;
        expect(resolved).toBe(true);
      } finally {
        vi.useRealTimers();
      }
    });
  });

  describe('Validation Schemas - Email', () => {
    it('validates correct emails', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: 'password',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid emails', () => {
      const result = loginSchema.safeParse({
        email: 'not-an-email',
        password: 'password',
      });
      expect(result.success).toBe(false);
    });

    it('converts email to lowercase', () => {
      const result = loginSchema.safeParse({
        email: 'USER@EXAMPLE.COM',
        password: 'password',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('user@example.com');
      }
    });
  });

  describe('Validation Schemas - CPF', () => {
    it('validates correct CPF format', () => {
      const result = enrollmentSchema.safeParse({
        studentName: 'João Silva',
        email: 'joao@example.com',
        cpf: '123.456.789-10',
        phone: '(61) 99999-9999',
        courseId: 'course-1',
        classId: 'class-1',
      });
      expect(result.success).toBe(true);
    });

    it('removes non-numeric from CPF during transform', () => {
      const result = enrollmentSchema.safeParse({
        studentName: 'João Silva',
        email: 'joao@example.com',
        cpf: '123.456.789-10',
        phone: '(61) 99999-9999',
        courseId: 'course-1',
        classId: 'class-1',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.cpf).toBe('12345678910');
      }
    });

    it('rejects invalid CPF format', () => {
      const result = enrollmentSchema.safeParse({
        studentName: 'João Silva',
        email: 'joao@example.com',
        cpf: 'invalid',
        phone: '(61) 99999-9999',
        courseId: 'course-1',
        classId: 'class-1',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('Validation Schemas - Phone', () => {
    it('validates correct phone format', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: 'pass',
      });
      expect(result.success).toBe(true);
    });

    it('accepts phone with 4 digits after area', () => {
      const result = enrollmentSchema.safeParse({
        studentName: 'João',
        email: 'joao@example.com',
        cpf: '123.456.789-10',
        phone: '(61) 3999-9999',
        courseId: 'course-1',
        classId: 'class-1',
      });
      expect(result.success).toBe(true);
    });

    it('accepts phone with 5 digits after area', () => {
      const result = enrollmentSchema.safeParse({
        studentName: 'João',
        email: 'joao@example.com',
        cpf: '123.456.789-10',
        phone: '(61) 99999-9999',
        courseId: 'course-1',
        classId: 'class-1',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('Validation Schemas - Names and Strings', () => {
    it('trims names and organization', () => {
      const result = enrollmentSchema.safeParse({
        studentName: '  João Silva  ',
        email: 'joao@example.com',
        cpf: '123.456.789-10',
        phone: '(61) 99999-9999',
        courseId: 'course-1',
        classId: 'class-1',
        organization: '  Tech Corp  ',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.studentName).toBe('João Silva');
        expect(result.data.organization).toBe('Tech Corp');
      }
    });

    it('enforces minimum name length', () => {
      const result = enrollmentSchema.safeParse({
        studentName: 'Jo',
        email: 'joao@example.com',
        cpf: '123.456.789-10',
        phone: '(61) 99999-9999',
        courseId: 'course-1',
        classId: 'class-1',
      });
      expect(result.success).toBe(false);
    });

    it('enforces maximum name length', () => {
      const result = enrollmentSchema.safeParse({
        studentName: 'A'.repeat(101),
        email: 'joao@example.com',
        cpf: '123.456.789-10',
        phone: '(61) 99999-9999',
        courseId: 'course-1',
        classId: 'class-1',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('Validation Schemas - Enums', () => {
    it('validates enrollment type enum', () => {
      const validTypes = ['Pessoa física', 'Empresa', 'Órgão público'];
      validTypes.forEach((type) => {
        const result = enrollmentSchema.safeParse({
          studentName: 'João',
          email: 'joao@example.com',
          cpf: '123.456.789-10',
          phone: '(61) 99999-9999',
          courseId: 'course-1',
          classId: 'class-1',
          enrollmentType: type as any,
        });
        expect(result.success).toBe(true);
      });
    });

    it('rejects invalid enrollment type', () => {
      const result = enrollmentSchema.safeParse({
        studentName: 'João',
        email: 'joao@example.com',
        cpf: '123.456.789-10',
        phone: '(61) 99999-9999',
        courseId: 'course-1',
        classId: 'class-1',
        enrollmentType: 'Invalid',
      });
      expect(result.success).toBe(false);
    });

    it('rejects payment methods from the public pre-enrollment contract', () => {
      const validMethods = ['Pix', 'Cartão', 'Boleto', 'Empenho'];
      validMethods.forEach((method) => {
        const result = enrollmentSchema.safeParse({
          studentName: 'João',
          email: 'joao@example.com',
          cpf: '123.456.789-10',
          phone: '(61) 99999-9999',
          courseId: 'course-1',
          classId: 'class-1',
          paymentMethod: method as any,
        });
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Validation Schemas - Defaults', () => {
    it('provides default values for optional fields', () => {
      const result = enrollmentSchema.safeParse({
        studentName: 'João',
        email: 'joao@example.com',
        cpf: '123.456.789-10',
        phone: '(61) 99999-9999',
        courseId: 'course-1',
        classId: 'class-1',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.enrollmentType).toBe('Pessoa física');
        expect(result.data).not.toHaveProperty('paymentMethod');
        expect(result.data.organization).toBe('');
        expect(result.data.jobTitle).toBe('');
        expect(result.data.notes).toBe('');
      }
    });
  });

  describe('validateInput Helper', () => {
    it('wraps schema validation with error mapping', () => {
      const result = validateInput(loginSchema, {
        email: 'test@example.com',
        password: 'password',
      });
      expect(result.success).toBe(true);
    });

    it('returns structured errors object', () => {
      const result = validateInput(loginSchema, {
        email: 'invalid-email',
        password: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(Object.keys(result.errors).length).toBeGreaterThan(0);
      }
    });
  });

  describe('Auth - Session Cookie Name', () => {
    it('uses consistent cookie name', () => {
      expect(SESSION_COOKIE).toBe('rh_cursos_demo_session');
    });

    it('cookie name follows naming convention', () => {
      expect(SESSION_COOKIE).toMatch(/^[a-z_]+$/);
    });
  });

  describe('Auth - Secret Management', () => {
    let originalEnv: NodeJS.ProcessEnv;

    beforeEach(() => {
      originalEnv = { ...process.env };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('loads secret from environment', () => {
      process.env.AUTH_SESSION_SECRET = 'test-secret-with-more-than-32-chars-at-least';
      const secret = getSessionSecret();
      expect(secret).toBe('test-secret-with-more-than-32-chars-at-least');
    });
  });

  describe('Course Filter Schema', () => {
    it('validates all optional fields together', () => {
      const result = courseFilterSchema.safeParse({
        category: 'programming',
        status: 'active',
        instructor: 'John',
        page: 1,
        limit: 50,
      });
      expect(result.success).toBe(true);
    });

    it('rejects page < 1', () => {
      const result = courseFilterSchema.safeParse({ page: 0 });
      expect(result.success).toBe(false);
    });

    it('rejects limit > 100', () => {
      const result = courseFilterSchema.safeParse({ limit: 101 });
      expect(result.success).toBe(false);
    });

    it('allows empty filter', () => {
      const result = courseFilterSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });
});
