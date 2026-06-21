import type { ReactNode } from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * Metadados comuns a todas as variantes de campo. Substitui tanto os
 * `Field`/`TextareaField` inline dos forms públicos quanto os `Shadcn*Field`.
 * Ver docs/architecture/form-system-evolution.md §4.
 */
export type FieldMeta = {
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
};

export function fieldDescriptionId(id: string): string {
  return `${id}-description`;
}

export function fieldErrorId(id: string): string {
  return `${id}-error`;
}

/**
 * Calcula o `aria-describedby` do control ligando descrição e/ou erro.
 * As variantes chamam isto para passar o atributo ao átomo (Opção 1 da spec —
 * prop explícita, sem cloneElement). Retorna `undefined` quando não há nada
 * a descrever (React omite o atributo).
 */
export function fieldDescribedBy(
  id: string,
  { description, error }: Pick<FieldMeta, "description" | "error">,
): string | undefined {
  const ids: string[] = [];

  if (description) {
    ids.push(fieldDescriptionId(id));
  }

  if (error) {
    ids.push(fieldErrorId(id));
  }

  return ids.length > 0 ? ids.join(" ") : undefined;
}

type FieldShellProps = FieldMeta & {
  id: string;
  children: ReactNode;
  className?: string;
};

/**
 * Molécula base: rótulo + control + descrição + erro. Centraliza o indicador
 * de obrigatório e o erro acessível (`role="alert"`, sem `aria-live`
 * redundante — ver spec §4.1).
 */
export function FieldShell({
  id,
  label,
  description,
  error,
  required,
  children,
  className,
}: FieldShellProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>
        {label}
        {required ? (
          <span className="text-destructive">
            <span aria-hidden> *</span>
            <span className="sr-only"> obrigatório</span>
          </span>
        ) : null}
      </Label>
      {children}
      {description ? (
        <p className="text-xs text-muted-foreground" id={fieldDescriptionId(id)}>
          {description}
        </p>
      ) : null}
      {error ? (
        <p className="text-xs font-semibold text-destructive" id={fieldErrorId(id)} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
