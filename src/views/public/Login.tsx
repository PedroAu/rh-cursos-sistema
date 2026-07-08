"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { AlertCircle, ShieldCheck } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import type { DashboardRole } from "@/lib/auth";
import { useNavigate } from "@/lib/router-compat";
import { useAppStore } from "@/lib/app-store";
import { getDefaultDashboardPath, isRolePathAllowed } from "@/lib/session-routing";
import { setSessionToken, setSupabaseSession } from "@/lib/supabase/session-token";
import { supabase } from "@/lib/supabase/client";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Preencha o e-mail para continuar.")
    .refine((value) => emailRegex.test(value), "Informe um e-mail válido."),
  password: z.string().trim().min(1, "Preencha a senha para continuar.")
});

type LoginFormValues = z.infer<typeof loginSchema>;

const roleOptions: Array<{
  role: DashboardRole;
  label: string;
  description: string;
}> = [
  {
    role: "admin",
    label: "Administração",
    description: "Acesso ao painel operacional e cadastro."
  },
  {
    role: "student",
    label: "Aluno",
    description: "Acompanhe inscrições e contexto das suas turmas."
  },
  {
    role: "instructor",
    label: "Instrutor",
    description: "Visualize turmas atribuídas e alunos vinculados."
  }
];

export function LoginPage() {
  const navigate = useNavigate();
  const searchParams = useSearchParams();
  const { setSession } = useAppStore();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState<DashboardRole>("admin");
  const status = searchParams.get("status");
  const nextPath = searchParams.get("next");
  const {
    control,
    formState: { errors },
    handleSubmit
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const handleValidSubmit = async (values: LoginFormValues) => {
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ role: selectedRole, email: values.email, password: values.password })
      });

      if (!response.ok) {
        setError("E-mail ou senha incorretos. Verifique seus dados e tente novamente.");
        return;
      }

      const data = (await response.json()) as {
        session: { role: DashboardRole; email: string; name: string };
        token: string;
        supabaseSession: { access_token: string; refresh_token: string } | null;
      };

      setSessionToken(data.token);

      if (data.supabaseSession && supabase) {
        setSupabaseSession(data.supabaseSession);
        await supabase.auth.setSession({
          access_token: data.supabaseSession.access_token,
          refresh_token: data.supabaseSession.refresh_token
        });
      }

      setSession(data.session);
      const nextDestination = isRolePathAllowed(data.session.role, nextPath ?? undefined)
        ? nextPath ?? getDefaultDashboardPath(data.session.role)
        : getDefaultDashboardPath(data.session.role);
      navigate(nextDestination);
    } catch {
      setError("Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="min-h-[calc(100vh-4.5rem)]">
      <div className="grid min-h-[calc(100vh-4.5rem)] lg:grid-cols-2">
        <div className="relative hidden overflow-hidden bg-[#072d48] lg:block">
          <Image
            src="/images/in-company-hero-ai.png"
            alt="Ambiente corporativo moderno da RH Cursos"
            fill
            sizes="50vw"
            className="object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#051d31] via-[#072d48]/85 to-[#072d48]/45" />

          <div className="relative flex h-full flex-col justify-between p-12 text-white">
            <p className="text-[4rem] font-extrabold leading-none">RH Cursos</p>

            <div className="space-y-8">
              <p className="max-w-[480px] text-[2rem] font-bold leading-[1.15]">
                Capacitação estratégica para profissionais que transformam a gestão pública e empresarial.
              </p>

              <div className="max-w-[420px] rounded-xl border border-white/20 bg-white/10 p-6">
                <div className="flex items-start gap-4">
                  <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-[#f5c13a]" />
                  <div className="space-y-1">
                    <p className="text-lg font-bold">Certificado Reconhecido</p>
                    <p className="text-sm leading-6 text-white/80">
                      Qualidade técnica com foco em resultados práticos.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center px-6 py-12">
          <Card className="w-full max-w-[560px] border-outline-variant bg-surface-container-lowest shadow-card" data-testid="ui-login-card">
            <CardContent className="grid gap-8 p-8 md:p-10">
              <div className="space-y-1.5">
                <h1 className="text-deep-navy">Acesse sua conta</h1>
                <p className="text-body-lg text-tk-ink-muted">Bem-vindo de volta. Entre com suas credenciais.</p>
              </div>

              {status === "required" ? (
                <div className="rounded-lg border border-[#d6b24a]/35 bg-[#fff5d8] px-4 py-3 text-sm text-[#6f5200]">
                  Faça login para acessar {nextPath || getDefaultDashboardPath(selectedRole)}.
                </div>
              ) : null}

              <div className="grid gap-4 md:grid-cols-3">
                {roleOptions.map((item) => (
                  <button
                    key={item.role}
                    type="button"
                    aria-pressed={selectedRole === item.role}
                    onClick={() => {
                      setSelectedRole(item.role);
                      setError(null);
                    }}
                    className={[
                      "rounded-xl border p-4 text-left transition-colors",
                      selectedRole === item.role
                        ? "border-[#0a4b72] bg-[#0a4b72] text-white"
                        : "border-[#d9e1e8] bg-[#eef3f7] text-[#5b6b7b]"
                    ].join(" ")}
                  >
                    <p className="text-sm font-bold">{item.label}</p>
                    <p className={["mt-2 text-sm leading-6", selectedRole === item.role ? "text-white/80" : "text-[#4f5f6f]"].join(" ")}>
                      {item.description}
                    </p>
                  </button>
                ))}
              </div>

              {error ? (
                <div role="alert" className="rounded-lg border border-tk-error/25 bg-tk-error/10 px-4 py-3 text-sm text-tk-error">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <div>
                      <p className="font-semibold">Falha ao entrar</p>
                      <p className="mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              ) : null}

              <form
                noValidate
                className="grid gap-5"
                onSubmit={handleSubmit(handleValidSubmit, () => setError("Preencha e-mail e senha para continuar."))}
              >
                <Controller
                  control={control}
                  name="email"
                  render={({ field }) => (
                    <FormField error={errors.email?.message} hint="Conta autorizada para o papel selecionado." label="E-mail" required>
                      {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
                        <Input
                          id={fieldId}
                          type="email"
                          placeholder="voce@empresa.com.br"
                          value={field.value}
                          aria-describedby={ariaDescribedBy}
                          aria-invalid={ariaInvalid}
                          onFocus={() => setError(null)}
                          onChange={field.onChange}
                        />
                      )}
                    </FormField>
                  )}
                />

                <Controller
                  control={control}
                  name="password"
                  render={({ field }) => (
                    <FormField
                      error={errors.password?.message}
                      hint={`Perfil atual: ${roleOptions.find((item) => item.role === selectedRole)?.label ?? selectedRole}.`}
                      label="Senha"
                      required
                    >
                      {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
                        <Input
                          id={fieldId}
                          type="password"
                          placeholder="Sua senha de acesso"
                          value={field.value}
                          aria-describedby={ariaDescribedBy}
                          aria-invalid={ariaInvalid}
                          onFocus={() => setError(null)}
                          onChange={field.onChange}
                        />
                      )}
                    </FormField>
                  )}
                />

                <Button type="submit" loading={isSubmitting} size="lg" className="w-full bg-deep-navy text-white hover:bg-deep-navy/92">
                  Entrar
                </Button>
              </form>

              <div className="h-px w-full bg-outline-variant" />

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  className="justify-start px-0 text-tk-brand hover:bg-transparent hover:text-tk-brand/85"
                  onClick={() => toast.success("Link de recuperação enviado para o seu e-mail.")}
                >
                  Esqueci minha senha
                </Button>

                <Button type="button" variant="outline" className="border-outline-variant text-deep-navy hover:bg-surface-muted" onClick={() => navigate("/cursos")}>
                  Voltar ao site
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
