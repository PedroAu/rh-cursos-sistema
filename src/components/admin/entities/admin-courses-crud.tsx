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
import { AdminCreateCourseForm } from "@/components/forms/admin-create-course-form";
import { AdminEditCourseForm } from "@/components/forms/admin-edit-course-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { AdminCourseRow } from "@/lib/admin-data";

type AdminCoursesCrudProps = {
  rows: AdminCourseRow[];
  emptyLabel: string;
  footer?: React.ReactNode;
};

function formatCourseFormat(format: string) {
  return format === "Hibrido" ? "Híbrido" : format;
}

export function AdminCoursesCrud({ rows, emptyLabel, footer }: AdminCoursesCrudProps) {
  const [mode, setMode] = useState<AdminFormMode>("create");
  const [selected, setSelected] = useState<AdminCourseRow | null>(null);
  const [formOpened, setFormOpened] = useState(false);
  const [deleteOpened, setDeleteOpened] = useState(false);

  function openForm(nextMode: AdminFormMode, row?: AdminCourseRow) {
    setMode(nextMode);
    setSelected(row ?? null);
    setFormOpened(true);
  }

  async function archiveSelected() {
    if (!selected) return;
    const formData = new FormData();
    formData.set("table", "curso");
    formData.set("id", selected.id);
    await archiveEntityAction(formData);
  }

  const modalTitle =
    mode === "create" ? "Novo curso" : selected?.title ?? "Curso";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-heading text-2xl font-bold text-brand-navy-700">Listagem de Cursos</h2>
      </div>

      <AdminDataTable
        columns={[
          { key: "course", label: "Curso / Turma" },
          { key: "category", label: "Categoria" },
          { key: "format", label: "Formato" },
          { key: "price", label: "Preço" },
          { key: "status", label: "Status" },
          { key: "seats", label: "Inscrições" },
        ]}
        emptyLabel={emptyLabel}
        pageSize={6}
        rows={rows.map((row) => ({
          id: row.id,
          ariaLabel: `curso ${row.title}`,
          title: row.title,
          description: row.slug,
          searchText: [
            row.title,
            row.slug,
            row.category,
            row.format,
            row.price,
            row.status,
            row.seatsLabel,
          ].join(" "),
          sortValues: {
            course: row.title,
            category: row.category,
            format: formatCourseFormat(row.format),
            price: row.price,
            status: row.status,
            seats: row.occupancy,
          },
          cells: {
            course: (
              <div className="space-y-0.5">
                <p className="font-semibold text-foreground">{row.title}</p>
                <p className="text-xs text-muted-foreground">{row.slug}</p>
              </div>
            ),
            category: row.category,
            format: row.format,
            price: row.price,
            status: (
              <Badge className={row.status === "Aberta" ? "bg-emerald-50 text-emerald-700" : undefined} variant="secondary">
                {row.status}
              </Badge>
            ),
            seats: (
              <div className="space-y-2">
                <p className="text-sm">{row.seatsLabel}</p>
                <Progress value={row.occupancy} />
              </div>
            ),
          },
          actions: (
            <AdminRowActions
              entityLabel={`curso ${row.title}`}
              onDelete={() => {
                setSelected(row);
                setDeleteOpened(true);
              }}
              onEdit={() => openForm("edit", row)}
              onView={() => openForm("view", row)}
            />
          ),
        }))}
        searchPlaceholder="Buscar nesta lista de cursos"
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
        title={modalTitle}
      >
        {mode === "create" ? (
          <AdminCreateCourseForm />
        ) : selected ? (
          <AdminEditCourseForm course={selected} readOnly={mode === "view"} />
        ) : null}
      </AdminFormModal>

      <AdminConfirmDialog
        confirmLabel="Arquivar curso"
        message={`O curso ${selected?.title ?? ""} será removido da listagem ativa usando soft-delete.`}
        onClose={() => setDeleteOpened(false)}
        onConfirm={archiveSelected}
        opened={deleteOpened}
        title="Arquivar curso?"
      />
    </div>
  );
}
