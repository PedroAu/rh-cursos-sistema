"use client";

import { useState } from "react";
import { Download } from "lucide-react";

import { archiveEntityAction, updateLeadStatusAction } from "@/app/actions/admin";
import {
  AdminConfirmDialog,
  AdminDataTable,
  AdminFormModal,
  AdminRowActions,
  type AdminFormMode,
} from "@/components/admin/crud";
import { AdminLeadForm } from "@/components/forms/admin-lead-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AdminLeadRow, AdminSelectOption } from "@/lib/admin-data";

const statusOptions = ["Novo", "Convertido"];

type AdminLeadsCrudProps = {
  rows: AdminLeadRow[];
  courseOptions: AdminSelectOption[];
  emptyLabel: string;
  exportHref?: string;
  footer?: React.ReactNode;
};

export function AdminLeadsCrud({
  rows,
  courseOptions,
  emptyLabel,
  exportHref,
  footer,
}: AdminLeadsCrudProps) {
  const [mode, setMode] = useState<AdminFormMode>("create");
  const [selected, setSelected] = useState<AdminLeadRow | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [formOpened, setFormOpened] = useState(false);
  const [deleteOpened, setDeleteOpened] = useState(false);

  function openForm(nextMode: AdminFormMode, row?: AdminLeadRow) {
    setMode(nextMode);
    setSelected(row ?? null);
    setFormOpened(true);
  }

  async function archiveSelected() {
    if (!selected) return;
    const formData = new FormData();
    formData.set("table", "lead");
    formData.set("id", selected.id);
    await archiveEntityAction(formData);
  }

  async function updateStatus(id: string, status: string) {
    const formData = new FormData();
    formData.set("lead_id", id);
    formData.set("status_crm", status);
    await updateLeadStatusAction(formData);
  }

  async function updateSelectedStatus(status: string) {
    await Promise.all(selectedIds.map((id) => updateStatus(id, status)));
    setSelectedIds([]);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-heading text-2xl font-bold text-brand-navy-700">Leads</h2>
      </div>
      <AdminDataTable
        columns={[
          { key: "name", label: "Nome" },
          { key: "contact", label: "Contato" },
          { key: "type", label: "Tipo" },
          { key: "interest", label: "Interesse" },
          { key: "origin", label: "Origem" },
          { key: "status", label: "Status" },
          { key: "created", label: "Entrada" },
        ]}
        emptyLabel={emptyLabel}
        minWidth={1080}
        pageSize={15}
        rows={rows.map((row) => ({
          id: row.id,
          ariaLabel: `lead ${row.name}`,
          title: row.name,
          description: row.email,
          searchText: [
            row.name,
            row.email,
            row.phone,
            row.type,
            row.interest,
            row.origin,
            row.crmStatus,
            row.createdAt,
          ].join(" "),
          sortValues: {
            name: row.name,
            contact: row.email,
            type: row.type,
            interest: row.interest,
            origin: row.origin,
            status: row.crmStatus,
            created: row.createdAt,
          },
          cells: {
            name: (
              <div className="space-y-0.5">
                <p className="font-semibold text-foreground">{row.name}</p>
                <p className="text-xs text-muted-foreground">{row.id}</p>
              </div>
            ),
            contact: (
              <div className="space-y-0.5">
                <p className="text-sm">{row.email}</p>
                <p className="text-xs text-muted-foreground">{row.phone}</p>
              </div>
            ),
            type: row.type,
            interest: row.interest,
            origin: row.origin,
            status: (
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{row.crmStatus}</Badge>
                {statusOptions
                  .filter((status) => status !== row.crmStatus)
                  .slice(0, 2)
                  .map((status) => (
                    <Button
                      key={status}
                      onClick={() => updateStatus(row.id, status)}
                      size="sm"
                      type="button"
                      variant="ghost"
                    >
                      {status}
                    </Button>
                  ))}
              </div>
            ),
            created: row.createdAt,
          },
          actions: (
            <AdminRowActions
              entityLabel={`lead ${row.name}`}
              onDelete={() => {
                setSelected(row);
                setDeleteOpened(true);
              }}
              onEdit={() => openForm("edit", row)}
              onView={() => openForm("view", row)}
            />
          ),
        }))}
        searchPlaceholder="Buscar nesta lista de leads"
        selectionActions={
          <Button onClick={() => updateSelectedStatus("Convertido")} size="sm" type="button" variant="outline">
            Marcar convertidos
          </Button>
        }
        selection={{
          ariaLabel: "Selecionar leads visíveis",
          onSelectionChange: setSelectedIds,
          selectedIds,
        }}
        toolbarActions={
          <>
            {exportHref ? (
              <Button asChild variant="outline">
                <a href={exportHref}>
                  <Download className="size-4" aria-hidden="true" />
                  Exportar CSV
                </a>
              </Button>
            ) : null}
            <Button onClick={() => openForm("create")} type="button">
              Novo
            </Button>
          </>
        }
      />
      {footer ? footer : null}
      <AdminFormModal
        description={mode === "view" ? "Campos em modo somente leitura." : undefined}
        mode={mode}
        onClose={() => setFormOpened(false)}
        opened={formOpened}
        title={mode === "create" ? "Novo lead" : selected?.name ?? "Lead"}
      >
        {mode === "create" ? (
          <AdminLeadForm courseOptions={courseOptions} />
        ) : selected ? (
          <AdminLeadForm courseOptions={courseOptions} lead={selected} readOnly={mode === "view"} />
        ) : null}
      </AdminFormModal>
      <AdminConfirmDialog
        confirmLabel="Arquivar lead"
        message={`O lead ${selected?.name ?? ""} será removido da listagem ativa usando soft-delete.`}
        onClose={() => setDeleteOpened(false)}
        onConfirm={archiveSelected}
        opened={deleteOpened}
        title="Arquivar lead?"
      />
    </div>
  );
}
