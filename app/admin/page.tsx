"use client";

import { DashboardPageShell } from "@/components/next-page-shell";
import { AdminDashboardPage } from "@/features/admin/dashboard/admin-dashboard-page";

export default function Page() {
  return (
    <DashboardPageShell role="admin">
      <AdminDashboardPage />
    </DashboardPageShell>
  );
}
