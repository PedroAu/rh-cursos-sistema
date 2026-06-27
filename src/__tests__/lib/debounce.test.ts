import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { debounce } from '@/lib/debounce';

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not call the function before the delay elapses', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 200);

    debounced();
    vi.advanceTimersByTime(199);

    expect(fn).not.toHaveBeenCalled();
  });

  it('calls the function once after the delay elapses', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 200);

    debounced();
    vi.advanceTimersByTime(200);

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('only fires once for rapid successive calls', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 200);

    debounced();
    debounced();
    debounced();
    vi.advanceTimersByTime(200);

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('resets the timer on each new call', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 200);

    debounced();
    vi.advanceTimersByTime(150);
    debounced();
    vi.advanceTimersByTime(150);

    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('passes the latest arguments to the function', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced('first');
    debounced('second');
    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledWith('second');
  });

  it('allows the function to fire again after a completed cycle', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced();
    vi.advanceTimersByTime(100);
    debounced();
    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledTimes(2);
  });
});
