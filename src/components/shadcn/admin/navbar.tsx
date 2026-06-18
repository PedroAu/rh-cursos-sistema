import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ShadcnNavItem = {
  href: string;
  label: string;
  icon?: ReactNode;
  active?: boolean;
};

type ShadcnAdminNavbarProps = {
  title: string;
  subtitle?: string;
  items: ShadcnNavItem[];
  footer?: ReactNode;
};

export function ShadcnAdminNavbar({ title, subtitle, items, footer }: ShadcnAdminNavbarProps) {
  return (
    <aside className="flex h-full min-h-dvh w-72 flex-col border-r border-border bg-brand-navy-900 text-white">
      <div className="border-b border-white/10 p-6">
        <p className="font-heading text-xl font-bold leading-tight">{title}</p>
        {subtitle ? <p className="mt-1 text-sm text-white/70">{subtitle}</p> : null}
      </div>
      <nav aria-label="Navegação administrativa" className="flex-1 space-y-1 p-4">
        {items.map((item) => (
          <Button
            asChild
            className={cn(
              "w-full justify-start text-white hover:bg-white/10 hover:text-white",
              item.active ? "bg-white text-brand-navy-900 hover:bg-white hover:text-brand-navy-900" : "bg-transparent",
            )}
            key={item.href}
            variant="ghost"
          >
            <Link href={item.href}>
              {item.icon}
              {item.label}
            </Link>
          </Button>
        ))}
      </nav>
      {footer ? <div className="border-t border-white/10 p-4">{footer}</div> : null}
    </aside>
  );
}
