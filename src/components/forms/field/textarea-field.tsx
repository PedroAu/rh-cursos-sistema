import type { ComponentProps } from "react";

import { Textarea } from "@/components/ui/textarea";

import { FieldShell, fieldDescribedBy, type FieldMeta } from "./field-shell";

type TextareaFieldProps = Omit<ComponentProps<typeof Textarea>, "id"> &
  FieldMeta & {
    id?: string;
  };

export function TextareaField({
  id,
  label,
  description,
  error,
  required,
  className,
  name,
  ...props
}: TextareaFieldProps) {
  const inputId = id ?? name ?? label;

  return (
    <FieldShell description={description} error={error} id={inputId} label={label} required={required}>
      <Textarea
        aria-describedby={fieldDescribedBy(inputId, { description, error })}
        aria-invalid={error ? true : undefined}
        aria-required={required || undefined}
        className={className}
        id={inputId}
        name={name}
        required={required}
        {...props}
      />
    </FieldShell>
  );
}
