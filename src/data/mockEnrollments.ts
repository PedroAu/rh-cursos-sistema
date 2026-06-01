import { mockStudents } from "@/data/mockStudents";
import type { Enrollment } from "@/types";

export const mockEnrollments: Enrollment[] = mockStudents.slice(0, 50).map((student, index) => ({
  id: `enrollment-${index + 1}`,
  studentName: student.name,
  email: student.email,
  phone: student.phone,
  cpf: student.cpf,
  organization: student.organization,
  jobTitle: student.jobTitle,
  enrollmentType: index % 3 === 0 ? "Órgão público" : index % 2 === 0 ? "Empresa" : "Pessoa física",
  paymentMethod: student.paymentMethod,
  courseId: student.courseId,
  classId: student.classId,
  status: student.enrollmentStatus,
  createdAt: student.enrolledAt,
  notes: "Inscrição criada para simulação de fluxo e gestão administrativa."
}));
