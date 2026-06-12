"use client";

import { AppShell } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import type { ReactNode } from "react";

import { AppToaster } from "@/components/ui/toaster";
import { AdminBottomNavigation } from "@/features/admin-shell/components/admin-bottom-navigation";
import { AdminSidebar } from "@/features/admin-shell/components/admin-sidebar";
import { AdminTopbar } from "@/features/admin-shell/components/admin-topbar";
import { Outlet } from "@/lib/router-compat";

export function DashboardShell({ role, children }: { role: "admin"; children?: ReactNode }) {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure(false);

  return (
    <>
      <AppShell
        header={{ height: 72 }}
        navbar={{
          width: 248,
          breakpoint: "lg",
          collapsed: { mobile: !mobileOpened }
        }}
        padding={0}
        styles={{
          main: {
            background: "#f4f6f9",
            color: "#111827"
          }
        }}
      >
        <AdminTopbar opened={mobileOpened} onToggle={toggleMobile} />
        <AdminSidebar role={role} />

        <AppShell.Main pb={{ base: 88, lg: 0 }}>
          <div style={{ padding: "1.5rem 1rem" }}>
            <div style={{ paddingInline: "clamp(0rem, 1vw, 0.5rem)" }}>{children ?? <Outlet />}</div>
          </div>
        </AppShell.Main>
      </AppShell>

      <AdminBottomNavigation />
      <AppToaster />
    </>
  );
}
