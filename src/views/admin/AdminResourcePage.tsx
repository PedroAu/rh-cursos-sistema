"use client";

import Image from "next/image";
import { Download, Pencil, Plus, Search, Trash2, Upload, X } from "lucide-react";
import { isValidElement, useId, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from "react";

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

export function AdminResourcePage({ resource }: { resource: ResourceKey }) {
  const store = useAppStore();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

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
        setOpen
      }),
    [editingId, form, resource, search, store]
  );

  const rows = config.rows as Array<{ id: string }>;
  const canCreate = resource !== "students" && resource !== "enrollments";
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
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0b4668]">{pageTitle}</h1>
          <p className="text-base leading-7 text-slate-600 md:text-lg">{pageDescription}</p>
        </div>

        {canCreate ? (
          <Button
            className="rounded-full bg-[#d39b10] hover:bg-[#ba870d]"
            onClick={() => {
              setEditingId(null);
              setForm({});
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
            const accentTone = index === 2 ? "#d17a00" : "#2f8b4f";

            return (
              <Panel key={stat.label} className="p-8">
                <div className="flex items-start justify-between gap-4">
                  <p className="max-w-[160px] text-[0.95rem] font-extrabold text-slate-600">{stat.label}</p>
                  {Icon ? (
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f1f6] text-[#0b4668]">
                      <Icon className="h-5 w-5" />
                    </div>
                  ) : null}
                </div>
                <p className="mt-10 text-[2.2rem] font-extrabold text-slate-900">{stat.value}</p>
                <p className="mt-1.5 font-semibold" style={{ color: accentTone }}>
                  {stat.helper}
                </p>
              </Panel>
            );
          })}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          <Panel className="p-8">
            <p className="text-[0.95rem] font-extrabold text-slate-600">Registros visíveis</p>
            <p className="mt-10 text-[2.2rem] font-extrabold text-slate-900">{rows.length}</p>
            <p className="mt-1.5 font-semibold text-[#2f8b4f]">
              {search ? `Filtro ativo para “${search}”.` : "Visão operacional atual."}
            </p>
          </Panel>
          <Panel className="p-8">
            <p className="text-[0.95rem] font-extrabold text-slate-600">Modo de operação</p>
            <p className="mt-10 text-[2.2rem] font-extrabold text-slate-900">{canCreate ? "CRUD" : "Supervisionado"}</p>
            <p className="mt-1.5 font-semibold text-[#2f8b4f]">
              {canCreate ? "Criação e edição liberadas" : "Atualização sob controle"}
            </p>
          </Panel>
          <Panel className="p-8">
            <p className="text-[0.95rem] font-extrabold text-slate-600">Atalho</p>
            <p className="mt-10 text-[2.2rem] font-extrabold text-slate-900">N</p>
            <p className="mt-1.5 font-semibold text-[#2f8b4f]">Cria um novo registro rapidamente</p>
          </Panel>
        </div>
      )}

      <Panel className="p-6">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-[#0b4668]">
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
            <TableHeader className="bg-slate-50">
              <TableRow className="hover:bg-slate-50">
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
          <div className="rounded-2xl bg-slate-50 p-8 text-center">
            <p className="font-semibold text-slate-900">Nenhum registro encontrado.</p>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
              {canCreate
                ? "Crie um novo item para iniciar a operação desta área."
                : "Os registros aparecem aqui conforme são gerados pelos fluxos do sistema."}
            </p>
            {canCreate ? (
              <div className="mt-5">
                <Button
                  onClick={() => {
                    setEditingId(null);
                    setForm({});
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[min(96vw,1100px)] overflow-y-auto p-0">
          <div className="max-h-[calc(100vh-2rem)] overflow-y-auto">
            <DialogHeader className="border-b border-slate-200 px-6 py-5">
              <DialogTitle>{editingId ? "Editar registro" : "Criar novo registro"}</DialogTitle>
              <DialogDescription>
                Revise os dados antes de salvar para evitar retrabalho operacional.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 px-6 py-5">
              {validationErrors.length > 0 ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                  <p className="font-semibold text-red-700">Erros encontrados</p>
                  <div className="mt-3 space-y-1">
                    {validationErrors.map((error, index) => (
                      <p key={`${error.field}-${index}`} className="text-sm text-red-700">
                        {error.message}
                      </p>
                    ))}
                  </div>
                </div>
              ) : null}

              {fieldSections.map((section) => (
                <Panel key={section.title} className="p-5">
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-900">{section.title}</p>
                    <p className="text-sm text-slate-500">
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
                          setForm={setForm}
                          error={errorsByField[field.key]}
                        />
                      </div>
                    ))}
                  </div>
                </Panel>
              ))}
            </div>

            <DialogFooter className="border-t border-slate-200 px-6 py-5">
              <Button variant="outline" onClick={() => setOpen(false)}>
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
  return <section className={cn("rounded-3xl border border-slate-200 bg-white shadow-sm", className)}>{children}</section>;
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
        "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50",
        tone === "danger" && "text-red-600 hover:bg-red-50"
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
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
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
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
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
  setForm,
  error
}: {
  field: FieldConfig;
  form: Record<string, unknown>;
  setForm: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
  error?: string;
}) {
  if (field.type === "readonly") {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-500">{field.label}</p>
        <p className="mt-3 text-sm text-slate-900">{String(form[field.key] ?? "—")}</p>
      </div>
    );
  }

  if (field.type === "modules") {
    return (
      <ModulesBuilderLite
        label={field.label}
        value={(form[field.key] as ModuleValue[]) || []}
        onChange={(value) => setForm((current) => ({ ...current, [field.key]: value }))}
        error={error}
      />
    );
  }

  if (field.type === "array") {
    return (
      <ArrayInputLite
        label={field.label}
        value={(form[field.key] as string[]) || []}
        onChange={(value) => setForm((current) => ({ ...current, [field.key]: value }))}
        error={error}
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
        onChange={(value) => setForm((current) => ({ ...current, [field.key]: value }))}
        error={error}
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
        onChange={(value) => setForm((current) => ({ ...current, [field.key]: value }))}
        error={error}
      />
    );
  }

  if (field.type === "textarea") {
    return (
      <Textarea
        label={field.label}
        value={String(form[field.key] ?? "")}
        placeholder={`Ex.: ${field.label}`}
        onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.currentTarget.value }))}
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
        onChange={(event) => {
          const nextValue = event.currentTarget.value;
          setForm((current) => ({ ...current, [field.key]: nextValue === "" ? "" : Number(nextValue) }));
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
        onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.currentTarget.value }))}
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
        value={typeof form[field.key] === "string" ? (form[field.key] as string) : ""}
        onChange={(value) => setForm((current) => ({ ...current, [field.key]: value }))}
        error={error}
      />
    );
  }

  return (
    <Input
      label={field.label}
      value={String(form[field.key] ?? "")}
      placeholder={`Ex.: ${field.label}`}
      onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.currentTarget.value }))}
      error={error}
      aria-required={field.required || undefined}
    />
  );
}

