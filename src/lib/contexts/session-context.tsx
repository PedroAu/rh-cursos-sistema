"use client";

import { createContext, useContext } from "react";

import type { CurrentSession } from "@/types";

/**
 * Domínio de sessão: autenticação, sessão do usuário e preferências.
 * Isolado para que consumidores de sessão não re-renderizem quando dados de
 * catálogo, alunos ou admin mudam.
 */
export type SessionStoreValue = {
  currentSession: CurrentSession | null;
  setSession: (session: CurrentSession) => void;
  logout: () => void;
};

export const SessionStoreContext = createContext<SessionStoreValue | null>(null);

export function useSessionStore() {
  const context = useContext(SessionStoreContext);

  if (!context) {
    throw new Error("useSessionStore must be used within AppStoreProvider");
  }

  return context;
}
