import * as React from "react";
import NextLink from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const linkVariants = cva(
  "inline-flex items-center gap-1 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tk-focus focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        primary: "text-tk-accent hover:text-tk-accent-strong underline underline-offset-2",
        ghost: "text-tk-ink hover:text-tk-accent",
        muted: "text-tk-ink-muted hover:text-tk-ink",
        accent: "text-tk-brand hover:text-tk-brand-hover font-semibold"
      },
      size: {
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md"
    }
  }
);

export interface LinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof linkVariants> {
  href?: string;
  external?: boolean;
}

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, variant, size, href = "#", external = false, children, ...props }, ref) => {
    const Comp = external || !href ? "a" : NextLink;
    const isExternal = external || href?.startsWith("http");

    return (
      <Comp
        href={href}
        className={cn(linkVariants({ variant, size }), className)}
        ref={ref}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);

Link.displayName = "Link";

export { linkVariants };
