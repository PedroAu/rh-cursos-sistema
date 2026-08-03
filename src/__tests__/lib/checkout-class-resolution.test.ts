import { describe, expect, it } from "vitest";

import {
  getOpenEnrollmentClasses,
  getDisplayableEnrollmentClasses,
  isEnrollmentClassDisplayable,
  isEnrollmentClassOpen,
  isTrainingClassSoldOut,
  resolveDisplayPrice,
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

  it("ignores an open-status class that has no remaining seats", () => {
    const fullClass = { ...openClass, id: "class-full", availableSeats: 0 };

    expect(isEnrollmentClassOpen(fullClass)).toBe(false);
    expect(isTrainingClassSoldOut(fullClass)).toBe(true);
    expect(getOpenEnrollmentClasses([fullClass, openClass], "course-1")).toEqual([openClass]);
  });

  it("keeps sold-out and coming-soon classes visible without making them checkout targets", () => {
    const fullClass = { ...openClass, id: "class-full", availableSeats: 0 };
    const comingSoonClass = { ...openClass, id: "class-soon", status: "Em breve" as const };

    expect(getDisplayableEnrollmentClasses([closedClass, fullClass, comingSoonClass], "course-1")).toEqual([
      fullClass,
      comingSoonClass,
    ]);
    expect(isEnrollmentClassDisplayable(fullClass)).toBe(true);
    expect(isEnrollmentClassDisplayable(comingSoonClass)).toBe(true);
    expect(isEnrollmentClassOpen(fullClass)).toBe(false);
    expect(isEnrollmentClassOpen(comingSoonClass)).toBe(false);
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

describe("resolveDisplayPrice", () => {
  it("prefers a positive class price over the course price", () => {
    expect(resolveDisplayPrice(1500, 1000)).toBe(1500);
  });

  it("falls back to the course price when the class price is 0", () => {
    expect(resolveDisplayPrice(0, 1000)).toBe(1000);
  });

  it("falls back to the course price when the class price is undefined", () => {
    expect(resolveDisplayPrice(undefined, 1000)).toBe(1000);
  });

  it("returns null (Sob consulta) when both class and course price are 0", () => {
    expect(resolveDisplayPrice(0, 0)).toBeNull();
  });

  it("returns null (Sob consulta) when class price is undefined and course price is 0", () => {
    expect(resolveDisplayPrice(undefined, 0)).toBeNull();
  });
});
