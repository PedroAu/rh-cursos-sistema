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
import { AdminCreateInstructorForm } from "@/components/forms/admin-create-instructor-form";
import { AdminEditInstructorForm } from "@/components/forms/admin-edit-instructor-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AdminInstructorRow } from "@/lib/admin-data";

type AdminInstructorsCrudProps = {
  rows: AdminInstructorRow[];
  emptyLabel: string;
  footer?: React.ReactNode;
};

function InitialsAvatar({ label }: { label: string }) {
  return (
    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-navy-700 text-sm font-bold text-white" aria-hidden="true">
      {label.slice(0, 2).toUpperCase()}
    </div>
  );
}

export function AdminInstructorsCrud({ rows, emptyLabel, footer }: AdminInstructorsCrudProps) {
  const [mode, setMode] = useState<AdminFormMode>("create");
  const [selected, setSelected] = useState<AdminInstructorRow | null>(null);
  const [formOpened, setFormOpened] = useState(false);
  const [deleteOpened, setDeleteOpened] = useState(false);

  function openForm(nextMode: AdminFormMode, row?: AdminInstructorRow) {
    setMode(nextMode);
    setSelected(row ?? null);
    setFormOpened(true);
  }

  async function archiveSelected() {
    if (!selected) return;
    const formData = new FormData();
    formData.set("table", "instrutor");
    formData.set("id", selected.id);
    await archiveEntityAction(formData);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-heading text-2xl font-bold text-brand-navy-700">Gerenciar Professores</h2>
      </div>
      <AdminDataTable
        columns={[
          { key: "name", label: "Nome" },
          { key: "specialty", label: "Especialidade" },
          { key: "email", label: "E-mail" },
          { key: "classes", label: "Turmas" },
          { key: "status", label: "Status" },
        ]}
        emptyLabel={emptyLabel}
        pageSize={6}
        rows={rows.map((row) => ({
          id: row.id,
          ariaLabel: `instrutor ${row.name}`,
          title: row.name,
          description: row.email,
          searchText: [
            row.name,
            row.email,
            row.specialty,
            row.status,
            row.turmaCount,
          ].join(" "),
          sortValues: {
            name: row.name,
            specialty: row.specialty,
            email: row.email,
            classes: row.turmaCount,
            status: row.status,
          },
          cells: {
            name: (
              <div className="flex items-center gap-4">
                <InitialsAvatar label={row.name} />
                <p className="font-semibold text-foreground">{row.name}</p>
              </div>
            ),
            specialty: row.specialty,
            email: row.email,
            classes: row.turmaCount,
            status: (
              <Badge className={row.status === "Ativo" ? "bg-emerald-50 text-emerald-700" : undefined} variant="secondary">
                {row.status}
              </Badge>
            ),
          },
          actions: (
            <AdminRowActions
              entityLabel={`instrutor ${row.name}`}
              onDelete={() => {
                setSelected(row);
                setDeleteOpened(true);
              }}
              onEdit={() => openForm("edit", row)}
              onView={() => openForm("view", row)}
            />
          ),
        }))}
        searchPlaceholder="Buscar nesta lista de professores"
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
        title={mode === "create" ? "Novo instrutor" : selected?.name ?? "Instrutor"}
      >
        {mode === "create" ? (
          <AdminCreateInstructorForm />
        ) : selected ? (
          <AdminEditInstructorForm instructor={selected} readOnly={mode === "view"} />
        ) : null}
      </AdminFormModal>
      <AdminConfirmDialog
        confirmLabel="Arquivar instrutor"
        message={`O instrutor ${selected?.name ?? ""} será removido da listagem ativa usando soft-delete.`}
        onClose={() => setDeleteOpened(false)}
        onConfirm={archiveSelected}
        opened={deleteOpened}
        title="Arquivar instrutor?"
      />
    </div>
  );
}
