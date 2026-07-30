import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { Checkbox } from "./checkbox";

/**
 * `Checkbox` acessível com estados marcado, indeterminado e desabilitado.
 * Sempre forneça `aria-label` (ou um texto associado) — o controle visual é
 * desenhado sobre um `<input>` nativo oculto.
 */
const meta = {
  title: "UI/Checkbox",
  component: Checkbox,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Checkbox>;

export default meta;

type Story = StoryObj<typeof meta>;

function ControlledCheckbox() {
  const [checked, setChecked] = useState(true);
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <Checkbox checked={checked} onCheckedChange={setChecked} aria-label="Aceitar termos" />
      <span className="text-sm">Aceito os termos de uso</span>
    </label>
  );
}

export const Checked: Story = { args: { checked: true, "aria-label": "Selecionado" } };
export const Unchecked: Story = { args: { checked: false, "aria-label": "Não selecionado" } };
export const Indeterminate: Story = { args: { indeterminate: true, "aria-label": "Parcial" } };
export const Disabled: Story = { args: { checked: true, disabled: true, "aria-label": "Bloqueado" } };
export const Interactive: Story = { render: () => <ControlledCheckbox /> };
