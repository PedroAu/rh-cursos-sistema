import "@testing-library/jest-dom/vitest";
import React from "react";
import { vi } from "vitest";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

class IntersectionObserverMock {
  root = null;
  rootMargin = "";
  thresholds = [];
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

vi.stubGlobal("ResizeObserver", ResizeObserverMock);
vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);

Object.defineProperty(window.HTMLElement.prototype, "scrollIntoView", {
  writable: true,
  value: vi.fn(),
});

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) =>
    React.createElement("a", { href, ...props }, children),
}));

export const mockedUsePathname = vi.fn(() => "/");
export const mockedUseSearchParams = vi.fn(() => new URLSearchParams());
export const mockedRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
  refresh: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
};

vi.mock("next/navigation", () => ({
  usePathname: () => mockedUsePathname(),
  useSearchParams: () => mockedUseSearchParams(),
  useRouter: () => mockedRouter,
}));
