"use client";

import { DashboardPageShell } from "@/components/next-page-shell";
import { InstructorDashboardPage } from "@/views/instructor/InstructorDashboard";

export default function Page() {
  return (
    <DashboardPageShell role="instructor">
      <InstructorDashboardPage />
    </DashboardPageShell>
  );
}
