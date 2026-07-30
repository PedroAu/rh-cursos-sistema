import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SectionTitle } from "./section-title";

/**
 * `SectionTitle` padroniza cabeçalhos de seção (eyebrow + título + descrição),
 * com animação de entrada que respeita `prefers-reduced-motion`. Use
 * `accentBar` para a barra dourada das páginas de detalhe.
 */
const meta = {
  title: "Common/SectionTitle",
  component: SectionTitle,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  args: {
    eyebrow: "Capacitação",
    title: "Treinamentos práticos para equipes de RH",
    description: "Conteúdo aplicado, instrutores especialistas e turmas ao vivo.",
  },
  argTypes: { align: { control: "inline-radio", options: ["left", "center"] } },
} satisfies Meta<typeof SectionTitle>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Left: Story = {};
export const Centered: Story = { args: { align: "center" } };
export const WithAccentBar: Story = { args: { accentBar: true } };
