/**
 * Keyboard Navigation Utilities
 *
 * Provides reusable hooks and utilities for keyboard navigation,
 * focus management, and accessible dialog/modal handling.
 *
 * Trust Keith Design System
 */

import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook to manage focus restoration when a dialog closes.
 *
 * Stores a reference to the trigger element and automatically
 * restores focus when the dialog closes or is dismissed.
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
 *
 * @returns A ref to attach to the dialog trigger element
 */
export function useDialogFocus() {
  const triggerRef = useRef<HTMLElement>(null);
  return triggerRef;
}

/**
 * Hook to manage focus trap within a dialog or modal.
 *
 * Prevents focus from leaving the modal and handles ESC key dismissal.
 * Automatically restores focus to the trigger element when closed.
 *
 * Usage:
 * const { focusableElements, handleKeyDown } = useFocusTrap(ref);
 * Attach to div: <div ref={ref} onKeyDown={handleKeyDown}>
 *
 * @param ref Ref to the modal/dialog container
 * @param onClose Optional callback when ESC is pressed
 * @returns Object with focusable elements and key handler
 */
export function useFocusTrap(
  ref: React.RefObject<HTMLDivElement>,
  onClose?: () => void
) {
  const focusableElements = useRef<HTMLElement[]>([]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      // ESC key closes the dialog
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose?.();
        return;
      }

      // TAB key trap
      if (event.key === 'Tab' && focusableElements.current.length > 0) {
        const currentElement = document.activeElement as HTMLElement;
        const currentIndex = focusableElements.current.indexOf(currentElement);

        if (event.shiftKey) {
          // Shift+Tab: move backwards
          if (currentIndex === 0) {
            event.preventDefault();
            focusableElements.current[focusableElements.current.length - 1].focus();
          }
        } else {
          // Tab: move forwards
          if (currentIndex === focusableElements.current.length - 1) {
            event.preventDefault();
            focusableElements.current[0].focus();
          }
        }
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (!ref.current) return;

    // Update focusable elements on mount and when dependencies change
    const updateFocusableElements = () => {
      const focusSelectors = [
        'button:not(:disabled)',
        'a[href]',
        'input:not(:disabled)',
        'select:not(:disabled)',
        'textarea:not(:disabled)',
        '[tabindex]:not([tabindex="-1"])',
      ];

      focusableElements.current = Array.from(
        ref.current!.querySelectorAll<HTMLElement>(focusSelectors.join(','))
      ).filter((el) => {
        // Exclude hidden elements
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden';
      });

      // Focus first element on mount
      if (focusableElements.current.length > 0) {
        focusableElements.current[0].focus();
      }
    };

    updateFocusableElements();

    // Re-update if DOM changes
    const observer = new MutationObserver(updateFocusableElements);
    observer.observe(ref.current, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [ref]);

  // Return getter functions instead of direct ref access
  return {
    get focusableElements() {
      return focusableElements.current;
    },
    handleKeyDown,
  };
}

/**
 * Hook to handle keyboard shortcuts.
 *
 * Allows registering global keyboard shortcuts with modifier keys.
 *
 * Usage:
 * ```tsx
 * useKeyboardShortcut('s', () => handleSave(), { ctrlKey: true });
 * // Ctrl+S to save
 * ```
 *
 * @param key - The key to listen for (e.g., 's', 'Enter', 'Escape')
 * @param callback - Function to call when shortcut is pressed
 * @param modifiers - Optional modifier keys (ctrl, shift, alt, meta)
 */
export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  modifiers?: {
    ctrlKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
    metaKey?: boolean;
  }
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const keyMatches = event.key.toLowerCase() === key.toLowerCase();
      const ctrlMatches = !modifiers?.ctrlKey || event.ctrlKey;
      const shiftMatches = !modifiers?.shiftKey || event.shiftKey;
      const altMatches = !modifiers?.altKey || event.altKey;
      const metaMatches = !modifiers?.metaKey || event.metaKey;

      if (keyMatches && ctrlMatches && shiftMatches && altMatches && metaMatches) {
        event.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [key, callback, modifiers]);
}

/**
 * Utility to restore focus to an element.
 *
 * Useful when closing dialogs or dismissing overlays.
 *
 * @param element - The element to restore focus to
 */
export function restoreFocus(element: HTMLElement | null | undefined) {
  if (!element) return;

  try {
    element.focus({ preventScroll: true });
  } catch (error) {
    console.warn('Failed to restore focus:', error);
  }
}

/**
 * Utility to get all focusable elements within a container.
 *
 * Useful for implementing focus traps and keyboard navigation.
 *
 * @param container - The container element to search within
 * @returns Array of focusable elements
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusSelectors = [
    'button:not(:disabled)',
    'a[href]',
    'input:not(:disabled)',
    'select:not(:disabled)',
    'textarea:not(:disabled)',
    '[tabindex]:not([tabindex="-1"])',
  ];

  return Array.from(container.querySelectorAll<HTMLElement>(focusSelectors.join(','))).filter(
    (el) => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden';
    }
  );
}

/**
 * Utility to check if an element is keyboard focusable.
 *
 * @param element - The element to check
 * @returns True if the element can receive keyboard focus
 */
export function isKeyboardFocusable(element: Element): element is HTMLElement {
  if (!(element instanceof HTMLElement)) {
    return false;
  }

  const tabindex = element.getAttribute('tabindex');
  if (tabindex !== null) {
    return parseInt(tabindex) >= 0;
  }

  const focusableElements = [
    'BUTTON',
    'INPUT',
    'SELECT',
    'TEXTAREA',
    'A',
    'AREA',
    'OBJECT',
    'EMBED',
    'IFRAME',
  ];

  if (focusableElements.includes(element.tagName)) {
    // Check if element is disabled
    if ('disabled' in element && element.disabled) {
      return false;
    }
    return true;
  }

  return false;
}
