"use client";

import type { ReactNode } from "react";

import { ShadcnAdminDataTable } from "@/components/shadcn/admin";

export type AdminDataTableColumn = {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
  sortable?: boolean;
};

export type AdminDataTableRow = {
  id: string;
  title: ReactNode;
  ariaLabel?: string;
  description?: ReactNode;
  cells: Record<string, ReactNode>;
  searchText?: string;
  sortValues?: Record<string, string | number | null | undefined>;
  actions?: ReactNode;
};

type AdminDataTableProps = {
  columns: AdminDataTableColumn[];
  rows: AdminDataTableRow[];
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

export function AdminDataTable(props: AdminDataTableProps) {
  return <ShadcnAdminDataTable {...props} />;
}

