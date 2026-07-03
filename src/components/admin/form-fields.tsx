"use client";

import * as React from "react";
import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  FormField,
  FormFieldMultiSelect,
  FormFieldSelect,
  FormFieldText,
  FormFieldTextarea,
} from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";

export { FormFieldSelect as SelectField, FormFieldText as TextField };

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

  const addItem = React.useCallback(() => {
    const nextValue = inputValue.trim();
    if (!nextValue) return;
    onChange([...value, nextValue]);
    setInputValue("");
  }, [inputValue, onChange, value]);

  return (
    <FormField error={error} hint="Adicione itens um por vez." label={label}>
      {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
        <div className="space-y-2">
          {value.map((item, index) => (
            <div key={`${item}-${index}`} className="flex items-center gap-2">
              <Input
                id={index === 0 ? fieldId : undefined}
                value={item}
                aria-describedby={index === 0 ? ariaDescribedBy : undefined}
                aria-invalid={index === 0 ? ariaInvalid : undefined}
                onChange={(event) => {
                  const copy = [...value];
                  copy[index] = event.currentTarget.value;
                  onChange(copy);
                }}
                className="flex-1"
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))}
                aria-label={`Remover item ${index + 1}`}
                title="Remover"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <Input
              id={value.length === 0 ? fieldId : undefined}
              placeholder={placeholder}
              value={inputValue}
              aria-describedby={value.length === 0 ? ariaDescribedBy : undefined}
              aria-invalid={value.length === 0 ? ariaInvalid : undefined}
              onChange={(event) => setInputValue(event.currentTarget.value)}
              onKeyDown={(event) => {
                if (event.key !== "Enter") return;
                event.preventDefault();
                addItem();
              }}
              className="flex-1"
            />
            <Button type="button" size="icon" aria-label={`Adicionar item em ${label}`} onClick={addItem}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </FormField>
  );
}

type ModuleValue = {
  title: string;
  description: string;
  topics: string[];
  duration: string;
};

export function ModulesBuilder({
  label,
  value = [],
  onChange,
  error,
}: {
  label: string;
  value: ModuleValue[];
  onChange: (v: ModuleValue[]) => void;
  error?: string;
}) {
  const updateModule = React.useCallback(
    (index: number, nextModule: ModuleValue) => {
      const copy = [...value];
      copy[index] = nextModule;
      onChange(copy);
    },
    [onChange, value]
  );

  return (
    <FormField error={error} hint="Cada modulo pode conter titulo, descricao, duracao e topicos." label={label}>
      {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
        <div className="space-y-3">
          {value.map((module, index) => (
            <div key={`module-${index}`} className="space-y-3 rounded-tk-card border border-tk-line bg-tk-surface-2 p-4">
              <div className="flex items-start justify-between gap-3">
                <h4 className="text-sm font-semibold text-tk-ink">Modulo {index + 1}</h4>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))}
                  aria-label={`Remover modulo ${index + 1}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <FormFieldText
                id={index === 0 ? fieldId : undefined}
                label="Titulo"
                placeholder="Ex.: Introducao a legislacao"
                value={module.title}
                aria-describedby={index === 0 ? ariaDescribedBy : undefined}
                aria-invalid={index === 0 ? ariaInvalid : undefined}
                onChange={(event) => updateModule(index, { ...module, title: event.currentTarget.value })}
              />

              <FormFieldTextarea
                label="Descricao"
                placeholder="Resumo do conteudo e objetivo do modulo"
                value={module.description}
                onChange={(event) => updateModule(index, { ...module, description: event.currentTarget.value })}
                rows={4}
              />

              <FormFieldText
                label="Duracao"
                placeholder="Ex.: 8 horas"
                value={module.duration}
                onChange={(event) => updateModule(index, { ...module, duration: event.currentTarget.value })}
              />

              <div className="space-y-2 border-t border-tk-line pt-3">
                <p className="text-caption font-semibold uppercase tracking-[0.05em] text-tk-ink-muted">
                  Topicos
                </p>
                <div className="space-y-2">
                  {module.topics.map((topic, topicIndex) => (
                    <div key={`topic-${index}-${topicIndex}`} className="flex items-center gap-2">
                      <Input
                        value={topic}
                        onChange={(event) => {
                          const nextTopics = [...module.topics];
                          nextTopics[topicIndex] = event.currentTarget.value;
                          updateModule(index, { ...module, topics: nextTopics });
                        }}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          updateModule(index, {
                            ...module,
                            topics: module.topics.filter((_, itemIndex) => itemIndex !== topicIndex),
                          });
                        }}
                        aria-label={`Remover topico ${topicIndex + 1} do modulo ${index + 1}`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => updateModule(index, { ...module, topics: [...module.topics, ""] })}
                  className="w-full"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Adicionar topico
                </Button>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onChange([...value, { title: "", description: "", topics: [""], duration: "" }]);
            }}
            className="w-full"
          >
            <Plus className="h-4 w-4" />
            Adicionar modulo
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
  return <FormFieldMultiSelect label={label} value={value} options={options} onChange={onChange} error={error} />;
}
