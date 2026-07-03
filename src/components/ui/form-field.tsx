import * as React from "react";
import * as Popover from "@radix-ui/react-popover";
import { Check, ChevronDown, X } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input, type InputProps } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea, type TextareaProps } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type FormFieldRenderProps = {
  fieldId: string;
  labelId: string;
  descriptionId: string | undefined;
  errorId: string | undefined;
  ariaDescribedBy: string | undefined;
  ariaInvalid: boolean;
};

const formFieldVariants = cva("flex flex-col gap-2", {
  variants: {
    size: {
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

type FormFieldProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children"> &
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
  size = "md",
  ...props
}: FormFieldProps) {
  const generatedId = React.useId();
  const fieldId = id ?? `field-${generatedId}`;
  const labelId = `${fieldId}-label`;
  const descriptionId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const ariaDescribedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn(formFieldVariants({ size }), className)} {...props}>
      <label
        id={labelId}
        className="text-sm font-semibold uppercase tracking-[0.05em] text-tk-ink"
        htmlFor={fieldId}
      >
        {label}
        {required ? <span className="ml-1 text-tk-error">*</span> : null}
      </label>
      {children({
        fieldId,
        labelId,
        descriptionId,
        errorId,
        ariaDescribedBy,
        ariaInvalid: Boolean(error),
      })}
      {hint ? (
        <p className="text-caption text-tk-ink-muted" id={descriptionId}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="text-caption text-tk-error" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type BaseFieldProps = {
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  size?: VariantProps<typeof formFieldVariants>["size"];
};

export const FormFieldText = React.forwardRef<
  HTMLInputElement,
  Omit<InputProps, "label" | "hint" | "error" | "size"> & BaseFieldProps
>(({ label, error, required, hint, size, id, className, ...props }, ref) => (
  <FormField label={label} error={error} hint={hint} required={required} size={size} id={id}>
    {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
      <Input
        ref={ref}
        id={fieldId}
        className={className}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid || undefined}
        {...props}
      />
    )}
  </FormField>
));
FormFieldText.displayName = "FormFieldText";

type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type FormFieldSelectProps = BaseFieldProps &
  Omit<React.ComponentPropsWithoutRef<typeof SelectTrigger>, "children" | "defaultValue" | "value" | "onChange"> & {
    id?: string;
    name?: string;
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    onValueChange?: (value: string) => void;
    options: SelectOption[];
    placeholder?: string;
  };

export function FormFieldSelect({
  label,
  options,
  error,
  required,
  hint,
  size,
  id,
  name,
  value,
  defaultValue,
  onChange,
  onValueChange,
  placeholder = "Selecione uma opcao",
  disabled,
  className,
  ...props
}: FormFieldSelectProps) {
  return (
    <FormField label={label} error={error} hint={hint} required={required} size={size} id={id}>
      {({ fieldId, labelId, ariaDescribedBy, ariaInvalid }) => (
        <Select
          value={value}
          defaultValue={defaultValue}
          disabled={disabled}
          onValueChange={(nextValue) => {
            onValueChange?.(nextValue);
            onChange?.(nextValue);
          }}
        >
          <SelectTrigger
            id={fieldId}
            name={name}
            className={className}
            aria-describedby={ariaDescribedBy}
            aria-labelledby={labelId}
            aria-invalid={ariaInvalid || undefined}
            disabled={disabled}
            {...props}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </FormField>
  );
}

export const FormFieldTextarea = React.forwardRef<
  HTMLTextAreaElement,
  Omit<TextareaProps, "label" | "hint" | "error"> & BaseFieldProps
>(({ label, error, required, hint, size, id, className, ...props }, ref) => (
  <FormField label={label} error={error} hint={hint} required={required} size={size} id={id}>
    {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
      <Textarea
        ref={ref}
        id={fieldId}
        className={className}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid || undefined}
        {...props}
      />
    )}
  </FormField>
));
FormFieldTextarea.displayName = "FormFieldTextarea";

export type FormFieldMultiSelectProps = BaseFieldProps & {
  id?: string;
  name?: string;
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  onValueChange?: (value: string[]) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  emptyMessage?: string;
  triggerClassName?: string;
  contentClassName?: string;
};

export const FormFieldMultiSelect = React.forwardRef<HTMLButtonElement, FormFieldMultiSelectProps>(
  (
    {
      label,
      error,
      required,
      hint,
      size,
      id,
      name,
      value,
      defaultValue = [],
      onChange,
      onValueChange,
      options,
      placeholder = "Selecione uma ou mais opcoes",
      disabled,
      emptyMessage = "Nenhuma opcao encontrada.",
      triggerClassName,
      contentClassName,
    },
    ref
  ) => {
    const [uncontrolledValue, setUncontrolledValue] = React.useState<string[]>(defaultValue);
    const [open, setOpen] = React.useState(false);
    const selectedValues = value ?? uncontrolledValue;

    const handleValueChange = React.useCallback(
      (nextValue: string[]) => {
        if (value === undefined) {
          setUncontrolledValue(nextValue);
        }
        onValueChange?.(nextValue);
        onChange?.(nextValue);
      },
      [onChange, onValueChange, value]
    );

    const selectedOptions = options.filter((option) => selectedValues.includes(option.value));

    return (
      <FormField label={label} error={error} hint={hint} required={required} size={size} id={id}>
        {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
          <Popover.Root open={open} onOpenChange={setOpen}>
            <Popover.Trigger asChild>
              <button
                ref={ref}
                id={fieldId}
                type="button"
                disabled={disabled}
                aria-describedby={ariaDescribedBy}
                className={cn(
                  "group flex min-h-11 w-full items-start justify-between gap-3 rounded-tk-input border border-tk-line bg-tk-surface px-4 py-3 text-left text-sm text-tk-ink outline-none transition duration-200 ease-[var(--tk-ease)] hover:border-tk-accent focus-visible:ring-2 focus-visible:ring-tk-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                  open && "border-tk-accent",
                  ariaInvalid && "border-tk-error",
                  triggerClassName
                )}
              >
                <span className="flex min-h-5 flex-1 flex-wrap items-center gap-2">
                  {selectedOptions.length > 0 ? (
                    selectedOptions.map((option) => (
                      <Badge key={option.value} tone="accent" className="max-w-full pr-1">
                        <span className="truncate">{option.label}</span>
                        <span
                          aria-hidden="true"
                          className="inline-flex h-5 w-5 items-center justify-center rounded-tk-pill hover:bg-[var(--tk-black-5)]"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleValueChange(selectedValues.filter((item) => item !== option.value));
                          }}
                        >
                          <X className="h-3.5 w-3.5" />
                        </span>
                      </Badge>
                    ))
                  ) : (
                    <span className="text-tk-ink-muted">{placeholder}</span>
                  )}
                </span>
                <ChevronDown
                  className={cn(
                    "mt-0.5 h-4 w-4 shrink-0 text-tk-ink-muted transition-transform duration-200",
                    open && "rotate-180"
                  )}
                />
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                align="start"
                sideOffset={8}
                className={cn(
                  "z-50 w-[var(--radix-popover-trigger-width)] rounded-tk-glass border border-tk-line bg-tk-surface p-2 shadow-tk-card",
                  contentClassName
                )}
              >
                <div className="max-h-72 space-y-1 overflow-y-auto">
                  {options.length > 0 ? (
                    options.map((option) => {
                      const checked = selectedValues.includes(option.value);
                      return (
                        <label
                          key={option.value}
                          className={cn(
                            "flex cursor-pointer items-start gap-3 rounded-tk-md px-3 py-2 text-sm text-tk-ink transition-colors duration-200 ease-[var(--tk-ease)] hover:bg-tk-accent-soft",
                            option.disabled && "cursor-not-allowed opacity-50"
                          )}
                        >
                          <Checkbox
                            checked={checked}
                            disabled={disabled || option.disabled}
                            onCheckedChange={(nextChecked) => {
                              if (!nextChecked) {
                                handleValueChange(selectedValues.filter((item) => item !== option.value));
                                return;
                              }
                              handleValueChange([...selectedValues, option.value]);
                            }}
                          />
                          <span className="flex-1">{option.label}</span>
                          {checked ? <Check className="mt-0.5 h-4 w-4 text-tk-accent-strong" /> : null}
                        </label>
                      );
                    })
                  ) : (
                    <p className="px-3 py-2 text-sm text-tk-ink-muted">{emptyMessage}</p>
                  )}
                </div>
                {name ? (
                  <div className="hidden">
                    {selectedValues.map((selectedValue) => (
                      <input key={selectedValue} type="hidden" name={name} value={selectedValue} />
                    ))}
                  </div>
                ) : null}
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        )}
      </FormField>
    );
  }
);
FormFieldMultiSelect.displayName = "FormFieldMultiSelect";

export const MantineFormFieldText = FormFieldText;
export const MantineFormFieldSelect = FormFieldSelect;
export const MantineFormFieldTextarea = FormFieldTextarea;
export const MantineFormFieldMultiSelect = FormFieldMultiSelect;
