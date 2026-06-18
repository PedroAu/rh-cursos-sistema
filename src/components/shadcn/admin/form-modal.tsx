"use client";

import type { ReactNode } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type ShadcnAdminFormMode = "create" | "edit" | "view";

type ShadcnAdminFormModalProps = {
  opened: boolean;
  onClose: () => void;
  mode: ShadcnAdminFormMode;
  title: string;
  description?: string;
  children: ReactNode;
};

const modeLabel: Record<ShadcnAdminFormMode, string> = {
  create: "Novo registro",
  edit: "Editar registro",
  view: "Visualização",
};

export function ShadcnAdminFormModal({
  opened,
  onClose,
  mode,
  title,
  description,
  children,
}: ShadcnAdminFormModalProps) {
  return (
    <Dialog open={opened} onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <DialogContent aria-describedby={description ? undefined : `${title}-description`}>
        <DialogHeader>
          <p className="text-xs font-bold uppercase tracking-normal text-primary">{modeLabel[mode]}</p>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : (
            <DialogDescription className="sr-only" id={`${title}-description`}>
              Formulário administrativo em modo {modeLabel[mode]}.
            </DialogDescription>
          )}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
