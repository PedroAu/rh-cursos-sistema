"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type LoginFormState = {
  error: string | null;
};

export async function loginAction(
  _previousState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const email = formData.get("email");
  const password = formData.get("password");
  const next = formData.get("next");

  if (typeof email !== "string" || typeof password !== "string") {
    return { error: "Preencha e-mail e senha." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "Não foi possível autenticar com estas credenciais." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sessão inválida após o login." };
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle<{ role: "admin" | "professor" | "aluno" }>();

  if (profile?.role === "admin") {
    if (typeof next === "string" && next.startsWith("/admin")) {
      redirect(next);
    }

    redirect("/admin");
  }

  redirect("/");
}
