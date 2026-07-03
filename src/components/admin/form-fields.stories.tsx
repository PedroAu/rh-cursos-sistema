import type { Meta, StoryObj } from "@storybook/nextjs";
import { useState } from "react";

import { ArrayInput, ModulesBuilder, MultiSelectField } from "./form-fields";

/**
 * Campos compostos do CRUD administrativo:
 * - `ArrayInput`: listas de strings (objetivos, benefícios) adicionadas item a item.
 * - `MultiSelectField`: seleção múltipla com popover, checkboxes e chips.
 * - `ModulesBuilder`: editor estruturado de módulos do curso.
 *
 * Todos seguem o contrato controlado `value` + `onChange`.
 */
const meta = {
  title: "Admin/FormFields",
  component: ArrayInput,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  args: { label: "Itens", value: [], onChange: () => undefined },
} satisfies Meta<typeof ArrayInput>;

export default meta;

type Story = StoryObj<typeof meta>;

function ArrayExample() {
  const [value, setValue] = useState<string[]>(["Validar eventos periódicos", "Reduzir inconsistências"]);
  return (
    <div style={{ maxWidth: 420 }}>
      <ArrayInput label="Objetivos do curso" value={value} onChange={setValue} />
    </div>
  );
}

function MultiSelectExample() {
  const [value, setValue] = useState<string[]>(["dp"]);
  return (
    <div style={{ maxWidth: 420 }}>
      <MultiSelectField
        label="Trilhas relacionadas"
        value={value}
        onChange={setValue}
        options={[
          { value: "dp", label: "Departamento Pessoal" },
          { value: "esocial", label: "eSocial" },
          { value: "gestao", label: "Gestão Pública" },
        ]}
      />
    </div>
  );
}

function ModulesExample() {
  const [value, setValue] = useState([
    { title: "Eventos periódicos", description: "Conferência de remuneração.", topics: ["S-1200"], duration: "8h" },
  ]);
  return (
    <div style={{ maxWidth: 560 }}>
      <ModulesBuilder label="Módulos" value={value} onChange={setValue} />
    </div>
  );
}

export const ArrayList: Story = { render: () => <ArrayExample /> };
export const MultiSelect: Story = { render: () => <MultiSelectExample /> };
export const Modules: Story = { render: () => <ModulesExample /> };
