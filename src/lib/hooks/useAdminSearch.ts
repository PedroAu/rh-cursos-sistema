import { useCallback, useMemo, useState } from "react";

interface SearchOptions {
  debounceMs?: number;
  minChars?: number;
}

export function useAdminSearch<T>(
  items: T[],
  searchFn: (item: T, query: string) => boolean,
  options: SearchOptions = {}
) {
  const { debounceMs = 300, minChars = 1 } = options;
  const [query, setQuery] = useState("");
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const handleSearch = useCallback(
    (newQuery: string) => {
      setQuery(newQuery);

      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      const timer = setTimeout(() => {
        setDebouncedQuery(newQuery);
      }, debounceMs);

      setDebounceTimer(timer);
    },
    [debounceMs, debounceTimer]
  );

  const results = useMemo(() => {
    if (debouncedQuery.length < minChars) {
      return items;
    }

    return items.filter((item) => searchFn(item, debouncedQuery));
  }, [items, debouncedQuery, minChars, searchFn]);

  const clear = useCallback(() => {
    setQuery("");
    setDebouncedQuery("");
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
  }, [debounceTimer]);

  return {
    query,
    debouncedQuery,
    results,
    handleSearch,
    clear,
    isSearching: query.length > 0
  };
}
