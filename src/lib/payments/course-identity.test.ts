import { resolveCourseForPayment } from "@/lib/payments/course-identity";

function buildSupabaseMock(options: {
  courseRow?: { id: string; preco: number } | null;
  courseError?: unknown;
}) {
  const maybeSingle = vi.fn().mockResolvedValue({
    data: options.courseRow ?? null,
    error: options.courseError ?? null,
  });
  const eq = vi.fn(() => ({ maybeSingle }));
  const select = vi.fn(() => ({ eq }));
  const from = vi.fn((table: string) => {
    if (table !== "courses") {
      throw new Error(`Unexpected table: ${table}`);
    }

    return { select };
  });

  return { from, select, eq, maybeSingle };
}

describe("resolveCourseForPayment", () => {
  it("resolves a public course slug to the canonical courses.id and preco", async () => {
    const supabase = buildSupabaseMock({
      courseRow: { id: "11111111-1111-1111-1111-111111111111", preco: 199.9 },
    });

    await expect(
      resolveCourseForPayment(supabase as never, { courseSlug: "curso-exemplo" }),
    ).resolves.toEqual({
      id: "11111111-1111-1111-1111-111111111111",
      preco: 199.9,
    });

    expect(supabase.from).toHaveBeenCalledWith("courses");
    expect(supabase.select).toHaveBeenCalledWith("id,preco");
    expect(supabase.eq).toHaveBeenCalledWith("slug", "curso-exemplo");
  });

  it("accepts a valid direct courses.id when a canonical row exists", async () => {
    const courseId = "22222222-2222-2222-2222-222222222222";
    const supabase = buildSupabaseMock({
      courseRow: { id: courseId, preco: 49.99 },
    });

    await expect(resolveCourseForPayment(supabase as never, { courseId })).resolves.toEqual({
      id: courseId,
      preco: 49.99,
    });

    expect(supabase.eq).toHaveBeenCalledWith("id", courseId);
  });

  it("rejects a legacy curso.id when it is not a real courses.id", async () => {
    const supabase = buildSupabaseMock({ courseRow: null });

    await expect(
      resolveCourseForPayment(supabase as never, { courseId: "curso-legado-123" }),
    ).rejects.toThrow(/não corresponde a courses\.id/i);

    expect(supabase.eq).toHaveBeenCalledWith("id", "curso-legado-123");
  });

  it("rejects missing course identity with a controlled error", async () => {
    const supabase = buildSupabaseMock({ courseRow: null });

    await expect(resolveCourseForPayment(supabase as never, {})).rejects.toThrow(
      /forneça um courseSlug válido ou um courses\.id válido/i,
    );

    expect(supabase.from).not.toHaveBeenCalled();
  });
});
