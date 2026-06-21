import type { ComponentProps } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import { fieldDescriptionId } from "./field-shell";

type CheckboxFieldProps = ComponentProps<typeof Checkbox> & {
  label: string;
  description?: string;
};

/**
 * Checkbox Radix: renderiza um input hidden com value `"on"` quando marcado e
 * o omite do FormData quando desmarcado. O schema zod deve modelar o campo como
 * `z.literal("on").optional()` — nunca `z.boolean()`. Ver spec §5.2.
 */
export function CheckboxField({
  id,
  name,
  label,
  description,
  className,
  ...props
}: CheckboxFieldProps) {
  const inputId = id ?? name ?? label;

  return (
    <div className={cn("flex items-start gap-3 rounded-sm border border-border bg-background p-3", className)}>
      <Checkbox
        aria-describedby={description ? fieldDescriptionId(inputId) : undefined}
        id={inputId}
        name={name}
        {...props}
      />
      <div className="grid gap-1.5 leading-none">
        <Label className="cursor-pointer" htmlFor={inputId}>
          {label}
        </Label>
        {description ? (
          <p className="text-xs text-muted-foreground" id={fieldDescriptionId(inputId)}>
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
