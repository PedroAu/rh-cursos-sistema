"use client";

import {
  ActionIcon,
  Alert,
  Box,
  Button,
  CloseButton,
  FileInput,
  Grid,
  Group,
  Modal,
  MultiSelect,
  NumberInput,
  Paper,
  ScrollArea,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  Textarea,
  ThemeIcon,
  Title
} from "@mantine/core";
import { Download, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { isValidElement, useMemo, useState, type ReactNode } from "react";

import { ArrayInput, ModulesBuilder } from "@/components/admin/form-fields";
import { useHotkey } from "@/hooks/use-hotkey";
import type { ValidationError } from "@/lib/admin-form-validation";
import { buildResourceConfig, type FieldConfig, type ResourceKey } from "@/lib/admin-resource-configs";
import { useAppStore } from "@/lib/app-store";

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
      return 12;
    }

    return 6;
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
    <Stack gap="xl">
      <Group justify="space-between" align="flex-start">
        <Box maw={780}>
          <Title order={1} c="#0b4668" fw={800}>
            {pageTitle}
          </Title>
          <Text mt="sm" size="lg" lh={1.7} c="#4b5563">
            {pageDescription}
          </Text>
        </Box>

        {canCreate ? (
          <Button
            color="rhGold"
            c="white"
            radius="xl"
            leftSection={<Plus size={16} />}
            onClick={() => {
              setEditingId(null);
              setForm({});
              setOpen(true);
            }}
          >
            Novo Cadastro
          </Button>
        ) : null}
      </Group>

      {config.stats ? (
        <SimpleGrid cols={{ base: 1, md: 2, xl: 4 }} spacing="lg">
          {config.stats.map((stat, index) => {
            const Icon = stat.icon;
            const accentTone = index === 2 ? "#d17a00" : "#2f8b4f";

            return (
              <Paper key={stat.label} radius="xl" withBorder shadow="xs" p="xl">
                <Group justify="space-between" align="flex-start">
                  <Text maw={160} size="0.95rem" fw={800} c="#414a58">
                    {stat.label}
                  </Text>
                  {Icon ? (
                    <ThemeIcon size={48} radius="md" variant="light" color="rhBlue">
                      <Icon size={20} />
                    </ThemeIcon>
                  ) : null}
                </Group>
                <Text mt="xl" fz="2.2rem" fw={800} c="#111827">
                  {stat.value}
                </Text>
                <Text mt={6} fw={600} c={accentTone}>
                  {stat.helper}
                </Text>
              </Paper>
            );
          })}
        </SimpleGrid>
      ) : (
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
          <Paper radius="xl" withBorder shadow="xs" p="xl">
            <Text size="0.95rem" fw={800} c="#414a58">
              Registros visíveis
            </Text>
            <Text mt="xl" fz="2.2rem" fw={800} c="#111827">
              {rows.length}
            </Text>
            <Text mt={6} fw={600} c="#2f8b4f">
              {search ? `Filtro ativo para “${search}”.` : "Visão operacional atual."}
            </Text>
          </Paper>
          <Paper radius="xl" withBorder shadow="xs" p="xl">
            <Text size="0.95rem" fw={800} c="#414a58">
              Modo de operação
            </Text>
            <Text mt="xl" fz="2.2rem" fw={800} c="#111827">
              {canCreate ? "CRUD" : "Supervisionado"}
            </Text>
            <Text mt={6} fw={600} c="#2f8b4f">
              {canCreate ? "Criação e edição liberadas" : "Atualização sob controle"}
            </Text>
          </Paper>
          <Paper radius="xl" withBorder shadow="xs" p="xl">
            <Text size="0.95rem" fw={800} c="#414a58">
              Atalho
            </Text>
            <Text mt="xl" fz="2.2rem" fw={800} c="#111827">
              N
            </Text>
            <Text mt={6} fw={600} c="#2f8b4f">
              Cria um novo registro rapidamente
            </Text>
          </Paper>
        </SimpleGrid>
      )}

      <Paper radius="xl" withBorder shadow="xs" p="lg">
        <Group justify="space-between" align="flex-end" mb="lg">
          <Box>
            <Title order={2} c="#0b4668">
              {resource === "classes" ? "Listagem de Turmas Ativas" : resource === "students" ? "Gerenciar Usuários" : config.title}
            </Title>
          </Box>
          <Group align="flex-end">
            <TextInput
              value={search}
              onChange={(event) => setSearch(event.currentTarget.value)}
              placeholder={getSearchPlaceholder(resource)}
              leftSection={<Search size={18} />}
              rightSection={
                search ? <CloseButton aria-label="Limpar busca" onClick={() => setSearch("")} /> : null
              }
              styles={{ root: { minWidth: 320 } }}
            />
            {rows.length > 0 ? (
              <Button
                variant="default"
                leftSection={<Download size={16} />}
                onClick={() => exportToCSV(config.rows, config.columns as CsvColumn[], resource)}
              >
                Exportar
              </Button>
            ) : null}
          </Group>
        </Group>

        {rows.length ? (
          <ScrollArea>
            <Table highlightOnHover verticalSpacing="lg" horizontalSpacing="xl" miw={860}>
              <Table.Thead bg="#f7f8fb">
                <Table.Tr>
                  {(config.columns as Array<{ key: string; label: string; render: (row: unknown) => unknown }>).map((column) => (
                    <Table.Th key={column.key}>{column.label}</Table.Th>
                  ))}
                  <Table.Th style={{ textAlign: "right" }}>Ações</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {rows.map((row) => (
                  <Table.Tr key={row.id}>
                    {(config.columns as Array<{ key: string; label: string; render: (row: unknown) => unknown }>).map((column) => (
                      <Table.Td key={`${row.id}-${column.key}`}>{column.render(row) as ReactNode}</Table.Td>
                    ))}
                    <Table.Td>
                      <Group justify="flex-end" gap="xs">
                        <ActionIcon
                          variant="subtle"
                          color="dark"
                          aria-label={`Editar item ${row.id}`}
                          onClick={() => config.onEdit(row)}
                        >
                          <Pencil size={18} />
                        </ActionIcon>
                        {config.onDelete ? (
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            aria-label={`Excluir item ${row.id}`}
                            onClick={() => config.onDelete?.(row)}
                          >
                            <Trash2 size={18} />
                          </ActionIcon>
                        ) : null}
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        ) : (
          <Paper radius="lg" p="xl" bg="#f8fafc">
            <Stack align="center" gap="sm">
              <Text fw={700} c="#111827">
                Nenhum registro encontrado.
              </Text>
              <Text size="sm" c="#667085" ta="center">
                {canCreate
                  ? "Crie um novo item para iniciar a operação desta área."
                  : "Os registros aparecem aqui conforme são gerados pelos fluxos do sistema."}
              </Text>
              {canCreate ? (
                <Button
                  color="rhBlue"
                  onClick={() => {
                    setEditingId(null);
                    setForm({});
                    setOpen(true);
                  }}
                >
                  Criar agora
                </Button>
              ) : null}
            </Stack>
          </Paper>
        )}
      </Paper>

      <Modal
        opened={open}
        onClose={() => setOpen(false)}
        size="xl"
        title={editingId ? "Editar registro" : "Criar novo registro"}
        centered
        scrollAreaComponent={ScrollArea.Autosize}
      >
        <Stack gap="lg">
          {validationErrors.length > 0 ? (
            <Alert color="red" variant="light" title="Erros encontrados">
              <Stack gap={4}>
                {validationErrors.map((error, index) => (
                  <Text key={`${error.field}-${index}`} size="sm">
                    {error.message}
                  </Text>
                ))}
              </Stack>
            </Alert>
          ) : null}

          {fieldSections.map((section) => (
            <Paper key={section.title} radius="lg" withBorder p="md">
              <Stack gap="md">
                <Box>
                  <Text fw={700} c="#111827">
                    {section.title}
                  </Text>
                  <Text size="sm" c="#667085" mt={4}>
                    {section.title === "Ação operacional"
                      ? "Atualize apenas o que interfere na operação do time."
                      : "Revise os dados antes de salvar para evitar retrabalho operacional."}
                  </Text>
                </Box>

                <Grid>
                  {section.fields.map((field) => (
                    <Grid.Col key={field.key} span={{ base: 12, md: getFieldSpan(field) }}>
                      <RenderField
                        field={field}
                        form={form}
                        setForm={setForm}
                        error={errorsByField[field.key]}
                      />
                    </Grid.Col>
                  ))}
                </Grid>
              </Stack>
            </Paper>
          ))}

          <Group justify="flex-end">
            <Button variant="default" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button color="rhBlue" loading={isSaving} onClick={handleSave}>
              {editingId ? "Salvar alterações" : "Criar registro"}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
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
      <Paper radius="md" p="md" bg="#f7f9fc" withBorder>
        <Text size="xs" fw={800} c="#667085">
          {field.label}
        </Text>
        <Text size="sm" c="#111827" mt="sm">
          {String(form[field.key] ?? "—")}
        </Text>
      </Paper>
    );
  }

  if (field.type === "modules") {
    return (
      <ModulesBuilder
        label={field.label}
        value={(form[field.key] as never[]) || []}
        onChange={(value) => setForm((current) => ({ ...current, [field.key]: value }))}
        error={error}
      />
    );
  }

  if (field.type === "array") {
    return (
      <ArrayInput
        label={field.label}
        value={(form[field.key] as string[]) || []}
        onChange={(value) => setForm((current) => ({ ...current, [field.key]: value }))}
        error={error}
      />
    );
  }

  if (field.type === "multiselect" && field.options) {
    return (
      <MultiSelect
        label={field.label}
        required={field.required}
        data={field.options}
        value={(form[field.key] as string[]) || []}
        onChange={(value) => setForm((current) => ({ ...current, [field.key]: value }))}
        error={error}
        searchable
      />
    );
  }

  if (field.type === "select" && field.options) {
    return (
      <Select
        label={field.label}
        required={field.required}
        data={field.options}
        value={String(form[field.key] ?? "")}
        onChange={(value) => setForm((current) => ({ ...current, [field.key]: value ?? "" }))}
        error={error}
      />
    );
  }

  if (field.type === "textarea") {
    return (
      <Textarea
        label={field.label}
        required={field.required}
        value={String(form[field.key] ?? "")}
        placeholder={`Ex.: ${field.label}`}
        onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.currentTarget.value }))}
        error={error}
        minRows={5}
      />
    );
  }

  if (field.type === "number") {
    return (
      <NumberInput
        label={field.label}
        required={field.required}
        value={typeof form[field.key] === "number" ? (form[field.key] as number) : Number(form[field.key] || 0)}
        onChange={(value) => setForm((current) => ({ ...current, [field.key]: value }))}
        error={error}
      />
    );
  }

  if (field.type === "date") {
    return (
      <TextInput
        label={field.label}
        required={field.required}
        type="date"
        value={String(form[field.key] ?? "")}
        onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.currentTarget.value }))}
        error={error}
      />
    );
  }

  if (field.type === "file") {
    return (
      <FileInput
        label={field.label}
        required={field.required}
        accept="image/*"
        error={error}
        onChange={(file) => {
          if (!file) return;
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result === "string") {
              setForm((current) => ({ ...current, [field.key]: reader.result }));
            }
          };
          reader.readAsDataURL(file);
        }}
      />
    );
  }

  return (
    <TextInput
      label={field.label}
      required={field.required}
      value={String(form[field.key] ?? "")}
      placeholder={`Ex.: ${field.label}`}
      onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.currentTarget.value }))}
      error={error}
    />
  );
}
