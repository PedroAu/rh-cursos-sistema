"use client";

import { DashboardPageShell } from "@/components/next-page-shell";
import { AdminResourcePage } from "@/features/admin/resources/admin-resource-page";

export default function Page() {
  return (
    <DashboardPageShell role="admin">
      <AdminResourcePage resource="students" />
    </DashboardPageShell>
  );
}
