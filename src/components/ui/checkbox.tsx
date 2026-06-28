import React from "react";
import { Check, Minus } from "lucide-react";

import { cn } from "@/lib/utils";

type CheckboxProps = {
  checked?: boolean;
  indeterminate?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  "aria-label"?: string;
  disabled?: boolean;
};

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ checked, indeterminate, onCheckedChange, "aria-label": ariaLabel, disabled }, ref) => (
    <label className="flex items-center gap-2 cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          ref={ref}
          className="sr-only"
          checked={checked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          aria-label={ariaLabel}
          disabled={disabled}
        />
        <div
          className={cn(
            "h-5 w-5 rounded border-2 border-outline-variant bg-white transition-all duration-200",
            (checked || indeterminate) && "border-primary bg-primary",
            disabled && "cursor-not-allowed opacity-50"
          )}
        >
          {checked && !indeterminate && (
            <Check className="h-4 w-4 text-white absolute top-0.5 left-0.5" />
          )}
          {indeterminate && (
            <Minus className="h-4 w-4 text-white absolute top-0.5 left-0.5" />
          )}
        </div>
      </div>
    </label>
  )
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
