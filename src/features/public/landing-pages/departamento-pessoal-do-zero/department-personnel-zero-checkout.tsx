"use client";

import { useRef, useState, type FormEvent } from "react";
import { CreditCard, LoaderCircle, LockKeyhole, QrCode } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DP_ZERO_SLUG } from "@/features/public/landing-pages/departamento-pessoal-do-zero/content";
import { trackEvent } from "@/lib/analytics";

type CheckoutField = "name" | "email" | "cpf" | "phone";
type CheckoutFieldErrors = Partial<Record<CheckoutField, string>>;

function validateCheckoutFields(values: Record<CheckoutField, string>): CheckoutFieldErrors {
  const errors: CheckoutFieldErrors = {};
  const name = values.name.trim();
  const email = values.email.trim();
  const cpfDigits = values.cpf.replace(/\D/g, "");
  const phoneDigits = values.phone.replace(/\D/g, "");

  if (!name) errors.name = "Digite seu nome completo.";
  else if (name.length < 3) errors.name = "Digite seu nome completo (pelo menos 3 caracteres).";

  if (!email) errors.email = "Digite seu e-mail.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Digite um e-mail válido, como voce@exemplo.com.br.";
  }

  if (!cpfDigits) errors.cpf = "Digite seu CPF.";
  else if (cpfDigits.length !== 11) errors.cpf = "Digite o CPF completo no formato 000.000.000-00.";

  if (!phoneDigits) errors.phone = "Digite seu telefone com DDD.";
  else if (phoneDigits.length < 10 || phoneDigits.length > 11) {
    errors.phone = "Digite um telefone válido com DDD, como (61) 99999-9999.";
  }

  return errors;
}

function maskCpf(value: string): string {
  return value
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }
  return digits
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

