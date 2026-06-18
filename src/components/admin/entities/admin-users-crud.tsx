"use client";

import { useState } from "react";

import { deactivateSystemUserAction } from "@/app/actions/admin";
import {
  AdminConfirmDialog,
  AdminDataTable,
  AdminFormModal,
  AdminRowActions,
  type AdminFormMode,
} from "@/components/admin/crud";
import { AdminUserForm } from "@/components/forms/admin-user-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AdminUserRow } from "@/lib/admin-data";
import { cn } from "@/lib/utils";

type AdminUsersCrudProps = {
  rows: AdminUserRow[];
  emptyLabel: string;
  footer?: React.ReactNode;
};

function InitialsAvatar({ label, tone = "navy" }: { label: string; tone?: "navy" | "gold" }) {
  return (
    <div
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold",
        tone === "gold" ? "bg-brand-gold text-brand-navy-900" : "bg-brand-navy-700 text-white",
      )}
      aria-hidden="true"
    >
      {label.slice(0, 2).toUpperCase()}
    </div>
  );
}

export function AdminUsersCrud({ rows, emptyLabel, footer }: AdminUsersCrudProps) {
  const [mode, setMode] = useState<AdminFormMode>("create");
  const [selected, setSelected] = useState<AdminUserRow | null>(null);
  const [formOpened, setFormOpened] = useState(false);
  const [deleteOpened, setDeleteOpened] = useState(false);

  function openForm(nextMode: AdminFormMode, row?: AdminUserRow) {
    setMode(nextMode);
    setSelected(row ?? null);
    setFormOpened(true);
  }

  async function deactivateSelected() {
    if (!selected) return;
    const formData = new FormData();
    formData.set("id", selected.id);
    await deactivateSystemUserAction({ error: null, success: null }, formData);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-heading text-2xl font-bold text-brand-navy-700">Usuários</h2>
      </div>
      <AdminDataTable
        columns={[
          { key: "user", label: "Usuário" },
          { key: "role", label: "Cargo / Tipo" },
          { key: "created", label: "Cadastro" },
          { key: "status", label: "Status" },
        ]}
        emptyLabel={emptyLabel}
        pageSize={10}
        rows={rows.map((row) => ({
          id: row.id,
          ariaLabel: `usuário ${row.email}`,
          title: row.name,
          description: row.role,
          searchText: [row.name, row.email, row.role, row.status, row.createdAt].join(" "),
          sortValues: {
            user: row.name || row.email,
            role: row.role,
            created: row.createdAt,
            status: row.status,
          },
          cells: {
            user: (
              <div className="flex items-center gap-4">
                <InitialsAvatar label={row.email} tone={row.role === "admin" ? "navy" : "gold"} />
                <div className="space-y-0.5">
                  <p className="font-semibold text-foreground">{row.name}</p>
                  <p className="text-xs text-muted-foreground">{row.email}</p>
                </div>
              </div>
            ),
            role: (
              <Badge className={row.role === "admin" ? undefined : "bg-muted text-muted-foreground"} variant={row.role === "admin" ? "default" : "secondary"}>
                {row.role}
              </Badge>
            ),
            created: row.createdAt,
            status: (
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "size-2 rounded-full",
                    row.status === "ativo" ? "bg-emerald-600" : "bg-orange-500",
                  )}
                  aria-hidden="true"
                />
                <span className="text-sm">{row.status}</span>
              </div>
            ),
          },
          actions: (
            <AdminRowActions
              entityLabel={`usuário ${row.email}`}
              onDelete={() => {
                setSelected(row);
                setDeleteOpened(true);
              }}
              onEdit={() => openForm("edit", row)}
              onView={() => openForm("view", row)}
            />
          ),
        }))}
        searchPlaceholder="Buscar nesta lista de usuários"
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
        title={mode === "create" ? "Novo usuário" : selected?.email ?? "Usuário"}
      >
        {mode === "create" ? (
          <AdminUserForm />
        ) : selected ? (
          <AdminUserForm readOnly={mode === "view"} user={selected} />
        ) : null}
      </AdminFormModal>
      <AdminConfirmDialog
        confirmLabel="Desativar usuário"
        message={`O usuário ${selected?.email ?? ""} será desativado via Supabase Auth. O schema não será alterado.`}
        onClose={() => setDeleteOpened(false)}
        onConfirm={deactivateSelected}
        opened={deleteOpened}
        title="Desativar usuário?"
      />
    </div>
  );
}
