import { AdminResourceError } from "./admin-resource-errors.ts";

type EnrollmentClassRef = {
  id: string;
  status: string;
};

export function isEnrollmentClassOpen(classRef: Pick<EnrollmentClassRef, "status">): boolean {
  return classRef.status === "Aberta" || classRef.status === "PoucasVagas";
}

export function resolveEnrollmentClassIdOrThrow({
  directClass,
  courseClasses,
}: {
  directClass: EnrollmentClassRef | null;
  courseClasses: EnrollmentClassRef[];
}): string {
  if (directClass?.id && isEnrollmentClassOpen(directClass)) {
    return directClass.id;
  }

  const existingClassId = courseClasses[0]?.id;
  if (existingClassId) {
    return existingClassId;
  }

  throw new AdminResourceError("Nenhuma turma aberta para este curso.", 422);
}
