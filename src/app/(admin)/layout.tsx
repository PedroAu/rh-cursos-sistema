import { requireAdmin } from "@/lib/auth";
import { signOut } from "@/app/actions/auth";
import { AdminShell } from "@/components/layout/admin-shell";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await requireAdmin();

  return (
    <AdminShell profileLabel={profile.nome || profile.email} signOutAction={signOut}>
      {children}
    </AdminShell>
  );
}
