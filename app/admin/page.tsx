"use client";

import { DashboardPageShell } from "@/components/next-page-shell";
import { AdminDashboardPage } from "@/views/admin/AdminDashboard";

export default function Page() {
  return (
    <DashboardPageShell role="admin">
      <AdminDashboardPage />
    </DashboardPageShell>
  );
}
