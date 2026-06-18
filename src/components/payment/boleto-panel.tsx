"use client";

import { useState } from "react";
import { IconCheck, IconCopy, IconFileText } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type BoletoPanelProps = {
  url: string | null;
  linhaDigitavel: string;
};

export function BoletoPanel({ url, linhaDigitavel }: BoletoPanelProps) {
  const [copied, setCopied] = useState(false);

  function copyLinhaDigitavel() {
    void navigator.clipboard?.writeText(linhaDigitavel);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-4" data-testid="boleto-panel">
      <h3 className="font-heading text-2xl font-bold text-foreground">
        Pague com Boleto
      </h3>
      <p className="text-sm leading-6 text-muted-foreground">
        Copie a linha digitável ou baixe o PDF do boleto para pagar no seu banco.
      </p>
      <div className="space-y-2">
        <Label htmlFor="boleto-linha-digitavel">Linha digitável</Label>
        <Input
          id="boleto-linha-digitavel"
          value={linhaDigitavel}
          readOnly
          aria-label="Linha digitável do boleto"
        />
        <Button
          className="w-full"
          onClick={copyLinhaDigitavel}
          aria-label="Copiar linha digitável"
          type="button"
          variant="gold"
        >
          {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
          {copied ? "Copiado" : "Copiar linha digitável"}
        </Button>
      </div>
      {url ? (
        <Button asChild variant="outline">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Abrir boleto em PDF"
          >
            <IconFileText size={16} />
            Abrir boleto em PDF
          </a>
        </Button>
      ) : null}
    </div>
  );
}
