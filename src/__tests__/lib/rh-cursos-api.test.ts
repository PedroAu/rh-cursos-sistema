import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  fetchCourseCategories,
  fetchLeadsWithClient,
  fetchPublicTestimonialsWithClient,
  isExplicitPublicTestBaselineEnabled,
  isPublicTestBaselineBuildEnabled,
  isServerPublicTestBaselineEnabled,
  PUBLIC_TEST_BASELINE_STORAGE_KEY,
  selectCatalogRowsForVisibility,
} from "@/lib/supabase/rh-cursos-api";

beforeEach(() => {
  const values = new Map<string, string>();
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: {
      clear: vi.fn(() => values.clear()),
      getItem: vi.fn((key: string) => values.get(key) ?? null),
      removeItem: vi.fn((key: string) => values.delete(key)),
      setItem: vi.fn((key: string, value: string) => values.set(key, value)),
    },
  });
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("explicit public test baseline", () => {
  it("requires both the Playwright build flag and browser opt-in", () => {
    vi.stubEnv("NEXT_PUBLIC_PLAYWRIGHT_TEST_BASELINE", "1");

    expect(isExplicitPublicTestBaselineEnabled()).toBe(false);

    window.localStorage.setItem(PUBLIC_TEST_BASELINE_STORAGE_KEY, "1");

    expect(isExplicitPublicTestBaselineEnabled()).toBe(true);
  });

  it("cannot be enabled by browser storage in a normal production build", () => {
    vi.stubEnv("NEXT_PUBLIC_PLAYWRIGHT_TEST_BASELINE", "0");
    window.localStorage.setItem(PUBLIC_TEST_BASELINE_STORAGE_KEY, "1");

    expect(isExplicitPublicTestBaselineEnabled()).toBe(false);
  });

  it("requires the dedicated Playwright build and request cookie for SSR", () => {
    vi.stubEnv("NEXT_PUBLIC_PLAYWRIGHT_TEST_BASELINE", "1");
    vi.stubEnv("PLAYWRIGHT_TEST_BUILD", "1");

    expect(isPublicTestBaselineBuildEnabled()).toBe(true);
    expect(isServerPublicTestBaselineEnabled(undefined)).toBe(false);
    expect(isServerPublicTestBaselineEnabled("1")).toBe(true);

    vi.stubEnv("PLAYWRIGHT_TEST_BUILD", "0");
    expect(isPublicTestBaselineBuildEnabled()).toBe(false);
    expect(isServerPublicTestBaselineEnabled("1")).toBe(false);
  });
});

function buildClient(data: Array<{ categoria: string | null }>, error: unknown = null) {
  const order = vi.fn(async () => ({ data, error }));
  const not = vi.fn(() => ({ order }));
  const is = vi.fn(() => ({ not }));
  const select = vi.fn(() => ({ is }));
  const from = vi.fn(() => ({ select }));
  const client = { from } as unknown as Parameters<typeof fetchCourseCategories>[0];

  return { client, from, select, is, not, order };
}

describe("fetchCourseCategories", () => {
  it("dedupes and sorts distinct categories, excluding nulls", async () => {
    const { client } = buildClient([
      { categoria: "Recursos Humanos" },
      { categoria: "Compliance" },
      { categoria: "Recursos Humanos" },
      { categoria: null },
      { categoria: "Auditoria" }
    ]);

    const result = await fetchCourseCategories(client);

    expect(result).toEqual(["Auditoria", "Compliance", "Recursos Humanos"]);
  });

  it("returns an empty list when there are no categories", async () => {
    const { client } = buildClient([]);

    const result = await fetchCourseCategories(client);

    expect(result).toEqual([]);
  });

  it("queries the curso table filtering out null categories, ordered", async () => {
    const { client, from, select, is, not, order } = buildClient([{ categoria: "Compliance" }]);

    await fetchCourseCategories(client);

    expect(from).toHaveBeenCalledWith("curso");
    expect(select).toHaveBeenCalledWith("categoria");
    expect(is).toHaveBeenCalledWith("deleted_at", null);
    expect(not).toHaveBeenCalledWith("categoria", "is", null);
    expect(order).toHaveBeenCalledWith("categoria");
  });

  it("throws when the query returns an error", async () => {
    const queryError = new Error("boom");
    const { client } = buildClient([], queryError);

    await expect(fetchCourseCategories(client)).rejects.toThrow("boom");
  });
});

