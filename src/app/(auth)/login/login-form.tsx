"use client";

import { useActionState } from "react";
import { IconAlertCircle, IconArrowRight, IconLock, IconMail } from "@tabler/icons-react";
import { loginAction } from "@/app/(auth)/login/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LoginFormProps = {
  nextPath?: string;
};

export function LoginForm({ nextPath }: LoginFormProps) {
  const [state, formAction, pending] = useActionState(
    loginAction,
    { error: null },
  );

  return (
    <form action={formAction}>
      <div className="space-y-4">
        {state.error ? (
          <Alert variant="destructive">
            <IconAlertCircle className="mb-2 size-4" aria-hidden="true" />
            <AlertTitle>Falha no login</AlertTitle>
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        ) : null}

        <input type="hidden" name="next" value={nextPath ?? ""} />

        <div className="space-y-2">
          <Label htmlFor="login-email">E-mail Corporativo</Label>
          <div className="relative">
            <IconMail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              autoComplete="email"
              className="pl-10"
              id="login-email"
              name="email"
              placeholder="exemplo@rhcursos.com.br"
              required
              type="email"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="login-password">Senha</Label>
          <div className="relative">
            <IconLock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              autoComplete="current-password"
              className="pl-10"
              id="login-password"
              name="password"
              placeholder="••••••••"
              required
              type="password"
            />
          </div>
        </div>

        <div className="flex flex-nowrap items-center justify-between gap-4">
          <label className="flex items-center gap-2 text-sm" htmlFor="login-remember">
            <input
              className="size-4 rounded border-primary accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              id="login-remember"
              name="remember"
              type="checkbox"
            />
            <span>Mantenha-me conectado</span>
          </label>
          <a className="text-xs font-bold text-brand-navy-700 hover:underline" href="/contato">
            Esqueceu a senha?
          </a>
        </div>

        <Button
          className="w-full"
          disabled={pending}
          size="lg"
          type="submit"
        >
          {pending ? "Entrando..." : "Entrar na Plataforma"}
          <IconArrowRight size={18} />
        </Button>
      </div>
    </form>
  );
}
