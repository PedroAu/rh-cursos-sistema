'use client';

import React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export interface CheckboxFieldProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  id?: string;
  label: string;
  description?: string;
  error?: string;
  name?: string;
}

export const CheckboxField = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxFieldProps
>(
  (
    {
      id: providedId,
      label,
      description,
      error,
      className,
      name,
      ...checkboxProps
    },
    ref,
  ) => {
    const id = providedId || name || `field-${Math.random().toString(36).slice(2, 9)}`;
    const descriptionId = `${id}-description`;
    const errorId = `${id}-error`;

    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Checkbox
            ref={ref}
            id={id}
            name={name}
            aria-describedby={[
              description ? descriptionId : null,
              error ? errorId : null,
            ]
              .filter(Boolean)
              .join(' ') || undefined}
            {...(error && { 'aria-invalid': true })}
            className={className}
            {...checkboxProps}
          />
          <Label htmlFor={id} className="font-normal cursor-pointer">
            {label}
          </Label>
        </div>

        {description && !error && (
          <p id={descriptionId} className="text-xs text-muted-foreground ml-6">
            {description}
          </p>
        )}

        {error && (
          <p
            id={errorId}
            role="alert"
            className="text-xs font-semibold text-destructive ml-6"
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);

CheckboxField.displayName = 'CheckboxField';
