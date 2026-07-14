"use client";

import Image from "next/image";
import { Download, Pencil, Plus, Search, Trash2, Upload, X } from "lucide-react";
import { isValidElement, useEffect, useId, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useHotkey } from "@/hooks/use-hotkey";
import type { ValidationError } from "@/lib/admin-form-validation";
import { buildResourceConfig, type FieldConfig, type ResourceKey } from "@/lib/admin-resource-configs";
import { useAppStore } from "@/lib/app-store";
import { formatCPF, formatPhone } from "@/lib/format";
import { cn } from "@/lib/utils";

type CsvColumn = {
  label: string;
  render: (row: unknown) => unknown;
  exportValue?: (row: unknown) => string;
};

function toExportableValue(value: unknown): string {
  if (value == null) return "";
  if (Array.isArray(value)) return value.map((item) => toExportableValue(item)).join("; ");
  if (isValidElement<{ children?: unknown }>(value)) {
    return toExportableValue(value.props.children);
  }
  return String(value);
}

function serializeFormSnapshot(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (Array.isArray(value)) {
    return `[${value.map((item) => serializeFormSnapshot(item)).join(",")}]`;
  }
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).sort(([left], [right]) =>
      left.localeCompare(right)
    );
    return `{${entries
      .map(([key, nextValue]) => `${JSON.stringify(key)}:${serializeFormSnapshot(nextValue)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function exportToCSV(data: unknown[], columns: CsvColumn[], filename: string) {
  if (data.length === 0) return;

  const csvContent = [
    columns.map((col) => `"${col.label}"`).join(","),
    ...data.map((row) =>
      columns
        .map((col) => {
          const value = col.exportValue ? col.exportValue(row) : col.render(row);
          return `"${toExportableValue(value).replace(/"/g, '""')}"`
        })
        .join(",")
    )
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

function getPageTitle(resource: ResourceKey, fallback: string) {
  if (resource === "classes") return "Gestão de Cursos e Turmas";
  if (resource === "students") return "Gestão de Cadastros";
  if (resource === "courses") return "Gestão de Cursos";
  return fallback;
}

function getPageDescription(resource: ResourceKey, fallback: string) {
  if (resource === "classes") {
    return "Administre o catálogo educacional, monitore inscrições em tempo real e organize o cronograma das próximas turmas presenciais e online.";
  }
  if (resource === "students") {
    return "Gerencie alunos, instrutores e acessos operacionais com a mesma linguagem visual do novo painel administrativo.";
  }
  return fallback;
}

function getSearchPlaceholder(resource: ResourceKey) {
  if (resource === "students") return "Filtrar por nome, CPF ou e-mail.";
  if (resource === "classes") return "Buscar turma, curso ou modalidade.";
  if (resource === "courses") return "Buscar curso ou trilha.";
  return "Buscar por nome, título ou referência.";
}

function getDefaultFormState(resource: ResourceKey) {
  if (resource === "courses") {
    return { featured: "Não" } satisfies Record<string, unknown>;
  }

  return {};
}

export function AdminResourcePage({ resource }: { resource: ResourceKey }) {
  const store = useAppStore();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [formSnapshot, setFormSnapshot] = useState("");
  const previousOpenRef = useRef(open);

  useEffect(() => {
    if (open && !previousOpenRef.current) {
      setFormSnapshot(serializeFormSnapshot(form));
    }

    if (!open && previousOpenRef.current) {
      setFormSnapshot("");
    }

    previousOpenRef.current = open;
  }, [form, open]);

  const isFormDirty = useMemo(
    () => serializeFormSnapshot(form) !== formSnapshot,
    [form, formSnapshot]
  );

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setOpen(true);
      return;
    }

    if (isFormDirty && !window.confirm("Descartar as alterações deste registro?")) {
      return;
    }

    setOpen(false);
  };

  const errorsByField = useMemo(() => {
    const result: Record<string, string> = {};
    validationErrors.forEach((error) => {
      if (!result[error.field]) result[error.field] = error.message;
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
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target?.isContentEditable) return false;
      return true;
    },
    (event) => {
      event.preventDefault();
      setEditingId(null);
      setForm(getDefaultFormState(resource));
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
        setOpen
      }),
    [editingId, form, resource, search, store]
  );

  const rows = config.rows as Array<{ id: string }>;
  const canCreate = true;
  const pageTitle = getPageTitle(resource, config.title);
  const pageDescription = getPageDescription(resource, config.description);

  async function handleSave() {
    setIsSaving(true);
    try {
      await config.onSave();
    } finally {
      setIsSaving(false);
    }
  }

  function getFieldSpan(field: FieldConfig) {
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

  function inferSectionTitle(field: FieldConfig) {
    if (field.section) return field.section;
    if (field.type === "readonly") return "Contexto";
    if (field.key === "status") return "Ação operacional";
    if (field.type === "textarea" || field.type === "array" || field.type === "modules") return "Conteúdo e detalhamento";
    return "Dados principais";
  }

  const fieldSections = config.fields.reduce<Array<{ title: string; fields: FieldConfig[] }>>((sections, field) => {
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
    <div className="space-y-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-3xl space-y-3">
          <h1 className="text-3xl font-extrabold tracking-tight text-tk-brand">{pageTitle}</h1>
          <p className="text-base leading-7 text-tk-ink-muted md:text-lg">{pageDescription}</p>
        </div>

        {canCreate ? (
          <Button
            className="rounded-full bg-tk-accent text-white hover:bg-tk-accent-strong"
            onClick={() => {
              setEditingId(null);
              setForm(getDefaultFormState(resource));
              setOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Novo Cadastro
          </Button>
        ) : null}
      </div>

      {config.stats ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {config.stats.map((stat, index) => {
            const Icon = stat.icon;
            const accentToneClass = index === 2 ? "text-warning" : "text-success";

            return (
              <Panel key={stat.label} className="p-8">
                <div className="flex items-start justify-between gap-4">
                  <p className="max-w-[160px] text-[0.95rem] font-extrabold text-tk-ink-muted">{stat.label}</p>
                  {Icon ? (
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-tk-accent-soft text-tk-brand">
                      <Icon className="h-5 w-5" />
                    </div>
                  ) : null}
                </div>
                <p className="mt-10 text-[2.2rem] font-extrabold text-tk-ink">{stat.value}</p>
                <p className={cn("mt-1.5 font-semibold", accentToneClass)}>
                  {stat.helper}
                </p>
              </Panel>
            );
          })}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          <Panel className="p-8">
            <p className="text-[0.95rem] font-extrabold text-tk-ink-muted">Registros visíveis</p>
            <p className="mt-10 text-[2.2rem] font-extrabold text-tk-ink">{rows.length}</p>
            <p className="mt-1.5 font-semibold text-tk-success">
              {search ? `Filtro ativo para “${search}”.` : "Visão operacional atual."}
            </p>
          </Panel>
          <Panel className="p-8">
            <p className="text-[0.95rem] font-extrabold text-tk-ink-muted">Modo de operação</p>
            <p className="mt-10 text-[2.2rem] font-extrabold text-tk-ink">{canCreate ? "CRUD" : "Supervisionado"}</p>
            <p className="mt-1.5 font-semibold text-tk-success">
              {canCreate ? "Criação e edição liberadas" : "Atualização sob controle"}
            </p>
          </Panel>
          <Panel className="p-8">
            <p className="text-[0.95rem] font-extrabold text-tk-ink-muted">Atalho</p>
            <p className="mt-10 text-[2.2rem] font-extrabold text-tk-ink">N</p>
            <p className="mt-1.5 font-semibold text-tk-success">Cria um novo registro rapidamente</p>
          </Panel>
        </div>
      )}

      <Panel className="p-6">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-tk-brand">
              {resource === "classes" ? "Listagem de Turmas Ativas" : resource === "students" ? "Gerenciar Usuários" : config.title}
            </h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <SearchField value={search} onChange={setSearch} placeholder={getSearchPlaceholder(resource)} />
            {rows.length > 0 ? (
              <Button
                variant="outline"
                onClick={() => exportToCSV(config.rows, config.columns as CsvColumn[], resource)}
              >
                <Download className="h-4 w-4" />
                Exportar
              </Button>
            ) : null}
          </div>
        </div>

        {rows.length ? (
          <Table className="min-w-[860px]">
            <TableHeader className="bg-tk-surface-2">
              <TableRow className="hover:bg-tk-surface-2">
                {(config.columns as Array<{ key: string; label: string; render: (row: unknown) => unknown }>).map((column) => (
                  <TableHead key={column.key}>{column.label}</TableHead>
                ))}
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  {(config.columns as Array<{ key: string; label: string; render: (row: unknown) => unknown }>).map((column) => (
                    <TableCell key={`${row.id}-${column.key}`}>{column.render(row) as ReactNode}</TableCell>
                  ))}
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <IconButton
                        label={`Editar item ${row.id}`}
                        onClick={() => config.onEdit(row)}
                      >
                        <Pencil className="h-4 w-4" />
                      </IconButton>
                      {config.onDelete ? (
                        <IconButton
                          label={`Excluir item ${row.id}`}
                          tone="danger"
                          onClick={() => config.onDelete?.(row)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </IconButton>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="rounded-2xl bg-tk-surface-2 p-8 text-center">
            <p className="font-semibold text-tk-ink">Nenhum registro encontrado.</p>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-tk-ink-muted">
              {canCreate
                ? "Crie um novo item para iniciar a operação desta área."
                : "Os registros aparecem aqui conforme são gerados pelos fluxos do sistema."}
            </p>
            {canCreate ? (
              <div className="mt-5">
                <Button
                  onClick={() => {
                    setEditingId(null);
                    setForm(getDefaultFormState(resource));
                    setOpen(true);
                  }}
                >
                  Criar agora
                </Button>
              </div>
            ) : null}
          </div>
        )}
      </Panel>

      <Dialog open={open} onOpenChange={handleDialogOpenChange}>
        <DialogContent
          className="w-[min(96vw,1100px)] overflow-y-auto p-0"
          onInteractOutside={(event) => {
            event.preventDefault();
          }}
          onPointerDownOutside={(event) => {
            event.preventDefault();
          }}
        >
          <div className="max-h-[calc(100vh-2rem)] overflow-y-auto">
            <DialogHeader className="border-b border-tk-line px-6 py-5">
              <DialogTitle>{editingId ? "Editar registro" : "Criar novo registro"}</DialogTitle>
              <DialogDescription>
                Revise os dados antes de salvar para evitar retrabalho operacional.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 px-6 py-5">
              {validationErrors.length > 0 ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                  <p className="font-semibold text-tk-error">Erros encontrados</p>
                  <div className="mt-3 space-y-1">
                    {validationErrors.map((error, index) => (
                      <p key={`${error.field}-${index}`} className="text-sm text-tk-error">
                        {error.message}
                      </p>
                    ))}
                  </div>
                </div>
              ) : null}

              {fieldSections.map((section) => (
                <Panel key={section.title} className="p-5">
                  <div className="space-y-1">
                    <p className="font-semibold text-tk-ink">{section.title}</p>
                    <p className="text-sm text-tk-ink-muted">
                      {section.title === "Ação operacional"
                        ? "Atualize apenas o que interfere na operação do time."
                        : "Revise os dados antes de salvar para evitar retrabalho operacional."}
                    </p>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    {section.fields.map((field) => (
                      <div key={field.key} className={getFieldSpan(field)}>
                        <RenderField
                          field={field}
                          form={form}
                          resource={resource}
                          setForm={setForm}
                          error={errorsByField[field.key]}
                        />
                      </div>
                    ))}
                  </div>
                </Panel>
              ))}
            </div>

            <DialogFooter className="border-t border-tk-line px-6 py-5">
              <Button variant="outline" onClick={() => handleDialogOpenChange(false)}>
                Cancelar
              </Button>
              <Button loading={isSaving} onClick={handleSave}>
                {editingId ? "Salvar alterações" : "Criar registro"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn("rounded-3xl border border-tk-line bg-tk-surface shadow-tk-card", className)}>{children}</section>;
}

function IconButton({
  children,
  label,
  onClick,
  tone = "default"
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
  tone?: "default" | "danger";
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-tk-line bg-tk-surface text-tk-ink-muted transition hover:bg-tk-surface-2 hover:text-tk-ink",
        tone === "danger" && "text-tk-error hover:bg-red-50 hover:text-tk-error"
      )}
    >
      {children}
    </button>
  );
}

function SearchField({
  value,
  onChange,
  placeholder
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative min-w-0 sm:min-w-[320px]">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-tk-ink-muted" />
      <Input
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
        placeholder={placeholder}
        className="pl-10 pr-10"
      />
      {value ? (
        <button
          type="button"
          aria-label="Limpar busca"
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-tk-ink-muted transition hover:bg-tk-surface-2 hover:text-tk-ink"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}

function RenderField({
  field,
  form,
  resource,
  setForm,
  error
}: {
  field: FieldConfig;
  form: Record<string, unknown>;
  resource: ResourceKey;
  setForm: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
  error?: string;
}) {
  const updateField = (value: unknown) => {
    setForm((current) => {
      if (resource === "enrollments" && field.key === "courseId") {
        return { ...current, courseId: value, classId: "" };
      }

      return { ...current, [field.key]: value };
    });
  };

  if (field.type === "readonly") {
    return (
      <div className="rounded-2xl border border-tk-line bg-tk-surface-2 p-4">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-tk-ink-muted">{field.label}</p>
        <p className="mt-3 text-sm text-tk-ink">{String(form[field.key] ?? "—")}</p>
      </div>
    );
  }

  if (field.type === "modules") {
    return (
      <ModulesBuilderLite
        label={field.label}
        value={(form[field.key] as ModuleValue[]) || []}
        onChange={updateField}
        hint={field.hint}
        error={error}
      />
    );
  }

  if (field.type === "array") {
    return (
      <ArrayInputLite
        label={field.label}
        value={(form[field.key] as string[]) || []}
        onChange={updateField}
        error={error}
        hint={field.hint}
        placeholder={field.placeholder}
        suggestions={field.suggestions}
      />
    );
  }

  if (field.type === "multiselect" && field.options) {
    return (
      <MultiSelectLite
        label={field.label}
        required={field.required}
        options={field.options}
        value={(form[field.key] as string[]) || []}
        onChange={updateField}
        error={error}
        hint={field.hint}
      />
    );
  }

  if (field.type === "select" && field.options) {
    return (
      <NativeSelectField
        label={field.label}
        required={field.required}
        options={field.options}
        value={String(form[field.key] ?? "")}
        onChange={updateField}
        error={error}
        hint={field.hint}
      />
    );
  }

  if (field.type === "textarea") {
    return (
      <Textarea
        label={field.label}
        value={String(form[field.key] ?? "")}
        placeholder={field.placeholder ?? `Ex.: ${field.label}`}
        hint={field.hint}
        onChange={(event) => updateField(event.currentTarget.value)}
        error={error}
        aria-required={field.required || undefined}
      />
    );
  }

  if (field.type === "number") {
    return (
      <Input
        label={field.label}
        type="number"
        value={String(form[field.key] ?? "")}
        placeholder={field.placeholder}
        hint={field.hint}
        onChange={(event) => {
          const nextValue = event.currentTarget.value;
          updateField(nextValue === "" ? "" : Number(nextValue));
        }}
        error={error}
        aria-required={field.required || undefined}
      />
    );
  }

  if (field.type === "date") {
    return (
      <Input
        label={field.label}
        type="date"
        value={String(form[field.key] ?? "")}
        hint={field.hint}
        onChange={(event) => updateField(event.currentTarget.value)}
        error={error}
        aria-required={field.required || undefined}
      />
    );
  }

  if (field.key === "cpf") {
    return (
      <Input
        label={field.label}
        value={String(form[field.key] ?? "")}
        placeholder="000.000.000-00"
        inputMode="numeric"
        onChange={(event) => updateField(formatCPF(event.currentTarget.value))}
        error={error}
        aria-required={field.required || undefined}
      />
    );
  }

  if (field.key === "phone") {
    return (
      <Input
        label={field.label}
        type="tel"
        value={String(form[field.key] ?? "")}
        placeholder="(00) 00000-0000"
        inputMode="tel"
        autoComplete="tel"
        onChange={(event) => updateField(formatPhone(event.currentTarget.value))}
        error={error}
        aria-required={field.required || undefined}
      />
    );
  }

  if (field.type === "file") {
    return (
      <FileUploadField
        label={field.label}
        required={field.required}
        hint={field.hint}
        value={typeof form[field.key] === "string" ? (form[field.key] as string) : ""}
        onChange={updateField}
        error={error}
      />
    );
  }

  return (
    <Input
      label={field.label}
      value={String(form[field.key] ?? "")}
      placeholder={field.placeholder ?? `Ex.: ${field.label}`}
      hint={field.hint}
      onChange={(event) => updateField(event.currentTarget.value)}
      error={error}
      aria-required={field.required || undefined}
    />
  );
}

function FieldShell({
  label,
  required,
  hint,
  error,
  children
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-tk-ink">
      <span>
        {label}
        {required ? <span className="ml-1 text-tk-error">*</span> : null}
      </span>
      {children}
      {hint ? <span className="text-xs leading-5 text-tk-ink-muted">{hint}</span> : null}
      {error ? <span className="text-xs text-tk-error">{error}</span> : null}
    </label>
  );
}

function NativeSelectField({
  label,
  required,
  options,
  value,
  onChange,
  hint,
  error
}: {
  label: string;
  required?: boolean;
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  error?: string;
}) {
  return (
    <FieldShell label={label} required={required} hint={hint} error={error}>
      <select
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
        className={cn(
          "flex h-11 w-full rounded-tk-input border border-tk-line bg-tk-surface px-4 text-sm text-tk-ink outline-none transition duration-200 ease-[var(--tk-ease)] hover:border-tk-accent focus-visible:ring-2 focus-visible:ring-tk-focus focus-visible:ring-offset-2",
          error && "border-tk-error"
        )}
      >
        <option value="">Selecione</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

function MultiSelectLite({
  label,
  required,
  options,
  value,
  onChange,
  hint,
  error
}: {
  label: string;
  required?: boolean;
  options: Array<{ value: string; label: string }>;
  value: string[];
  onChange: (value: string[]) => void;
  hint?: string;
  error?: string;
}) {
  return (
    <FieldShell label={label} required={required} hint={hint} error={error}>
      <div className={cn("rounded-2xl border border-tk-line bg-tk-surface p-4", error && "border-tk-error")}>
        <div className="mb-3 flex flex-wrap gap-2">
          {value.length ? (
            value.map((item) => {
              const labelForItem = options.find((option) => option.value === item)?.label ?? item;
              return (
                <Badge key={item} variant="muted">
                  {labelForItem}
                </Badge>
              );
            })
          ) : (
            <span className="text-sm text-tk-ink-muted">Nenhuma opção selecionada.</span>
          )}
        </div>
        <div className="grid gap-2">
          {options.map((option) => {
            const checked = value.includes(option.value);
            return (
              <label key={option.value} className="flex items-center gap-3 rounded-xl border border-tk-line px-3 py-2 text-sm text-tk-ink">
                <input
                  type="checkbox"
                  aria-label={option.label}
                  checked={checked}
                  onChange={(event) => {
                    if (event.currentTarget.checked) {
                      onChange([...value, option.value]);
                      return;
                    }
                    onChange(value.filter((item) => item !== option.value));
                  }}
                  className="h-4 w-4 rounded border-tk-line text-tk-brand focus:ring-tk-focus"
                />
                <span>{option.label}</span>
              </label>
            );
          })}
        </div>
      </div>
    </FieldShell>
  );
}

function ArrayInputLite({
  label,
  value = [],
  onChange,
  placeholder = "Digite um item e clique em adicionar",
  hint,
  error,
  suggestions
}: {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  hint?: string;
  error?: string;
  suggestions?: string[];
}) {
  const [inputValue, setInputValue] = useState("");
  const datalistId = useId();
  const hasSuggestions = Boolean(suggestions?.length);

  return (
    <FieldShell label={label} hint={hint} error={error}>
      <div className="space-y-2">
        {value.map((item, index) => (
          <div key={`${item}-${index}`} className="flex items-center gap-2">
            <Input
              value={item}
              placeholder={placeholder}
              list={hasSuggestions ? datalistId : undefined}
              onChange={(event) => {
                const next = [...value];
                next[index] = event.currentTarget.value;
                onChange(next);
              }}
            />
            <IconButton
              label={`Remover item ${index + 1}`}
              tone="danger"
              onClick={() => onChange(value.filter((_, currentIndex) => currentIndex !== index))}
            >
              <X className="h-4 w-4" />
            </IconButton>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <Input
            value={inputValue}
            placeholder={placeholder}
            list={hasSuggestions ? datalistId : undefined}
            onChange={(event) => setInputValue(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key !== "Enter") return;
              event.preventDefault();
              if (!inputValue.trim()) return;
              onChange([...value, inputValue.trim()]);
              setInputValue("");
            }}
          />
          <Button
            type="button"
            size="icon"
            onClick={() => {
              if (!inputValue.trim()) return;
              onChange([...value, inputValue.trim()]);
              setInputValue("");
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {hasSuggestions ? (
          <datalist id={datalistId}>
            {suggestions!.map((suggestion) => (
              <option key={suggestion} value={suggestion}>
                {suggestion}
              </option>
            ))}
          </datalist>
        ) : null}
      </div>
    </FieldShell>
  );
}

type ModuleValue = {
  title: string;
  description: string;
  topics: string[];
  duration: string;
};

function ModulesBuilderLite({
  label,
  value = [],
  onChange,
  hint,
  error
}: {
  label: string;
  value: ModuleValue[];
  onChange: (value: ModuleValue[]) => void;
  hint?: string;
  error?: string;
}) {
  return (
    <FieldShell label={label} hint={hint} error={error}>
      <div className="space-y-3">
        {value.map((module, moduleIndex) => (
          <div key={moduleIndex} className="space-y-3 rounded-2xl border border-tk-line bg-tk-surface-2 p-4">
            <div className="flex items-start justify-between gap-3">
              <h4 className="text-sm font-semibold text-tk-ink">Módulo {moduleIndex + 1}</h4>
              <IconButton
                label={`Remover módulo ${moduleIndex + 1}`}
                tone="danger"
                onClick={() => onChange(value.filter((_, index) => index !== moduleIndex))}
              >
                <X className="h-4 w-4" />
              </IconButton>
            </div>

            <Input
              placeholder="Ex.: Introdução à legislação"
              value={module.title}
              onChange={(event) => {
                const next = [...value];
                next[moduleIndex] = { ...module, title: event.currentTarget.value };
                onChange(next);
              }}
            />

            <Textarea
              placeholder="Resumo do conteúdo e objetivo do módulo"
              value={module.description}
              onChange={(event) => {
                const next = [...value];
                next[moduleIndex] = { ...module, description: event.currentTarget.value };
                onChange(next);
              }}
            />

            <Input
              placeholder="Ex.: 8 horas"
              value={module.duration}
              onChange={(event) => {
                const next = [...value];
                next[moduleIndex] = { ...module, duration: event.currentTarget.value };
                onChange(next);
              }}
            />

            <div className="border-t border-tk-line pt-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-tk-ink-muted">Tópicos</p>
              <div className="space-y-2">
                {module.topics.map((topic, topicIndex) => (
                  <div key={topicIndex} className="flex items-center gap-2">
                    <Input
                      placeholder="Ex.: Casos reais, checklist e boas práticas"
                      value={topic}
                      onChange={(event) => {
                        const next = [...value];
                        const nextTopics = [...module.topics];
                        nextTopics[topicIndex] = event.currentTarget.value;
                        next[moduleIndex] = { ...module, topics: nextTopics };
                        onChange(next);
                      }}
                    />
                    <IconButton
                      label={`Remover tópico ${topicIndex + 1} do módulo ${moduleIndex + 1}`}
                      tone="danger"
                      onClick={() => {
                        const next = [...value];
                        next[moduleIndex] = {
                          ...module,
                          topics: module.topics.filter((_, index) => index !== topicIndex)
                        };
                        onChange(next);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </IconButton>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3 w-full"
                onClick={() => {
                  const next = [...value];
                  next[moduleIndex] = { ...module, topics: [...module.topics, ""] };
                  onChange(next);
                }}
              >
                <Plus className="h-4 w-4" />
                Adicionar tópico
              </Button>
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() =>
            onChange([...value, { title: "", description: "", topics: [""], duration: "" }])
          }
        >
          <Plus className="h-4 w-4" />
          Adicionar módulo
        </Button>
      </div>
    </FieldShell>
  );
}

function FileUploadField({
  label,
  required,
  hint,
  value,
  onChange,
  error
}: {
  label: string;
  required?: boolean;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewId = useId();

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") onChange(reader.result);
    };
    reader.readAsDataURL(file);
  }

  return (
    <FieldShell label={label} required={required} hint={hint} error={error}>
      <div className={cn("rounded-2xl border border-dashed border-tk-line p-4", error && "border-tk-error")}>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          aria-label={`Selecionar arquivo para ${label}`}
          className="hidden"
          onChange={handleFile}
        />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm text-tk-ink-muted">Selecione uma imagem para este registro.</p>
            {value ? (
              <div id={previewId} className="text-xs text-tk-ink-muted">
                Arquivo carregado e pronto para salvar.
              </div>
            ) : null}
          </div>
          <Button type="button" variant="outline" onClick={() => inputRef.current?.click()} aria-describedby={value ? previewId : undefined}>
            <Upload className="h-4 w-4" />
            Escolher imagem
          </Button>
        </div>
        {value ? (
          <div className="mt-4 overflow-hidden rounded-2xl border border-tk-line bg-tk-surface-2">
            <Image src={value} alt="" width={640} height={192} unoptimized className="max-h-48 w-full object-contain" />
          </div>
        ) : null}
      </div>
    </FieldShell>
  );
}
