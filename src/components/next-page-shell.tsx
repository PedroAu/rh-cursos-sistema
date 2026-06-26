"use client";

import { Suspense, type ReactNode } from "react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PublicLayout } from "@/components/layout/public-layout";
import { AppStoreProvider, type AppStoreInitialData } from "@/lib/app-store";
import type { CurrentSession } from "@/types";

export function PublicPageShell({
  children,
  initialData
}: {
  children: ReactNode;
  initialData?: AppStoreInitialData;
}) {
  return (
    <AppStoreProvider initialData={initialData}>
      <Suspense fallback={null}>
        <PublicLayout>{children}</PublicLayout>
      </Suspense>
    </AppStoreProvider>
  );
}

export function DashboardPageShell({
  role,
  initialSession,
  children
}: {
  role: "admin";
  initialSession: CurrentSession;
  children: ReactNode;
}) {
  return (
    <AppStoreProvider initialSession={initialSession}>
      <Suspense fallback={null}>
        <DashboardShell role={role}>{children}</DashboardShell>
      </Suspense>
    </AppStoreProvider>
  );
}
