"use client";

import { Plus, Download } from "lucide-react";
import { isValidElement, useMemo, useState } from "react";

import { DataTable } from "@/components/admin/data-table";
import { EmptyState } from "@/components/common/empty-state";
import { SearchInput } from "@/components/common/search-input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
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

function toExportableValue(value: unknown): string {
  if (value == null) return "";
  if (Array.isArray(value)) return value.map((item) => toExportableValue(item)).join("; ");
  if (isValidElement<{ children?: unknown }>(value)) {
    return toExportableValue(value.props.children);
  }
  return String(value);
}

function exportToCSV(data: unknown[], columns: CsvColumn[], filename: string) {
  if (data.length === 0) return;

  const csvContent = [
    columns.map((col) => `"${col.label}"`).join(","),
    ...data.map((row) =>
      columns
        .map((col) => {
          const value = col.render(row);
          return `"${toExportableValue(value).replace(/"/g, '""')}"`;
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

  function getFieldSpanClass(field: (typeof config.fields)[number]) {
    if (
      field.type === "readonly" ||
      field.type === "textarea" ||
      field.type === "array" ||
      field.type === "modules" ||
      field.type === "multiselect"
    ) {
      return "md:col-span-2";
    }

    return "";
  }

  function inferSectionTitle(field: (typeof config.fields)[number]) {
    if (field.section) return field.section;
    if (field.type === "readonly") return "Contexto";
    if (field.key === "status") return "Ação operacional";
    if (field.type === "textarea" || field.type === "array" || field.type === "modules") {
      return "Conteúdo e detalhamento";
    }
    return "Dados principais";
  }

  const fieldSections = config.fields.reduce<Array<{ title: string; fields: Array<(typeof config.fields)[number]> }>>((sections, field) => {
    const title = inferSectionTitle(field);
    const existing = sections.find((section) => section.title === title);

    if (existing) {
      existing.fields.push(field);
      return sections;
    }

    sections.push({ title, fields: [field] });
    return sections;
  }, []);

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
          <div className="flex flex-wrap gap-2">
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

        <div className="grid gap-4 md:grid-cols-3">
          <div className="surface-card p-5">
            <p className="text-label font-bold uppercase tracking-[0.08em] text-label-secondary">Registros visíveis</p>
            <p className="mt-3 text-3xl font-semibold text-foreground">{rows.length}</p>
            <p className="mt-2 text-sm leading-6 text-label-secondary">
              {search ? `Filtro ativo para “${search}”.` : "Visão operacional atual desta área."}
            </p>
          </div>
          <div className="surface-card p-5">
            <p className="text-label font-bold uppercase tracking-[0.08em] text-label-secondary">Modo de operação</p>
            <p className="mt-3 text-2xl font-semibold text-foreground">
              {canCreate ? "CRUD completo" : "Atualização supervisionada"}
            </p>
            <p className="mt-2 text-sm leading-6 text-label-secondary">
              {canCreate
                ? "Criação, edição e exclusão disponíveis com busca e exportação."
                : "Fluxo restrito a contexto e atualização segura de registros existentes."}
            </p>
          </div>
          <div className="surface-card p-5">
            <p className="text-label font-bold uppercase tracking-[0.08em] text-label-secondary">Atalho</p>
            <p className="mt-3 text-2xl font-semibold text-foreground">N para novo item</p>
            <p className="mt-2 text-sm leading-6 text-label-secondary">
              Disponível nas áreas com criação manual para acelerar operação recorrente.
            </p>
          </div>
        </div>

        <div className="surface-card space-y-4 p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl space-y-1">
              <p className="text-sm font-semibold text-foreground">Busca operacional</p>
              <p className="text-sm leading-6 text-label-secondary">
                Filtre por nome, título ou referência para reduzir ruído antes de editar.
              </p>
            </div>
            <div className="w-full lg:max-w-md">
              <SearchInput
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nome, título ou referência..."
              />
            </div>
          </div>
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
          <DialogContent className="w-[min(96vw,980px)] max-w-4xl p-0 sm:min-h-[36rem]">
            <div className="flex h-full max-h-[calc(100vh-2rem)] flex-col">
              <DialogHeader className="border-b border-border px-6 py-5">
                <DialogTitle>{editingId ? "Editar item" : "Criar novo item"}</DialogTitle>
                <DialogDescription>Preencha os campos obrigatórios marcados com *</DialogDescription>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto px-6 py-5">
                <div className="space-y-6">
                  {validationErrors.length > 0 && (
                    <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3">
                      <p className="mb-2 text-sm font-medium text-destructive">Erros encontrados:</p>
                      <ul className="space-y-1 text-xs text-destructive">
                        {validationErrors.map((error, i) => (
                          <li key={i} className="flex gap-2">
                            <span>•</span>
                            <span>{error.message}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {fieldSections.map((section) => (
                    <div key={section.title} className="space-y-4">
                      <div className="space-y-1">
                        <h3 className="text-lg font-semibold text-foreground">{section.title}</h3>
                        <p className="text-sm leading-6 text-label-secondary">
                          {section.title === "Ação operacional"
                            ? "Atualize apenas o que interfere na operação do time."
                            : "Revise os dados antes de salvar para evitar retrabalho operacional."}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {section.fields.map((field) => {
                          const fieldError = errorsByField[field.key];
                          const fieldSpanClass = getFieldSpanClass(field);

                          if (field.type === "readonly") {
                            return (
                              <div key={field.key} className={fieldSpanClass}>
                                <div className="h-full rounded-xl border border-border bg-surface-muted/50 p-4">
                                  <p className="text-label font-bold uppercase tracking-[0.08em] text-label-secondary">
                                    {field.label}
                                  </p>
                                  <p className="mt-3 text-sm leading-6 text-foreground">
                                    {String(form[field.key] ?? "—")}
                                  </p>
                                </div>
                              </div>
                            );
                          }

                          if (field.type === "modules") {
                            return (
                              <div key={field.key} className={fieldSpanClass}>
                                <ModulesBuilder
                                  label={field.label}
                                  value={form[field.key] || []}
                                  onChange={(v) => setForm((current) => ({ ...current, [field.key]: v }))}
                                  error={fieldError}
                                />
                              </div>
                            );
                          }

                          if (field.type === "array") {
                            return (
                              <div key={field.key} className={fieldSpanClass}>
                                <ArrayInput
                                  label={field.label}
                                  value={form[field.key] || []}
                                  onChange={(v) => setForm((current) => ({ ...current, [field.key]: v }))}
                                  error={fieldError}
                                />
                              </div>
                            );
                          }

                          if (field.type === "multiselect" && field.options) {
                            return (
                              <div key={field.key} className={fieldSpanClass}>
                                <MultiSelectField
                                  label={field.label}
                                  value={form[field.key] || []}
                                  options={field.options}
                                  onChange={(v) => setForm((current) => ({ ...current, [field.key]: v }))}
                                  error={fieldError}
                                />
                              </div>
                            );
                          }

                          if (field.type === "select" && field.options) {
                            return (
                              <div key={field.key} className={fieldSpanClass}>
                                <SelectField
                                  label={field.label}
                                  value={form[field.key] ?? ""}
                                  options={field.options}
                                  onChange={(v) => setForm((current) => ({ ...current, [field.key]: v }))}
                                  required={field.required}
                                  error={fieldError}
                                />
                              </div>
                            );
                          }

                          if (field.type === "textarea") {
                            return (
                              <div key={field.key} className={fieldSpanClass}>
                                <FormField error={fieldError} label={field.label} required={field.required}>
                                  {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
                                    <textarea
                                      id={fieldId}
                                      placeholder={`Ex.: ${field.label}`}
                                      value={form[field.key] ?? ""}
                                      aria-describedby={ariaDescribedBy}
                                      aria-invalid={ariaInvalid}
                                      onChange={(event) =>
                                        setForm((current) => ({ ...current, [field.key]: event.target.value }))
                                      }
                                      className="min-h-32 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                    />
                                  )}
                                </FormField>
                              </div>
                            );
                          }

                          if (field.type === "number") {
                            return (
                              <div key={field.key} className={fieldSpanClass}>
                                <FormField error={fieldError} label={field.label} required={field.required}>
                                  {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
                                    <input
                                      id={fieldId}
                                      type="number"
                                      placeholder={`Ex.: ${field.label}`}
                                      value={form[field.key] ?? ""}
                                      aria-describedby={ariaDescribedBy}
                                      aria-invalid={ariaInvalid}
                                      onChange={(event) =>
                                        setForm((current) => ({ ...current, [field.key]: event.target.value }))
                                      }
                                      className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                    />
                                  )}
                                </FormField>
                              </div>
                            );
                          }

                          if (field.type === "date") {
                            return (
                              <div key={field.key} className={fieldSpanClass}>
                                <FormField error={fieldError} label={field.label} required={field.required}>
                                  {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
                                    <input
                                      id={fieldId}
                                      type="date"
                                      value={form[field.key] ?? ""}
                                      aria-describedby={ariaDescribedBy}
                                      aria-invalid={ariaInvalid}
                                      onChange={(event) =>
                                        setForm((current) => ({ ...current, [field.key]: event.target.value }))
                                      }
                                      className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                                    />
                                  )}
                                </FormField>
                              </div>
                            );
                          }

                          if (field.type === "file") {
                            return (
                              <div key={field.key} className={fieldSpanClass}>
                                <FormField error={fieldError} label={field.label} required={field.required}>
                                  {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
                                    <>
                                      <input
                                        id={fieldId}
                                        type="file"
                                        accept="image/*"
                                        aria-describedby={ariaDescribedBy}
                                        aria-invalid={ariaInvalid}
                                        onChange={(event) => {
                                          const file = event.target.files?.[0];
                                          if (!file) return;
                                          const reader = new FileReader();
                                          reader.onload = () => {
                                            if (typeof reader.result === "string") {
                                              setForm((current) => ({ ...current, [field.key]: reader.result }));
                                            }
                                          };
                                          reader.readAsDataURL(file);
                                        }}
                                        className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                                      />
                                      {form[field.key] ? (
                                        <p className="text-xs text-muted-foreground">Imagem carregada com sucesso.</p>
                                      ) : null}
                                    </>
                                  )}
                                </FormField>
                              </div>
                            );
                          }

                          return (
                            <div key={field.key} className={fieldSpanClass}>
                              <FormField error={fieldError} label={field.label} required={field.required}>
                                {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
                                  <Input
                                    id={fieldId}
                                    placeholder={`Ex.: ${field.label}`}
                                    value={form[field.key] ?? ""}
                                    aria-describedby={ariaDescribedBy}
                                    aria-invalid={ariaInvalid}
                                    onChange={(event) =>
                                      setForm((current) => ({ ...current, [field.key]: event.target.value }))
                                    }
                                  />
                                )}
                              </FormField>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <DialogFooter className="border-t border-border px-6 py-4">
                <DialogClose asChild>
                  <Button variant="outline" disabled={isSaving}>
                    Cancelar
                  </Button>
                </DialogClose>
                <Button onClick={handleSave} loading={isSaving}>
                  Salvar
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
