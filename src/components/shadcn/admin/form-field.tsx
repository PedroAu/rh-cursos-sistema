import type { ComponentProps, ReactNode } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type FieldShellProps = {
  id: string;
  label: string;
  description?: string;
  error?: string;
  children: ReactNode;
  className?: string;
};

export function ShadcnFieldShell({ id, label, description, error, children, className }: FieldShellProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      {error ? <p className="text-xs font-semibold text-destructive">{error}</p> : null}
    </div>
  );
}

type ShadcnTextFieldProps = ComponentProps<typeof Input> & {
  label: string;
  description?: string;
  error?: string;
};

export function ShadcnTextField({ id, label, description, error, className, ...props }: ShadcnTextFieldProps) {
  const inputId = id ?? props.name ?? label;
  return (
    <ShadcnFieldShell description={description} error={error} id={inputId} label={label}>
      <Input aria-invalid={Boolean(error)} className={className} id={inputId} {...props} />
    </ShadcnFieldShell>
  );
}

type ShadcnTextareaFieldProps = ComponentProps<typeof Textarea> & {
  label: string;
  description?: string;
  error?: string;
};

export function ShadcnTextareaField({ id, label, description, error, className, ...props }: ShadcnTextareaFieldProps) {
  const inputId = id ?? props.name ?? label;
  return (
    <ShadcnFieldShell description={description} error={error} id={inputId} label={label}>
      <Textarea aria-invalid={Boolean(error)} className={className} id={inputId} {...props} />
    </ShadcnFieldShell>
  );
}

type ShadcnSelectOption = {
  value: string;
  label: string;
};

type ShadcnSelectFieldProps = {
  id?: string;
  name: string;
  label: string;
  options: ShadcnSelectOption[];
  defaultValue?: string;
  placeholder?: string;
  description?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
};

export function ShadcnSelectField({
  id,
  name,
  label,
  options,
  defaultValue,
  placeholder = "Selecione",
  description,
  error,
  disabled,
  required,
  className,
}: ShadcnSelectFieldProps) {
  const inputId = id ?? name;

  return (
    <ShadcnFieldShell className={className} description={description} error={error} id={inputId} label={label}>
      <Select defaultValue={defaultValue} disabled={disabled} name={name} required={required}>
        <SelectTrigger aria-invalid={Boolean(error)} id={inputId}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </ShadcnFieldShell>
  );
}

type ShadcnCheckboxFieldProps = ComponentProps<typeof Checkbox> & {
  label: string;
  description?: string;
};

export function ShadcnCheckboxField({
  id,
  name,
  label,
  description,
  className,
  ...props
}: ShadcnCheckboxFieldProps) {
  const inputId = id ?? name ?? label;

  return (
    <div className={cn("flex items-start gap-3 rounded-sm border border-border bg-background p-3", className)}>
      <Checkbox id={inputId} name={name} {...props} />
      <div className="grid gap-1.5 leading-none">
        <Label className="cursor-pointer" htmlFor={inputId}>
          {label}
        </Label>
        {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      </div>
    </div>
  );
}