function FieldShell({
  label,
  required,
  error,
  children
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-900">
      <span>
        {label}
        {required ? <span className="ml-1 text-red-600">*</span> : null}
      </span>
      {children}
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </label>
  );
}

function NativeSelectField({
  label,
  required,
  options,
  value,
  onChange,
  error
}: {
  label: string;
  required?: boolean;
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <FieldShell label={label} required={required} error={error}>
      <select
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
        className={cn(
          "flex h-11 w-full rounded-tk-input border border-tk-line bg-tk-surface px-4 text-sm text-tk-ink outline-none transition duration-200 ease-[var(--tk-ease)] hover:border-tk-accent focus-visible:ring-2 focus-visible:ring-tk-focus focus-visible:ring-offset-2",
          error && "border-red-400"
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
  error
}: {
  label: string;
  required?: boolean;
  options: Array<{ value: string; label: string }>;
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
}) {
  return (
    <FieldShell label={label} required={required} error={error}>
      <div className={cn("rounded-2xl border border-slate-200 bg-white p-4", error && "border-red-300")}>
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
            <span className="text-sm text-slate-500">Nenhuma opção selecionada.</span>
          )}
        </div>
        <div className="grid gap-2">
          {options.map((option) => {
            const checked = value.includes(option.value);
            return (
              <label key={option.value} className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700">
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
                  className="h-4 w-4 rounded border-slate-300 text-[#0b4668] focus:ring-[#0b4668]"
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
  error
}: {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  error?: string;
}) {
  const [inputValue, setInputValue] = useState("");

  return (
    <FieldShell label={label} error={error}>
      <div className="space-y-2">
        {value.map((item, index) => (
          <div key={`${item}-${index}`} className="flex items-center gap-2">
            <Input
              value={item}
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
  error
}: {
  label: string;
  value: ModuleValue[];
  onChange: (value: ModuleValue[]) => void;
  error?: string;
}) {
  return (
    <FieldShell label={label} error={error}>
      <div className="space-y-3">
        {value.map((module, moduleIndex) => (
          <div key={moduleIndex} className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <h4 className="text-sm font-semibold text-slate-900">Módulo {moduleIndex + 1}</h4>
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

            <div className="border-t border-slate-200 pt-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Tópicos</p>
              <div className="space-y-2">
                {module.topics.map((topic, topicIndex) => (
                  <div key={topicIndex} className="flex items-center gap-2">
                    <Input
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
  value,
  onChange,
  error
}: {
  label: string;
  required?: boolean;
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
    <FieldShell label={label} required={required} error={error}>
      <div className={cn("rounded-2xl border border-dashed border-slate-300 p-4", error && "border-red-300")}>
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
            <p className="text-sm text-slate-600">Selecione uma imagem para este registro.</p>
            {value ? (
              <div id={previewId} className="text-xs text-slate-500">
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
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
            <Image src={value} alt="" width={640} height={192} unoptimized className="max-h-48 w-full object-contain" />
          </div>
        ) : null}
      </div>
    </FieldShell>
  );
}
