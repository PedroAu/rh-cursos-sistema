import { describe, it, expect } from 'vitest';
import {
  enrollmentSchema,
  userProfileSchema,
  loginSchema,
  courseFilterSchema,
  adminResourceSchema,
  validateInput,
  type EnrollmentInput,
  type UserProfile,
  type LoginInput,
  type CourseFilter,
  type AdminResource,
} from '@/lib/validation';

describe('Validation Schemas', () => {
  describe('enrollmentSchema', () => {
    it('should validate a valid enrollment', () => {
      const validData = {
        studentName: 'João Silva',
        email: 'joao@example.com',
        cpf: '123.456.789-10',
        phone: '(61) 99999-9999',
        courseId: 'course-123',
        classId: 'class-456',
        organization: 'Tech Corp',
        jobTitle: 'Developer',
        enrollmentType: 'Pessoa física' as const,
        notes: 'Some notes',
      };

      const result = enrollmentSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('joao@example.com');
        expect(result.data.studentName).toBe('João Silva');
      }
    });

    it.each([
      'paymentMethod',
      'cardName',
      'cardNumber',
      'cardExpiry',
      'cardCvv',
      'installments',
      'couponCode',
    ])(
      'should reject the unexpected financial field %s',
      (field) => {
        const result = enrollmentSchema.safeParse({
          studentName: 'João Silva',
          email: 'joao@example.com',
          cpf: '123.456.789-10',
          phone: '(61) 99999-9999',
          courseId: 'course-123',
          classId: 'class-456',
          [field]: 'synthetic-value',
        });

        expect(result.success).toBe(false);
      },
    );

    it('should trim student name', () => {
      const data = {
        studentName: '  João Silva  ',
        email: 'joao@example.com',
        cpf: '123.456.789-10',
        phone: '(61) 99999-9999',
        courseId: 'course-123',
        classId: 'class-456',
      };

      const result = enrollmentSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.studentName).toBe('João Silva');
      }
    });

    it('should fail with short student name', () => {
      const data = {
        studentName: 'Jo',
        email: 'joao@example.com',
        cpf: '123.456.789-10',
        phone: '(61) 99999-9999',
        courseId: 'course-123',
        classId: 'class-456',
      };

      const result = enrollmentSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should fail with invalid email', () => {
      const data = {
        studentName: 'João Silva',
        email: 'not-an-email',
        cpf: '123.456.789-10',
        phone: '(61) 99999-9999',
        courseId: 'course-123',
        classId: 'class-456',
      };

      const result = enrollmentSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should fail with invalid CPF format', () => {
      const data = {
        studentName: 'João Silva',
        email: 'joao@example.com',
        cpf: '12345678910',
        phone: '(61) 99999-9999',
        courseId: 'course-123',
        classId: 'class-456',
      };

      const result = enrollmentSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should fail with invalid phone format', () => {
      const data = {
        studentName: 'João Silva',
        email: 'joao@example.com',
        cpf: '123.456.789-10',
        phone: '999999999',
        courseId: 'course-123',
        classId: 'class-456',
      };

      const result = enrollmentSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should have default enrollment type', () => {
      const data = {
        studentName: 'João Silva',
        email: 'joao@example.com',
        cpf: '123.456.789-10',
        phone: '(61) 99999-9999',
        courseId: 'course-123',
        classId: 'class-456',
      };

      const result = enrollmentSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.enrollmentType).toBe('Pessoa física');
      }
    });
  });

  describe('userProfileSchema', () => {
    it('should validate a valid user profile', () => {
      const validData = {
        firstName: 'João',
        lastName: 'Silva',
        email: 'joao@example.com',
        phone: '(61) 99999-9999',
        company: 'Tech Corp',
      };

      const result = userProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should allow optional phone and company', () => {
      const minimalData = {
        firstName: 'João',
        lastName: 'Silva',
        email: 'joao@example.com',
      };

      const result = userProfileSchema.safeParse(minimalData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.phone).toBeUndefined();
        expect(result.data.company).toBeUndefined();
      }
    });

    it('should fail with short first name', () => {
      const data = {
        firstName: 'J',
        lastName: 'Silva',
        email: 'joao@example.com',
      };

      const result = userProfileSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('should validate a valid login', () => {
      const validData = {
        email: 'user@example.com',
        password: 'secure-password-123',
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should fail without password', () => {
      const data = {
        email: 'user@example.com',
        password: '',
      };

      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should convert email to lowercase', () => {
      const data = {
        email: 'USER@EXAMPLE.COM',
        password: 'password',
      };

      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('user@example.com');
      }
    });
  });

  describe('courseFilterSchema', () => {
    it('should validate with all optional fields', () => {
      const data = {
        category: 'programming',
        status: 'active' as const,
        instructor: 'John',
        page: 1,
        limit: 10,
      };

      const result = courseFilterSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should allow empty filter object', () => {
      const result = courseFilterSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should fail with negative page', () => {
      const data = { page: -1 };
      const result = courseFilterSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should fail with limit > 100', () => {
      const data = { limit: 150 };
      const result = courseFilterSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('adminResourceSchema', () => {
    it('should validate a valid resource', () => {
      const data = {
        title: 'Resource Title',
        description: 'Resource description',
        type: 'document' as const,
        url: 'https://example.com/doc',
      };

      const result = adminResourceSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should fail with short title', () => {
      const data = {
        title: 'AB',
        type: 'document' as const,
      };

      const result = adminResourceSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should fail with invalid URL', () => {
      const data = {
        title: 'Valid Title',
        type: 'document' as const,
        url: 'not-a-url',
      };

      const result = adminResourceSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should allow optional url and description', () => {
      const data = {
        title: 'Valid Title',
        type: 'video' as const,
      };

      const result = adminResourceSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('validateInput helper', () => {
    it('should return success with valid data', () => {
      const data = {
        email: 'user@example.com',
        password: 'password',
      };

      const result = validateInput(loginSchema, data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('user@example.com');
      }
    });

    it('should return errors with invalid data', () => {
      const data = {
        email: 'not-an-email',
        password: '',
      };

      const result = validateInput(loginSchema, data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toBeDefined();
        expect(Object.keys(result.errors).length).toBeGreaterThan(0);
      }
    });

    it('should have error messages in Portuguese', () => {
      const data = {
        studentName: 'Jo',
        email: 'joao@example.com',
        cpf: '123.456.789-10',
        phone: '(61) 99999-9999',
        courseId: 'course-123',
        classId: 'class-456',
      };

      const result = validateInput(enrollmentSchema, data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(Object.values(result.errors).some(msg => msg.includes('caracteres'))).toBe(true);
      }
    });
  });
});
