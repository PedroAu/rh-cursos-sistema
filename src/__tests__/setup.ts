import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { webcrypto } from 'crypto';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock environment variables (vitest automatically sets NODE_ENV=test)

// Mock IntersectionObserver
interface MockIntersectionObserverInit {
  observe: ReturnType<typeof vi.fn>;
  unobserve: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
}

global.IntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
})) as unknown as typeof IntersectionObserver;

// Mock ResizeObserver
interface MockResizeObserverInit {
  observe: ReturnType<typeof vi.fn>;
  unobserve: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
}

global.ResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
})) as unknown as typeof ResizeObserver;

// Mock crypto API for auth tests
if (!global.crypto) {
  global.crypto = webcrypto as unknown as Crypto;
}

// Mock fetch if needed
if (!global.fetch) {
  global.fetch = vi.fn() as unknown as typeof fetch;
}
