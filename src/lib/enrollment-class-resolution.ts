import type { TrainingClass } from "@/types";

const OPEN_CLASS_STATUSES = new Set<TrainingClass["status"]>([
  "Inscrições abertas",
  "Poucas vagas",
]);

export function isEnrollmentClassOpen(trainingClass: Pick<TrainingClass, "status">) {
  return OPEN_CLASS_STATUSES.has(trainingClass.status);
}

export function getOpenEnrollmentClasses(classes: TrainingClass[], courseId: string) {
  return classes
    .filter((trainingClass) => trainingClass.courseId === courseId && isEnrollmentClassOpen(trainingClass))
    .sort((left, right) => new Date(left.startDate).getTime() - new Date(right.startDate).getTime());
}

export function resolveOpenEnrollmentClassId({
  classes,
  requestedClassId,
  preferredClassId,
}: {
  classes: TrainingClass[];
  requestedClassId?: string;
  preferredClassId?: string;
}) {
  const openClasses = classes.filter(isEnrollmentClassOpen);

  return (
    openClasses.find((trainingClass) => trainingClass.id === requestedClassId)?.id ??
    openClasses.find((trainingClass) => trainingClass.id === preferredClassId)?.id ??
    openClasses[0]?.id ??
    ""
  );
}
