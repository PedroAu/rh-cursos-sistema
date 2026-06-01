"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { loginAction } from "@/app/login/actions";

const statusMessages: Record<string, string> = {
  required: "Entre com um acesso demo para abrir essa área.",
  invalid: "Credenciais inválidas para o perfil selecionado.",
  disabled: "A autenticação demo está desativada neste ambiente.",
  "logged-out": "Sessão encerrada com sucesso."
};

export function LoginForm() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status") ?? undefined;
  const next = searchParams.get("next") ?? "";

  return (
    <section className="section section-cream">
      <div className="container auth-shell">
        <div className="surface-card auth-card">
          <div className="section-heading">
            <span className="eyebrow">Área do aluno</span>
            <h1>Login</h1>
            <p>
              Acesso demo protegido por cookie HTTP-only enquanto a autenticação
              definitiva com Supabase Auth não é ativada.
            </p>
          </div>

          {status ? <div className="notice">{statusMessages[status] ?? statusMessages.required}</div> : null}

          <form action={loginAction} className="stack-sm">
            <input type="hidden" name="next" value={next} />
            <select name="role" defaultValue="student" aria-label="Perfil">
              <option value="student">Aluno</option>
              <option value="admin">Admin</option>
              <option value="instructor">Instrutor</option>
            </select>
            <input name="email" placeholder="Email" type="email" required />
            <input name="password" placeholder="Senha" type="password" required />
            <label className="remember">
              <input type="checkbox" /> Manter conectado
            </label>
            <button className="button" type="submit">
              Entrar
            </button>
            <Link className="button-outline" href="/cadastro">
              Criar senha do primeiro acesso
            </Link>
          </form>

          <div className="demo-access">
            <strong>Acessos demo</strong>
            <span>Aluno: ana.silva1@mockmail.com / aluno123</span>
            <span>Admin: admin@rhcursos.demo / admin123</span>
            <span>Instrutor: mariana.teles@rhcursos.com / instrutor123</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .auth-shell {
          display: flex;
          justify-content: center;
        }

        .auth-card {
          width: min(560px, 100%);
          padding: 32px;
        }

        input,
        select {
          width: 100%;
          min-height: 52px;
          padding: 0 16px;
          border-radius: 16px;
          border: 1px solid rgba(27, 47, 94, 0.12);
          background: rgba(255, 255, 255, 0.96);
        }

        button.button {
          width: 100%;
        }

        .notice {
          margin-bottom: 18px;
          border-radius: 16px;
          border: 1px solid rgba(200, 150, 46, 0.28);
          background: rgba(200, 150, 46, 0.12);
          padding: 14px 16px;
          color: var(--color-primary);
          font-weight: 700;
        }

        .remember {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
        }

        .remember input {
          width: auto;
          min-height: auto;
        }

        .demo-access {
          display: grid;
          gap: 8px;
          margin-top: 22px;
          border-top: 1px solid rgba(27, 47, 94, 0.1);
          padding-top: 18px;
          color: rgba(61, 61, 61, 0.78);
          font-size: 0.92rem;
        }

        .demo-access strong {
          color: var(--color-primary);
        }
      `}</style>
    </section>
  );
}
