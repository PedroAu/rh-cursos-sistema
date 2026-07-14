import type {
  BlogPost,
  Course,
  CoursePublicContent,
  CurrentSession,
  Enrollment,
  Instructor,
  Lead,
  Student,
  Testimonial,
  TrainingClass,
  TrainingPath
} from "@/types";

/**
 * Estado canônico da aplicação. Mantido como uma única árvore para preservar
 * atualizações atômicas entre domínios (ex.: matrícula altera inscrições,
 * alunos e a capacidade da turma no mesmo `setState`). A distribuição em
 * contextos por domínio acontece na camada de provider, não no estado.
 */
export type AppState = {
  courses: Course[];
  classes: TrainingClass[];
  students: Student[];
  instructors: Instructor[];
  coursePublicContents: CoursePublicContent[];
  leads: Lead[];
  enrollments: Enrollment[];
  blogPosts: BlogPost[];
  testimonials: Testimonial[];
  trainingPaths: TrainingPath[];
  courseCategories: string[];
  currentSession: CurrentSession | null;
};

export type AppStoreInitialData = Partial<Omit<AppState, "currentSession">>;

export type EnrollmentPayload = Omit<Enrollment, "id" | "createdAt" | "status">;
export type LeadPayload = Omit<Lead, "id" | "createdAt" | "status"> & {
  status?: Lead["status"];
};
export type StudentPayload = Pick<Student, "name" | "email" | "organization" | "enrollmentStatus"> &
  Partial<Pick<Student, "phone" | "cpf" | "jobTitle" | "courseId" | "classId" | "paymentMethod">>;
export type AdminEnrollmentPayload = Pick<
  Enrollment,
  "studentName" | "email" | "phone" | "cpf" | "organization" | "jobTitle" | "enrollmentType" | "paymentMethod" | "courseId" | "classId" | "notes"
> & {
  status?: Enrollment["status"];
};
