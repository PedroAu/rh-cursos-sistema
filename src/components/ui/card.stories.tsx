import type { Meta, StoryObj } from "@storybook/nextjs";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";
import { Button } from "./button";

/**
 * `Card` é o contêiner base de superfícies. Combine os subcomponentes
 * (`CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`)
 * para manter espaçamento e hierarquia consistentes. Use `interactive` apenas
 * quando o card inteiro for clicável (e garanta um foco/role adequado).
 */
const meta = {
  title: "UI/Card",
  component: Card,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "inline-radio", options: ["base", "elevated", "outlined", "filled"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    accent: { control: "inline-radio", options: ["none", "top"] },
  },
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

const Body = () => (
  <>
    <CardHeader>
      <CardTitle>eSocial Prático</CardTitle>
      <CardDescription>Operação prática de eventos do eSocial.</CardDescription>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground">
        16h de carga horária, turmas ao vivo online com casos reais.
      </p>
    </CardContent>
    <CardFooter>
      <Button size="sm">Ver detalhes</Button>
    </CardFooter>
  </>
);

export const Base: Story = { args: { variant: "base", children: <Body /> } };
export const Elevated: Story = { args: { variant: "elevated", children: <Body /> } };
export const Outlined: Story = { args: { variant: "outlined", children: <Body /> } };
export const Filled: Story = { args: { variant: "filled", children: <Body /> } };
export const WithTopAccent: Story = { args: { accent: "top", variant: "elevated", children: <Body /> } };
