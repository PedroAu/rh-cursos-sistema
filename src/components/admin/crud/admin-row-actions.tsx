"use client";

import { Eye, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

type AdminRowActionsProps = {
  entityLabel: string;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function AdminRowActions({
  entityLabel,
  onView,
  onEdit,
  onDelete,
}: AdminRowActionsProps) {
  return (
    <div className="flex flex-nowrap justify-end gap-1">
      <Button
        aria-label={`Visualizar ${entityLabel}`}
        onClick={onView}
        size="icon"
        title={`Visualizar ${entityLabel}`}
        type="button"
        variant="ghost"
      >
        <Eye className="size-4" aria-hidden="true" />
      </Button>
      <Button
        aria-label={`Editar ${entityLabel}`}
        className="text-brand-navy-700 hover:text-brand-navy-800"
        onClick={onEdit}
        size="icon"
        title={`Editar ${entityLabel}`}
        type="button"
        variant="ghost"
      >
        <Pencil className="size-4" aria-hidden="true" />
      </Button>
      <Button
        aria-label={`Excluir ${entityLabel}`}
        className="text-destructive hover:text-destructive"
        onClick={onDelete}
        size="icon"
        title={`Excluir ${entityLabel}`}
        type="button"
        variant="ghost"
      >
        <Trash2 className="size-4" aria-hidden="true" />
      </Button>
    </div>
  );
}
