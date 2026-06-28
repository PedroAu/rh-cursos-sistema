import type { Meta, StoryObj } from "@storybook/nextjs";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

/**
 * `Select` (Radix) para escolha única. Componha `SelectTrigger` + `SelectValue`
 * (placeholder), `SelectContent` e `SelectItem`. Para formulários administrativos
 * com integração Mantine, prefira `MantineFormFieldSelect`.
 */
const meta = {
  title: "UI/Select",
  component: Select,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Select>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div style={{ width: 280 }}>
      <Select>
        <SelectTrigger aria-label="Modalidade">
          <SelectValue placeholder="Selecione a modalidade" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="online">Ao vivo online</SelectItem>
          <SelectItem value="presencial">Presencial</SelectItem>
          <SelectItem value="in-company">In company</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};

export const WithDefault: Story = {
  render: () => (
    <div style={{ width: 280 }}>
      <Select defaultValue="online">
        <SelectTrigger aria-label="Modalidade">
          <SelectValue placeholder="Selecione a modalidade" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="online">Ao vivo online</SelectItem>
          <SelectItem value="presencial">Presencial</SelectItem>
          <SelectItem value="in-company">In company</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};
