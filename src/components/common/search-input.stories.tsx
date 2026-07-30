import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { SearchInput } from "./search-input";

/**
 * `SearchInput` é um campo de busca com ícone, estado de carregamento e botão
 * de limpar. Envolto em `role="search"`; passe `resultsLabel` para anunciar a
 * contagem de resultados a leitores de tela.
 */
const meta = {
  title: "Common/SearchInput",
  component: SearchInput,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
} satisfies Meta<typeof SearchInput>;

export default meta;

type Story = StoryObj<typeof meta>;

function Controlled({ loading = false }: { loading?: boolean }) {
  const [value, setValue] = useState("eSocial");
  return (
    <div style={{ maxWidth: 420 }}>
      <SearchInput
        aria-label="Buscar cursos"
        placeholder="Buscar cursos..."
        value={value}
        loading={loading}
        onChange={(event) => setValue(event.target.value)}
        onClear={() => setValue("")}
        resultsLabel={value ? `3 resultados para "${value}"` : undefined}
      />
    </div>
  );
}

export const Default: Story = { render: () => <Controlled /> };
export const Loading: Story = { render: () => <Controlled loading /> };
export const Empty: Story = {
  render: () => (
    <div style={{ maxWidth: 420 }}>
      <SearchInput aria-label="Buscar cursos" placeholder="Buscar cursos..." value="" />
    </div>
  ),
};
