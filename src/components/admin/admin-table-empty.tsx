import { Inbox } from "lucide-react";

import { TableCell, TableRow } from "@/components/ui/table";

type AdminTableEmptyProps = {
  colSpan: number;
  title?: string;
  description?: string;
};

/**
 * Linha de estado vazio para tabelas administrativas.
 * Renderiza uma única célula que ocupa todas as colunas.
 */
export function AdminTableEmpty({
  colSpan,
  title = "Nenhum registro encontrado",
  description = "Ajuste os filtros ou limpe a busca para ver mais resultados.",
}: AdminTableEmptyProps) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan}>
        <div className="mx-auto flex max-w-sm flex-col items-center gap-3 py-12 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Inbox className="size-6" aria-hidden="true" />
          </div>
          <p className="text-sm font-bold text-foreground">{title}</p>
          <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
      </TableCell>
    </TableRow>
  );
}
