import { AlertTriangle, Home, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { company } from "@/lib/company";

type ErrorFallbackProps = {
  title?: string;
  description?: string;
  /** Identificador do erro (ex.: `error.digest` do Next) exibido para suporte. */
  errorId?: string;
  /** Quando fornecido, exibe o botão "Tentar novamente". */
  onReset?: () => void;
  homeHref?: string;
};

/**
 * UI de fallback amigável para error boundaries (ver `app/error.tsx`).
 *
 * Renderiza dentro do root layout, portanto os tokens de design (`--ea-*`) e o
 * Tailwind estão disponíveis. Para o boundary de último recurso — quando o
 * próprio root layout falha — use `app/global-error.tsx`, que é auto-contido.
 */
export function ErrorFallback({
  title = "Algo deu errado",
  description = "Encontramos um problema inesperado ao carregar esta página. Você pode tentar novamente ou voltar para a página inicial.",
  errorId,
  onReset,
  homeHref = "/"
}: ErrorFallbackProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <div className="rounded-full bg-secondary p-4 text-primary">
        <AlertTriangle className="h-8 w-8" aria-hidden="true" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="max-w-xl text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {errorId ? (
        <p className="text-xs text-muted-foreground">
          Código do erro: <code className="font-mono">{errorId}</code>
        </p>
      ) : null}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {onReset ? (
          <Button onClick={onReset}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Tentar novamente
          </Button>
        ) : null}
        <Button asChild variant="outline">
          <a href={homeHref}>
            <Home className="h-4 w-4" aria-hidden="true" />
            Ir para o início
          </a>
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Se o problema persistir, entre em contato:{" "}
        <a className="underline" href={`mailto:${company.email}`}>
          {company.email}
        </a>
      </p>
    </div>
  );
}
