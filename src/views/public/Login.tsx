"use client";

import { useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import { AlertCircle } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { useNavigate } from "@/lib/router-compat";
import { useAppStore } from "@/lib/app-store";
import { getDefaultDashboardPath, isRolePathAllowed } from "@/lib/session-routing";
import { setSessionToken, setSupabaseSession } from "@/lib/supabase/session-token";
import { supabase } from "@/lib/supabase/client";
import type { DashboardRole } from "@/lib/auth";

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

const portalCopy: Record<string, { badge: string; subtitle: string }> = {
  "/login/aluno": {
    badge: "Portal do aluno",
    subtitle: "Acesse seus cursos, certificados e materiais."
  },
  "/login/instrutor": {
    badge: "Portal do instrutor",
    subtitle: "Acesse suas turmas, agendas e avaliações."
  }
};

const defaultPortalCopy = {
  badge: "Portal RH Cursos",
  subtitle: "Entre com suas credenciais para acessar o portal."
};

function getPortalCopy(pathname: string | null) {
  if (!pathname) return defaultPortalCopy;
  return portalCopy[pathname] ?? defaultPortalCopy;
}

export function LoginPage() {
  const navigate = useNavigate();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { setSession } = useAppStore();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [remember, setRemember] = useState(true);
  const status = searchParams.get("status");
  const nextPath = searchParams.get("next");
  const { badge: badgeLabel, subtitle } = getPortalCopy(pathname);
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
        body: JSON.stringify({ email: values.email, password: values.password, remember })
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
    <section
      className="flex min-h-screen flex-col items-center justify-center gap-7 px-6 py-12"
      style={{ background: "radial-gradient(circle at 50% 20%, var(--tk-surface-2) 30%, var(--tk-surface) 100%)" }}
    >
      <div className="flex flex-col items-center gap-3.5">
        <Image
          src="/uploads/logoHorizontal_800X600.png"
          alt="RH Cursos"
          width={200}
          height={52}
          className="h-[52px] w-auto"
          priority
        />
        <span className="rounded-tk-pill bg-tk-accent-soft px-3 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-tk-brand">
          {badgeLabel}
        </span>
      </div>

      <Card
        className="w-[400px] max-w-full rounded-tk-card border-tk-line bg-tk-surface shadow-tk-card"
        data-testid="ui-login-card"
      >
        <CardContent className="p-9 pb-8">
          <h1 className="mb-1.5 text-center font-tk-display text-[25px] font-bold leading-[1.15] tracking-[var(--tk-tracking-display)] text-tk-ink">
            Bem-vindo de volta
          </h1>
          <p className="mb-6 text-center text-body-small text-tk-ink-muted">{subtitle}</p>

          {status === "required" ? (
            <div className="mb-5 rounded-lg border border-tk-accent/25 bg-tk-accent-soft px-4 py-3 text-sm text-tk-brand-hover">
              Faça login para acessar {nextPath ?? "a área restrita"}.
            </div>
          ) : null}

          <form
            noValidate
            className="grid grid-cols-1 gap-[18px]"
            onSubmit={handleSubmit(handleValidSubmit, () => setError("Preencha e-mail e senha para continuar."))}
          >
            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <FormField error={errors.email?.message} label="E-mail" required>
                  {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
                    <Input
                      id={fieldId}
                      type="email"
                      autoComplete="email"
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
                <FormField error={errors.password?.message} label="Senha" required>
                  {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
                    <Input
                      id={fieldId}
                      type="password"
                      autoComplete="current-password"
                      placeholder="••••••••"
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

            <div className="-mt-0.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Checkbox id="login-remember" checked={remember} onCheckedChange={setRemember} />
                <label htmlFor="login-remember" className="cursor-pointer text-body-small text-tk-ink-muted">
                  Manter conectado
                </label>
              </div>
              <Button
                type="button"
                variant="tertiary"
                className="ml-auto"
                onClick={() => toast.success("Link de recuperação enviado para o seu e-mail.")}
              >
                Esqueci minha senha
              </Button>
            </div>

            {error ? (
              <div
                role="alert"
                className="flex items-center gap-2.5 rounded-lg border border-tk-error/25 bg-tk-error/10 px-3.5 py-2.5 text-body-small text-tk-error"
              >
                <AlertCircle className="h-[15px] w-[15px] shrink-0" aria-hidden="true" />
                {error}
              </div>
            ) : null}

            <Button type="submit" loading={isSubmitting} size="lg" className="w-full">
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="flex items-center gap-4 text-body-small text-tk-ink-muted">
        <button
          type="button"
          className="font-medium text-tk-ink-muted hover:text-tk-accent-strong"
          onClick={() => navigate("/cursos")}
        >
          ← Voltar ao site
        </button>
        <span aria-hidden="true" className="h-[3px] w-[3px] rounded-full bg-tk-ink-muted" />
        <span>
          Precisa de acesso?{" "}
          <button
            type="button"
            className="font-semibold text-tk-accent hover:text-tk-accent-strong"
            onClick={() => navigate("/contato")}
          >
            Fale com a coordenação
          </button>
        </span>
      </div>
    </section>
  );
}
