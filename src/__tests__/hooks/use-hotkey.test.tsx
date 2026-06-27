import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useHotkey } from '@/hooks/use-hotkey';

function dispatchKey(init: KeyboardEventInit) {
  window.dispatchEvent(new KeyboardEvent('keydown', init));
}

describe('useHotkey', () => {
  it('calls the handler when the matcher returns true', () => {
    const handler = vi.fn();
    renderHook(() => useHotkey((e) => e.key === 'k', handler));

    dispatchKey({ key: 'k' });

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('does not call the handler when the matcher returns false', () => {
    const handler = vi.fn();
    renderHook(() => useHotkey((e) => e.key === 'k', handler));

    dispatchKey({ key: 'j' });

    expect(handler).not.toHaveBeenCalled();
  });

  it('passes the keyboard event to the handler', () => {
    const handler = vi.fn();
    renderHook(() => useHotkey((e) => e.metaKey && e.key === 's', handler));

    dispatchKey({ key: 's', metaKey: true });

    expect(handler).toHaveBeenCalledWith(expect.any(KeyboardEvent));
  });

  it('removes the listener on unmount', () => {
    const handler = vi.fn();
    const { unmount } = renderHook(() => useHotkey(() => true, handler));

    unmount();
    dispatchKey({ key: 'k' });

    expect(handler).not.toHaveBeenCalled();
  });
});
