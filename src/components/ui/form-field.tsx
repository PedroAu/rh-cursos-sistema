import * as React from "react";
import { TextInput, Select, Textarea, MultiSelect } from "@mantine/core";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

type FormFieldRenderProps = {
  fieldId: string;
  descriptionId: string | undefined;
  errorId: string | undefined;
  ariaDescribedBy: string | undefined;
  ariaInvalid: boolean;
};

// CVA wrapper for consistent styling across variants
const formFieldVariants = cva("flex flex-col gap-2", {
  variants: {
    size: {
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg"
    }
  },
  defaultVariants: {
    size: "md"
  }
});

type FormFieldProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> &
  VariantProps<typeof formFieldVariants> & {
    children: (props: FormFieldRenderProps) => React.ReactNode;
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
  required = false,
  size = "md"
}: FormFieldProps) {
  const generatedId = React.useId();
  const fieldId = id ?? `field-${generatedId}`;
  const descriptionId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const ariaDescribedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn(formFieldVariants({ size }), className)}>
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

// Mantine-based convenience components
export const MantineFormFieldText = React.forwardRef<
  HTMLInputElement,
  {
    label: string;
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    hint?: string;
  }
>(({ label, error, required, hint, onChange, ...props }, ref) => (
  <FormField label={label} error={error} hint={hint} required={required}>
    {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
      <TextInput
        ref={ref}
        id={fieldId}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        onChange={(e) => onChange(e.currentTarget.value)}
        {...props}
      />
    )}
  </FormField>
));
MantineFormFieldText.displayName = "MantineFormFieldText";

export const MantineFormFieldSelect = React.forwardRef<
  HTMLInputElement,
  {
    label: string;
    placeholder?: string;
    value: string;
    onChange: (value: string | null) => void;
    options: Array<{ value: string; label: string }>;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    hint?: string;
  }
>(({ label, options, error, required, hint, ...props }, ref) => (
  <FormField label={label} error={error} hint={hint} required={required}>
    {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
      <Select
        ref={ref}
        id={fieldId}
        data={options}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        {...props}
      />
    )}
  </FormField>
));
MantineFormFieldSelect.displayName = "MantineFormFieldSelect";

export const MantineFormFieldTextarea = React.forwardRef<
  HTMLTextAreaElement,
  {
    label: string;
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    hint?: string;
    minRows?: number;
  }
>(({ label, error, required, hint, minRows = 3, onChange, ...props }, ref) => (
  <FormField label={label} error={error} hint={hint} required={required}>
    {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
      <Textarea
        ref={ref}
        id={fieldId}
        minRows={minRows}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        onChange={(e) => onChange(e.currentTarget.value)}
        {...props}
      />
    )}
  </FormField>
));
MantineFormFieldTextarea.displayName = "MantineFormFieldTextarea";

export const MantineFormFieldMultiSelect = React.forwardRef<
  HTMLInputElement,
  {
    label: string;
    value: string[];
    onChange: (value: string[]) => void;
    options: Array<{ value: string; label: string }>;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    hint?: string;
    placeholder?: string;
  }
>(({ label, options, error, required, hint, ...props }, ref) => (
  <FormField label={label} error={error} hint={hint} required={required}>
    {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
      <MultiSelect
        ref={ref}
        id={fieldId}
        data={options}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        {...props}
      />
    )}
  </FormField>
));
MantineFormFieldMultiSelect.displayName = "MantineFormFieldMultiSelect";
