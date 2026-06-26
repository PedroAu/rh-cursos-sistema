import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { DashboardPageShell } from "@/components/next-page-shell";
import { getServerSession } from "@/lib/server-session";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession();

  if (!session || session.role !== "admin") {
    redirect("/login?status=required&next=/admin");
  }

  return (
    <DashboardPageShell role="admin" initialSession={session}>
      {children}
    </DashboardPageShell>
  );
}
