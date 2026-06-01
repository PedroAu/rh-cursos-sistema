import type * as React from "react";

import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Column<T> = {
  key: string;
  label: string;
  render: (row: T) => React.ReactNode;
};

export function DataTable<T extends { id: string }>({
  data,
  columns,
  onEdit,
  onDelete
}: {
  data: T[];
  columns: Column<T>[];
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column.key}>{column.label}</TableHead>
          ))}
          {(onEdit || onDelete) ? <TableHead className="text-right">Ações</TableHead> : null}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row) => (
          <TableRow key={row.id}>
            {columns.map((column) => (
              <TableCell key={column.key}>{column.render(row)}</TableCell>
            ))}
            {(onEdit || onDelete) ? (
              <TableCell className="flex justify-end gap-2">
                {onEdit ? (
                  <Button size="icon" variant="outline" onClick={() => onEdit(row)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                ) : null}
                {onDelete ? (
                  <Button size="icon" variant="outline" onClick={() => onDelete(row)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                ) : null}
              </TableCell>
            ) : null}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
