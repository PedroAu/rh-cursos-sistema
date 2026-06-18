import { restoreEntityAction } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdminArchivedRow } from "@/lib/admin-data";

type AdminArchivedListProps = {
  rows: AdminArchivedRow[];
};

const tableLabels: Record<AdminArchivedRow["table"], string> = {
  curso: "Curso",
  instrutor: "Instrutor",
  turma: "Turma",
  lead: "Lead",
  aluno: "Aluno",
};

export function AdminArchivedList({ rows }: AdminArchivedListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Arquivados recentes</CardTitle>
        <CardDescription>Restauração rápida para registros com `deleted_at`.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum registro arquivado no momento.</p>
        ) : (
          rows.map((row) => (
            <Card key={`${row.table}-${row.id}`} className="shadow-none">
              <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">{row.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {tableLabels[row.table]} · {row.subtitle}
                  </p>
                  <p className="text-xs text-muted-foreground">Arquivado em {row.deletedAt}</p>
                </div>
                <form action={restoreEntityAction}>
                  <input name="table" type="hidden" value={row.table} />
                  <input name="id" type="hidden" value={row.id} />
                  <Button type="submit" variant="outline">
                    Restaurar
                  </Button>
                </form>
              </CardContent>
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  );
}
