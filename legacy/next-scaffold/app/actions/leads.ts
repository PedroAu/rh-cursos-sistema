"use server";

import { redirect } from "next/navigation";

import { supabase } from "@/lib/supabase/client";

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function numberOrNull(value: string) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export async function submitLeadAction(formData: FormData) {
  const name = text(formData, "name");

  if (supabase && name) {
    const leadType = text(formData, "leadType") || "Contato";
    const message = text(formData, "message");
    const organization = text(formData, "organization");
    const role = text(formData, "role");

    await supabase.from("lead").insert({
      nome: name,
      email: text(formData, "email") || null,
      telefone: text(formData, "phone") || null,
      tipo: leadType,
      orgao: organization || null,
      num_participantes: numberOrNull(text(formData, "participants")),
      tema_interesse: text(formData, "interest") || null,
      mensagem: [role ? `Cargo: ${role}` : "", message].filter(Boolean).join("\n\n") || null,
      origem: "Site Next"
    });
  }

  redirect("/obrigado");
}
