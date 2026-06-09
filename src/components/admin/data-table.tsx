import type * as React from "react";
import { useState } from "react";

import { Pencil, Trash2, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

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

const PAGE_SIZE = 20;

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
  const [confirmDeleteRow, setConfirmDeleteRow] = useState<T | null>(null);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
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

  const totalPages = Math.max(1, Math.ceil(sortedData.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const pageData = sortedData.slice(pageStart, pageStart + PAGE_SIZE);

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
            variant="ghost"
            size="sm"
            onClick={() => setConfirmDeleteBulk(true)}
            className="bg-red-600 text-white hover:bg-red-700 hover:text-white"
          >
            <Trash2 className="h-4 w-4" />
            Deletar selecionados
          </Button>
        </div>
      )}
      <Table className="min-w-[720px]">
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
          {pageData.map((row) => (
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
                <TableCell className="whitespace-nowrap text-right">
                  <div className="flex justify-end gap-2">
                    {onEdit ? (
                      <Button size="icon" variant="outline" onClick={() => onEdit(row)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    ) : null}
                    {onDelete ? (
                      <Button size="icon" variant="outline" onClick={() => setConfirmDeleteRow(row)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    ) : null}
                  </div>
                </TableCell>
              ) : null}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {pageStart + 1}–{Math.min(pageStart + PAGE_SIZE, sortedData.length)} de {sortedData.length} registros
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              aria-label="Página anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-3">
              {safePage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              aria-label="Próxima página"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <AlertDialog open={confirmDeleteBulk} onOpenChange={setConfirmDeleteBulk}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar itens selecionados?</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que deseja deletar {selectedIds.size} item{selectedIds.size !== 1 ? "ns" : ""}? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete}>
              Deletar
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!confirmDeleteRow} onOpenChange={(open) => { if (!open) setConfirmDeleteRow(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar este item?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmDeleteRow && onDelete) {
                  onDelete(confirmDeleteRow);
                }
                setConfirmDeleteRow(null);
              }}
            >
              Deletar
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
