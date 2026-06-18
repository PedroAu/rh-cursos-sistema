"use client";

import { useState, useTransition } from "react";
import { IconAlertCircle } from "@tabler/icons-react";

import { createPixOrBoletoCharge } from "@/app/actions/payment";
import { BoletoPanel } from "@/components/payment/boleto-panel";
import { PixPanel } from "@/components/payment/pix-panel";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type CheckoutClientProps = {
  courseSlug: string;
  enrollmentRef?: string;
  customer: { name: string; cpfCnpj: string };
};

type ChargeArtifacts =
  | { billingType: "PIX"; pix: { qrImage: string; payload: string } }
  | { billingType: "BOLETO"; boleto: { url: string | null; linhaDigitavel: string } };

export function CheckoutClient({ courseSlug, enrollmentRef, customer }: CheckoutClientProps) {
  const [method, setMethod] = useState<"pix" | "boleto">("pix");
  const [artifacts, setArtifacts] = useState<ChargeArtifacts | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSelectMethod(value: string | null) {
    if (value !== "pix" && value !== "boleto") {
      return;
    }

    setMethod(value);
    setError(null);
    setArtifacts(null);

    startTransition(async () => {
      const result = await createPixOrBoletoCharge(
        {
          courseSlug,
          enrollmentRef,
          billingType: value === "pix" ? "PIX" : "BOLETO",
        },
        customer,
      );

      if (!result.success) {
        setError(result.error);
        return;
      }

      if (result.billingType === "PIX" && result.pix) {
        setArtifacts({ billingType: "PIX", pix: result.pix });
      } else if (result.billingType === "BOLETO" && result.boleto) {
        setArtifacts({ billingType: "BOLETO", boleto: result.boleto });
      }
    });
  }

  return (
    <div className="space-y-6" data-testid="checkout-client">
      <h2 className="font-heading text-3xl font-bold text-foreground">
        Escolha a forma de pagamento
      </h2>

      <Tabs value={method} onValueChange={handleSelectMethod}>
        <TabsList>
          <TabsTrigger value="pix" aria-label="Pagar com Pix">
            Pix
          </TabsTrigger>
          <TabsTrigger value="boleto" aria-label="Pagar com Boleto">
            Boleto
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {isPending ? (
        <div className="flex flex-col items-center gap-2" role="status" aria-live="polite">
          <span className="inline-block size-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <p className="text-sm text-muted-foreground">
            Gerando cobrança...
          </p>
        </div>
      ) : null}

      {error ? (
        <Alert variant="destructive">
          <IconAlertCircle className="mb-2 size-5" aria-hidden="true" />
          <AlertTitle>Não foi possível gerar a cobrança</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {!isPending && artifacts?.billingType === "PIX" ? (
        <PixPanel qrImage={artifacts.pix.qrImage} payload={artifacts.pix.payload} />
      ) : null}

      {!isPending && artifacts?.billingType === "BOLETO" ? (
        <BoletoPanel url={artifacts.boleto.url} linhaDigitavel={artifacts.boleto.linhaDigitavel} />
      ) : null}
    </div>
  );
}