describe("catalog visibility", () => {
  const rows = {
    courses: [
      { id: "course-public", status: "Ativo", categoria: "Público" },
      { id: "course-draft", status: "Rascunho", categoria: "Interno" },
    ],
    instructors: [
      { id: "instructor-active", status: "Ativo" },
      { id: "instructor-inactive", status: "Inativo" },
    ],
    classes: [
      { id: "class-public", curso_id: "course-public", instrutor_id: "instructor-active" },
      { id: "class-draft", curso_id: "course-draft", instrutor_id: "instructor-active" },
      { id: "class-inactive", curso_id: "course-public", instrutor_id: "instructor-inactive" },
      { id: "class-no-instructor", curso_id: "course-public", instrutor_id: null },
    ],
    courseInstructors: [
      { id: "relation-public", curso_id: "course-public", instrutor_id: "instructor-active" },
      { id: "relation-draft", curso_id: "course-draft", instrutor_id: "instructor-active" },
      { id: "relation-inactive", curso_id: "course-public", instrutor_id: "instructor-inactive" },
    ],
    coursePublicContents: [
      { id: "content-public", curso_id: "course-public", published: true },
      { id: "content-draft-course", curso_id: "course-draft", published: true },
      { id: "content-unpublished", curso_id: "course-public", published: false },
    ],
  } as unknown as Parameters<typeof selectCatalogRowsForVisibility>[0];

  it("reproduces public course, class, instructor and content RLS relationships", () => {
    const selected = selectCatalogRowsForVisibility(rows, "public");

    expect(selected.courses.map(({ id }) => id)).toEqual(["course-public"]);
    expect(selected.instructors.map(({ id }) => id)).toEqual(["instructor-active"]);
    expect(selected.classes.map(({ id }) => id)).toEqual(["class-public", "class-no-instructor"]);
    expect(selected.courseInstructors.map(({ id }) => id)).toEqual(["relation-public"]);
    expect(selected.coursePublicContents.map(({ id }) => id)).toEqual(["content-public"]);
  });

  it("preserves draft courses and inactive instructors in the admin read model", () => {
    const selected = selectCatalogRowsForVisibility(rows, "admin");

    expect(selected).toBe(rows);
    expect(selected.courses).toHaveLength(2);
    expect(selected.instructors).toHaveLength(2);
  });
});

describe("public testimonials", () => {
  it("filters soft-deleted assessments explicitly before publication filters", async () => {
    const order = vi.fn(async () => ({ data: [], error: null }));
    const not = vi.fn(() => ({ order }));
    const eq = vi.fn(() => ({ not }));
    const is = vi.fn(() => ({ eq }));
    const select = vi.fn(() => ({ is }));
    const from = vi.fn(() => ({ select }));
    const client = { from } as unknown as Parameters<typeof fetchPublicTestimonialsWithClient>[0];

    await fetchPublicTestimonialsWithClient(client);

    expect(from).toHaveBeenCalledWith("avaliacao");
    expect(is).toHaveBeenCalledWith("deleted_at", null);
    expect(eq).toHaveBeenCalledWith("publicar", true);
    expect(not).toHaveBeenCalledWith("comentario", "is", null);
  });
});

describe("admin leads", () => {
  it("filters soft-deleted leads explicitly before ordering", async () => {
    const order = vi.fn(async () => ({ data: [], error: null }));
    const is = vi.fn(() => ({ order }));
    const select = vi.fn(() => ({ is }));
    const from = vi.fn(() => ({ select }));
    const client = { from } as unknown as Parameters<typeof fetchLeadsWithClient>[0];

    await fetchLeadsWithClient(client);

    expect(from).toHaveBeenCalledWith("lead");
    expect(is).toHaveBeenCalledWith("deleted_at", null);
    expect(order).toHaveBeenCalledWith("created_at", { ascending: false });
  });
});
