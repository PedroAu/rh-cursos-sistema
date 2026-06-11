import * as React from "react";

import { cn } from "@/lib/utils";

type FormFieldRenderProps = {
  fieldId: string;
  descriptionId: string | undefined;
  errorId: string | undefined;
  ariaDescribedBy: string | undefined;
  ariaInvalid: boolean;
};

type FormFieldProps = {
  children: (props: FormFieldRenderProps) => React.ReactNode;
  className?: string;
  error?: string;
  hint?: string;
  id?: string;
  label: string;
  required?: boolean;
};

export function FormField({
  children,
  className,
  error,
  hint,
  id,
  label,
  required = false
}: FormFieldProps) {
  const generatedId = React.useId();
  const fieldId = id ?? `field-${generatedId}`;
  const descriptionId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const ariaDescribedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label className="text-label-bold font-semibold uppercase tracking-[0.05em] text-label-primary" htmlFor={fieldId}>
        {label}
        {required ? <span className="ml-1 text-danger">*</span> : null}
      </label>
      {children({
        fieldId,
        descriptionId,
        errorId,
        ariaDescribedBy,
        ariaInvalid: Boolean(error)
      })}
      {hint ? (
        <p className="text-sm leading-6 text-label-secondary" id={descriptionId}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="text-sm leading-6 text-danger" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
