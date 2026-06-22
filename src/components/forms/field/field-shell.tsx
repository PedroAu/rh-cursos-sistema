'use client';

import React from 'react';

export interface FieldShellProps {
  id: string;
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const FieldShell = React.forwardRef<HTMLDivElement, FieldShellProps>(
  (
    {
      id,
      label,
      description,
      error,
      required,
      children,
      className,
    },
    ref,
  ) => {
    const descriptionId = `${id}-description`;
    const errorId = `${id}-error`;

    return (
      <div ref={ref} className={className}>
        <label htmlFor={id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
          {required && (
            <>
              <span aria-hidden className="text-destructive ml-1">
                *
              </span>
              <span className="sr-only">obrigatório</span>
            </>
          )}
        </label>

        <div className="mt-2">
          {children}
        </div>

        {description && !error && (
          <p id={descriptionId} className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}

        {error && (
          <p
            id={errorId}
            role="alert"
            className="text-xs font-semibold text-destructive mt-1"
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);

FieldShell.displayName = 'FieldShell';
