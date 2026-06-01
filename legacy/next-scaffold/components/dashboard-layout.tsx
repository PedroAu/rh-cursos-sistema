"use client";

import Link from "next/link";

import { logoutAction } from "@/app/login/actions";

export function DashboardLayout({
  title,
  description,
  items,
  accent = "navy",
  userName,
  userEmail
}: {
  title: string;
  description: string;
  items: Array<{ label: string; value: string; helper: string }>;
  accent?: "navy" | "gold";
  userName?: string;
  userEmail?: string;
}) {
  return (
    <>
      <section className={`section ${accent === "gold" ? "section-cream" : ""}`}>
        <div className="container stack-lg">
          <div className="section-heading">
            <span className="eyebrow">{accent === "gold" ? "Operação" : "Área protegida"}</span>
            <h1>{title}</h1>
            <p>{description}</p>
            {userName ? (
              <p className="session-line">
                Sessão demo: {userName}
                {userEmail ? ` (${userEmail})` : ""}
              </p>
            ) : null}
          </div>

          <div className="site-grid grid-3">
            {items.map((item) => (
              <article key={item.label} className="surface-card stat-card">
                <span className="label">{item.label}</span>
                <strong>{item.value}</strong>
                <p>{item.helper}</p>
              </article>
            ))}
          </div>

          <div className="surface-card info-card">
            <div className="stack-sm">
              <strong>Scaffold funcional</strong>
              <p>
                Esta área foi estruturada para refletir a arquitetura do PDR e servir de
                base para autenticação, integrações, PDFs, CRM e pagamentos na próxima
                etapa de backend.
              </p>
            </div>
            <div className="button-row">
              <Link className="button" href="/cursos">
                Voltar para cursos
              </Link>
              <Link className="button-outline" href="/">
                Ir para a home
              </Link>
              <form action={logoutAction}>
                <button className="button-outline" type="submit">
                  Sair
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .stat-card,
        .info-card {
          padding: 24px;
        }

        .label {
          display: inline-flex;
          margin-bottom: 16px;
          color: var(--color-primary);
          font-size: 0.82rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        strong {
          display: block;
          margin-bottom: 10px;
          color: var(--color-primary);
          font-family: var(--font-merriweather), serif;
          font-size: 2rem;
        }

        p {
          margin: 0;
          line-height: 1.7;
        }

        .session-line {
          margin-top: 12px;
          color: var(--color-primary);
          font-weight: 700;
        }

        .info-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
        }

        @media (max-width: 767px) {
          .info-card {
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>
    </>
  );
}
