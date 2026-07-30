import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";
import { StatusBadge } from "@/components/common/status-badge";

/**
 * Primitivos de `Table` para listagens administrativas. Sempre use
 * `TableHeader`/`TableHead` para os cabeçalhos — isso garante a associação
 * semântica de células com colunas para tecnologia assistiva.
 */
const meta = {
  title: "UI/Table",
  component: Table,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
} satisfies Meta<typeof Table>;

export default meta;

type Story = StoryObj<typeof meta>;

const rows = [
  { name: "Maria Souza", course: "eSocial Prático", status: "Confirmada" },
  { name: "Pedro Alves", course: "eSocial Prático", status: "Aguardando pagamento" },
  { name: "Julia Rocha", course: "Gestão de DP", status: "Cancelada" },
];

export const Default: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Aluno</TableHead>
          <TableHead>Curso</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.name}>
            <TableCell>{row.name}</TableCell>
            <TableCell>{row.course}</TableCell>
            <TableCell>
              <StatusBadge status={row.status} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};
