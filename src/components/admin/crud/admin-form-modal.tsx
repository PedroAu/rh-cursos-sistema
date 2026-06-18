"use client";

import type { ComponentProps } from "react";

import {
  ShadcnAdminFormModal,
  type ShadcnAdminFormMode,
} from "@/components/shadcn/admin/form-modal";

export type AdminFormMode = ShadcnAdminFormMode;

type AdminFormModalProps = ComponentProps<typeof ShadcnAdminFormModal>;

export function AdminFormModal(props: AdminFormModalProps) {
  return <ShadcnAdminFormModal {...props} />;
}
