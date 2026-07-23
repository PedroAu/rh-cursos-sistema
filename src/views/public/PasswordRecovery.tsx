"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { useNavigate } from "@/lib/router-compat";
import { PASSWORD_MIN_LENGTH } from "@/lib/password-recovery";

const emailSchema = z.object({ email: z.string().trim().email("Informe um e-mail válido.") });
const passwordSchema = z
  .object({
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH, `A senha deve ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres.`)
      .regex(/[a-z]/, "A senha deve conter uma letra minúscula.")
      .regex(/[A-Z]/, "A senha deve conter uma letra maiúscula.")
      .regex(/\d/, "A senha deve conter um número.")
      .regex(/[^A-Za-z0-9]/, "A senha deve conter um caractere especial."),
    confirmation: z.string()
  })
  .refine((values) => values.password === values.confirmation, { path: ["confirmation"], message: "As senhas não coincidem." });

type EmailValues = z.infer<typeof emailSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

export function PasswordRecoveryPage() {
  const navigate = useNavigate();
  const searchParams = useSearchParams();
  const isUpdate = searchParams.get("mode") === "update";
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const emailForm = useForm<EmailValues>({ resolver: zodResolver(emailSchema), defaultValues: { email: "" } });
  const passwordForm = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema), defaultValues: { password: "", confirmation: "" } });

  const submitEmail = async ({ email }: EmailValues) => {
    setError(null); setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/password-recovery", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      if (!response.ok) throw new Error("request");
      setSuccess(true);
    } catch { setError("Não foi possível solicitar a recuperação agora. Tente novamente."); } finally { setIsSubmitting(false); }
  };

  const submitPassword = async (values: PasswordValues) => {
    setError(null); setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/password-update", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) throw new Error(data?.error || "update");
      navigate("/login?status=password-updated");
    } catch (submissionError) {
      const message = submissionError instanceof Error ? submissionError.message : "";
      setError(message && message !== "update" ? message : "Não foi possível atualizar a senha. Solicite um novo link.");
    } finally { setIsSubmitting(false); }
  };

  return <section className="flex min-h-screen items-center justify-center px-6 py-12" style={{ background: "radial-gradient(circle at 50% 20%, var(--tk-surface-2) 30%, var(--tk-surface) 100%)" }}>
    <Card className="w-[440px] max-w-full rounded-tk-card border-tk-line bg-tk-surface shadow-tk-card"><CardContent className="p-9">
      <h1 className="mb-2 text-center font-tk-display text-[25px] font-bold text-tk-ink">{isUpdate ? "Crie uma nova senha" : "Recupere sua senha"}</h1>
      <p className="mb-6 text-center text-body-small text-tk-ink-muted">{isUpdate ? "Use uma senha forte para proteger sua conta." : "Enviaremos um link seguro para o seu e-mail."}</p>
      {success ? <div role="status" className="space-y-4 rounded-lg border border-tk-success/25 bg-tk-success/10 p-4 text-sm text-tk-ink"><CheckCircle2 className="h-5 w-5 text-tk-success" /><p>Se existir uma conta com este e-mail, você receberá as instruções em instantes.</p><Button type="button" variant="outline" className="w-full" onClick={() => navigate("/login")}>Voltar ao login</Button></div> : isUpdate ? <form className="grid gap-4" onSubmit={passwordForm.handleSubmit(submitPassword)}>
        <Controller control={passwordForm.control} name="password" render={({ field }) => <FormField label="Nova senha" error={passwordForm.formState.errors.password?.message} required>{({ fieldId, ariaDescribedBy, ariaInvalid }) => <Input id={fieldId} type="password" autoComplete="new-password" value={field.value} aria-describedby={ariaDescribedBy} aria-invalid={ariaInvalid} onChange={field.onChange} />}</FormField>} />
        <Controller control={passwordForm.control} name="confirmation" render={({ field }) => <FormField label="Confirme a nova senha" error={passwordForm.formState.errors.confirmation?.message} required>{({ fieldId, ariaDescribedBy, ariaInvalid }) => <Input id={fieldId} type="password" autoComplete="new-password" value={field.value} aria-describedby={ariaDescribedBy} aria-invalid={ariaInvalid} onChange={field.onChange} />}</FormField>} />
        {error ? <div role="alert" className="flex gap-2 rounded-lg border border-tk-error/25 bg-tk-error/10 p-3 text-sm text-tk-error"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div> : null}<Button type="submit" loading={isSubmitting} className="w-full">Atualizar senha</Button>
      </form> : <form className="grid gap-4" onSubmit={emailForm.handleSubmit(submitEmail)}>
        <Controller control={emailForm.control} name="email" render={({ field }) => <FormField label="E-mail" error={emailForm.formState.errors.email?.message} required>{({ fieldId, ariaDescribedBy, ariaInvalid }) => <Input id={fieldId} type="email" autoComplete="email" placeholder="voce@empresa.com.br" value={field.value} aria-describedby={ariaDescribedBy} aria-invalid={ariaInvalid} onChange={field.onChange} />}</FormField>} />
        {error ? <div role="alert" className="flex gap-2 rounded-lg border border-tk-error/25 bg-tk-error/10 p-3 text-sm text-tk-error"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div> : null}<Button type="submit" loading={isSubmitting} className="w-full">Enviar link de recuperação</Button><Button type="button" variant="ghost" className="w-full" onClick={() => navigate("/login")}>Voltar ao login</Button>
      </form>}
    </CardContent></Card>
  </section>;
}
