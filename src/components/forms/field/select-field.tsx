'use client';

import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FieldShell } from './field-shell';

interface Option {
  value: string;
  label: string;
}

interface FieldMeta {
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
}

export interface SelectFieldProps extends FieldMeta {
  id?: string;
  name: string;
  options: Option[];
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export const SelectField = React.forwardRef<HTMLDivElement, SelectFieldProps>(
  (
    {
      id: providedId,
      name,
      label,
      description,
      error,
      required,
      options,
      placeholder,
      value,
      defaultValue,
      onValueChange,
      disabled,
      className,
    },
    ref,
  ) => {
    const id = providedId || name;
    const descriptionId = `${id}-description`;
    const errorId = `${id}-error`;
    const [internalValue, setInternalValue] = React.useState(
      value || defaultValue || '',
    );

    const displayValue = value !== undefined ? value : internalValue;

    const handleValueChange = (newValue: string) => {
      setInternalValue(newValue);
      onValueChange?.(newValue);
    };

    return (
      <FieldShell
        ref={ref}
        id={id}
        label={label}
        description={description}
        error={error}
        required={required}
        className={className}
      >
        <Select
          value={displayValue}
          onValueChange={handleValueChange}
          disabled={disabled}
        >
          <SelectTrigger
            id={id}
            aria-describedby={[
              description ? descriptionId : null,
              error ? errorId : null,
            ]
              .filter(Boolean)
              .join(' ') || undefined}
            {...(error && { 'aria-invalid': true })}
            aria-required={required || undefined}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
          <input type="hidden" name={name} value={displayValue} />
        </Select>
      </FieldShell>
    );
  },
);

SelectField.displayName = 'SelectField';
