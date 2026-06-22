"use client";

import * as React from "react";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField, MantineFormFieldSelect, MantineFormFieldText, MantineFormFieldMultiSelect } from "@/components/ui/form-field";
import { TextInput, ActionIcon, Group } from "@mantine/core";

// Re-export Mantine form components for backward compatibility
export { MantineFormFieldSelect as SelectField, MantineFormFieldText as TextField };

export function ArrayInput({
  label,
  value = [],
  onChange,
  placeholder = "Digite um item e clique em adicionar",
  error,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  error?: string;
}) {
  const [inputValue, setInputValue] = React.useState("");

  return (
    <FormField error={error} hint="Adicione itens um por vez." label={label}>
      {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
        <div className="space-y-2">
          {value.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <TextInput
                id={i === 0 ? fieldId : undefined}
                value={item}
                aria-describedby={i === 0 ? ariaDescribedBy : undefined}
                aria-invalid={i === 0 ? ariaInvalid : undefined}
                onChange={(e) => {
                  const copy = [...value];
                  copy[i] = e.target.value;
                  onChange(copy);
                }}
                className="flex-1"
              />
              <ActionIcon
                variant="subtle"
                color="red"
                onClick={() => onChange(value.filter((_, j) => j !== i))}
                aria-label={`Remover item ${i + 1}`}
                title="Remover"
              >
                <X className="h-4 w-4" />
              </ActionIcon>
            </div>
          ))}
          <Group gap="sm">
            <TextInput
              id={value.length === 0 ? fieldId : undefined}
              placeholder={placeholder}
              value={inputValue}
              aria-describedby={value.length === 0 ? ariaDescribedBy : undefined}
              aria-invalid={value.length === 0 ? ariaInvalid : undefined}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (inputValue.trim()) {
                    onChange([...value, inputValue.trim()]);
                    setInputValue("");
                  }
                  e.preventDefault();
                }
              }}
              className="flex-1"
            />
            <Button
              type="button"
              size="sm"
              aria-label={`Adicionar item em ${label}`}
              onClick={() => {
                if (inputValue.trim()) {
                  onChange([...value, inputValue.trim()]);
                  setInputValue("");
                }
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </Group>
        </div>
      )}
    </FormField>
  );
}

export function ModulesBuilder({
  label,
  value = [],
  onChange,
  error,
}: {
  label: string;
  value: Array<{
    title: string;
    description: string;
    topics: string[];
    duration: string;
  }>;
  onChange: (
    v: Array<{
      title: string;
      description: string;
      topics: string[];
      duration: string;
    }>
  ) => void;
  error?: string;
}) {
  return (
    <FormField error={error} hint="Cada módulo pode conter título, descrição, duração e tópicos." label={label}>
      {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
        <div className="space-y-3">
          {value.map((module, i) => (
            <div
              key={i}
              className="space-y-2 rounded-md border bg-muted/30 p-3"
            >
              <div className="flex items-start justify-between">
                <h4 className="text-sm font-medium">Módulo {i + 1}</h4>
                <ActionIcon
                  variant="subtle"
                  color="red"
                  onClick={() => onChange(value.filter((_, j) => j !== i))}
                  aria-label={`Remover módulo ${i + 1}`}
                >
                  <X className="h-4 w-4" />
                </ActionIcon>
              </div>

              <TextInput
                id={i === 0 ? fieldId : undefined}
                placeholder="Ex.: Introdução à legislação"
                value={module.title}
                aria-describedby={i === 0 ? ariaDescribedBy : undefined}
                aria-invalid={i === 0 ? ariaInvalid : undefined}
                onChange={(e) => {
                  const copy = [...value];
                  copy[i].title = e.target.value;
                  onChange(copy);
                }}
              />

              <textarea
                placeholder="Resumo do conteúdo e objetivo do módulo"
                value={module.description}
                onChange={(e) => {
                  const copy = [...value];
                  copy[i].description = e.target.value;
                  onChange(copy);
                }}
                className="w-full min-h-20 rounded-md border border-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />

              <TextInput
                placeholder="Ex.: 8 horas"
                value={module.duration}
                onChange={(e) => {
                  const copy = [...value];
                  copy[i].duration = e.target.value;
                  onChange(copy);
                }}
              />

              <div className="border-t pt-2">
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  Tópicos
                </p>
                <div className="space-y-1">
                  {module.topics.map((topic, j) => (
                    <Group key={j} gap="sm">
                      <TextInput
                        value={topic}
                        onChange={(e) => {
                          const copy = [...value];
                          copy[i].topics[j] = e.target.value;
                          onChange(copy);
                        }}
                        className="flex-1"
                      />
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={() => {
                          const copy = [...value];
                          copy[i].topics = module.topics.filter(
                            (_, jj) => jj !== j
                          );
                          onChange(copy);
                        }}
                        aria-label={`Remover tópico ${j + 1} do módulo ${i + 1}`}
                      >
                        <X className="h-3 w-3" />
                      </ActionIcon>
                    </Group>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const copy = [...value];
                    copy[i].topics.push("");
                    onChange(copy);
                  }}
                  className="mt-2 h-8 w-full text-label"
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Adicionar tópico
                </Button>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onChange([
                ...value,
                { title: "", description: "", topics: [""], duration: "" },
              ]);
            }}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar módulo
          </Button>
        </div>
      )}
    </FormField>
  );
}

export function MultiSelectField({
  label,
  value = [],
  options,
  onChange,
  error,
}: {
  label: string;
  value: string[];
  options: Array<{ value: string; label: string }>;
  onChange: (v: string[]) => void;
  error?: string;
}) {
  return (
    <MantineFormFieldMultiSelect
      label={label}
      value={value}
      onChange={onChange}
      options={options}
      error={error}
      placeholder="Selecione as opções..."
    />
  );
}
