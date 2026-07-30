import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import {
  FormField,
  FormFieldMultiSelect,
  FormFieldSelect,
  FormFieldText,
} from "./form-field";
import { Input } from "./input";

/**
 * `FormField` é um wrapper acessível por render-prop: gera `id`, associa
 * `label`, `hint` e mensagens de erro via `aria-describedby`/`aria-invalid`.
 * Os wrappers `FormField*` aplicam o mesmo contrato sobre os primitives do
 * design system e mantêm assinatura controlada útil para `react-hook-form`.
 */
const meta = {
  title: "UI/FormField",
  component: FormField,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  args: { label: "Campo", children: () => null },
} satisfies Meta<typeof FormField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithHint: Story = {
  render: () => (
    <div style={{ maxWidth: 360 }}>
      <FormField label="E-mail corporativo" hint="Usaremos para enviar o certificado." required>
        {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
          <Input id={fieldId} aria-describedby={ariaDescribedBy} aria-invalid={ariaInvalid} placeholder="seu@email.com" />
        )}
      </FormField>
    </div>
  ),
};

export const WithError: Story = {
  render: () => (
    <div style={{ maxWidth: 360 }}>
      <FormField label="CPF" error="Informe um CPF válido." required>
        {({ fieldId, ariaDescribedBy, ariaInvalid }) => (
          <Input id={fieldId} aria-describedby={ariaDescribedBy} aria-invalid={ariaInvalid} placeholder="000.000.000-00" />
        )}
      </FormField>
    </div>
  ),
};

function ControlledExample() {
  const [name, setName] = useState("");
  const [modality, setModality] = useState("online");
  const [audiences, setAudiences] = useState<string[]>(["dp"]);
  return (
    <div style={{ maxWidth: 420, display: "grid", gap: 16 }}>
      <FormFieldText
        label="Nome completo"
        value={name}
        onChange={(event) => setName(event.currentTarget.value)}
        required
      />
      <FormFieldSelect
        label="Modalidade"
        value={modality}
        onChange={setModality}
        options={[
          { value: "online", label: "Ao vivo online" },
          { value: "presencial", label: "Presencial" },
        ]}
      />
      <FormFieldMultiSelect
        label="Publicos relacionados"
        value={audiences}
        onChange={setAudiences}
        options={[
          { value: "dp", label: "Departamento Pessoal" },
          { value: "esocial", label: "eSocial" },
          { value: "fiscal", label: "Fiscal" },
        ]}
      />
    </div>
  );
}

export const ControlledFields: Story = { render: () => <ControlledExample /> };
