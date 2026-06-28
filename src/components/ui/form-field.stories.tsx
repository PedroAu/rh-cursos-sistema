import type { Meta, StoryObj } from "@storybook/nextjs";
import { useState } from "react";

import { FormField, MantineFormFieldSelect, MantineFormFieldText } from "./form-field";
import { Input } from "./input";

/**
 * `FormField` é um wrapper acessível por render-prop: gera `id`, associa
 * `label`, `hint` e mensagens de erro via `aria-describedby`/`aria-invalid`.
 * Os wrappers `MantineFormField*` aplicam o mesmo contrato sobre componentes
 * Mantine prontos para os formulários administrativos.
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

function MantineExample() {
  const [name, setName] = useState("");
  const [modality, setModality] = useState("online");
  return (
    <div style={{ maxWidth: 360, display: "grid", gap: 16 }}>
      <MantineFormFieldText label="Nome completo" value={name} onChange={setName} required />
      <MantineFormFieldSelect
        label="Modalidade"
        value={modality}
        onChange={(value) => setModality(value ?? "")}
        options={[
          { value: "online", label: "Ao vivo online" },
          { value: "presencial", label: "Presencial" },
        ]}
      />
    </div>
  );
}

export const MantineFields: Story = { render: () => <MantineExample /> };
