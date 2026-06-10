import { Skeleton } from "@/components/ui/skeleton";

export function LoadingBlocks({
  count = 3,
  summary = "Carregando resultados..."
}: {
  count?: number;
  summary?: string;
}) {
  return (
    <div className="space-y-4" aria-live="polite" aria-busy="true">
      <p className="text-sm leading-6 text-label-secondary">{summary}</p>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="surface-card p-5">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="mt-4 h-8 w-3/4" />
            <Skeleton className="mt-3 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-5/6" />
            <div className="mt-6 flex gap-3">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 flex-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
