'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { FieldShell } from './field-shell';

interface FieldAdornments {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

interface FieldMeta {
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
}

export interface TextFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'id'>,
    FieldMeta,
    FieldAdornments {
  id?: string;
}

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      id: providedId,
      label,
      description,
      error,
      required,
      leftIcon,
      rightIcon,
      className,
      name,
      ...inputProps
    },
    ref,
  ) => {
    const id = providedId || name || `field-${Math.random().toString(36).slice(2, 9)}`;
    const descriptionId = `${id}-description`;
    const errorId = `${id}-error`;

    return (
      <FieldShell
        id={id}
        label={label}
        description={description}
        error={error}
        required={required}
      >
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
              {leftIcon}
            </div>
          )}
          <Input
            ref={ref}
            id={id}
            name={name}
            type="text"
            aria-describedby={[
              description ? descriptionId : null,
              error ? errorId : null,
            ]
              .filter(Boolean)
              .join(' ') || undefined}
            {...(error && { 'aria-invalid': true })}
            aria-required={required || undefined}
            className={
              (leftIcon ? 'pl-10' : '') +
              (rightIcon ? ' pr-10' : '') +
              (className ? ` ${className}` : '')
            }
            {...inputProps}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>
      </FieldShell>
    );
  },
);

TextField.displayName = 'TextField';
