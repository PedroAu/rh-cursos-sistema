"use client";

import { createContext, useContext } from "react";

import type { BlogPost, Lead } from "@/types";

import type { LeadPayload } from "./store-types";

/**
 * Domínio administrativo: leads, conteúdo do blog (moderação) e ações globais
 * de manutenção. Consumidores deste contexto re-renderizam apenas quando
 * leads/posts mudam.
 */
export type AdminStoreValue = {
  leads: Lead[];
  blogPosts: BlogPost[];
  createLead: (payload: LeadPayload) => Promise<void>;
  updateLeadStatus: (id: string, status: Lead["status"]) => Promise<void>;
  updateLead: (payload: Partial<Lead> & { id: string }) => Promise<void>;
  upsertBlogPost: (post: Partial<BlogPost>) => Promise<void>;
  deleteBlogPost: (id: string) => Promise<void>;
  resetStore: () => void;
};

export const AdminStoreContext = createContext<AdminStoreValue | null>(null);

export function useAdminStore() {
  const context = useContext(AdminStoreContext);

  if (!context) {
    throw new Error("useAdminStore must be used within AppStoreProvider");
  }

  return context;
}
