"use client";

import { createContext, useContext } from "react";

import type { Enrollment, EnrollmentStatus, Student } from "@/types";

import type { EnrollmentPayload } from "./store-types";

/**
 * Domínio de alunos: matrículas, inscrições e progresso. Consumidores deste
 * contexto re-renderizam apenas quando alunos/inscrições mudam.
 */
export type StudentStoreValue = {
  students: Student[];
  enrollments: Enrollment[];
  createEnrollment: (payload: EnrollmentPayload) => Promise<void>;
  updateStudent: (student: Partial<Student> & { id: string }) => Promise<void>;
  updateEnrollmentStatus: (id: string, status: EnrollmentStatus) => Promise<void>;
};

export const StudentStoreContext = createContext<StudentStoreValue | null>(null);

export function useStudentStore() {
  const context = useContext(StudentStoreContext);

  if (!context) {
    throw new Error("useStudentStore must be used within AppStoreProvider");
  }

  return context;
}
