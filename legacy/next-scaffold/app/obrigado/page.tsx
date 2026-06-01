"use client";

import Link from "next/link";

export default function ThankYouPage() {
  return (
    <section className="section">
      <div className="container">
        <div className="surface-card thanks">
          <span className="eyebrow">Pós-conversão</span>
          <h1>Recebemos sua solicitação.</h1>
          <p>
            Sua jornada continua daqui: confirmação, próximos passos por email e orientação
            comercial quando necessário.
          </p>
          <div className="button-row">
            <Link className="button" href="/login">
              Ir para a área do aluno
            </Link>
            <Link className="button-outline" href="/cursos">
              Ver mais cursos
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .thanks {
          padding: 40px;
          text-align: center;
          display: grid;
          gap: 18px;
        }

        h1 {
          margin: 0;
          font-family: var(--font-merriweather), serif;
          color: var(--color-primary);
        }

        p {
          margin: 0 auto;
          max-width: 640px;
          line-height: 1.8;
        }
      `}</style>
    </section>
  );
}
