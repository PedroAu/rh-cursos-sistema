import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

/**
 * `Avatar` (Radix) exibe a foto de uma pessoa com fallback de iniciais quando
 * a imagem não carrega. Sempre forneça `alt` descritivo na `AvatarImage`.
 */
const meta = {
  title: "UI/Avatar",
  component: Avatar,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Avatar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithFallback: Story = {
  render: () => (
    <Avatar className="h-14 w-14">
      <AvatarFallback className="font-display">AL</AvatarFallback>
    </Avatar>
  ),
};

export const WithImage: Story = {
  render: () => (
    <Avatar className="h-14 w-14">
      <AvatarImage src="https://i.pravatar.cc/96?img=47" alt="Ana Lima" />
      <AvatarFallback>AL</AvatarFallback>
    </Avatar>
  ),
};
