"use client";

import { DashboardPageShell } from "@/components/next-page-shell";
import { AdminResourcePage } from "@/views/admin/AdminResourcePage";

export default function Page() {
  return (
    <DashboardPageShell role="admin">
      <AdminResourcePage resource="classes" />
    </DashboardPageShell>
  );
}
