import type * as React from "react";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

export const Select = SelectPrimitive.Root;
export const SelectValue = SelectPrimitive.Value;

export function SelectTrigger({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        "group flex h-[var(--form-input-height)] w-full items-center justify-between rounded-[var(--form-input-radius)] border border-[var(--form-input-border)] bg-[var(--form-input-bg)] px-[var(--form-input-padding-inline)] text-[var(--form-input-font-size)] shadow-sm outline-none transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--form-input-border-hover)] hover:shadow-soft focus:border-[var(--form-input-border-focus)] focus:ring-[var(--form-input-focus-ring)] focus:ring-[var(--form-input-focus-ring-color)] data-[state=open]:-translate-y-0.5 data-[state=open]:border-[var(--form-input-border-focus)] data-[state=open]:shadow-soft data-[state=open]:ring-[var(--form-input-focus-ring)] data-[state=open]:ring-[var(--form-input-focus-ring-color)]",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon>
        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

export function SelectContent({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        className={cn(
          "z-50 overflow-hidden rounded-[var(--mantine-radius-lg)] border border-[var(--form-input-border)] bg-[var(--form-input-bg)] shadow-md backdrop-blur-sm data-[state=open]:animate-[selectContentIn_160ms_ease-out]",
          className
        )}
        {...props}
      >
        <SelectPrimitive.Viewport className="p-2">{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

export function SelectItem({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      className={cn(
        "relative flex cursor-pointer items-center rounded-[var(--mantine-radius-sm)] py-3 pl-9 pr-3 text-sm outline-none transition-colors duration-150 data-[highlighted]:bg-primary-1 data-[highlighted]:text-primary-7",
        className
      )}
      {...props}
    >
      <span className="absolute left-3 flex h-3.5 w-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="h-4 w-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}
