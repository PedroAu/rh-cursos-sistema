import React from "react";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

/**
 * Hook to manage focus restoration when a dialog closes.
 * Stores a reference to the trigger element and restores focus on dialog close.
 *
 * Usage:
 * ```tsx
 * const triggerRef = useDialogFocus();
 * <Dialog open={open} onOpenChange={setOpen}>
 *   <DialogTrigger ref={triggerRef} asChild>
 *     <button>Open Dialog</button>
 *   </DialogTrigger>
 *   <DialogContent triggerRef={triggerRef} />
 * </Dialog>
 * ```
 */
export function useDialogFocus() {
  const triggerRef = React.useRef<HTMLElement>(null);
  return triggerRef;
}

export function DialogContent({
  className,
  children,
  initialFocusRef,
  onOpenAutoFocus,
  triggerRef,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  triggerRef?: React.RefObject<HTMLElement | null>;
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-deep-navy/45 backdrop-blur-sm" />
      <DialogPrimitive.Content
        className={cn(
          "fixed left-1/2 top-1/2 z-50 max-h-[calc(100vh-2rem)] w-[min(92vw,760px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border bg-white p-6 shadow-card focus:outline-none",
          className
        )}
        onOpenAutoFocus={(event) => {
          onOpenAutoFocus?.(event);
          if (event.defaultPrevented) return;
          if (initialFocusRef?.current) {
            event.preventDefault();
            initialFocusRef.current.focus();
          }
        }}
        onCloseAutoFocus={(event) => {
          // Only prevent default if we have a trigger to restore focus to
          if (triggerRef?.current) {
            event.preventDefault();
            triggerRef.current.focus();
          }
          // Otherwise let Radix handle default focus restoration
        }}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          aria-label="Fechar"
          className="absolute right-5 top-5 rounded-full p-2 text-muted-foreground hover:bg-muted"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-4 flex flex-col gap-2", className)} {...props} />;
}

export function DialogTitle({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title className={cn("text-xl font-semibold", className)} {...props} />;
}

export function DialogDescription({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn("text-sm leading-6 text-muted-foreground", className)}
      {...props}
    />
  );
}

export function DialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-3 sm:flex-row sm:justify-end", className)} {...props} />;
}
