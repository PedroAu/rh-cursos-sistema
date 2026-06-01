"use client";

import { DashboardPageShell } from "@/components/next-page-shell";
import { StudentDashboardPage } from "@/views/student/StudentDashboard";

export default function Page() {
  return (
    <DashboardPageShell role="student">
      <StudentDashboardPage />
    </DashboardPageShell>
  );
}
