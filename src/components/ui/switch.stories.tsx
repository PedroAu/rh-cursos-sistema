import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { Switch } from "./switch";

/**
 * `Switch` com `role="switch"`. O estado é exposto por `aria-checked` (não só
 * cor). Associe um rótulo via `aria-labelledby` apontando para um texto visível.
 */
const meta = {
  title: "UI/Switch",
  component: Switch,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: { checked: true, onCheckedChange: () => undefined },
} satisfies Meta<typeof Switch>;

export default meta;

type Story = StoryObj<typeof meta>;

function ControlledSwitch({ disabled = false }: { disabled?: boolean }) {
  const [checked, setChecked] = useState(true);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
      <span id="notif-label" className="text-sm font-medium">
        Notificar novas inscrições
      </span>
      <Switch
        checked={checked}
        onCheckedChange={setChecked}
        disabled={disabled}
        aria-labelledby="notif-label"
      />
    </span>
  );
}

export const On: Story = { render: () => <ControlledSwitch /> };
export const Disabled: Story = { render: () => <ControlledSwitch disabled /> };
