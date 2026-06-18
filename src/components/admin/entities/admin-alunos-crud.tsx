"use client";

import { useState } from "react";

import { archiveEntityAction } from "@/app/actions/admin";
import {
  AdminConfirmDialog,
  AdminDataTable,
  AdminFormModal,
  AdminRowActions,
  type AdminFormMode,
} from "@/components/admin/crud";
import { AdminAlunoForm } from "@/components/forms/admin-aluno-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AdminAlunoRow } from "@/lib/admin-data";

type AdminAlunosCrudProps = {
  rows: AdminAlunoRow[];
  emptyLabel: string;
  footer?: React.ReactNode;
};

export function AdminAlunosCrud({ rows, emptyLabel, footer }: AdminAlunosCrudProps) {
  const [mode, setMode] = useState<AdminFormMode>("create");
  const [selected, setSelected] = useState<AdminAlunoRow | null>(null);
  const [formOpened, setFormOpened] = useState(false);
  const [deleteOpened, setDeleteOpened] = useState(false);

  function openForm(nextMode: AdminFormMode, row?: AdminAlunoRow) {
    setMode(nextMode);
    setSelected(row ?? null);
    setFormOpened(true);
  }

  async function archiveSelected() {
    if (!selected) return;
    const formData = new FormData();
    formData.set("table", "aluno");
    formData.set("id", selected.id);
    await archiveEntityAction(formData);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-heading text-2xl font-bold text-brand-navy-700">Gerenciar Alunos</h2>
      </div>
      <AdminDataTable
        columns={[
          { key: "name", label: "Aluno" },
          { key: "contact", label: "Contato" },
          { key: "type", label: "Tipo" },
          { key: "organization", label: "Órgão/empresa" },
          { key: "created", label: "Cadastro" },
        ]}
        emptyLabel={emptyLabel}
        minWidth={1040}
        pageSize={10}
        rows={rows.map((row) => ({
          id: row.id,
          ariaLabel: `aluno ${row.fullName}`,
          title: row.fullName,
          description: row.email,
          searchText: [
            row.fullName,
            row.email,
            row.cpf,
            row.phone,
            row.role,
            row.organization,
            row.studentType,
          ].join(" "),
          sortValues: {
            name: row.fullName,
            contact: row.email,
            type: row.studentType,
            organization: row.organization,
            created: row.createdAt,
          },
          cells: {
            name: (
              <div className="space-y-0.5">
                <p className="font-semibold text-foreground">{row.fullName}</p>
                <p className="text-xs text-muted-foreground">{row.role || row.id}</p>
              </div>
            ),
            contact: (
              <div className="space-y-0.5">
                <p className="text-sm">{row.email}</p>
                <p className="text-xs text-muted-foreground">{row.phone || "Telefone nao informado"}</p>
              </div>
            ),
            type: (
              <Badge className={row.studentType === "PJ" ? "bg-brand-gold/15 text-brand-navy-900" : undefined} variant="secondary">
                {row.studentType}
              </Badge>
            ),
            organization: row.organization || "-",
            created: row.createdAt,
          },
          actions: (
            <AdminRowActions
              entityLabel={`aluno ${row.fullName}`}
              onDelete={() => {
                setSelected(row);
                setDeleteOpened(true);
              }}
              onEdit={() => openForm("edit", row)}
              onView={() => openForm("view", row)}
            />
          ),
        }))}
        searchPlaceholder="Buscar nesta lista de alunos"
        toolbarActions={
          <Button onClick={() => openForm("create")} type="button">
            Novo
          </Button>
        }
      />
      {footer ? footer : null}
      <AdminFormModal
        description={mode === "view" ? "Campos em modo somente leitura." : undefined}
        mode={mode}
        onClose={() => setFormOpened(false)}
        opened={formOpened}
        title={mode === "create" ? "Novo aluno" : selected?.fullName ?? "Aluno"}
      >
        {mode === "create" ? (
          <AdminAlunoForm />
        ) : selected ? (
          <AdminAlunoForm aluno={selected} readOnly={mode === "view"} />
        ) : null}
      </AdminFormModal>
      <AdminConfirmDialog
        confirmLabel="Arquivar aluno"
        message={`O aluno ${selected?.fullName ?? ""} será removido da listagem ativa usando soft-delete.`}
        onClose={() => setDeleteOpened(false)}
        onConfirm={archiveSelected}
        opened={deleteOpened}
        title="Arquivar aluno?"
      />
    </div>
  );
}
