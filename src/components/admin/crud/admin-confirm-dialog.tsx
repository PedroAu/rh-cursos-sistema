"use client";

import type { ComponentProps } from "react";

import { ShadcnAdminConfirmDialog } from "@/components/shadcn/admin/confirm-dialog";

type AdminConfirmDialogProps = ComponentProps<typeof ShadcnAdminConfirmDialog>;

export function AdminConfirmDialog(props: AdminConfirmDialogProps) {
  return <ShadcnAdminConfirmDialog {...props} />;
}
