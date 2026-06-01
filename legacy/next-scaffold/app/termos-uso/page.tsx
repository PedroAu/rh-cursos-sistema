"use client";

export default function TermsPage() {
  return (
    <section className="section">
      <div className="container">
        <article className="surface-card legal">
          <div className="section-heading">
            <span className="eyebrow">Legal</span>
            <h1>Termos de Uso</h1>
            <p>
              Esta versão estabelece a camada inicial de termos para navegação, inscrições,
              acesso à área do aluno e uso do conteúdo publicado no site.
            </p>
          </div>
          <div className="stack-md">
            <p>
              O acesso às áreas autenticadas depende de credenciais válidas e do uso
              adequado dos materiais disponibilizados ao aluno.
            </p>
            <p>
              Conteúdos, trilhas, certificados e materiais complementares são protegidos e
              destinados ao uso do contratante ou participante inscrito.
            </p>
            <p>
              Políticas de cancelamento, reembolso, remarcação e emissão de documentos devem
              ser integradas ao fluxo de checkout e ao painel administrativo.
            </p>
          </div>
        </article>
      </div>

      <style jsx>{`
        .legal {
          padding: 32px;
        }

        p {
          margin: 0;
          line-height: 1.8;
        }
      `}</style>
    </section>
  );
}
