import { describe, expect, it } from "vitest";

import { requiresSupabaseSession } from "@/lib/supabase/middleware";

describe("requiresSupabaseSession", () => {
  it("keeps refreshes for authenticated surfaces and API routes", () => {
    expect(requiresSupabaseSession("/admin")).toBe(true);
    expect(requiresSupabaseSession("/admin/configuracoes")).toBe(true);
    expect(requiresSupabaseSession("/aluno")).toBe(true);
    expect(requiresSupabaseSession("/instrutor/turmas")).toBe(true);
    expect(requiresSupabaseSession("/login")).toBe(true);
    expect(requiresSupabaseSession("/api/auth/session")).toBe(true);
  });

  it("skips refreshes for public marketing and discovery routes", () => {
    expect(requiresSupabaseSession("/")).toBe(false);
    expect(requiresSupabaseSession("/cursos")).toBe(false);
    expect(requiresSupabaseSession("/agenda")).toBe(false);
    expect(requiresSupabaseSession("/blog")).toBe(false);
    expect(requiresSupabaseSession("/contato")).toBe(false);
    expect(requiresSupabaseSession("/sitemap.xml")).toBe(false);
    expect(requiresSupabaseSession("/robots.txt")).toBe(false);
    expect(requiresSupabaseSession("/administrator")).toBe(false);
  });
});
