"use client";

import * as React from "react";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";

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
              <input
                id={i === 0 ? fieldId : undefined}
                type="text"
                value={item}
                aria-describedby={i === 0 ? ariaDescribedBy : undefined}
                aria-invalid={i === 0 ? ariaInvalid : undefined}
                onChange={(e) => {
                  const copy = [...value];
                  copy[i] = e.target.value;
                  onChange(copy);
                }}
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="button"
                onClick={() => onChange(value.filter((_, j) => j !== i))}
                className="rounded p-1 text-destructive hover:bg-destructive/10"
                aria-label={`Remover item ${i + 1}`}
                title="Remover"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <input
              id={value.length === 0 ? fieldId : undefined}
              type="text"
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
              placeholder={placeholder}
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
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
          </div>
        </div>
      )}
    </FormField>
  );
}

export function SelectField({
  label,
  value,
  options,
  onChange,
  error,
  required = false,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (v: string) => void;
  error?: string;
  required?: boolean;
}) {
  return (
    <FormField error={error} label={label} required={required}>
      {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
        <select
          id={fieldId}
          value={value}
          aria-describedby={ariaDescribedBy}
          aria-invalid={ariaInvalid}
          onChange={(e) => onChange(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Selecione uma opção...</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
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
                <button
                  type="button"
                  onClick={() => onChange(value.filter((_, j) => j !== i))}
                  className="rounded p-1 text-destructive hover:bg-destructive/10"
                  aria-label={`Remover módulo ${i + 1}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <input
                id={i === 0 ? fieldId : undefined}
                type="text"
                placeholder="Ex.: Introdução à legislação"
                value={module.title}
                aria-describedby={i === 0 ? ariaDescribedBy : undefined}
                aria-invalid={i === 0 ? ariaInvalid : undefined}
                onChange={(e) => {
                  const copy = [...value];
                  copy[i].title = e.target.value;
                  onChange(copy);
                }}
                className="w-full rounded-md border border-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
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

              <input
                type="text"
                placeholder="Ex.: 8 horas"
                value={module.duration}
                onChange={(e) => {
                  const copy = [...value];
                  copy[i].duration = e.target.value;
                  onChange(copy);
                }}
                className="w-full rounded-md border border-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />

              <div className="border-t pt-2">
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  Tópicos
                </p>
                <div className="space-y-1">
                  {module.topics.map((topic, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={topic}
                        onChange={(e) => {
                          const copy = [...value];
                          copy[i].topics[j] = e.target.value;
                          onChange(copy);
                        }}
                        className="flex-1 rounded-md border border-input px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const copy = [...value];
                          copy[i].topics = module.topics.filter(
                            (_, jj) => jj !== j
                          );
                          onChange(copy);
                        }}
                        className="rounded p-1 text-destructive hover:bg-destructive/10"
                        aria-label={`Remover tópico ${j + 1} do módulo ${i + 1}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
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
    <FormField error={error} label={label}>
      {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
        <div className="space-y-2" id={fieldId}>
          {options.map((opt, index) => (
            <label key={opt.value} className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={value.includes(opt.value)}
                aria-describedby={index === 0 ? ariaDescribedBy : undefined}
                aria-invalid={index === 0 ? ariaInvalid : undefined}
                onChange={(e) => {
                  if (e.target.checked) {
                    onChange([...value, opt.value]);
                  } else {
                    onChange(value.filter((v) => v !== opt.value));
                  }
                }}
                className="rounded border border-input"
              />
              <span className="text-sm">{opt.label}</span>
            </label>
          ))}
        </div>
      )}
    </FormField>
  );
}
