import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { FAQAccordion } from "./faq-accordion";

/**
 * `FAQAccordion` agrupa as perguntas frequentes da home/landing num acordeão de
 * abertura única. O conteúdo é estático; para acordeões genéricos use o
 * primitivo `Accordion`.
 */
const meta = {
  title: "Common/FAQAccordion",
  component: FAQAccordion,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
} satisfies Meta<typeof FAQAccordion>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
