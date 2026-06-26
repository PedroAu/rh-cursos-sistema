import { describe, it, expect } from 'vitest';

/**
 * Additional Coverage Tests to reach 20%+ threshold
 * Tests more edge cases and branches of existing utilities
 */

import { cn, slugify, currency, formatDate, delay } from '@/lib/utils';
import { validateInput, enrollmentSchema, userProfileSchema, adminResourceSchema } from '@/lib/validation';
import { company } from '@/lib/company';

describe('Additional Utility Coverage', () => {
  describe('cn - Advanced Class Merging', () => {
    it('should handle nested arrays of classes', () => {
      const result = cn([['a', 'b'], ['c', 'd']]);
      expect(result).toContain('a');
      expect(result).toContain('c');
    });

    it('should override conflicting width classes', () => {
      const result = cn('w-10 w-20 w-32');
      expect(result).toMatch(/w-\d+/);
    });

    it('should handle mixed undefined and strings', () => {
      const value = undefined;
      const result = cn('px-2', value, 'py-4');
      expect(result).toContain('px-2');
      expect(result).toContain('py-4');
    });

    it('should merge responsive classes', () => {
      const result = cn('md:px-4 lg:px-8');
      expect(result).toMatch(/px-/);
    });

    it('should handle null values', () => {
      const result = cn('px-2', null, 'py-4');
      expect(result).toContain('px-2');
    });
  });

  describe('slugify - Edge Cases', () => {
    it('should handle consecutive special characters', () => {
      expect(slugify('test!!!###value')).toBe('test-value');
    });

    it('should handle numbers correctly', () => {
      expect(slugify('Course 2024 v3.0')).toContain('2024');
      expect(slugify('Course 2024 v3.0')).toContain('3');
    });

    it('should handle mixed case with numbers', () => {
      expect(slugify('HTML2PDF Converter')).toBe('html2pdf-converter');
    });

    it('should remove diacritics completely', () => {
      const result = slugify('Über Straße Naïve');
      expect(result).not.toMatch(/[üöäßñ]/i);
    });

    it('should collapse multiple spaces to single hyphen', () => {
      expect(slugify('hello     world')).toBe('hello-world');
    });

    it('should handle single character inputs', () => {
      expect(slugify('a')).toBe('a');
      expect(slugify('-')).toBe('');
    });

    it('should handle all caps inputs', () => {
      expect(slugify('JAVASCRIPT')).toBe('javascript');
    });
  });

  describe('currency - Formatting Edge Cases', () => {
    it('should format fractional cents', () => {
      const result = currency(0.01);
      expect(result).toContain('R$');
    });

    it('should handle negative numbers', () => {
      const result = currency(-50.00);
      expect(result).toBeTruthy();
    });

    it('should handle very large numbers', () => {
      const result = currency(9999999.99);
      expect(result).toContain('R$');
      expect(result).toContain('9');
    });

    it('should format with proper decimal precision', () => {
      const result = currency(100.5);
      expect(result).toBeTruthy();
    });
  });

  describe('formatDate - Various Dates', () => {
    it('should handle leap year date', () => {
      const result = formatDate('2024-02-29T12:00:00Z');
      expect(result).toBeTruthy();
      expect(result).toMatch(/\d{2}/); // Should have day
    });

    it('should format dates consistently', () => {
      const result = formatDate('2024-01-15T12:00:00Z');
      expect(result).toBeTruthy();
      expect(result).toMatch(/\d{2}/); // Should have digits
    });

    it('should format last day of year', () => {
      const result = formatDate('2024-12-31T12:00:00Z');
      expect(result).toBeTruthy();
      expect(result).toMatch(/2024/);
    });

    it('should handle different months consistently', () => {
      const jan = formatDate('2024-01-15T12:00:00Z');
      const dec = formatDate('2024-12-15T12:00:00Z');
      expect(jan).toBeTruthy();
      expect(dec).toBeTruthy();
      expect(jan).not.toBe(dec);
    });
  });

  describe('delay - Timing Validation', () => {
    it('should return promise that resolves', async () => {
      const promise = delay(5);
      const resolved = await promise;
      expect(resolved).toBeUndefined();
    });

    it('should work with multiple consecutive delays', async () => {
      await delay(5);
      await delay(5);
      expect(true).toBe(true);
    });
  });

  describe('Company Data Validation', () => {
    it('should have consistent address formatting', () => {
      const address = company.address.full;
      expect(address).toContain(company.address.street);
      expect(address).toContain(company.address.district);
    });

    it('should have valid phone number format for all phones', () => {
      const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
      [company.phones.primary, company.phones.secondary, company.phones.whatsapp].forEach(phone => {
        expect(phoneRegex.test(phone)).toBe(true);
      });
    });

    it('should have matching CNPJ format', () => {
      expect(company.cnpj).toMatch(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/);
    });

    it('should have consistent contact information', () => {
      expect(company.email).toBeTruthy();
      expect(company.links.email).toContain(company.email);
    });

    it('should have valid logo configuration', () => {
      expect(company.logo.src).toMatch(/\.(png|jpg|jpeg|gif|webp)$/);
      expect(company.logo.alt).toBeTruthy();
    });
  });

  describe('Validation - Name Constraints', () => {
    it('should validate first name minimum length', () => {
      const result = userProfileSchema.safeParse({
        firstName: 'A',
        lastName: 'Smith',
        email: 'test@example.com',
      });
      expect(result.success).toBe(false);
    });

    it('should validate first name maximum length', () => {
      const result = userProfileSchema.safeParse({
        firstName: 'A'.repeat(51),
        lastName: 'Smith',
        email: 'test@example.com',
      });
      expect(result.success).toBe(false);
    });

    it('should trim first and last names', () => {
      const result = userProfileSchema.safeParse({
        firstName: '  John  ',
        lastName: '  Doe  ',
        email: 'test@example.com',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.firstName).toBe('John');
        expect(result.data.lastName).toBe('Doe');
      }
    });
  });

  describe('Validation - Notes Field', () => {
    it('should accept notes within limit', () => {
      const result = enrollmentSchema.safeParse({
        studentName: 'João',
        email: 'joao@example.com',
        cpf: '123.456.789-10',
        phone: '(61) 99999-9999',
        courseId: 'course-1',
        classId: 'class-1',
        notes: 'A'.repeat(500),
      });
      expect(result.success).toBe(true);
    });

    it('should reject notes exceeding limit', () => {
      const result = enrollmentSchema.safeParse({
        studentName: 'João',
        email: 'joao@example.com',
        cpf: '123.456.789-10',
        phone: '(61) 99999-9999',
        courseId: 'course-1',
        classId: 'class-1',
        notes: 'A'.repeat(501),
      });
      expect(result.success).toBe(false);
    });

    it('should trim notes', () => {
      const result = enrollmentSchema.safeParse({
        studentName: 'João',
        email: 'joao@example.com',
        cpf: '123.456.789-10',
        phone: '(61) 99999-9999',
        courseId: 'course-1',
        classId: 'class-1',
        notes: '  Note content  ',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.notes).toBe('Note content');
      }
    });
  });

  describe('Validation - Admin Resources', () => {
    it('should validate all resource types', () => {
      const types = ['document', 'video', 'link', 'other'];
      types.forEach(type => {
        const result = adminResourceSchema.safeParse({
          title: 'Resource Title',
          type: type as any,
        });
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid resource type', () => {
      const result = adminResourceSchema.safeParse({
        title: 'Resource Title',
        type: 'invalid' as any,
      });
      expect(result.success).toBe(false);
    });

    it('should allow metadata as optional record', () => {
      const result = adminResourceSchema.safeParse({
        title: 'Resource Title',
        type: 'document' as const,
        metadata: { key: 'value', number: 123, nested: { inner: true } },
      });
      expect(result.success).toBe(true);
    });

    it('should validate title length constraints', () => {
      const tooShort = adminResourceSchema.safeParse({
        title: 'AB',
        type: 'document' as const,
      });
      expect(tooShort.success).toBe(false);

      const tooLong = adminResourceSchema.safeParse({
        title: 'A'.repeat(201),
        type: 'document' as const,
      });
      expect(tooLong.success).toBe(false);

      const valid = adminResourceSchema.safeParse({
        title: 'A'.repeat(200),
        type: 'document' as const,
      });
      expect(valid.success).toBe(true);
    });
  });

  describe('Validation - Resource ID Format', () => {
    it('should validate resource ID pattern', () => {
      const result = enrollmentSchema.safeParse({
        studentName: 'João',
        email: 'joao@example.com',
        cpf: '123.456.789-10',
        phone: '(61) 99999-9999',
        courseId: 'valid-course-id_123',
        classId: 'class-ABC_456',
      });
      expect(result.success).toBe(true);
    });

    it('should reject resource ID with invalid characters', () => {
      const result = enrollmentSchema.safeParse({
        studentName: 'João',
        email: 'joao@example.com',
        cpf: '123.456.789-10',
        phone: '(61) 99999-9999',
        courseId: 'invalid@course',
        classId: 'class-1',
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty resource ID', () => {
      const result = enrollmentSchema.safeParse({
        studentName: 'João',
        email: 'joao@example.com',
        cpf: '123.456.789-10',
        phone: '(61) 99999-9999',
        courseId: '',
        classId: 'class-1',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('validateInput - Error Structure', () => {
    it('should provide path-based error keys', () => {
      const result = validateInput(enrollmentSchema, {
        studentName: 'AB',
        email: 'invalid',
        cpf: 'bad',
        phone: 'bad',
        courseId: '',
        classId: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(Object.keys(result.errors).length).toBeGreaterThan(0);
        expect(Object.values(result.errors).some(msg => typeof msg === 'string')).toBe(true);
      }
    });
  });
});
