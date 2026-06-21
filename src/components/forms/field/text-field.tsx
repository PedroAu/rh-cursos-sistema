import type { ComponentProps, ReactNode } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { FieldShell, fieldDescribedBy, type FieldMeta } from "./field-shell";

type TextFieldProps = Omit<ComponentProps<typeof Input>, "id"> &
  FieldMeta & {
    id?: string;
    /** Adorno à esquerda do input (ícone). Ver spec §4.3. */
    leftIcon?: ReactNode;
    /** Adorno à direita do input (ícone). Necessário p/ public-enrollment-form. */
    rightIcon?: ReactNode;
  };

export function TextField({
  id,
  label,
  description,
  error,
  required,
  leftIcon,
  rightIcon,
  className,
  name,
  ...props
}: TextFieldProps) {
  const inputId = id ?? name ?? label;
  const hasAdornment = Boolean(leftIcon) || Boolean(rightIcon);

  const input = (
    <Input
      aria-describedby={fieldDescribedBy(inputId, { description, error })}
      aria-invalid={error ? true : undefined}
      aria-required={required || undefined}
      className={cn(leftIcon && "pl-10", rightIcon && "pr-10", className)}
      id={inputId}
      name={name}
      required={required}
      {...props}
    />
  );

  return (
    <FieldShell description={description} error={error} id={inputId} label={label} required={required}>
      {hasAdornment ? (
        <div className="relative">
          {leftIcon ? (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </span>
          ) : null}
          {input}
          {rightIcon ? (
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {rightIcon}
            </span>
          ) : null}
        </div>
      ) : (
        input
      )}
    </FieldShell>
  );
}
