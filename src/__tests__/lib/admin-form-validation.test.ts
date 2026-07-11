import { describe, it, expect } from 'vitest';
import {
  validateCourse,
  validateClass,
  validateStudent,
  validateLead,
  validateEnrollment,
  validateInstructor,
  validateBlogPost,
  getErrorMessage,
  getErrorsForDisplay,
  type ValidationError,
} from '@/lib/admin-form-validation';

const validCourse: Record<string, string> = {
  title: 'Curso de DP',
  pathId: 'path-1',
  modality: 'Ao vivo online',
  durationLabel: '8h',
  price: '1000',
  level: 'Básico',
  status: 'published',
  shortDescription: 'Resumo',
  fullDescription: 'Descrição completa do curso',
};

describe('validateCourse', () => {
  it('returns valid for a complete course form', () => {
    const result = validateCourse(validCourse);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('flags a missing title', () => {
    const result = validateCourse({ ...validCourse, title: '' });
    expect(result.valid).toBe(false);
    expect(getErrorMessage(result.errors, 'title')).toBe('Nome do curso é obrigatório');
  });

  it('flags a missing training path', () => {
    const result = validateCourse({ ...validCourse, pathId: '' });
    expect(getErrorMessage(result.errors, 'pathId')).toBeDefined();
  });

  it('accepts modalities when modality is absent', () => {
    const { modality: _omit, ...rest } = validCourse;
    void _omit;
    const result = validateCourse({ ...rest, modalities: 'Ao vivo online' });
    expect(getErrorMessage(result.errors, 'modalities')).toBeUndefined();
  });

  it('flags when neither modality nor modalities is provided', () => {
    const { modality: _omit, ...rest } = validCourse;
    void _omit;
    const result = validateCourse(rest);
    expect(getErrorMessage(result.errors, 'modalities')).toBeDefined();
  });

  it('rejects a non-numeric price', () => {
    const result = validateCourse({ ...validCourse, price: 'abc' });
    expect(getErrorMessage(result.errors, 'price')).toContain('número válido');
  });

  it('rejects a negative price', () => {
    const result = validateCourse({ ...validCourse, price: '-5' });
    expect(getErrorMessage(result.errors, 'price')).toContain('número válido');
  });

  it('accepts a zero price', () => {
    const result = validateCourse({ ...validCourse, price: '0' });
    expect(getErrorMessage(result.errors, 'price')).toBeUndefined();
  });

  it('rejects malformed JSON in categories', () => {
    const result = validateCourse({ ...validCourse, categories: '{not json' });
    expect(getErrorMessage(result.errors, 'categories')).toBe('Formato inválido nas categorias');
  });

  it('rejects categories that parse to a non-array', () => {
    const result = validateCourse({ ...validCourse, categories: '{"a":1}' });
    expect(getErrorMessage(result.errors, 'categories')).toContain('array válido');
  });

  it('ignores empty-array sentinel for categories', () => {
    const result = validateCourse({ ...validCourse, categories: '[]' });
    expect(getErrorMessage(result.errors, 'categories')).toBeUndefined();
  });

  it('rejects malformed JSON in objectives', () => {
    const result = validateCourse({ ...validCourse, objectives: 'oops' });
    expect(getErrorMessage(result.errors, 'objectives')).toContain('JSON inválido');
  });

  it('rejects malformed JSON in benefits', () => {
    const result = validateCourse({ ...validCourse, benefits: 'oops' });
    expect(getErrorMessage(result.errors, 'benefits')).toContain('JSON inválido');
  });

  it('validates module fields when modules are present', () => {
    const result = validateCourse(validCourse, [
      { title: '', description: '', topics: [], duration: '' },
    ]);
    const moduleErrors = result.errors.filter((e) => e.field === 'modules');
    expect(moduleErrors.length).toBeGreaterThanOrEqual(4);
  });

  it('accepts a fully-filled module', () => {
    const result = validateCourse(validCourse, [
      { title: 'Mod 1', description: 'desc', topics: ['t1'], duration: '2h' },
    ]);
    expect(result.errors.some((e) => e.field === 'modules')).toBe(false);
  });
});

describe('validateClass', () => {
  const validClass: Record<string, string> = {
    courseId: 'course-1',
    startDate: '2026-01-10',
    endDate: '2026-01-20',
    modality: 'Ao vivo online',
    status: 'open',
    time: '19h',
    totalSeats: '30',
  };

  it('returns valid for a complete class form', () => {
    expect(validateClass(validClass).valid).toBe(true);
  });

  it('rejects an end date before the start date', () => {
    const result = validateClass({ ...validClass, endDate: '2026-01-05' });
    expect(getErrorMessage(result.errors, 'endDate')).toContain('posterior');
  });

  it('rejects an invalid start date', () => {
    const result = validateClass({ ...validClass, startDate: 'not-a-date' });
    expect(getErrorMessage(result.errors, 'startDate')).toContain('inválida');
  });

  it('requires a location for in-person classes', () => {
    const result = validateClass({
      ...validClass,
      modality: 'Presencial',
      location: '',
    });
    expect(getErrorMessage(result.errors, 'location')).toBeDefined();
  });

  it('rejects negative total seats', () => {
    const result = validateClass({ ...validClass, totalSeats: '-1' });
    expect(getErrorMessage(result.errors, 'totalSeats')).toBeDefined();
  });

  it('rejects invalid manual filled seats when provided', () => {
    const result = validateClass({ ...validClass, manualFilledSeats: 'x' });
    expect(getErrorMessage(result.errors, 'manualFilledSeats')).toBeDefined();
  });
});

describe('validateStudent', () => {
  it('returns valid for a complete student form', () => {
    const result = validateStudent({
      name: 'Ana',
      email: 'ana@example.com',
      organization: 'ACME',
      enrollmentStatus: 'active',
    });
    expect(result.valid).toBe(true);
  });

  it('rejects an invalid email', () => {
    const result = validateStudent({
      name: 'Ana',
      email: 'ana-at-example',
      organization: 'ACME',
      enrollmentStatus: 'active',
    });
    expect(getErrorMessage(result.errors, 'email')).toBe('Email inválido');
  });

  it('flags a missing organization', () => {
    const result = validateStudent({
      name: 'Ana',
      email: 'ana@example.com',
      organization: '',
      enrollmentStatus: 'active',
    });
    expect(getErrorMessage(result.errors, 'organization')).toBeDefined();
  });
});

describe('validateLead', () => {
  it('returns valid for a complete lead form', () => {
    const result = validateLead({
      name: 'Ana',
      email: 'ana@example.com',
      type: 'Contato',
      courseInterest: 'DP',
      origin: 'Site',
      status: 'Novo',
    });
    expect(result.valid).toBe(true);
  });

  it('flags multiple missing required fields', () => {
    const result = validateLead({ name: '', email: '' });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(4);
  });
});

describe('validateEnrollment', () => {
  it('requires a status', () => {
    expect(validateEnrollment({ status: '' }).valid).toBe(false);
    expect(validateEnrollment({ status: 'active' }).valid).toBe(true);
  });
});

describe('validateInstructor', () => {
  it('requires a name', () => {
    expect(validateInstructor({ name: '' }).valid).toBe(false);
  });

  it('allows an absent email', () => {
    expect(validateInstructor({ name: 'Carlos' }).valid).toBe(true);
  });

  it('rejects an invalid email when provided', () => {
    const result = validateInstructor({ name: 'Carlos', email: 'bad' });
    expect(getErrorMessage(result.errors, 'email')).toBe('Email inválido');
  });
});

describe('validateBlogPost', () => {
  const validPost: Record<string, string> = {
    title: 'Título',
    category: 'RH',
    author: 'Equipe',
    status: 'draft',
    summary: 'Um resumo com mais de vinte caracteres.',
    content: 'C'.repeat(150),
  };

  it('returns valid for a complete blog post', () => {
    expect(validateBlogPost(validPost).valid).toBe(true);
  });

  it('rejects a summary shorter than 20 characters', () => {
    const result = validateBlogPost({ ...validPost, summary: 'curto' });
    expect(getErrorMessage(result.errors, 'summary')).toContain('20 caracteres');
  });

  it('rejects content shorter than 100 characters', () => {
    const result = validateBlogPost({ ...validPost, content: 'curto' });
    expect(getErrorMessage(result.errors, 'content')).toContain('100 caracteres');
  });
});

describe('getErrorMessage', () => {
  it('returns the message for a matching field', () => {
    const errors: ValidationError[] = [{ field: 'title', message: 'obrigatório' }];
    expect(getErrorMessage(errors, 'title')).toBe('obrigatório');
  });

  it('returns undefined when no field matches', () => {
    expect(getErrorMessage([], 'title')).toBeUndefined();
  });
});

describe('getErrorsForDisplay', () => {
  it('maps errors to a field-keyed object', () => {
    const errors: ValidationError[] = [
      { field: 'title', message: 'A' },
      { field: 'price', message: 'B' },
    ];
    expect(getErrorsForDisplay(errors)).toEqual({ title: 'A', price: 'B' });
  });

  it('keeps only the first message per field', () => {
    const errors: ValidationError[] = [
      { field: 'modules', message: 'first' },
      { field: 'modules', message: 'second' },
    ];
    expect(getErrorsForDisplay(errors)).toEqual({ modules: 'first' });
  });
});
