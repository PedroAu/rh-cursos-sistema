import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, id, label, hint, error, "aria-describedby": ariaDescribedBy, ...props }, ref) => {
    const reactId = React.useId();
    const textareaId = id ?? reactId;
    const hintId = hint ? `${textareaId}-hint` : undefined;
    const errorId = error ? `${textareaId}-error` : undefined;
    const describedBy = [ariaDescribedBy, hintId, errorId].filter(Boolean).join(" ") || undefined;

    const control = (
      <textarea
        ref={ref}
        id={textareaId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          "flex min-h-[120px] w-full rounded-tk-input border border-tk-line bg-tk-surface px-4 py-3 text-sm text-tk-ink outline-none transition duration-200 ease-[var(--tk-ease)] placeholder:text-tk-ink-muted hover:border-tk-accent focus-visible:ring-2 focus-visible:ring-tk-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-tk-error",
          className
        )}
        {...props}
      />
    );

    if (!label && !hint && !error) return control;

    return (
      <label className="grid gap-2 text-sm font-medium text-tk-ink" htmlFor={textareaId}>
        {label}
        {control}
        {hint ? <span id={hintId} className="text-caption text-tk-ink-muted">{hint}</span> : null}
        {error ? <span id={errorId} className="text-caption text-tk-error">{error}</span> : null}
      </label>
    );
  }
);
Textarea.displayName = "Textarea";
