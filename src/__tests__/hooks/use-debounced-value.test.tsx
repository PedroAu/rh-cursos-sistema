import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";

import { useDebouncedValue } from "@/hooks/use-debounced-value";

describe("useDebouncedValue", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("keeps the previous value until the user pauses", () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
      initialProps: { value: "" }
    });

    rerender({ value: "curso" });
    expect(result.current).toBe("");

    act(() => vi.advanceTimersByTime(299));
    expect(result.current).toBe("");

    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe("curso");
  });

  it("cancels stale values when the user keeps typing", () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
      initialProps: { value: "c" }
    });

    act(() => vi.advanceTimersByTime(200));
    rerender({ value: "cu" });
    act(() => vi.advanceTimersByTime(200));
    expect(result.current).toBe("c");

    act(() => vi.advanceTimersByTime(100));
    expect(result.current).toBe("cu");
  });
});
