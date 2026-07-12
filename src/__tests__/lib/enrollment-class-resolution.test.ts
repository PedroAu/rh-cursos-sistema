import { describe, expect, it } from "vitest";

import {
  isEnrollmentClassOpen,
  resolveEnrollmentClassIdOrThrow,
} from "../../../supabase/functions/_shared/enrollment-class-resolution";

describe("resolveEnrollmentClassIdOrThrow", () => {
  it("prefers the direct class when it is open", () => {
    expect(
      resolveEnrollmentClassIdOrThrow({
        directClass: { id: "class-direct", status: "Aberta" },
        courseClasses: [{ id: "class-course", status: "Aberta" }],
      })
    ).toBe("class-direct");
  });

  it("falls back to an open course class when the direct class is closed", () => {
    expect(
      resolveEnrollmentClassIdOrThrow({
        directClass: { id: "class-direct", status: "Encerrada" },
        courseClasses: [{ id: "class-course", status: "Aberta" }],
      })
    ).toBe("class-course");
  });

  it("throws when no open class exists for the course", () => {
    expect(() =>
      resolveEnrollmentClassIdOrThrow({
        directClass: { id: "class-direct", status: "Encerrada" },
        courseClasses: [],
      })
    ).toThrow("Nenhuma turma aberta para este curso.");
  });

  it("does not treat a class that is not open as an enrollment target", () => {
    expect(isEnrollmentClassOpen({ status: "EmBreve" })).toBe(false);
    expect(isEnrollmentClassOpen({ status: "Cancelada" })).toBe(false);
  });
});
