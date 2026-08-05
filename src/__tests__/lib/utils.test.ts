import { describe, it, expect, vi } from 'vitest';
import { cn, slugify, currency, formatDate, parseDate, delay } from '@/lib/utils';

describe('Utils', () => {
  describe('cn', () => {
    it('should merge class names', () => {
      const result = cn('px-2', 'py-1');
      expect(result).toContain('px-2');
      expect(result).toContain('py-1');
    });

    it('should handle object values', () => {
      const result = cn({ 'px-2': true, 'py-1': false });
      expect(result).toContain('px-2');
      expect(result).not.toContain('py-1');
    });

    it('should merge conflicting tailwind classes', () => {
      const result = cn('px-2 px-4', 'px-8');
      // The rightmost value should take precedence
      expect(result).toContain('px-8');
    });

    it('should handle arrays', () => {
      const result = cn(['px-2', 'py-1']);
      expect(result).toContain('px-2');
      expect(result).toContain('py-1');
    });

    it('should handle empty inputs', () => {
      const result = cn('');
      expect(typeof result).toBe('string');
    });

    it('should remove falsy values', () => {
      const result = cn('px-2', undefined, false, 'py-1');
      expect(result).toContain('px-2');
      expect(result).toContain('py-1');
      expect(result).not.toContain('undefined');
    });
  });

  describe('slugify', () => {
    it('should convert to lowercase', () => {
      expect(slugify('Hello World')).toBe('hello-world');
    });

    it('should replace spaces with hyphens', () => {
      expect(slugify('My Awesome Course')).toBe('my-awesome-course');
    });

    it('should remove special characters', () => {
      expect(slugify('Course: Level 1!')).toBe('course-level-1');
    });

    it('should remove accents', () => {
      expect(slugify('São Paulo')).toBe('sao-paulo');
      expect(slugify('Açúcar')).toBe('acucar');
      expect(slugify('Café')).toBe('cafe');
    });

    it('should remove leading and trailing hyphens', () => {
      expect(slugify('-Course-')).toBe('course');
      expect(slugify('---Start---')).toBe('start');
    });

    it('should handle multiple consecutive hyphens', () => {
      expect(slugify('Hello  World')).toBe('hello-world');
      expect(slugify('Test---Value')).toBe('test-value');
    });

    it('should handle empty strings', () => {
      expect(slugify('')).toBe('');
    });

    it('should handle Portuguese accents', () => {
      expect(slugify('Português')).toBe('portugues');
      expect(slugify('Engenharia')).toBe('engenharia');
    });

    it('should work with real course titles', () => {
      expect(slugify('RH Cursos & Soluções')).toBe('rh-cursos-solucoes');
      expect(slugify('Desenvolvimento Web 2024')).toBe('desenvolvimento-web-2024');
    });
  });

  describe('currency', () => {
    it('should format number as Brazilian currency', () => {
      const result = currency(1000);
      expect(result).toContain('R$');
      expect(result).toContain('1');
      expect(result).toContain('000');
    });

    it('should handle zero', () => {
      const result = currency(0);
      expect(result).toContain('0');
      expect(result).toContain('R$');
    });

    it('should handle decimal values', () => {
      const result = currency(99.99);
      expect(result).toContain('99');
    });

    it('should handle large numbers', () => {
      const result = currency(1000000);
      expect(result).toContain('R$');
      expect(result).toContain('1');
    });

    it('should format with thousands separator', () => {
      const result = currency(1234.56);
      // Brazilian format uses . for thousands
      expect(result).toMatch(/\d+\.\d+/);
    });

    it('should show cents properly', () => {
      const result = currency(10.50);
      expect(result).toContain('10');
    });
  });

  describe('formatDate', () => {
    it('keeps a date-only value on the requested calendar day', () => {
      const result = formatDate('2026-08-10');

      expect(result).toContain('10');
      expect(result).toContain('2026');
    });

    it('parses date-only values as local calendar parts', () => {
      const result = parseDate('2026-08-10');

      expect(result.getFullYear()).toBe(2026);
      expect(result.getMonth()).toBe(7);
      expect(result.getDate()).toBe(10);
    });

    it('should format ISO date string', () => {
      const result = formatDate('2024-01-15T10:30:00Z');
      expect(result).toContain('15');
      expect(result).toContain('2024');
    });

    it('should format with locale format', () => {
      const result = formatDate('2024-06-01T10:30:00Z');
      // Should be a non-empty string with numbers and possibly text
      expect(result).toBeTruthy();
      expect(result).toMatch(/\d/);
    });

    it('should handle different dates', () => {
      const result1 = formatDate('2024-01-01T10:30:00Z');
      const result2 = formatDate('2024-12-31T10:30:00Z');
      expect(result1).not.toBe(result2);
    });

    it('should work with current date', () => {
      const today = new Date().toISOString();
      const result = formatDate(today);
      expect(result).toBeTruthy();
      expect(result).toMatch(/\d/);
    });

    it('should format month as short name', () => {
      const result = formatDate('2024-06-15T10:30:00Z');
      // June in Portuguese is "jun"
      expect(result).toMatch(/\w{3}/);
    });
  });

  describe('delay', () => {
    it('should resolve after specified milliseconds', async () => {
      const start = Date.now();
      await delay(50);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(45);
    });

    it('should resolve with undefined', async () => {
      const result = await delay(10);
      expect(result).toBeUndefined();
    });

    it('should handle zero delay', async () => {
      const result = await delay(0);
      expect(result).toBeUndefined();
    });

    it('should be chainable with async/await', async () => {
      let executed = false;
      await delay(10);
      executed = true;
      expect(executed).toBe(true);
    });

    it('should return a promise', () => {
      const result = delay(100);
      expect(result).toBeInstanceOf(Promise);
    });
  });
});
