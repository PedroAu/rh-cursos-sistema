import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { FieldShell, fieldDescribedBy, type FieldMeta } from "./field-shell";

export type SelectOption = {
  value: string;
  label: string;
};

type SelectFieldProps = FieldMeta & {
  id?: string;
  name: string;
  options: SelectOption[];
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

export function SelectField({
  id,
  name,
  label,
  options,
  defaultValue,
  placeholder = "Selecione",
  description,
  error,
  required,
  disabled,
  className,
}: SelectFieldProps) {
  const inputId = id ?? name;

  return (
    <FieldShell
      className={className}
      description={description}
      error={error}
      id={inputId}
      label={label}
      required={required}
    >
      <Select defaultValue={defaultValue} disabled={disabled} name={name} required={required}>
        <SelectTrigger
          aria-describedby={fieldDescribedBy(inputId, { description, error })}
          aria-invalid={error ? true : undefined}
          aria-required={required || undefined}
          id={inputId}
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
      </Select>
    </FieldShell>
  );
}
