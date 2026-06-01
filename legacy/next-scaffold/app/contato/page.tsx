"use client";

import { submitLeadAction } from "@/app/actions/leads";

export default function ContactPage() {
  return (
    <section className="section">
      <div className="container contact-grid">
        <div className="stack-lg">
          <div className="section-heading">
            <span className="eyebrow">Suporte & relacionamento</span>
            <h1>Contato</h1>
            <p>
              Canal direto para dúvidas, propostas, agendas e orientação comercial sobre os
              cursos da RH Cursos & Soluções.
            </p>
          </div>
          <div className="site-grid grid-3">
            {[
              { label: "WhatsApp", value: "+55 (61) 99999-9999" },
              { label: "Email", value: "contato@rhcursos.com.br" },
              { label: "Endereço", value: "Brasília, DF" }
            ].map((item) => (
              <article key={item.label} className="surface-card contact-card">
                <strong>{item.label}</strong>
                <p>{item.value}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="surface-card form-card">
          <form action={submitLeadAction} className="stack-sm">
            <input type="hidden" name="leadType" value="Contato" />
            <input name="name" placeholder="Nome" required />
            <input name="email" placeholder="Email" type="email" />
            <input name="phone" placeholder="Telefone" />
            <textarea name="message" placeholder="Como podemos ajudar?" rows={6} />
            <button className="button" type="submit">
              Enviar mensagem
            </button>
          </form>
        </div>
      </div>

      <style jsx>{`
        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 0.82fr;
          gap: 28px;
          align-items: start;
        }

        .contact-card,
        .form-card {
          padding: 22px;
        }

        .contact-card strong {
          display: block;
          margin-bottom: 10px;
          color: var(--color-primary);
          font-family: var(--font-merriweather), serif;
        }

        .contact-card p {
          margin: 0;
          line-height: 1.7;
        }

        input,
        button,
        textarea {
          width: 100%;
          min-height: 52px;
          padding: 0 16px;
          border-radius: 16px;
          border: 1px solid rgba(27, 47, 94, 0.12);
          background: rgba(255, 255, 255, 0.96);
        }

        button {
          width: auto;
          background: var(--color-accent);
        }

        textarea {
          min-height: 180px;
          padding-top: 16px;
        }

        @media (max-width: 1199px) {
          .contact-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
