import type { TrainingClass } from "@/types";

const OPEN_CLASS_STATUSES = new Set<TrainingClass["status"]>([
  "Inscrições abertas",
  "Poucas vagas",
]);

// Visibilidade pública e elegibilidade para pré-inscrição são conceitos
// distintos. Uma turma ainda pode orientar a decisão do visitante mesmo sem
// vagas ou antes da abertura das inscrições.
const DISPLAYABLE_CLASS_STATUSES = new Set<TrainingClass["status"]>([
  ...OPEN_CLASS_STATUSES,
  "Em breve",
]);

export function isTrainingClassSoldOut(trainingClass: Pick<TrainingClass, "availableSeats">) {
  return trainingClass.availableSeats <= 0;
}

export function isEnrollmentClassOpen(trainingClass: Pick<TrainingClass, "status" | "availableSeats">) {
  return OPEN_CLASS_STATUSES.has(trainingClass.status) && !isTrainingClassSoldOut(trainingClass);
}

export function isEnrollmentClassDisplayable(trainingClass: Pick<TrainingClass, "status">) {
  return DISPLAYABLE_CLASS_STATUSES.has(trainingClass.status);
}

export function getOpenEnrollmentClasses(classes: TrainingClass[], courseId: string) {
  return classes
    .filter((trainingClass) => trainingClass.courseId === courseId && isEnrollmentClassOpen(trainingClass))
    .sort((left, right) => new Date(left.startDate).getTime() - new Date(right.startDate).getTime());
}

export function getDisplayableEnrollmentClasses(classes: TrainingClass[], courseId: string) {
  return classes
    .filter((trainingClass) => trainingClass.courseId === courseId && isEnrollmentClassDisplayable(trainingClass))
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
