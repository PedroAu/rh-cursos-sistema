import { useCallback, useState } from "react";

export interface UseDisclosureHandlers {
  close: () => void;
  open: () => void;
  toggle: () => void;
}

export type UseDisclosureReturnValue = [boolean, UseDisclosureHandlers];

export function useDisclosure(initialState = false): UseDisclosureReturnValue {
  const [opened, setOpened] = useState(initialState);

  const close = useCallback(() => {
    setOpened(false);
  }, []);

  const open = useCallback(() => {
    setOpened(true);
  }, []);

  const toggle = useCallback(() => {
    setOpened((current) => !current);
  }, []);

  return [opened, { close, open, toggle }];
}
