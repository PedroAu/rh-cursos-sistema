"use client";

import { useState } from "react";
import { IconCheck, IconCopy } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type PixPanelProps = {
  qrImage: string;
  payload: string;
};

export function PixPanel({ qrImage, payload }: PixPanelProps) {
  const [copied, setCopied] = useState(false);

  function copyPayload() {
    void navigator.clipboard?.writeText(payload);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col items-center gap-4" data-testid="pix-panel">
      <h3 className="font-heading text-2xl font-bold text-foreground">
        Pague com Pix
      </h3>
      <p className="max-w-md text-center text-sm leading-6 text-muted-foreground">
        Escaneie o QR Code abaixo ou copie o código para pagar no app do seu banco.
      </p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`data:image/png;base64,${qrImage}`}
        alt="QR Code Pix para pagamento"
        className="size-[220px] rounded-md border bg-white object-contain p-3"
      />
      <div className="w-full space-y-2">
        <Label htmlFor="pix-payload">Código copia e cola</Label>
        <Input
          id="pix-payload"
          value={payload}
          readOnly
          aria-label="Código Pix copia e cola"
        />
        <Button
          className="w-full"
          onClick={copyPayload}
          aria-label="Copiar código Pix"
          type="button"
          variant="gold"
        >
          {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
          {copied ? "Copiado" : "Copiar código Pix"}
        </Button>
      </div>
    </div>
  );
}
