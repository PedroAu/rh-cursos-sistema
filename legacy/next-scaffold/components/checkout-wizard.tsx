"use client";

import Link from "next/link";
import { useState } from "react";

import type { Course } from "@/lib/site-data";

export function CheckoutWizard({ course }: { course: Course }) {
  const [step, setStep] = useState(1);
  const [buyerType, setBuyerType] = useState<"pf" | "pj">("pf");
  const [paymentMethod, setPaymentMethod] = useState<"cartao" | "pix" | "boleto">("pix");

  return (
    <>
      <section id="checkout" className="surface-card checkout">
        <div className="stack-sm">
          <span className="eyebrow">Checkout preparado para integração</span>
          <h3>Inscreva-se agora</h3>
          <p>
            Fluxo visual de 3 etapas pronto para conectar gateway, CRM e disparos
            transacionais na próxima fase.
          </p>
        </div>

        <div className="stepper">
          {[1, 2, 3].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setStep(item)}
              className={step === item ? "active" : ""}
            >
              {item}
            </button>
          ))}
        </div>

        {step === 1 ? (
          <div className="stack-sm">
            <input placeholder="Nome completo" />
            <div className="grid">
              <input placeholder="CPF" />
              <input placeholder="Email" />
            </div>
            <div className="grid">
              <input placeholder="Telefone" />
              <input placeholder="Cargo" />
            </div>
            <div className="toggle-row">
              <button
                type="button"
                className={buyerType === "pf" ? "active" : ""}
                onClick={() => setBuyerType("pf")}
              >
                Pessoa Física
              </button>
              <button
                type="button"
                className={buyerType === "pj" ? "active" : ""}
                onClick={() => setBuyerType("pj")}
              >
                Pessoa Jurídica
              </button>
            </div>
            {buyerType === "pj" ? (
              <div className="grid">
                <input placeholder="CNPJ" />
                <input placeholder="Razão Social" />
              </div>
            ) : null}
          </div>
        ) : null}

        {step === 2 ? (
          <div className="stack-sm">
            <div className="toggle-row">
              <button
                type="button"
                className={paymentMethod === "pix" ? "active" : ""}
                onClick={() => setPaymentMethod("pix")}
              >
                PIX
              </button>
              <button
                type="button"
                className={paymentMethod === "boleto" ? "active" : ""}
                onClick={() => setPaymentMethod("boleto")}
              >
                Boleto
              </button>
              <button
                type="button"
                className={paymentMethod === "cartao" ? "active" : ""}
                onClick={() => setPaymentMethod("cartao")}
              >
                Cartão
              </button>
            </div>

            {paymentMethod === "pix" ? (
              <div className="surface-card payment-card">
                <strong>PIX com confirmação automática</strong>
                <p className="muted">
                  QR Code dinâmico com expiração de 30 min e polling previsto para confirmação.
                </p>
              </div>
            ) : null}

            {paymentMethod === "boleto" ? (
              <div className="surface-card payment-card">
                <strong>Boleto com vencimento em 3 dias úteis</strong>
                <p className="muted">
                  Fluxo preparado para geração de PDF, envio por email e atualização por webhook.
                </p>
              </div>
            ) : null}

            {paymentMethod === "cartao" ? (
              <div className="stack-sm">
                <div className="grid">
                  <input placeholder="Nome impresso no cartão" />
                  <input placeholder="Número do cartão" />
                </div>
                <div className="grid">
                  <input placeholder="Validade" />
                  <input placeholder="CVV" />
                </div>
              </div>
            ) : null}

            <input placeholder="Cupom de desconto (opcional)" />
          </div>
        ) : null}

        {step === 3 ? (
          <div className="surface-card confirmation">
            <strong>Resumo da inscrição</strong>
            <ul>
              <li>{course.title}</li>
              <li>{course.nextClass}</li>
              <li>{course.price}</li>
              <li>Método selecionado: {paymentMethod.toUpperCase()}</li>
            </ul>
            <p className="muted">
              Após a confirmação, o aluno recebe email com instruções e acesso à área do
              aluno.
            </p>
          </div>
        ) : null}

        <div className="actions">
          <button
            type="button"
            className="button-outline"
            onClick={() => setStep((current) => Math.max(1, current - 1))}
          >
            Voltar
          </button>
          {step < 3 ? (
            <button
              type="button"
              className="button"
              onClick={() => setStep((current) => Math.min(3, current + 1))}
            >
              Continuar
            </button>
          ) : (
            <Link className="button" href="/obrigado">
              Finalizar inscrição
            </Link>
          )}
        </div>
      </section>

      <style jsx>{`
        .checkout {
          display: grid;
          gap: 22px;
          padding: 26px;
        }

        h3 {
          margin: 0;
          font-family: var(--font-merriweather), serif;
          font-size: 1.8rem;
          color: var(--color-primary);
        }

        p,
        ul {
          margin: 0;
          line-height: 1.7;
        }

        .stepper {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }

        .stepper button,
        .toggle-row button {
          min-height: 46px;
          border-radius: 14px;
          border: 1px solid rgba(27, 47, 94, 0.12);
          background: rgba(255, 255, 255, 0.92);
          font-weight: 700;
        }

        .stepper button.active,
        .toggle-row button.active {
          background: var(--color-primary);
          color: var(--color-white);
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        input {
          width: 100%;
          min-height: 52px;
          padding: 0 16px;
          border-radius: 14px;
          border: 1px solid rgba(27, 47, 94, 0.12);
          background: rgba(255, 255, 255, 0.96);
        }

        .toggle-row,
        .actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .payment-card,
        .confirmation {
          padding: 18px;
          border-left: 4px solid var(--color-accent);
        }

        ul {
          padding-left: 18px;
        }

        @media (max-width: 767px) {
          .grid,
          .stepper {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
