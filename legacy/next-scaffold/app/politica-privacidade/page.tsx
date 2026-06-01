"use client";

export default function PrivacyPage() {
  return (
    <section className="section">
      <div className="container">
        <article className="surface-card legal">
          <div className="section-heading">
            <span className="eyebrow">Legal</span>
            <h1>Política de Privacidade</h1>
            <p>
              Esta versão resume a política prevista no PDR e estabelece a base para LGPD,
              consentimento de cookies e tratamento de dados em formulários e inscrições.
            </p>
          </div>
          <div className="stack-md">
            <p>
              Coletamos apenas os dados necessários para responder contatos, processar
              inscrições, emitir documentos e operar a área do aluno.
            </p>
            <p>
              O uso de métricas e cookies analíticos depende de consentimento do usuário,
              armazenado localmente e passível de revisão.
            </p>
            <p>
              Integrações com gateway, CRM, CMS, email e storage deverão operar sob contrato
              e bases legais compatíveis com a LGPD.
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
