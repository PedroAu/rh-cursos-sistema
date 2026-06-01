"use client";

export default function AboutPage() {
  return (
    <section className="section">
      <div className="container about-grid">
        <div className="surface-card portrait">Brand story visual • Ester e Nilson</div>
        <div className="stack-lg">
          <div className="section-heading">
            <span className="eyebrow">Institucional</span>
            <h1>Sobre Ester e Nilson</h1>
            <p>
              Fundadores reais, história real e um posicionamento que não gira em torno de
              certificados, e sim de transformação mensurável.
            </p>
          </div>

          <div className="stack-md narrative">
            <p>
              Desde 2007, a RH Cursos & Soluções constrói autoridade a partir da prática:
              entender o contexto de quem serve ao público, traduzir temas complexos e gerar
              segurança para agir.
            </p>
            <p>
              O diferencial nunca foi volume. Foi clareza, didática, consistência e respeito
              pelo impacto real que uma decisão técnica tem dentro de um órgão ou equipe.
            </p>
            <p>
              O resultado é um método que ajuda profissionais a reduzir erros, ganhar
              confiança e se tornar referência técnica em suas áreas.
            </p>
          </div>

          <div className="site-grid grid-2">
            {[
              "19 anos de operação",
              "Brasília como base estratégica",
              "Especialização em eSocial, DP e compras públicas",
              "Capacitação para equipes e contratos In Company"
            ].map((item) => (
              <div key={item} className="surface-card fact">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .about-grid {
          display: grid;
          grid-template-columns: 0.9fr 1.1fr;
          gap: 28px;
          align-items: center;
        }

        .portrait {
          min-height: 520px;
          padding: 28px;
          display: flex;
          align-items: flex-end;
          border-radius: 28px;
          background:
            linear-gradient(180deg, rgba(200, 150, 46, 0.08), rgba(27, 47, 94, 0.9)),
            linear-gradient(135deg, #ccb18f, #516886);
          color: var(--color-white);
          font-weight: 800;
        }

        .fact {
          padding: 20px;
          font-weight: 800;
          color: var(--color-primary);
        }

        .narrative p {
          margin: 0;
          line-height: 1.8;
        }

        @media (max-width: 1199px) {
          .about-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
