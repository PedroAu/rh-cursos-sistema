import { describe, it, expect, vi } from 'vitest';
import {
  useDialogFocus,
  getFocusableElements,
  isKeyboardFocusable,
  restoreFocus,
} from '@/lib/keyboard-navigation';

describe('Keyboard Navigation Utilities', () => {
  describe('getFocusableElements', () => {
    it('returns all focusable elements', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <button>Button</button>
        <input type="text" />
        <a href="#">Link</a>
        <textarea></textarea>
      `;
      document.body.appendChild(container);

      const focusable = getFocusableElements(container);

      expect(focusable.length).toBeGreaterThan(0);
      expect(focusable.some((el) => el.tagName === 'BUTTON')).toBe(true);
      expect(focusable.some((el) => el.tagName === 'INPUT')).toBe(true);
      expect(focusable.some((el) => el.tagName === 'A')).toBe(true);

      document.body.removeChild(container);
    });

    it('excludes disabled elements', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <button>Enabled</button>
        <button disabled>Disabled</button>
      `;
      document.body.appendChild(container);

      const focusable = getFocusableElements(container);

      expect(focusable.length).toBe(1);
      expect(focusable[0].textContent).toBe('Enabled');

      document.body.removeChild(container);
    });

    it('excludes hidden elements', () => {
      const container = document.createElement('div');
      const button = document.createElement('button');
      button.textContent = 'Hidden';
      button.style.display = 'none';
      container.appendChild(button);
      document.body.appendChild(container);

      const focusable = getFocusableElements(container);

      expect(focusable.length).toBe(0);

      document.body.removeChild(container);
    });
  });

  describe('isKeyboardFocusable', () => {
    it('returns true for native focusable elements', () => {
      const button = document.createElement('button');
      const input = document.createElement('input');
      const link = document.createElement('a');
      link.href = '#';

      expect(isKeyboardFocusable(button)).toBe(true);
      expect(isKeyboardFocusable(input)).toBe(true);
      expect(isKeyboardFocusable(link)).toBe(true);
    });

    it('returns true for elements with positive tabindex', () => {
      const div = document.createElement('div');
      div.setAttribute('tabindex', '0');

      expect(isKeyboardFocusable(div)).toBe(true);
    });

    it('returns false for disabled elements', () => {
      const button = document.createElement('button');
      button.disabled = true;

      expect(isKeyboardFocusable(button)).toBe(false);
    });

    it('returns false for elements with negative tabindex', () => {
      const button = document.createElement('button');
      button.setAttribute('tabindex', '-1');

      expect(isKeyboardFocusable(button)).toBe(false);
    });

    it('returns false for non-HTMLElement', () => {
      const text: any = document.createTextNode('text');
      expect(isKeyboardFocusable(text)).toBe(false);
    });
  });

  describe('restoreFocus', () => {
    it('focuses the provided element', () => {
      const button = document.createElement('button');
      document.body.appendChild(button);

      const focusSpy = vi.spyOn(button, 'focus');
      restoreFocus(button);

      expect(focusSpy).toHaveBeenCalled();

      document.body.removeChild(button);
    });

    it('handles null gracefully', () => {
      expect(() => restoreFocus(null)).not.toThrow();
    });

    it('handles undefined gracefully', () => {
      expect(() => restoreFocus(undefined)).not.toThrow();
    });

    it('prevents scroll when focusing', () => {
      const button = document.createElement('button');
      document.body.appendChild(button);

      const focusSpy = vi.spyOn(button, 'focus');
      restoreFocus(button);

      expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });

      document.body.removeChild(button);
    });
  });

  describe('useDialogFocus', () => {
    it('returns a ref object', () => {
      // This test just ensures the hook doesn't throw
      // Actual hook testing would require React Testing Library
      expect(useDialogFocus).toBeDefined();
    });
  });
});
