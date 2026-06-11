import * as React from "react";

import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-12 w-full rounded-[var(--ea-control-radius)] border border-input bg-white/95 px-4 py-2 text-sm shadow-sm outline-none transition placeholder:text-muted-foreground focus-visible:border-[var(--ea-focus)] focus-visible:ring-2 focus-visible:ring-[var(--ea-focus-ring)]",
        className
      )}
      {...props}
    />
  )
);

Input.displayName = "Input";
