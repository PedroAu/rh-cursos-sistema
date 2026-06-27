import { describe, it, expect } from 'vitest';
import { getInitials } from '@/lib/get-initials';

describe('getInitials', () => {
  it('returns "?" when name is empty', () => {
    expect(getInitials('')).toBe('?');
  });

  it('returns "?" when name is only whitespace', () => {
    expect(getInitials('   ')).toBe('?');
  });

  it('returns first two uppercase letters for a single name', () => {
    expect(getInitials('Maria')).toBe('MA');
  });

  it('uppercases a short single name without padding', () => {
    expect(getInitials('Jo')).toBe('JO');
  });

  it('handles a single-character name', () => {
    expect(getInitials('A')).toBe('A');
  });

  it('returns first and last initials for two names', () => {
    expect(getInitials('Maria Silva')).toBe('MS');
  });

  it('uses first and last names when there are middle names', () => {
    expect(getInitials('Maria da Silva Santos')).toBe('MS');
  });

  it('collapses multiple spaces between names', () => {
    expect(getInitials('Maria    Silva')).toBe('MS');
  });

  it('trims leading and trailing whitespace', () => {
    expect(getInitials('  Pedro Augusto  ')).toBe('PA');
  });

  it('always returns uppercase initials', () => {
    expect(getInitials('joão pereira')).toBe('JP');
  });
});
