"use client";

import { useEffect, useId, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type RowSelectionState,
  type SortingState,
} from "@tanstack/react-table";
import { ChevronDown, ChevronUp, ChevronsUpDown, Search, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type ShadcnAdminDataTableColumn = {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
  sortable?: boolean;
};

export type ShadcnAdminDataTableRow = {
  id: string;
  title: ReactNode;
  ariaLabel?: string;
  description?: ReactNode;
  cells: Record<string, ReactNode>;
  searchText?: string;
  sortValues?: Record<string, string | number | null | undefined>;
  actions?: ReactNode;
};

type ShadcnAdminDataTableProps = {
  columns: ShadcnAdminDataTableColumn[];
  rows: ShadcnAdminDataTableRow[];
  emptyLabel: string;
  actionsLabel?: string;
  pageSize?: number;
  pageSizeOptions?: number[];
  searchLabel?: string;
  searchPlaceholder?: string;
  toolbarActions?: ReactNode;
  selectionActions?: ReactNode;
  selection?: {
    selectedIds: string[];
    onSelectionChange: (selectedIds: string[]) => void;
    ariaLabel: string;
  };
  minWidth?: number;
};

function normalize(value: string | number | null | undefined) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function compareValues(first: string | number | null | undefined, second: string | number | null | undefined) {
  if (typeof first === "number" && typeof second === "number") {
    return first - second;
  }

  return normalize(first).localeCompare(normalize(second), "pt-BR", {
    numeric: true,
    sensitivity: "base",
  });
}

function getSortIcon(isSorted: false | "asc" | "desc") {
  if (isSorted === "asc") return <ChevronUp aria-hidden className="size-3.5" />;
  if (isSorted === "desc") return <ChevronDown aria-hidden className="size-3.5" />;
  return <ChevronsUpDown aria-hidden className="size-3.5" />;
}

export function ShadcnAdminDataTable({
  columns,
  rows,
  emptyLabel,
  actionsLabel = "Ações",
  pageSize = 10,
  pageSizeOptions = [6, 10, 15, 25, 50],
  searchLabel = "Buscar na tabela",
  searchPlaceholder = "Buscar registros",
  toolbarActions,
  selectionActions,
  selection,
  minWidth = 880,
}: ShadcnAdminDataTableProps) {
  "use no memo";

  const searchId = useId();
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [density, setDensity] = useState<"compact" | "comfortable">("comfortable");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>(() =>
    Object.fromEntries(selection?.selectedIds.map((id) => [id, true]) ?? []),
  );
  const selectedIdsKey = selection?.selectedIds.join("|") ?? "";
  const filteredRows = useMemo(
    () => rows.filter((row) => normalize(row.searchText).includes(normalize(globalFilter))),
    [globalFilter, rows],
  );

  useEffect(() => {
    if (!selectedIdsKey) {
      setRowSelection({});
      return;
    }
    setRowSelection(Object.fromEntries(selectedIdsKey.split("|").map((id) => [id, true])));
  }, [selectedIdsKey]);

  const tableColumns = useMemo<ColumnDef<ShadcnAdminDataTableRow>[]>(() => {
    const base: ColumnDef<ShadcnAdminDataTableRow>[] = columns.map((column) => ({
      id: column.key,
      accessorFn: (row) => row.sortValues?.[column.key] ?? "",
      header: ({ column: tableColumn }) => {
        const sorted = tableColumn.getIsSorted();
        return column.sortable === false ? (
          <span>{column.label}</span>
        ) : (
          <button
            aria-label={`Ordenar por ${column.label}`}
            className={cn(
              "inline-flex w-full items-center gap-2 text-xs font-bold uppercase tracking-[0.04em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              column.align === "right" && "justify-end",
              column.align === "center" && "justify-center",
            )}
            onClick={tableColumn.getToggleSortingHandler()}
            type="button"
          >
            {column.label}
            <span className={cn(sorted ? "text-primary" : "text-muted-foreground")}>{getSortIcon(sorted)}</span>
          </button>
        );
      },
      cell: ({ row }) => row.original.cells[column.key],
      sortingFn: (first, second) => compareValues(first.original.sortValues?.[column.key], second.original.sortValues?.[column.key]),
      enableSorting: column.sortable !== false,
      meta: { align: column.align },
    }));

    if (selection) {
      base.unshift({
        id: "select",
        header: ({ table }) => (
          <Checkbox
            aria-label={selection.ariaLabel}
            checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(Boolean(value))}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            aria-label={`Selecionar ${row.original.ariaLabel ?? row.original.id}`}
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
          />
        ),
        enableSorting: false,
      });
    }

    base.push({
      id: "actions",
      header: () => <span className="sr-only sm:not-sr-only">{actionsLabel}</span>,
      cell: ({ row }) => <div className="flex justify-end">{row.original.actions}</div>,
      enableSorting: false,
    });

    return base;
  }, [actionsLabel, columns, selection]);

  // TanStack Table retorna funções stateful; o componente fica fora do React Compiler.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: filteredRows,
    columns: tableColumns,
    state: { sorting, rowSelection },
    getRowId: (row) => row.id,
    onSortingChange: setSorting,
    onRowSelectionChange: (updater) => {
      const next = typeof updater === "function" ? updater(rowSelection) : updater;
      setRowSelection(next);
      selection?.onSelectionChange(Object.keys(next).filter((id) => next[id]));
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  });

  const visibleRows = table.getRowModel().rows;
  const selectedCount = Object.values(rowSelection).filter(Boolean).length;
  const compact = density === "compact";

  return (
    <Card className="overflow-hidden rounded-xl">
      <CardContent className="space-y-4 p-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <label className="grid w-full gap-2 sm:max-w-md" htmlFor={searchId}>
            <span className="text-sm font-semibold">{searchLabel}</span>
            <span className="relative">
              <Search aria-hidden className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9 pr-9"
                id={searchId}
                onChange={(event) => {
                  table.setPageIndex(0);
                  setGlobalFilter(event.currentTarget.value);
                }}
                placeholder={searchPlaceholder}
                value={globalFilter ?? ""}
              />
              {globalFilter ? (
                <Button
                  aria-label="Limpar refinamento da tabela"
                  className="absolute right-1 top-1/2 size-8 -translate-y-1/2"
                  onClick={() => {
                    table.setPageIndex(0);
                    setGlobalFilter("");
                  }}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <X className="size-4" aria-hidden="true" />
                </Button>
              ) : null}
            </span>
          </label>
          {toolbarActions ? <div className="flex flex-wrap gap-2">{toolbarActions}</div> : null}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-muted-foreground">
              {filteredRows.length} de {rows.length} registros
            </p>
            {selection ? <Badge variant="secondary">{selectedCount} selecionados</Badge> : null}
            {selection && selectedCount > 0 && selectionActions ? <div className="flex flex-wrap gap-2">{selectionActions}</div> : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-sm border border-input bg-background p-1" role="group" aria-label="Densidade da tabela">
              <Button aria-pressed={compact} onClick={() => setDensity("compact")} size="sm" type="button" variant={compact ? "default" : "ghost"}>
                Compacta
              </Button>
              <Button aria-pressed={!compact} onClick={() => setDensity("comfortable")} size="sm" type="button" variant={!compact ? "default" : "ghost"}>
                Conforto
              </Button>
            </div>
            <Select
              onValueChange={(value) => {
                table.setPageIndex(0);
                table.setPageSize(Number(value));
              }}
              value={String(table.getState().pagination.pageSize)}
            >
              <SelectTrigger aria-label="Quantidade de registros por página" className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option} por página
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>

      <div className="hidden overflow-x-auto sm:block">
        <Table className="min-w-[var(--admin-table-min-width)]" style={{ "--admin-table-min-width": `${minWidth}px` } as CSSProperties}>
          <TableHeader className="sticky top-0 z-10 bg-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    aria-sort={
                      header.column.getCanSort()
                        ? header.column.getIsSorted() === "asc"
                          ? "ascending"
                          : header.column.getIsSorted() === "desc"
                            ? "descending"
                            : "none"
                        : undefined
                    }
                    key={header.id}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {visibleRows.length === 0 ? (
              <TableRow>
                <TableCell className="py-12 text-center text-muted-foreground" colSpan={tableColumns.length}>
                  {emptyLabel}
                </TableCell>
              </TableRow>
            ) : null}
            {visibleRows.map((row) => (
              <TableRow data-state={row.getIsSelected() ? "selected" : undefined} key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell className={cn(compact && "py-2")} key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-3 p-4 sm:hidden">
        {visibleRows.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">{emptyLabel}</p> : null}
        {visibleRows.map((row) => (
          <article className="rounded-lg border border-border bg-muted/40 p-4" key={row.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold">{row.original.title}</h3>
                {row.original.description ? <p className="mt-1 text-sm text-muted-foreground">{row.original.description}</p> : null}
              </div>
              {selection ? (
                <Checkbox
                  aria-label={`Selecionar ${row.original.ariaLabel ?? row.original.id}`}
                  checked={row.getIsSelected()}
                  onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
                />
              ) : null}
            </div>
            <dl className={cn("mt-4 grid gap-3", compact && "gap-2")}>
              {columns.slice(1).map((column) => (
                <div className="flex items-center justify-between gap-4" key={column.key}>
                  <dt className="rounded-sm bg-background px-2 py-1 text-xs font-bold text-muted-foreground">{column.label}</dt>
                  <dd className="text-right text-sm">{row.original.cells[column.key]}</dd>
                </div>
              ))}
            </dl>
            {row.original.actions ? <div className="mt-4 flex justify-end">{row.original.actions}</div> : null}
          </article>
        ))}
      </div>

      {table.getPageCount() > 1 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-muted p-4">
          <p className="text-sm font-medium text-muted-foreground">
            Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
          </p>
          <div className="flex gap-2">
            <Button disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()} type="button" variant="outline">
              Anterior
            </Button>
            <Button disabled={!table.getCanNextPage()} onClick={() => table.nextPage()} type="button" variant="outline">
              Próxima
            </Button>
          </div>
        </div>
      ) : null}
    </Card>
  );
}
