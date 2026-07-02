import * as React from "react";
import { Check, Minus } from "lucide-react";

import { cn } from "@/lib/utils";

type CheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> & {
  indeterminate?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, indeterminate, onCheckedChange, disabled, ...props }, ref) => (
    <label className={cn("inline-flex cursor-pointer items-center", disabled && "cursor-not-allowed opacity-50")}>
      <input
        ref={ref}
        type="checkbox"
        className="sr-only"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onCheckedChange?.(event.target.checked)}
        {...props}
      />
      <span
        className={cn(
          "flex h-5 w-5 items-center justify-center rounded-tk-input border border-tk-line bg-tk-surface text-tk-surface transition duration-200 ease-[var(--tk-ease)] ring-offset-tk-surface focus-within:ring-2 focus-within:ring-tk-focus focus-within:ring-offset-2",
          (checked || indeterminate) && "border-tk-brand bg-tk-brand",
          className
        )}
      >
        {indeterminate ? <Minus className="h-3.5 w-3.5" aria-hidden="true" /> : null}
        {checked && !indeterminate ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : null}
      </span>
    </label>
  )
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
