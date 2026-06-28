import * as React from "react";

import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-input border border-surface-neutral bg-surface-white px-4 py-3 text-sm text-text-primary shadow-sm outline-none transition placeholder:text-text-secondary hover:border-bright-blue focus-visible:border-bright-blue focus-visible:ring-2 focus-visible:ring-bright-blue focus-visible:ring-offset-1",
        className
      )}
      {...props}
    />
  )
);

Input.displayName = "Input";
