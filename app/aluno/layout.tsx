import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { DashboardPageShell } from "@/components/next-page-shell";
import { getServerSession } from "@/lib/server-session";

export default async function StudentLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession();

  if (!session || session.role !== "student") {
    redirect("/login?status=required&next=/aluno");
  }

  return (
    <DashboardPageShell role="student" initialSession={session}>
      {children}
    </DashboardPageShell>
  );
}
