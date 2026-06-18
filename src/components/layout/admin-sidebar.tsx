"use client";

import {
  IconAdjustments,
  IconBook2,
  IconCalendarEvent,
  IconChartBar,
  IconMessageCircle2,
  IconSchool,
  IconUsers,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { adminNavItems } from "@/lib/site-data";
import { cn } from "@/lib/utils";

const navIcons = [
  IconChartBar,
  IconMessageCircle2,
  IconUsers,
  IconSchool,
  IconBook2,
  IconCalendarEvent,
  IconAdjustments,
];

type AdminSidebarProps = {
  profileLabel: string;
  onNavigate?: () => void;
};

function initialsFromLabel(label: string) {
  return (
    label
      .split(/\s|@/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "A"
  );
}

export function AdminSidebar({ profileLabel, onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex min-h-dvh flex-col bg-brand-navy-900 text-white">
      <div className="space-y-1 border-b border-white/10 p-6">
        <p className="font-heading text-xl font-extrabold leading-tight">
          RH Cursos
        </p>
        <p className="text-sm text-white/65">Painel administrativo</p>
      </div>

      <nav aria-label="Navegação administrativa" className="flex-1 space-y-1 p-4">
        {adminNavItems.map((item, index) => {
          const active = pathname === item.href;
          const Icon = navIcons[index] ?? IconChartBar;

          return (
            <Button
              asChild
              className={cn(
                "h-auto min-h-11 w-full justify-start gap-3 rounded-md px-3 py-2.5 text-left text-white hover:bg-white/10 hover:text-white",
                active && "bg-brand-gold text-brand-navy-900 hover:bg-brand-gold hover:text-brand-navy-900",
              )}
              key={item.href}
              variant="ghost"
            >
              <Link
                aria-current={active ? "page" : undefined}
                href={item.href}
                onClick={onNavigate}
              >
                <span
                  className={cn(
                    "inline-flex size-8 items-center justify-center rounded-md bg-white/10",
                    active && "bg-brand-navy-900/10",
                  )}
                >
                  <Icon aria-hidden size={18} />
                </span>
                <span>{item.label}</span>
              </Link>
            </Button>
          );
        })}
      </nav>

      <div className="p-4">
        <Separator className="mb-4 bg-white/10" />
        <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
          <div className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-gold font-extrabold text-brand-navy-900">
            {initialsFromLabel(profileLabel)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{profileLabel}</p>
            <p className="text-xs text-white/55">Diretoria</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

