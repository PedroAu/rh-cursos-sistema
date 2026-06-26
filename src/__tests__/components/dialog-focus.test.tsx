import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { describe, it, expect } from "vitest";

/**
 * Test suite for dialog focus management (AC9: D-2.4)
 *
 * Verifies that when a dialog closes, focus is restored to the trigger element.
 * This is critical for accessibility and keyboard navigation.
 */
describe("Dialog Focus Management (AC9 - D-2.4)", () => {
  function DialogTestComponent() {
    const [open, setOpen] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <button ref={triggerRef} onClick={() => setOpen(true)}>
          Open Dialog
        </button>
        <DialogContent triggerRef={triggerRef} data-testid="dialog-content">
          <DialogHeader>
            <DialogTitle>Test Dialog</DialogTitle>
          </DialogHeader>
          <p>Dialog content</p>
          <DialogClose>Close</DialogClose>
        </DialogContent>
      </Dialog>
    );
  }

  it("should restore focus to trigger when dialog closes via close button", async () => {
    render(<DialogTestComponent />);

    const triggerButton = screen.getByRole("button", { name: /open dialog/i });
    // Open dialog
    fireEvent.click(triggerButton);

    // Dialog should open (verified by close button becoming available)
    const closeButton = screen.getByRole("button", { name: /close/i });

    // Close dialog
    fireEvent.click(closeButton);

    // Focus should be restored to trigger button
    await waitFor(() => {
      expect(triggerButton).toHaveFocus();
    });
  });

  it("should restore focus when dialog closes via escape key", async () => {
    render(<DialogTestComponent />);

    const triggerButton = screen.getByRole("button", { name: /open dialog/i });
    // Open dialog
    fireEvent.click(triggerButton);

    // Dialog should open (verified by close button becoming available)
    const closeButton = screen.getByRole("button", { name: /close/i });

    // Close dialog with Escape key (fire on document since dialog is in portal)
    fireEvent.keyDown(document, { key: "Escape", code: "Escape" });

    // Focus should be restored to trigger button
    await waitFor(() => {
      expect(triggerButton).toHaveFocus();
    });
  });

  it("should support custom initialFocusRef", async () => {
    function DialogWithInitialFocus() {
      const [open, setOpen] = useState(false);
      const triggerRef = useRef<HTMLButtonElement>(null);
      const initialFocusRef = useRef<HTMLInputElement>(null);

      return (
        <Dialog open={open} onOpenChange={setOpen}>
          <button ref={triggerRef} onClick={() => setOpen(true)}>
            Open Dialog
          </button>
          <DialogContent triggerRef={triggerRef} initialFocusRef={initialFocusRef}>
            <DialogHeader>
              <DialogTitle>Test Dialog</DialogTitle>
            </DialogHeader>
            <input ref={initialFocusRef} placeholder="Focus me" data-testid="input" />
            <DialogClose>Close</DialogClose>
          </DialogContent>
        </Dialog>
      );
    }

    render(<DialogWithInitialFocus />);

    const triggerButton = screen.getByRole("button", { name: /open dialog/i });

    // Open dialog first
    fireEvent.click(triggerButton);

    // Now the input inside the dialog portal is rendered
    const input = screen.getByTestId("input");

    // Input should receive focus
    await waitFor(() => {
      expect(input).toHaveFocus();
    });

    // Close dialog
    const closeButton = screen.getByRole("button", { name: /close/i });
    fireEvent.click(closeButton);

    // Focus should be restored to trigger
    await waitFor(() => {
      expect(triggerButton).toHaveFocus();
    });
  });
});
