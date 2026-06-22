'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { FieldShell } from './field-shell';

interface FieldMeta {
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
}

export interface NumberFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'id' | 'type'>,
    FieldMeta {
  id?: string;
  min?: number;
  max?: number;
  step?: number;
}

export const NumberField = React.forwardRef<HTMLInputElement, NumberFieldProps>(
  (
    {
      id: providedId,
      label,
      description,
      error,
      required,
      className,
      name,
      min = 0,
      max,
      step = 1,
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
        <Input
          ref={ref}
          id={id}
          name={name}
          type="number"
          min={min}
          max={max}
          step={step}
          aria-describedby={[
            description ? descriptionId : null,
            error ? errorId : null,
          ]
            .filter(Boolean)
            .join(' ') || undefined}
          {...(error && { 'aria-invalid': true })}
          aria-required={required || undefined}
          className={className}
          {...inputProps}
        />
      </FieldShell>
    );
  },
);

NumberField.displayName = 'NumberField';
