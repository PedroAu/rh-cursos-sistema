"use client";

import { useState } from "react";
import { AlertCircle, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { useNavigate } from "@/lib/router-compat";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/lib/app-store";
import { setSessionToken, setSupabaseSession } from "@/lib/supabase/session-token";
import { supabase } from "@/lib/supabase/client";

export function LoginPage() {
  const navigate = useNavigate();
  const searchParams = useSearchParams();
  const { setSession } = useAppStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRole] = useState<"admin">("admin");
  const status = searchParams.get("status");
  const nextPath = searchParams.get("next");

  const handleSubmit = async () => {
    setError(null);
    const nextErrors: { email?: string; password?: string } = {};

    if (!email) {
      nextErrors.email = "Preencha o e-mail para continuar.";
    }
    if (!password) {
      nextErrors.password = "Preencha a senha para continuar.";
    }
    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setError("Preencha e-mail e senha para continuar.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ role: "admin", email, password })
      });

      if (!response.ok) {
        setError("E-mail ou senha incorretos. Verifique seus dados e tente novamente.");
        return;
      }

      const data = (await response.json()) as {
        session: { role: "admin"; email: string; name: string };
        token: string;
        supabaseSession: { access_token: string; refresh_token: string } | null;
      };

      setSessionToken(data.token);

      // Reidrata o cliente Supabase com o JWT do Auth → role `authenticated`.
      // Com isso as leituras admin passam pelo RLS (is_admin) sem Edge Function.
      if (data.supabaseSession && supabase) {
        setSupabaseSession(data.supabaseSession);
        await supabase.auth.setSession({
          access_token: data.supabaseSession.access_token,
          refresh_token: data.supabaseSession.refresh_token,
        });
      }

      setSession(data.session);

      navigate(searchParams.get("next") || "/admin");
    } catch {
      setError("Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-deep-navy lg:block">
        <Image
          src="/images/in-company-hero-ai.png"
          alt="Ambiente corporativo moderno da RH Cursos"
          fill
          sizes="50vw"
          className="object-cover opacity-35"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-deep-navy via-deep-navy/80 to-deep-navy/40" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <span className="font-display text-3xl font-bold">RH Cursos</span>
          <div className="space-y-6">
            <p className="max-w-md text-lg leading-8 text-white/85">
              Capacitação estratégica para profissionais que transformam a gestão pública e empresarial.
            </p>
            <div className="flex items-start gap-4 rounded-2xl border border-white/12 bg-white/8 p-5">
              <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-prestige-gold" />
              <div>
                <p className="font-bold">Certificado reconhecido</p>
                <p className="mt-1 text-sm leading-6 text-white/75">
                  Qualidade técnica com foco em resultados práticos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex items-center justify-center px-6 py-12">
        <Card className="w-full max-w-xl border-outline-variant" data-testid="ui-login-card">
          <CardContent className="space-y-6 p-8">
            <div className="space-y-3 text-center">
              <span className="eyebrow">Administração</span>
              <h1 className="text-4xl font-extrabold text-primary">Entrar</h1>
              <p className="text-base leading-7 text-muted-foreground">
                Acesse sua conta para gerenciar o painel administrativo.
              </p>
            </div>

            {status === "required" ? (
              <div className="rounded-lg border border-accent/20 bg-accent/10 p-4 text-sm leading-6 text-accent">
                Faça login para acessar {nextPath || "/admin"}. Nesta publicação, somente o papel administrativo está disponível.
              </div>
            ) : null}

            <div className="grid gap-3 md:grid-cols-3">
              {[
                {
                  label: "Administração",
                  description: "Acesso ao painel operacional e cadastro.",
                  active: true
                },
                {
                  label: "Aluno",
                  description: "Portal fora do escopo desta publicação.",
                  active: false
                },
                {
                  label: "Instrutor",
                  description: "Portal fora do escopo desta publicação.",
                  active: false
                }
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  disabled={!item.active}
                  aria-pressed={item.active}
                  className={`rounded-xl border p-4 text-left ${
                    item.active
                      ? "border-deep-navy bg-deep-navy text-white"
                      : "border-outline-variant bg-surface-muted text-text-muted opacity-80"
                  }`}
                >
                  <p className="text-sm font-bold">{item.label}</p>
                  <p className={`mt-2 text-sm leading-6 ${item.active ? "text-white/78" : "text-text-muted"}`}>{item.description}</p>
                </button>
              ))}
            </div>

            {error && (
              <div
                role="alert"
                aria-live="assertive"
                className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="grid gap-4">
              <FormField error={fieldErrors.email} hint="Conta autorizada para o papel selecionado." label="E-mail" required>
                {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
                  <Input
                    id={fieldId}
                    placeholder="admin@empresa.com.br"
                    value={email}
                    aria-describedby={ariaDescribedBy}
                    aria-invalid={ariaInvalid}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setFieldErrors((current) => ({ ...current, email: undefined }));
                      if (error) setError(null);
                    }}
                    onKeyDown={(event) => event.key === "Enter" && handleSubmit()}
                  />
                )}
              </FormField>
              <FormField error={fieldErrors.password} hint={`Perfil atual: ${selectedRole === "admin" ? "Administração" : selectedRole}.`} label="Senha" required>
                {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
                  <Input
                    id={fieldId}
                    type="password"
                    placeholder="Sua senha de acesso"
                    value={password}
                    aria-describedby={ariaDescribedBy}
                    aria-invalid={ariaInvalid}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setFieldErrors((current) => ({ ...current, password: undefined }));
                      if (error) setError(null);
                    }}
                    onKeyDown={(event) => event.key === "Enter" && handleSubmit()}
                  />
                )}
              </FormField>
            </div>

            <div className="flex flex-col gap-3">
              <Button onClick={handleSubmit} loading={isSubmitting}>
                Entrar
              </Button>
              <Button variant="outline" onClick={() => toast.success("Link de recuperação enviado para o seu e-mail.")}>
                Esqueci minha senha
              </Button>
              <Button variant="ghost" onClick={() => navigate("/cursos")}>
                Voltar ao site
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
