import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const alertVariants = cva("relative w-full rounded-md border p-4 text-sm", {
  variants: {
    variant: {
      default: "border-border bg-background text-foreground",
      destructive: "border-destructive/50 text-destructive",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

function Alert({ className, variant, ...props }: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>) {
  return <div className={cn(alertVariants({ variant }), className)} role="alert" {...props} />;
}

function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h5 className={cn("mb-1 font-semibold leading-none tracking-tight", className)} {...props} />;
}

function AlertDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <div className={cn("text-sm opacity-90", className)} {...props} />;
}

export { Alert, AlertTitle, AlertDescription };
