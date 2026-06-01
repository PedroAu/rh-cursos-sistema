import { addDays, formatISO } from "date-fns";

import { mockCourses } from "@/data/mockCourses";
import { mockInstructors } from "@/data/mockInstructors";
import type { ClassStatus, TrainingClass } from "@/types";

const locations = [
  "Brasília • Asa Sul",
  "Ao vivo via Zoom",
  "Sede do cliente",
  "Híbrido • Brasília + online",
  "Plataforma gravada"
];

const statuses: ClassStatus[] = ["Inscrições abertas", "Poucas vagas", "Encerrada", "Em breve"];

export const mockClasses: TrainingClass[] = mockCourses.map((course, index) => {
  const start = addDays(new Date("2026-05-05T09:00:00"), index * 5);
  const end = addDays(start, course.durationHours > 16 ? 1 : 0);
  const totalSeats = course.modality === "In company" ? 40 : 30;
  const filledSeats = Math.min(totalSeats, 10 + (index % 17));
  const status = statuses[index % statuses.length];
  const instructor = mockInstructors.find((item) => item.id === course.instructorId) ?? mockInstructors[0];

  return {
    id: `class-${Math.floor(index / 5) + 1}-${(index % 5) + 1}`,
    courseId: course.id,
    startDate: formatISO(start),
    endDate: formatISO(end),
    time: index % 2 === 0 ? "09:00 às 17:00" : "19:00 às 22:00",
    modality: course.modality,
    location: locations[index % locations.length],
    instructorId: instructor.id,
    totalSeats,
    filledSeats,
    availableSeats: totalSeats - filledSeats,
    status,
    price: course.price,
    notes:
      status === "Poucas vagas"
        ? "Restam poucas vagas nesta turma."
        : status === "Encerrada"
          ? "Turma já realizada ou encerrada para novas inscrições."
          : "Turma pronta para demonstração e inscrição simulada."
  };
});
