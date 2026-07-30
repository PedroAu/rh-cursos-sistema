import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Chip } from "@/components/ui/chip";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

const meta = {
  title: "Trust Keith/Primitives",
  parameters: { layout: "padded" }
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Buttons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button>Primary -&gt;</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button size="sm">Small</Button>
      <Button size="lg">Large -&gt;</Button>
      <Button loading>Loading</Button>
    </div>
  )
};

export const BadgesAndChips: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Badge tone="accent" dot>Trilha</Badge>
      <Badge tone="neutral">Neutral</Badge>
      <Badge tone="success">Success</Badge>
      <Badge tone="error">Error</Badge>
      <Chip>Presencial</Chip>
      <Chip variant="filter">Filtro</Chip>
      <Chip variant="filter" active>Ativo</Chip>
    </div>
  )
};

export const FormControls: Story = {
  render: () => (
    <div className="grid max-w-md gap-4">
      <Input label="Nome" placeholder="Seu nome" hint="Use o nome completo." />
      <Textarea label="Mensagem" placeholder="Como podemos ajudar?" />
      <Select defaultValue="online">
        <SelectTrigger>
          <SelectValue placeholder="Modalidade" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="online">Online</SelectItem>
          <SelectItem value="presencial">Presencial</SelectItem>
        </SelectContent>
      </Select>
      <div className="flex items-center gap-4">
        <Checkbox aria-label="Aceitar termos" checked />
        <Switch aria-label="Receber novidades" defaultChecked />
      </div>
    </div>
  )
};

export const CardsAndAvatar: Story = {
  render: () => (
    <div className="grid max-w-3xl gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Card padrão</CardTitle>
          <CardDescription>Base com raio 24px e sombra do sistema.</CardDescription>
        </CardHeader>
        <CardContent>Conteúdo do card.</CardContent>
        <CardFooter><Button size="sm">Continuar</Button></CardFooter>
      </Card>
      <Card variant="glass">
        <Avatar size="lg">
          <AvatarFallback>RH</AvatarFallback>
        </Avatar>
      </Card>
    </div>
  )
};
