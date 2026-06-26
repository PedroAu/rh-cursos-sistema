"use client";

import type { ReactNode } from "react";
import { MantineProvider } from "@mantine/core";

import { mantineTheme } from "@/theme/mantine-theme";

export function AppMantineProvider({ children }: { children: ReactNode }) {
  return <MantineProvider theme={mantineTheme} defaultColorScheme="light">{children}</MantineProvider>;
}
