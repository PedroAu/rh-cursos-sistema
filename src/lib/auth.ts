import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type UserProfile = {
  id: string;
  email: string;
  nome: string;
  role: "admin" | "professor" | "aluno";
};

export async function getOptionalUserProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle<{ id: string; role: "admin" | "professor" | "aluno" }>();

  if (!profile) {
    return null;
  }

  return {
    id: profile.id,
    email: user.email ?? "",
    nome: typeof user.user_metadata?.nome === "string" ? user.user_metadata.nome : "",
    role: profile.role,
  };
}

export async function requireAdmin() {
  const profile = await getOptionalUserProfile();

  if (!profile) {
    redirect("/login");
  }

  if (profile.role !== "admin") {
    redirect("/");
  }

  return profile;
}
