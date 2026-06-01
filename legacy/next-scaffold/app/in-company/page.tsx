"use client";

import { submitLeadAction } from "@/app/actions/leads";
import { testimonials } from "@/lib/site-data";

export default function InCompanyPage() {
  const managementTestimonials = testimonials.filter((item) => item.role.includes("Diretora") || item.role.includes("Chefe"));

  return (
    <section className="section section-dark">
      <div className="container incompany-grid">
        <div className="stack-lg">
          <div className="section-heading">
            <span className="eyebrow">M07 • In Company</span>
            <h1>Capacite toda a sua equipe de uma vez.</h1>
            <p>
              Conteúdo personalizado para a realidade do seu órgão, com emissão de NF-e,
              proposta sob medida e resposta comercial em até 24h úteis.
            </p>
          </div>

          <div className="site-grid grid-3">
            {[
              "Ementa personalizada para sua realidade",
              "Emissão de NF-e para empenho",
              "Instrutor com +10 anos no setor público"
            ].map((item) => (
              <article key={item} className="surface-card benefit-card">
                <strong>{item}</strong>
              </article>
            ))}
          </div>

          <div className="logos">
            {["Órgão A", "Órgão B", "Fundação C", "Autarquia D", "Instituto E", "Secretaria F"].map((logo) => (
              <span key={logo}>{logo}</span>
            ))}
          </div>

          <div className="site-grid grid-2">
            {managementTestimonials.map((item) => (
              <blockquote key={item.name} className="surface-card quote">
                <p>{item.text}</p>
                <footer>
                  {item.name} • {item.organization}
                </footer>
              </blockquote>
            ))}
          </div>
        </div>

        <div className="surface-card form-card">
          <div className="stack-sm">
            <h2>Solicitar proposta</h2>
            <p className="muted">
              Estrutura pronta para CRM, Resend, honeypot e rate limit na próxima etapa.
            </p>
          </div>
          <form action={submitLeadAction} className="stack-sm">
            <input type="hidden" name="leadType" value="InCompany" />
            <input name="name" placeholder="Nome" required />
            <input name="role" placeholder="Cargo" />
            <input name="organization" placeholder="Órgão ou empresa" />
            <input name="email" placeholder="Email" type="email" />
            <input name="phone" placeholder="Telefone" />
            <select name="interest" defaultValue="">
              <option value="" disabled>
                Área de interesse
              </option>
              <option>eSocial</option>
              <option>DP</option>
              <option>Compras</option>
              <option>Licitações</option>
              <option>Liderança</option>
              <option>IA Gov</option>
            </select>
            <input name="participants" placeholder="Número estimado de participantes" inputMode="numeric" />
            <textarea name="message" placeholder="Mensagem livre" rows={5} />
            <button className="button" type="submit">
              Enviar proposta
            </button>
          </form>
        </div>
      </div>

      <style jsx>{`
        .incompany-grid {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 28px;
          align-items: start;
        }

        .benefit-card,
        .quote,
        .form-card {
          padding: 24px;
        }

        .logos {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }

        .logos span {
          min-height: 72px;
          border-radius: 18px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.06);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.64);
          font-weight: 800;
        }

        .quote {
          margin: 0;
          border-left: 4px solid var(--color-accent);
        }

        .quote p,
        .quote footer {
          margin: 0;
          line-height: 1.7;
        }

        .form-card {
          background: rgba(255, 255, 255, 0.96);
          color: var(--color-text);
        }

        h1,
        h2 {
          margin: 0;
          font-family: var(--font-merriweather), serif;
        }

        input,
        button,
        select,
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
          min-height: 140px;
          padding-top: 16px;
        }

        @media (max-width: 1199px) {
          .incompany-grid,
          .logos {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
