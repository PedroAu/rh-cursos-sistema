"use client";

import type * as React from "react";
import { useState } from "react";

import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Eye, Pencil, Trash2 } from "lucide-react";

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
  AlertDialogTitle,
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
  onDelete,
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
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const toggleAll = () => {
    if (selectedIds.size === data.length) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(data.map((row) => row.id)));
  };

  const handleBulkDelete = () => {
    selectedIds.forEach((id) => {
      const row = data.find((item) => item.id === id);
      if (row && onDelete) onDelete(row);
    });
    setSelectedIds(new Set());
    setConfirmDeleteBulk(false);
  };

  return (
    <>
      {selectedIds.size > 0 ? (
        <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-[#f2d9b8] bg-[#fff7eb] p-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm font-semibold text-[#9a5b00]">
            {selectedIds.size} item{selectedIds.size !== 1 ? "ns" : ""} selecionado{selectedIds.size !== 1 ? "s" : ""}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConfirmDeleteBulk(true)}
            className="rounded-xl bg-[#c24141] px-4 text-white hover:bg-[#af3434] hover:text-white"
          >
            <Trash2 className="size-4" />
            Excluir selecionados
          </Button>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-[1.2rem] border border-[#d5dae2] bg-white">
        <Table className="min-w-[720px]">
          <TableHeader className="bg-[#f7f8fb]">
            <TableRow className="border-b border-[#dfe3ea] hover:bg-[#f7f8fb]">
              {onDelete ? (
                <TableHead className="w-12 pl-6">
                  <Checkbox
                    checked={sortedData.length > 0 && selectedIds.size === sortedData.length}
                    indeterminate={selectedIds.size > 0 && selectedIds.size < sortedData.length}
                    onCheckedChange={toggleAll}
                    aria-label="Selecionar tudo"
                  />
                </TableHead>
              ) : null}
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className="py-4 text-[0.92rem] font-bold tracking-[0.06em] text-[#414a58]"
                  aria-sort={sortKey === column.key ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
                >
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-md px-1 py-1 text-left transition hover:text-[#0b4668]"
                    onClick={() => handleSort(column.key)}
                  >
                    <span>{column.label}</span>
                    {sortKey === column.key ? (
                      sortDir === "asc" ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />
                    ) : null}
                  </button>
                </TableHead>
              ))}
              {onEdit || onDelete ? (
                <TableHead className="pr-6 text-right text-[0.92rem] font-bold tracking-[0.06em] text-[#414a58]">
                  Ações
                </TableHead>
              ) : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageData.map((row) => (
              <TableRow key={row.id} className="border-b border-[#edf1f5] hover:bg-[#fbfcfd]">
                {onDelete ? (
                  <TableCell className="pl-6">
                    <Checkbox
                      checked={selectedIds.has(row.id)}
                      onCheckedChange={() => toggleRow(row.id)}
                      aria-label={`Selecionar item ${row.id}`}
                    />
                  </TableCell>
                ) : null}
                {columns.map((column) => (
                  <TableCell key={column.key} className="py-5 text-[0.98rem] text-[#111827]">
                    {column.render(row)}
                  </TableCell>
                ))}
                {onEdit || onDelete ? (
                  <TableCell className="pr-6 text-right">
                    <div className="flex justify-end gap-3 text-[#5f6876]">
                      <button type="button" aria-label={`Visualizar item ${row.id}`} className="transition hover:text-[#0b4668]">
                        <Eye className="size-5" />
                      </button>
                      {onEdit ? (
                        <button type="button" aria-label={`Editar item ${row.id}`} className="transition hover:text-[#0b4668]" onClick={() => onEdit(row)}>
                          <Pencil className="size-5" />
                        </button>
                      ) : null}
                      {onDelete ? (
                        <button type="button" aria-label={`Excluir item ${row.id}`} className="transition hover:text-[#c24141]" onClick={() => setConfirmDeleteRow(row)}>
                          <Trash2 className="size-5" />
                        </button>
                      ) : null}
                    </div>
                  </TableCell>
                ) : null}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex flex-col gap-3 text-sm text-[#5f6876] sm:flex-row sm:items-center sm:justify-between">
        <span>
          Mostrando {pageStart + 1}-{Math.min(pageStart + PAGE_SIZE, sortedData.length)} de {sortedData.length} registros
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={safePage === 1}
            aria-label="Página anterior"
            className="flex size-10 items-center justify-center rounded-md border border-[#d5dae2] bg-white text-[#98a2b3] transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft className="size-4" />
          </button>
          {Array.from({ length: Math.min(totalPages, 3) }, (_, index) => {
            const value = index + 1;
            const active = value === safePage;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setPage(value)}
                className={`flex size-10 items-center justify-center rounded-md border text-sm font-semibold transition ${
                  active
                    ? "border-[#0b4668] bg-[#0b4668] text-white"
                    : "border-[#d5dae2] bg-white text-[#344054] hover:border-[#0b4668] hover:text-[#0b4668]"
                }`}
              >
                {value}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={safePage === totalPages}
            aria-label="Próxima página"
            className="flex size-10 items-center justify-center rounded-md border border-[#d5dae2] bg-white text-[#344054] transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <AlertDialog open={confirmDeleteBulk} onOpenChange={setConfirmDeleteBulk}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir itens selecionados?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação remove permanentemente os registros selecionados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-3">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete}>Excluir</AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={Boolean(confirmDeleteRow)} onOpenChange={(open) => !open && setConfirmDeleteRow(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir registro?</AlertDialogTitle>
            <AlertDialogDescription>Essa ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-3">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmDeleteRow && onDelete) onDelete(confirmDeleteRow);
                setConfirmDeleteRow(null);
              }}
            >
              Excluir
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
