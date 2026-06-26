import type { Meta, StoryObj } from "@storybook/nextjs";
import { ArrowRight } from "lucide-react";

import { Button } from "./button";

const meta = {
  title: "UI/Button",
  component: Button,
  parameters: {
    layout: "centered"
  },
  tags: ["autodocs"],
  args: {
    children: "Enviar"
  }
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const WithIcon: Story = {
  args: {
    children: (
      <>
        Continuar
        <ArrowRight aria-hidden="true" />
      </>
    )
  }
};
