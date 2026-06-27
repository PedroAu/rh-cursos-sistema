import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useSimulatedLoading } from '@/hooks/use-simulated-loading';

describe('useSimulatedLoading', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts in a loading state', () => {
    const { result } = renderHook(() => useSimulatedLoading([1]));
    expect(result.current).toBe(true);
  });

  it('clears the loading state after the default duration', () => {
    const { result } = renderHook(() => useSimulatedLoading([1]));

    act(() => {
      vi.advanceTimersByTime(450);
    });

    expect(result.current).toBe(false);
  });

  it('respects a custom duration', () => {
    const { result } = renderHook(() => useSimulatedLoading([1], 1000));

    act(() => {
      vi.advanceTimersByTime(450);
    });
    expect(result.current).toBe(true);

    act(() => {
      vi.advanceTimersByTime(550);
    });
    expect(result.current).toBe(false);
  });

  it('re-enters loading when dependencies change', () => {
    const { result, rerender } = renderHook(
      ({ dep }) => useSimulatedLoading([dep]),
      { initialProps: { dep: 1 } }
    );

    act(() => {
      vi.advanceTimersByTime(450);
    });
    expect(result.current).toBe(false);

    rerender({ dep: 2 });
    expect(result.current).toBe(true);
  });
});
