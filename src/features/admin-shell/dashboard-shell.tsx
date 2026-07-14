"use client";

import type { ReactNode } from "react";

import type { DashboardRole } from "@/lib/auth";
import { AdminBottomNavigation } from "@/features/admin-shell/components/admin-bottom-navigation";
import { AdminSidebar } from "@/features/admin-shell/components/admin-sidebar";
import { AdminTopbar } from "@/features/admin-shell/components/admin-topbar";
import { useDisclosure } from "@/hooks/use-disclosure";
import { Outlet } from "@/lib/router-compat";

export function DashboardShell({ role, children }: { role: DashboardRole; children?: ReactNode }) {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure(false);

  return (
    <>
      <div className="min-h-screen bg-tk-surface-2 text-tk-ink">
        <AdminSidebar role={role} />
        <AdminTopbar opened={mobileOpened} onToggle={toggleMobile} role={role} />

        <main className="pb-[88px] pt-[72px] lg:pb-0 lg:pl-[248px]">
          <div className="px-4 py-6 lg:px-8">{children ?? <Outlet />}</div>
        </main>
      </div>

      <AdminBottomNavigation role={role} />
    </>
  );
}
