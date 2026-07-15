import type { TrainingClass } from "@/types";

const OPEN_CLASS_STATUSES = new Set<TrainingClass["status"]>([
  "Inscrições abertas",
  "Poucas vagas",
]);

export function isEnrollmentClassOpen(trainingClass: Pick<TrainingClass, "status" | "availableSeats">) {
  return OPEN_CLASS_STATUSES.has(trainingClass.status) && trainingClass.availableSeats > 0;
}

export function getOpenEnrollmentClasses(classes: TrainingClass[], courseId: string) {
  return classes
    .filter((trainingClass) => trainingClass.courseId === courseId && isEnrollmentClassOpen(trainingClass))
    .sort((left, right) => new Date(left.startDate).getTime() - new Date(right.startDate).getTime());
}

/**
 * Preço da turma é opcional no formulário (0 = não preenchido, não "grátis").
 * Retorna null quando turma e curso estão ambos sem preço definido, para o
 * chamador exibir "Sob consulta" em vez de R$ 0,00.
 */
export function resolveDisplayPrice(classPrice: number | undefined, coursePrice: number): number | null {
  const effectivePrice = classPrice && classPrice > 0 ? classPrice : coursePrice;
  return effectivePrice > 0 ? effectivePrice : null;
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
