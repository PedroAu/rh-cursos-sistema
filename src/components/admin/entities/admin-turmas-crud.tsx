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
import { AdminCreateTurmaForm } from "@/components/forms/admin-create-turma-form";
import { AdminEditTurmaForm } from "@/components/forms/admin-edit-turma-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { AdminAgendaRow, AdminSelectOption } from "@/lib/admin-data";

type AdminTurmasCrudProps = {
  rows: AdminAgendaRow[];
  courseOptions: AdminSelectOption[];
  instructorOptions: AdminSelectOption[];
  emptyLabel: string;
  footer?: React.ReactNode;
};

function formatClassFormat(format: string) {
  return format === "Hibrido" ? "Híbrido" : format;
}

export function AdminTurmasCrud({
  rows,
  courseOptions,
  instructorOptions,
  emptyLabel,
  footer,
}: AdminTurmasCrudProps) {
  const [mode, setMode] = useState<AdminFormMode>("create");
  const [selected, setSelected] = useState<AdminAgendaRow | null>(null);
  const [formOpened, setFormOpened] = useState(false);
  const [deleteOpened, setDeleteOpened] = useState(false);

  function openForm(nextMode: AdminFormMode, row?: AdminAgendaRow) {
    setMode(nextMode);
    setSelected(row ?? null);
    setFormOpened(true);
  }

  async function archiveSelected() {
    if (!selected) return;
    const formData = new FormData();
    formData.set("table", "turma");
    formData.set("id", selected.id);
    await archiveEntityAction(formData);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-heading text-2xl font-bold text-brand-navy-700">Próximas turmas</h2>
      </div>
      <AdminDataTable
        columns={[
          { key: "course", label: "Curso" },
          { key: "date", label: "Data" },
          { key: "format", label: "Formato" },
          { key: "location", label: "Local" },
          { key: "seats", label: "Vagas" },
          { key: "status", label: "Status" },
        ]}
        emptyLabel={emptyLabel}
        pageSize={6}
        rows={rows.map((row) => {
          const occupancy = row.seatsTotal > 0 ? (row.seatsFilled / row.seatsTotal) * 100 : 0;

          return {
            id: row.id,
            ariaLabel: `turma ${row.courseTitle}`,
            title: row.courseTitle,
            description: row.id,
            searchText: [
              row.courseTitle,
              row.id,
              row.startDate,
              row.endDate,
              row.format,
              row.schedule,
              row.location,
              `${row.seatsFilled}/${row.seatsTotal}`,
              row.status,
            ].join(" "),
            sortValues: {
              course: row.courseTitle,
              date: row.startDate,
              format: formatClassFormat(row.format),
              location: `${row.schedule} ${row.location}`,
              seats: Math.round(occupancy),
              status: row.status,
            },
            cells: {
              course: (
                <div className="space-y-0.5">
                  <p className="font-semibold text-foreground">{row.courseTitle}</p>
                  <p className="text-xs text-muted-foreground">{row.id}</p>
                </div>
              ),
              date: `${row.startDate}${row.endDate ? ` até ${row.endDate}` : ""}`,
              format: row.format,
              location: `${row.schedule} · ${row.location}`,
              seats: (
                <div className="space-y-2">
                  <p className="text-sm">
                    {row.seatsFilled} / {row.seatsTotal}
                  </p>
                  <Progress className={occupancy >= 90 ? "[&>div]:bg-destructive" : undefined} value={occupancy} />
                </div>
              ),
              status: (
                <Badge className="bg-brand-gold/15 text-brand-navy-900" variant="secondary">
                  {row.status}
                </Badge>
              ),
            },
            actions: (
              <AdminRowActions
                entityLabel={`turma ${row.courseTitle}`}
                onDelete={() => {
                  setSelected(row);
                  setDeleteOpened(true);
                }}
                onEdit={() => openForm("edit", row)}
                onView={() => openForm("view", row)}
              />
            ),
          };
        })}
        searchPlaceholder="Buscar nesta lista de turmas"
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
        title={mode === "create" ? "Nova turma" : selected?.courseTitle ?? "Turma"}
      >
        {mode === "create" ? (
          <AdminCreateTurmaForm courseOptions={courseOptions} instructorOptions={instructorOptions} />
        ) : selected ? (
          <AdminEditTurmaForm
            courseOptions={courseOptions}
            instructorOptions={instructorOptions}
            readOnly={mode === "view"}
            turma={selected}
          />
        ) : null}
      </AdminFormModal>
      <AdminConfirmDialog
        confirmLabel="Arquivar turma"
        message={`A turma ${selected?.courseTitle ?? ""} será removida da listagem ativa usando soft-delete.`}
        onClose={() => setDeleteOpened(false)}
        onConfirm={archiveSelected}
        opened={deleteOpened}
        title="Arquivar turma?"
      />
    </div>
  );
}
