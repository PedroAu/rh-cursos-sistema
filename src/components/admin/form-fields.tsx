"use client";

import * as React from "react";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="space-y-2">
        {value.map((item, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              type="text"
              value={item}
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
              className="p-1 text-destructive hover:bg-destructive/10 rounded"
              title="Remover"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => {
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
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
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
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      <select
        value={value}
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
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
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
  onChange: (v: any[]) => void;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium">{label}</label>
      <div className="space-y-3">
        {value.map((module, i) => (
          <div
            key={i}
            className="border rounded-md p-3 bg-muted/30 space-y-2"
          >
            <div className="flex justify-between items-start">
              <h4 className="font-medium text-sm">Módulo {i + 1}</h4>
              <button
                type="button"
                onClick={() => onChange(value.filter((_, j) => j !== i))}
                className="p-1 text-destructive hover:bg-destructive/10 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <input
              type="text"
              placeholder="Título do módulo"
              value={module.title}
              onChange={(e) => {
                const copy = [...value];
                copy[i].title = e.target.value;
                onChange(copy);
              }}
              className="w-full rounded-md border border-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />

            <textarea
              placeholder="Descrição do módulo"
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
              placeholder="Duração (ex: 8 horas)"
              value={module.duration}
              onChange={(e) => {
                const copy = [...value];
                copy[i].duration = e.target.value;
                onChange(copy);
              }}
              className="w-full rounded-md border border-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />

            <div className="pt-2 border-t">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Tópicos
              </p>
              <div className="space-y-1">
                {module.topics.map((topic, j) => (
                  <div key={j} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => {
                        const copy = [...value];
                        copy[i].topics[j] = e.target.value;
                        onChange(copy);
                      }}
                      className="flex-1 rounded-md border border-input px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
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
                      className="p-1 text-destructive hover:bg-destructive/10 rounded"
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
                className="mt-2 w-full h-8 text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Adicionar tópico
              </Button>
            </div>
          </div>
        ))}
      </div>

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
        <Plus className="h-4 w-4 mr-2" />
        Adicionar módulo
      </Button>

      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
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
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="space-y-2">
        {options.map((opt) => (
          <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={value.includes(opt.value)}
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
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}
