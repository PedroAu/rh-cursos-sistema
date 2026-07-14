import { describe, expect, it } from "vitest";

import {
  publicTestBaselineClasses,
  publicTestBaselineCourses,
  publicTestBaselineTrainingPaths
} from "@/lib/public-test-baseline";

describe("public test baseline", () => {
  it("keeps an eligible catalog course without inventing an open class", () => {
    const courseWithoutClass = publicTestBaselineCourses.find(
      (course) => course.id === "course-public-gestao-contratos-1"
    );

    expect(courseWithoutClass).toMatchObject({
      status: "Ativo",
      nextClassId: ""
    });
    expect(
      publicTestBaselineClasses.some((trainingClass) => trainingClass.courseId === courseWithoutClass?.id)
    ).toBe(false);
  });

  it("keeps path course counts synchronized with the catalog fixture", () => {
    for (const path of publicTestBaselineTrainingPaths) {
      expect(path.courseCount).toBe(
        publicTestBaselineCourses.filter((course) => course.pathId === path.id).length
      );
    }
  });
});
