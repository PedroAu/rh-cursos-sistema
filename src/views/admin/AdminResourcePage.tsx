import { Plus, Download } from "lucide-react";
import { useMemo, useState } from "react";

import { DataTable } from "@/components/admin/data-table";
import { EmptyState } from "@/components/common/empty-state";
import { SearchInput } from "@/components/common/search-input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  ArrayInput,
  SelectField,
  ModulesBuilder,
  MultiSelectField,
} from "@/components/admin/form-fields";
import { useAppStore } from "@/lib/app-store";
import { useHotkey } from "@/hooks/use-hotkey";
import { buildResourceConfig, type ResourceKey } from "@/lib/admin-resource-configs";
import type { ValidationError } from "@/lib/admin-form-validation";

type CsvColumn = { label: string; render: (row: unknown) => unknown };

function exportToCSV(data: unknown[], columns: CsvColumn[], filename: string) {
  if (data.length === 0) return;

  const csvContent = [
    columns.map((col) => `"${col.label}"`).join(","),
    ...data.map((row) =>
      columns
        .map((col) => {
          const value = col.render(row);
          if (Array.isArray(value)) return `"${value.join("; ")}"`;
          return `"${String(value ?? "").replace(/"/g, '""')}"`;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob(["﻿" + csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}-${new Date().toISOString().split("T")[0]}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function AdminResourcePage({ resource }: { resource: ResourceKey }) {
  const store = useAppStore();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [form, setForm] = useState<Record<string, any>>({});
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  const errorsByField = useMemo(() => {
    const result: Record<string, string> = {};
    validationErrors.forEach((e) => {
      if (!result[e.field]) result[e.field] = e.message;
    });
    return result;
  }, [validationErrors]);

  useHotkey(
    (event) => {
      if (event.key.toLowerCase() !== "n") return false;
      if (!window.location.pathname.startsWith("/admin")) return false;
      if (open) return false;
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target?.isContentEditable) {
        return false;
      }
      return true;
    },
    (event) => {
      event.preventDefault();
      setEditingId(null);
      setForm({});
      setOpen(true);
    }
  );

  const config = useMemo(
    () =>
      buildResourceConfig(resource, store, {
        search,
        editingId,
        form,
        setForm,
        setEditingId,
        setValidationErrors,
        setOpen,
      }),
    [editingId, resource, search, store, form]
  );

  const rows = config.rows as Array<{ id: string }>;
  const canCreate = resource !== "students" && resource !== "enrollments";

  async function handleSave() {
    setIsSaving(true);
    try {
      await config.onSave();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="page-section">
      <div className="container space-y-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <span className="eyebrow">{config.title}</span>
            <h1 className="mt-3 text-4xl font-semibold">{config.title}</h1>
            <p className="mt-2 max-w-3xl text-base leading-7 text-muted-foreground">
              {config.description}
            </p>
          </div>
          <div className="flex gap-2">
            {config.rows.length > 0 && (
              <Button
                variant="outline"
                onClick={() => exportToCSV(config.rows, config.columns as CsvColumn[], resource)}
              >
                <Download className="h-4 w-4" />
                Exportar CSV
              </Button>
            )}
            {canCreate && (
              <Button
                onClick={() => {
                  setEditingId(null);
                  setForm({});
                  setOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                Novo item
              </Button>
            )}
          </div>
        </div>

        <div className="surface-card space-y-4 p-5">
          <SearchInput
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nome, título ou referência..."
          />
          {rows.length ? (
            <DataTable
              data={rows}
              columns={config.columns as never}
              onEdit={config.onEdit as never}
              onDelete={config.onDelete as never}
            />
          ) : (
            <EmptyState
              title="Nenhum registro encontrado."
              description={
                canCreate
                  ? "Crie um novo item para validar o CRUD local desta área."
                  : "Os registros aparecem aqui conforme são gerados pelas inscrições."
              }
              actionLabel={canCreate ? "Criar agora" : undefined}
              onAction={
                canCreate
                  ? () => {
                      setEditingId(null);
                      setForm({});
                      setOpen(true);
                    }
                  : undefined
              }
            />
          )}
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar item" : "Criar novo item"}</DialogTitle>
              <DialogDescription>Preencha os campos obrigatórios marcados com *</DialogDescription>
            </DialogHeader>

            {validationErrors.length > 0 && (
              <div className="rounded-md bg-destructive/10 p-3 border border-destructive/20">
                <p className="text-sm font-medium text-destructive mb-2">Erros encontrados:</p>
                <ul className="text-xs text-destructive space-y-1">
                  {validationErrors.map((error, i) => (
                    <li key={i} className="flex gap-2">
                      <span>•</span>
                      <span>{error.message}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid gap-4">
              {config.fields.map((field) => {
                const fieldError = errorsByField[field.key];

                if (field.type === "modules") {
                  return (
                    <ModulesBuilder
                      key={field.key}
                      label={field.label}
                      value={form[field.key] || []}
                      onChange={(v) => setForm((current) => ({ ...current, [field.key]: v }))}
                      error={fieldError}
                    />
                  );
                }

                if (field.type === "array") {
                  return (
                    <ArrayInput
                      key={field.key}
                      label={field.label}
                      value={form[field.key] || []}
                      onChange={(v) => setForm((current) => ({ ...current, [field.key]: v }))}
                      error={fieldError}
                    />
                  );
                }

                if (field.type === "multiselect" && field.options) {
                  return (
                    <MultiSelectField
                      key={field.key}
                      label={field.label}
                      value={form[field.key] || []}
                      options={field.options}
                      onChange={(v) => setForm((current) => ({ ...current, [field.key]: v }))}
                      error={fieldError}
                    />
                  );
                }

                if (field.type === "select" && field.options) {
                  return (
                    <SelectField
                      key={field.key}
                      label={field.label}
                      value={form[field.key] ?? ""}
                      options={field.options}
                      onChange={(v) => setForm((current) => ({ ...current, [field.key]: v }))}
                      required={field.required}
                      error={fieldError}
                    />
                  );
                }

                if (field.type === "textarea") {
                  return (
                    <div key={field.key} className="flex flex-col gap-2">
                      <label className="text-sm font-medium">
                        {field.label}
                        {field.required && <span className="text-destructive ml-1">*</span>}
                      </label>
                      <textarea
                        placeholder={field.label}
                        value={form[field.key] ?? ""}
                        onChange={(event) =>
                          setForm((current) => ({ ...current, [field.key]: event.target.value }))
                        }
                        className="min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      {fieldError && <p className="text-xs text-destructive">{fieldError}</p>}
                    </div>
                  );
                }

                if (field.type === "number") {
                  return (
                    <div key={field.key} className="flex flex-col gap-2">
                      <label className="text-sm font-medium">
                        {field.label}
                        {field.required && <span className="text-destructive ml-1">*</span>}
                      </label>
                      <input
                        type="number"
                        placeholder={field.label}
                        value={form[field.key] ?? ""}
                        onChange={(event) =>
                          setForm((current) => ({ ...current, [field.key]: event.target.value }))
                        }
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      {fieldError && <p className="text-xs text-destructive">{fieldError}</p>}
                    </div>
                  );
                }

                if (field.type === "date") {
                  return (
                    <div key={field.key} className="flex flex-col gap-2">
                      <label className="text-sm font-medium">
                        {field.label}
                        {field.required && <span className="text-destructive ml-1">*</span>}
                      </label>
                      <input
                        type="date"
                        value={form[field.key] ?? ""}
                        onChange={(event) =>
                          setForm((current) => ({ ...current, [field.key]: event.target.value }))
                        }
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      {fieldError && <p className="text-xs text-destructive">{fieldError}</p>}
                    </div>
                  );
                }

                return (
                  <div key={field.key} className="flex flex-col gap-2">
                    <label className="text-sm font-medium">
                      {field.label}
                      {field.required && <span className="text-destructive ml-1">*</span>}
                    </label>
                    <Input
                      placeholder={field.label}
                      value={form[field.key] ?? ""}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, [field.key]: event.target.value }))
                      }
                    />
                    {fieldError && <p className="text-xs text-destructive">{fieldError}</p>}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-3">
              <DialogClose asChild>
                <Button variant="outline" disabled={isSaving}>
                  Cancelar
                </Button>
              </DialogClose>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Salvando…" : "Salvar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
