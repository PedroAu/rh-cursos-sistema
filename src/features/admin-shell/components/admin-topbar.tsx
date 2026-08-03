"use client";

import { Bell, CircleHelp, Menu } from "lucide-react";

import type { DashboardRole } from "@/lib/auth";
import { ADMIN_MOBILE_DRAWER_ID } from "@/features/admin-shell/components/admin-mobile-drawer";
import { Button } from "@/components/ui/button";

export function AdminTopbar({
  opened,
  onToggle
}: {
  opened: boolean;
  onToggle: () => void;
  role: DashboardRole;
}) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-[72px] items-center gap-3 border-b border-tk-line bg-tk-surface/96 px-4 backdrop-blur-md sm:px-5 lg:left-[248px] lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        aria-expanded={opened}
        aria-controls={ADMIN_MOBILE_DRAWER_ID}
        aria-label="Alternar navegação"
        className="rounded-full lg:hidden"
      >
        <Menu size={20} />
      </Button>

      <div className="flex flex-1 items-center justify-end gap-3">
        <Button
          variant="ghost"
          size="icon"
          disabled
          aria-disabled="true"
          title="Notificações em breve"
          aria-label="Notificações (em breve)"
          className="rounded-full text-tk-ink"
        >
          <Bell size={19} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          disabled
          aria-disabled="true"
          title="Central de ajuda em breve"
          aria-label="Ajuda (em breve)"
          className="rounded-full text-tk-ink"
        >
          <CircleHelp size={19} />
        </Button>
      </div>
    </header>
  );
}
