import type { Meta, StoryObj } from "@storybook/nextjs";

import { BlogPostClient } from "./blog-post-client";
import { CourseDetailClient } from "./course-detail-client";
import { mockStoreInitialData } from "@/components/storybook/mock-data";

/**
 * Os *page clients* são os componentes de cliente que cada rota App Router
 * monta, hidratando a store com `initialData` vindo do servidor e delegando à
 * view correspondente. Documentados juntos por compartilharem o mesmo contrato.
 */
const meta = {
  title: "Layout/PageClients",
  component: CourseDetailClient,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
} satisfies Meta<typeof CourseDetailClient>;

export default meta;

type Story = StoryObj<typeof meta>;

export const CourseDetail: Story = {
  render: () => <CourseDetailClient initialData={mockStoreInitialData} />,
};

export const BlogPost: Story = {
  render: () => <BlogPostClient initialData={mockStoreInitialData} />,
};
