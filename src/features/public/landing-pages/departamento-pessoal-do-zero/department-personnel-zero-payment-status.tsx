import { CircleAlert, CircleCheckBig, Clock3 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DP_ZERO_CHECKOUT_PATH,
  DP_ZERO_LANDING_PATH,
} from "@/features/public/landing-pages/departamento-pessoal-do-zero/content";

const statusContent = {
  sucesso: {
    icon: CircleCheckBig,
    eyebrow: "Retorno do pagamento",
    title: "Estamos confirmando seu pagamento",
    description:
      "O retorno desta página não confirma a cobrança. Assim que o Asaas notificar o sistema de inscrições, sua inscrição será confirmada automaticamente.",
    primary: "Voltar para a página do curso",
    primaryHref: DP_ZERO_LANDING_PATH,
  },
  cancelado: {
    icon: CircleAlert,
    eyebrow: "Pagamento cancelado",
    title: "Seu pagamento não foi concluído",
    description:
      "Nenhuma confirmação foi feita por esta página. Se quiser continuar, inicie uma nova tentativa de pagamento.",
    primary: "Tentar novamente",
    primaryHref: DP_ZERO_CHECKOUT_PATH,
  },
  expirado: {
    icon: Clock3,
    eyebrow: "Checkout expirado",
    title: "O tempo desta tentativa terminou",
    description:
      "O pagamento não foi confirmado. Para sua segurança, volte ao formulário e gere um novo checkout.",
    primary: "Gerar novo checkout",
    primaryHref: DP_ZERO_CHECKOUT_PATH,
  },
} as const;

export function DepartmentPersonnelZeroPaymentStatus({
  status,
}: {
  status: keyof typeof statusContent;
}) {
  const content = statusContent[status];
  const Icon = content.icon;

  return (
    <section className="bg-tk-surface-2 py-16 sm:py-24">
      <div className="container max-w-2xl">
        <Card className="text-center">
          <Icon className="mx-auto h-12 w-12 text-tk-accent" aria-hidden="true" />
          <p className="mt-5 text-sm font-semibold uppercase tracking-[0.14em] text-tk-accent">
            {content.eyebrow}
          </p>
          <h1 className="mt-3 font-tk-display text-page-title font-bold leading-tight text-tk-ink">
            {content.title}
          </h1>
          <p className="mx-auto mt-4 max-w-xl leading-7 text-tk-ink-muted">
            {content.description}
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href={content.primaryHref}>{content.primary}</Link>
            </Button>
            {status !== "sucesso" ? (
              <Button asChild size="lg" variant="outline">
                <Link href={DP_ZERO_LANDING_PATH}>Voltar para o curso</Link>
              </Button>
            ) : null}
          </div>
        </Card>
      </div>
    </section>
  );
}
