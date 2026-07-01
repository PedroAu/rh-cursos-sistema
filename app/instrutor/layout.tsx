import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { DashboardPageShell } from "@/components/next-page-shell";
import { getServerSession } from "@/lib/server-session";

export default async function InstructorLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession();

  if (!session || session.role !== "instructor") {
    redirect("/login?status=required&next=/instrutor");
  }

  return (
    <DashboardPageShell role="instructor" initialSession={session}>
      {children}
    </DashboardPageShell>
  );
}
