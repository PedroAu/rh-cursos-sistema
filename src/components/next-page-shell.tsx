"use client";

import { Suspense, type ReactNode } from "react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PublicLayout } from "@/components/layout/public-layout";
import { AppStoreProvider } from "@/lib/app-store";

export function PublicPageShell({ children }: { children: ReactNode }) {
  return (
    <AppStoreProvider>
      <Suspense fallback={null}>
        <PublicLayout>{children}</PublicLayout>
      </Suspense>
    </AppStoreProvider>
  );
}

export function DashboardPageShell({
  role,
  children
}: {
  role: "admin";
  children: ReactNode;
}) {
  return (
    <AppStoreProvider>
      <Suspense fallback={null}>
        <DashboardShell role={role}>{children}</DashboardShell>
      </Suspense>
    </AppStoreProvider>
  );
}
