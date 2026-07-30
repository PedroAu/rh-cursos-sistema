import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { BlogCard } from "./blog-card";
import { mockBlogPost } from "@/components/storybook/mock-data";

/**
 * `BlogCard` apresenta um artigo do blog. A variante `featured` aplica o tema
 * escuro (deep navy) para destacar o post principal de uma listagem.
 */
const meta = {
  title: "Domínio/BlogCard",
  component: BlogCard,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  args: { post: mockBlogPost },
} satisfies Meta<typeof BlogCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Featured: Story = { args: { featured: true } };
