import * as React from "react";

import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-[120px] w-full rounded-[var(--form-input-radius)] border border-[var(--form-input-border)] bg-[var(--form-input-bg)] px-[var(--form-input-padding-inline)] py-[var(--form-input-padding-block)] text-[var(--form-input-font-size)] text-[var(--form-input-color)] shadow-sm outline-none transition placeholder:text-muted-foreground hover:border-[var(--form-input-border-hover)] focus-visible:border-[var(--form-input-border-focus)] focus-visible:ring-[var(--form-input-focus-ring)] focus-visible:ring-[var(--form-input-focus-ring-color)]",
      className
    )}
    {...props}
  />
));

Textarea.displayName = "Textarea";
