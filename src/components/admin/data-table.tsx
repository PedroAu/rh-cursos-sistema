import type * as React from "react";
import { useState } from "react";

import { Pencil, Trash2, ChevronUp, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmDeleteBulk, setConfirmDeleteBulk] = useState(false);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortKey) return 0;
    const aVal = a[sortKey as keyof T];
    const bVal = b[sortKey as keyof T];

    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortDir === "asc" ? aVal - bVal : bVal - aVal;
    }
    return 0;
  });

  const toggleRow = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleAll = () => {
    if (selectedIds.size === data.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data.map(row => row.id)));
    }
  };

  const handleBulkDelete = () => {
    selectedIds.forEach(id => {
      const row = data.find(r => r.id === id);
      if (row && onDelete) onDelete(row);
    });
    setSelectedIds(new Set());
    setConfirmDeleteBulk(false);
  };
  return (
    <>
      {selectedIds.size > 0 && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4">
          <span className="text-sm font-medium text-red-800">
            {selectedIds.size} item{selectedIds.size !== 1 ? "ns" : ""} selecionado{selectedIds.size !== 1 ? "s" : ""}
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setConfirmDeleteBulk(true)}
          >
            <Trash2 className="h-4 w-4" />
            Deletar selecionados
          </Button>
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            {onDelete && (
              <TableHead className="w-12">
                <Checkbox
                  checked={sortedData.length > 0 && selectedIds.size === sortedData.length}
                  indeterminate={selectedIds.size > 0 && selectedIds.size < sortedData.length}
                  onCheckedChange={toggleAll}
                  aria-label="Selecionar tudo"
                />
              </TableHead>
            )}
            {columns.map((column) => (
              <TableHead key={column.key} className="cursor-pointer hover:bg-muted" onClick={() => handleSort(column.key)}>
                <div className="flex items-center gap-2">
                  {column.label}
                  {sortKey === column.key && (
                    sortDir === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
            ))}
            {(onEdit || onDelete) ? <TableHead className="text-right">Ações</TableHead> : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((row) => (
            <TableRow key={row.id}>
              {onDelete && (
                <TableCell>
                  <Checkbox
                    checked={selectedIds.has(row.id)}
                    onCheckedChange={() => toggleRow(row.id)}
                    aria-label={`Selecionar item ${row.id}`}
                  />
                </TableCell>
              )}
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

      <AlertDialog open={confirmDeleteBulk} onOpenChange={setConfirmDeleteBulk}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar itens selecionados?</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que deseja deletar {selectedIds.size} item{selectedIds.size !== 1 ? "ns" : ""}? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-3">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} className="bg-red-600 text-white hover:bg-red-700">
              Deletar
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
