import type * as React from "react";

import { Loader2, Search, X } from "lucide-react";
import { forwardRef, useId } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SearchInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  clearLabel?: string;
  loading?: boolean;
  onClear?: () => void;
  resultsLabel?: string;
};

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      className,
      clearLabel = "Limpar busca",
      loading = false,
      onClear,
      resultsLabel,
      value,
      ...props
    },
    ref
  ) => {
    const helperId = useId();
    const hasValue = typeof value === "string" ? value.length > 0 : false;
    const describedBy = [props["aria-describedby"], resultsLabel ? helperId : undefined]
      .filter(Boolean)
      .join(" ") || undefined;

    return (
      <div className="space-y-2">
        <div className="relative" role="search">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-tk-ink-muted" />
          <Input
            ref={ref}
            className={cn(hasValue || loading ? "pl-11 pr-24" : "pl-11", className)}
            value={value}
            aria-describedby={describedBy}
            {...props}
          />
          <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin text-tk-ink-muted" aria-hidden="true" /> : null}
            {hasValue && onClear ? (
              <button
                type="button"
                onClick={onClear}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-surface-muted hover:text-tk-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                aria-label={clearLabel}
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>
        {resultsLabel ? (
          <p id={helperId} aria-live="polite" data-testid="search-results-label" className="text-sm leading-6 text-label-secondary">
            {resultsLabel}
          </p>
        ) : null}
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";
