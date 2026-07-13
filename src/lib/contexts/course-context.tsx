"use client";

import { createContext, useContext } from "react";

import type { Course, CoursePublicContent, Instructor, Testimonial, TrainingClass, TrainingPath } from "@/types";

/**
 * Domínio de catálogo: cursos, trilhas, turmas, instrutores e depoimentos —
 * além das ações de busca/CRUD relacionadas. Consumidores deste contexto
 * re-renderizam apenas quando o catálogo muda.
 */
export type CourseStoreValue = {
  courses: Course[];
  classes: TrainingClass[];
  instructors: Instructor[];
  trainingPaths: TrainingPath[];
  courseCategories: string[];
  coursePublicContents: CoursePublicContent[];
  testimonials: Testimonial[];
  upsertCourse: (course: Partial<Course>) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  duplicateCourse: (id: string) => void;
  upsertClass: (trainingClass: Partial<TrainingClass>) => Promise<void>;
  deleteClass: (id: string) => Promise<void>;
  upsertInstructor: (instructor: Partial<Instructor>) => Promise<void>;
  deleteInstructor: (id: string) => Promise<void>;
};

export const CourseStoreContext = createContext<CourseStoreValue | null>(null);

export function useCourseStore() {
  const context = useContext(CourseStoreContext);

  if (!context) {
    throw new Error("useCourseStore must be used within AppStoreProvider");
  }

  return context;
}

export function useCourseBySlug(slug?: string) {
  const { courses } = useCourseStore();
  return courses.find((course) => course.slug === slug);
}
