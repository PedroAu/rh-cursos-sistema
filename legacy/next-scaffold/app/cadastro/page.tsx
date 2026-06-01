"use client";

import Link from "next/link";

export default function SignupPage() {
  return (
    <section className="section">
      <div className="container auth-shell">
        <div className="surface-card auth-card">
          <div className="section-heading">
            <span className="eyebrow">Primeiro acesso</span>
            <h1>Criar senha</h1>
            <p>
              Fluxo previsto para links temporários enviados após checkout confirmado.
            </p>
          </div>
          <form className="stack-sm">
            <input placeholder="Email" />
            <input placeholder="Nova senha" type="password" />
            <input placeholder="Confirmar senha" type="password" />
            <Link className="button" href="/login">
              Ir para login
            </Link>
          </form>
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

        input {
          width: 100%;
          min-height: 52px;
          padding: 0 16px;
          border-radius: 16px;
          border: 1px solid rgba(27, 47, 94, 0.12);
        }
      `}</style>
    </section>
  );
}
