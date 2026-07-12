import { describe, expect, it } from "vitest";

import {
  getOpenEnrollmentClasses,
  isEnrollmentClassOpen,
  resolveOpenEnrollmentClassId,
} from "@/lib/enrollment-class-resolution";
import type { TrainingClass } from "@/types";

const buildClass = (id: string, status: TrainingClass["status"], startDate: string): TrainingClass => ({
  id,
  courseId: "course-1",
  startDate,
  endDate: startDate,
  time: "09:00 - 18:00",
  modality: "Ao vivo online",
  location: "Online ao vivo",
  instructorId: "instructor-1",
  totalSeats: 20,
  filledSeats: 0,
  availableSeats: 20,
  status,
  price: 100,
  notes: "",
});

describe("checkout class resolution", () => {
  const closedClass = buildClass("class-closed", "Encerrada", "2026-07-01T09:00:00.000Z");
  const openClass = buildClass("class-open", "Inscrições abertas", "2026-08-01T09:00:00.000Z");

  it("ignores closed classes when preparing the checkout options", () => {
    expect(getOpenEnrollmentClasses([closedClass, openClass], "course-1")).toEqual([openClass]);
    expect(isEnrollmentClassOpen(closedClass)).toBe(false);
  });

  it("replaces a requested closed class with the first open class", () => {
    expect(
      resolveOpenEnrollmentClassId({
        classes: [closedClass, openClass],
        requestedClassId: closedClass.id,
      }),
    ).toBe(openClass.id);
  });

  it("keeps the requested open class", () => {
    expect(
      resolveOpenEnrollmentClassId({
        classes: [closedClass, openClass],
        requestedClassId: openClass.id,
      }),
    ).toBe(openClass.id);
  });
});
