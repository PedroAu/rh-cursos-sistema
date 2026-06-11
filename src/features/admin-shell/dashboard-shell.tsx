"use client";

import type { ReactNode } from "react";

import { AdminBottomNavigation } from "@/features/admin-shell/components/admin-bottom-navigation";
import { AdminSidebar } from "@/features/admin-shell/components/admin-sidebar";
import { AdminTopbar } from "@/features/admin-shell/components/admin-topbar";
import { AppToaster } from "@/components/ui/toaster";
import { Outlet } from "@/lib/router-compat";

export function DashboardShell({ role, children }: { role: "admin"; children?: ReactNode }) {
  return (
    <div data-theme="executive" className="min-h-screen bg-background">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <AdminSidebar role={role} />

        <main className="flex-1 pb-24 lg:pb-0">
          <AdminTopbar />
          <div>{children ?? <Outlet />}</div>
        </main>
      </div>

      <AdminBottomNavigation />
      <AppToaster />
    </div>
  );
}
