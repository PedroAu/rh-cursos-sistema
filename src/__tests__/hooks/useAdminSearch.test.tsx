import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useAdminSearch } from '@/lib/hooks/useAdminSearch';

const items = [
  { id: 1, name: 'Ana' },
  { id: 2, name: 'Bruno' },
  { id: 3, name: 'Carla' },
];

const matchByName = (item: { name: string }, query: string) =>
  item.name.toLowerCase().includes(query.toLowerCase());

describe('useAdminSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns all items before any search', () => {
    const { result } = renderHook(() => useAdminSearch(items, matchByName));
    expect(result.current.results).toHaveLength(3);
    expect(result.current.isSearching).toBe(false);
  });

  it('updates the query immediately but debounces filtering', () => {
    const { result } = renderHook(() => useAdminSearch(items, matchByName));

    act(() => {
      result.current.handleSearch('ana');
    });

    expect(result.current.query).toBe('ana');
    // Debounced query has not settled yet, so results are unfiltered.
    expect(result.current.results).toHaveLength(3);
  });

  it('filters results after the debounce delay elapses', () => {
    const { result } = renderHook(() => useAdminSearch(items, matchByName));

    act(() => {
      result.current.handleSearch('ana');
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.debouncedQuery).toBe('ana');
    expect(result.current.results).toEqual([{ id: 1, name: 'Ana' }]);
  });

  it('respects a custom minChars threshold', () => {
    const { result } = renderHook(() =>
      useAdminSearch(items, matchByName, { minChars: 3 })
    );

    act(() => {
      result.current.handleSearch('an');
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Query is shorter than minChars, so all items are returned.
    expect(result.current.results).toHaveLength(3);
  });

  it('clears the query and restores all items', () => {
    const { result } = renderHook(() => useAdminSearch(items, matchByName));

    act(() => {
      result.current.handleSearch('ana');
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    act(() => {
      result.current.clear();
    });

    expect(result.current.query).toBe('');
    expect(result.current.debouncedQuery).toBe('');
    expect(result.current.results).toHaveLength(3);
    expect(result.current.isSearching).toBe(false);
  });

  it('marks isSearching true while a query is present', () => {
    const { result } = renderHook(() => useAdminSearch(items, matchByName));

    act(() => {
      result.current.handleSearch('b');
    });

    expect(result.current.isSearching).toBe(true);
  });
});