export function DepartmentPersonnelZeroCheckout({
  interestFreeInstallmentsConfirmed,
}: {
  interestFreeInstallmentsConfirmed: boolean;
}) {
  const idempotencyKey = useRef<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<CheckoutFieldErrors>({});
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");

  function clearFieldError(field: CheckoutField) {
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setError("");
    const data = new FormData(event.currentTarget);
    const values = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      cpf: String(data.get("cpf") ?? ""),
      phone: String(data.get("phone") ?? ""),
    } satisfies Record<CheckoutField, string>;
    const nextFieldErrors = validateCheckoutFields(values);
    setFieldErrors(nextFieldErrors);
    if (Object.keys(nextFieldErrors).length > 0) {
      const firstInvalidField = Object.keys(nextFieldErrors)[0] as CheckoutField;
      document.getElementById(`checkout-${firstInvalidField}`)?.focus();
      return;
    }

    setSubmitting(true);
    idempotencyKey.current ??= crypto.randomUUID();
    try {
      const response = await fetch("/api/payments/asaas/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            productSlug: DP_ZERO_SLUG,
            idempotencyKey: idempotencyKey.current,
          name: values.name,
          email: values.email,
          cpf: values.cpf,
          phone: values.phone,
        }),
      });
      const body = (await response.json().catch(() => null)) as
        | { checkoutUrl?: string; error?: string; retryWithNewAttempt?: boolean }
        | null;
      if (!response.ok || !body?.checkoutUrl) {
        if (body?.retryWithNewAttempt) idempotencyKey.current = null;
          throw new Error(body?.error || "Não foi possível abrir o pagamento. Confira os dados e tente novamente.");
      }

      trackEvent("checkout_iniciado", {
        course: DP_ZERO_SLUG,
        provider: "asaas",
      });
      window.location.assign(body.checkoutUrl);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Não foi possível abrir o pagamento. Confira os dados e tente novamente.",
      );
      setSubmitting(false);
    }
  }

  return (
    <section className="bg-tk-surface-2 py-10 sm:py-16">
      <div className="container grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <Card className="order-2 lg:order-1">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-tk-accent">
              Inscrição e pagamento
            </p>
            <h1 className="mt-2 font-tk-display text-page-title font-bold leading-tight text-tk-ink">
              Complete seus dados
            </h1>
            <p className="mt-3 leading-7 text-tk-ink-muted">
              Em seguida, você será direcionado ao ambiente seguro do Asaas para escolher Pix ou cartão.
            </p>
          </div>

          <form className="grid gap-5" onSubmit={handleSubmit} noValidate>
            <Input
              id="checkout-name"
              name="name"
              label="Nome completo"
              autoComplete="name"
              minLength={3}
              maxLength={100}
              required
              error={fieldErrors.name}
              onChange={() => clearFieldError("name")}
            />
            <Input
              id="checkout-email"
              name="email"
              type="email"
              label="E-mail"
              autoComplete="email"
              maxLength={254}
              required
              error={fieldErrors.email}
              onChange={() => clearFieldError("email")}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                id="checkout-cpf"
                name="cpf"
                label="CPF"
                inputMode="numeric"
                autoComplete="off"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(event) => {
                  setCpf(maskCpf(event.target.value));
                  clearFieldError("cpf");
                }}
                pattern="\d{3}\.\d{3}\.\d{3}-\d{2}"
                required
                error={fieldErrors.cpf}
              />
              <Input
                id="checkout-phone"
                name="phone"
                type="tel"
                label="Telefone"
                inputMode="tel"
                autoComplete="tel"
                placeholder="(00) 00000-0000"
                value={phone}
                onChange={(event) => {
                  setPhone(maskPhone(event.target.value));
                  clearFieldError("phone");
                }}
                pattern="\(\d{2}\)\s\d{4,5}-\d{4}"
                required
                error={fieldErrors.phone}
              />
            </div>

            <p className="rounded-tk-md border border-tk-line bg-tk-surface-2 p-4 text-xs leading-5 text-tk-ink-muted">
              Seus dados registram a inscrição. No ambiente seguro do Asaas, você confirmará seus dados, informará o endereço e escolherá Pix ou cartão. Isso não autoriza comunicações de marketing; os dados do cartão não são recebidos nem armazenados por esta página.
            </p>

            {error ? (
              <p role="alert" className="rounded-tk-md bg-red-50 p-4 text-sm text-tk-error">
                {error}
              </p>
            ) : null}

            <Button type="submit" size="lg" disabled={submitting} className="w-full">
              {submitting ? (
                <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />
              ) : (
                <LockKeyhole className="h-5 w-5" aria-hidden="true" />
              )}
              {submitting ? "Abrindo pagamento seguro…" : "Ir para o pagamento seguro"}
            </Button>
          </form>
        </Card>

        <Card className="order-1 lg:order-2" variant="filled">
          <p className="text-sm font-semibold text-tk-ink-muted">Seu pedido</p>
          <h2 className="mt-3 font-tk-display text-section-heading font-bold text-tk-ink">
            Departamento Pessoal do Zero
          </h2>
          <p className="mt-2 text-sm leading-6 text-tk-ink-muted">
            Formação gravada e online · 40 horas · acesso ao kit de materiais
          </p>
          <div className="my-6 border-t border-tk-line" />
          <div className="flex items-end justify-between gap-4">
            <span className="font-semibold text-tk-ink">Total</span>
            <span className="font-tk-display text-3xl font-bold text-tk-ink">R$ 297</span>
          </div>
          <div className="mt-6 grid gap-3 text-sm text-tk-ink-muted">
            <div className="flex items-center gap-3">
              <QrCode className="h-5 w-5 text-tk-accent" aria-hidden="true" />
              Pix
            </div>
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-tk-accent" aria-hidden="true" />
              {interestFreeInstallmentsConfirmed
                ? "Cartão em até 12x sem juros"
                : "Cartão à vista"}
            </div>
          </div>
          <p className="mt-6 flex items-start gap-2 text-xs leading-5 text-tk-ink-muted">
            <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            Pagamento processado pelo Asaas. Esta página não recebe os dados do seu cartão.
          </p>
        </Card>
      </div>
    </section>
  );
}
