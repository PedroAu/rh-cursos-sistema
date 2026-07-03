import { cn } from "@/lib/utils";

type SeatProgressProps = {
  filled: number;
  total: number;
};

/**
 * Barra de progresso de inscritos por turma. O percentual é exposto em texto
 * (não apenas cor) e a barra recebe role/aria-valuenow para leitores de tela.
 */
export function SeatProgress({ filled, total }: SeatProgressProps) {
  const safeTotal = Math.max(total, 0);
  const safeFilled = Math.min(Math.max(filled, 0), safeTotal || filled);
  const percent = safeTotal > 0 ? Math.round((safeFilled / safeTotal) * 100) : 0;
  const isFull = safeTotal > 0 && safeFilled >= safeTotal;

  return (
    <div className="min-w-36 space-y-1">
      <div className="flex items-center justify-between gap-2 text-xs font-medium text-foreground">
        <span>
          {safeFilled}/{safeTotal || "—"}
        </span>
        <span className="text-label-secondary">{isFull ? "Lotado" : `${percent}%`}</span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-surface-muted"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Inscritos: ${safeFilled} de ${safeTotal}`}
      >
        <div
          className={cn("h-full rounded-full transition-all", isFull ? "bg-tk-success" : "bg-tk-brand")}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
