import { useEffect } from "react";

export function useHotkey(
  matcher: (event: KeyboardEvent) => boolean,
  handler: (event: KeyboardEvent) => void
) {
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (matcher(event)) {
        handler(event);
      }
    };

    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [handler, matcher]);
}
