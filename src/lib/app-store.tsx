import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren
} from "react";
import { toast } from "sonner";

import {
  courseCoverByPath,
  defaultCourseCover,
  demoAccessList,
  mockBlogPosts,
  mockClasses,
  mockCourses,
  mockEnrollments,
  mockInstructors,
  mockLeads,
  mockStudents,
  mockTestimonials,
  trainingPaths
} from "@/data";
import { slugify } from "@/lib/utils";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  fetchLeadsFromSupabase,
  fetchPublicCatalogFromSupabase
} from "@/lib/supabase/rh-cursos-api";
import type {
  BlogPost,
  Course,
  CurrentSession,
  DemoAccess,
  Enrollment,
  EnrollmentStatus,
  Instructor,
  Lead,
  Student,
  TrainingClass
} from "@/types";

type AppState = {
  courses: Course[];
  classes: TrainingClass[];
  students: Student[];
  instructors: Instructor[];
  leads: Lead[];
  enrollments: Enrollment[];
  blogPosts: BlogPost[];
  testimonials: typeof mockTestimonials;
  currentSession: CurrentSession | null;
};

type EnrollmentPayload = Omit<Enrollment, "id" | "createdAt" | "status">;

type AppStoreValue = AppState & {
  trainingPaths: typeof trainingPaths;
  demoAccessList: DemoAccess[];
  login: (role: CurrentSession["role"], email: string, password: string, name?: string) => boolean;
  setSession: (session: CurrentSession) => void;
  logout: () => void;
  createEnrollment: (payload: EnrollmentPayload) => void;
  createLead: (payload: Omit<Lead, "id" | "createdAt" | "status">) => void;
  updateLeadStatus: (id: string, status: Lead["status"]) => void;
  upsertCourse: (course: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  duplicateCourse: (id: string) => void;
  upsertClass: (trainingClass: Partial<TrainingClass>) => void;
  deleteClass: (id: string) => void;
  upsertInstructor: (instructor: Partial<Instructor>) => void;
  deleteInstructor: (id: string) => void;
  updateStudent: (student: Partial<Student> & { id: string }) => void;
  updateEnrollmentStatus: (id: string, status: EnrollmentStatus) => void;
  upsertBlogPost: (post: Partial<BlogPost>) => void;
  deleteBlogPost: (id: string) => void;
  resetStore: () => void;
};

const STORAGE_KEY = "rhcursos-demo-store-v4";

const initialState: AppState = {
  courses: mockCourses,
  classes: mockClasses,
  students: mockStudents,
  instructors: mockInstructors,
  leads: mockLeads,
  enrollments: mockEnrollments,
  blogPosts: mockBlogPosts,
  testimonials: mockTestimonials,
  currentSession: null
};

const AppStoreContext = createContext<AppStoreValue | null>(null);

function readInitialState() {
  if (typeof window === "undefined") {
    return initialState;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return initialState;
  }

  try {
    return JSON.parse(stored) as AppState;
  } catch {
    return initialState;
  }
}

export function AppStoreProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<AppState>(readInitialState);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let active = true;

    fetchPublicCatalogFromSupabase()
      .then((catalog) => {
        if (!active || !catalog) return;

        setState((current) => ({
          ...current,
          courses: catalog.courses.length ? catalog.courses : current.courses,
          classes: catalog.classes.length ? catalog.classes : current.classes,
          instructors: catalog.instructors.length ? catalog.instructors : current.instructors
        }));
      })
      .catch(() => {
        toast.error("Não foi possível carregar o catálogo do Supabase. Usando dados locais.");
      });

    fetchLeadsFromSupabase()
      .then((leads) => {
        if (!active || !leads?.length) return;
        setState((current) => ({ ...current, leads }));
      })
      .catch(() => {
        // Leads dependem de autenticação pelas policies; o fallback local mantém o admin utilizável.
      });

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<AppStoreValue>(
    () => ({
      ...state,
      trainingPaths,
      demoAccessList,
      login: (role, email, password, name) => {
        const matchedAccess = demoAccessList.find(
          (access) =>
            access.role === role &&
            access.email.toLowerCase() === email.toLowerCase() &&
            access.password === password
        );

        if (!matchedAccess) {
          toast.error("Credenciais de teste inválidas para este perfil.");
          return false;
        }

        const student = state.students.find((item) => item.email === email);
        const instructor = state.instructors.find((item) => item.email === email);
        const fallbackName =
          student?.name ?? instructor?.name ?? matchedAccess.name ?? name ?? email.split("@")[0];

        setState((current) => ({
          ...current,
          currentSession: {
            role,
            email,
            name: fallbackName
          }
        }));
        toast.success("Login simulado realizado.");
        return true;
      },
      setSession: (session) => {
        setState((current) => ({ ...current, currentSession: session }));
        toast.success("Login realizado.");
      },
      logout: () => {
        void fetch("/api/auth/session", { method: "DELETE" });
        setState((current) => ({ ...current, currentSession: null }));
        toast.success("Sessão simulada encerrada.");
      },
      createEnrollment: (payload) => {
        const enrollmentId = `enrollment-${Date.now()}`;
        const studentId = `student-sim-${Date.now()}`;

        void fetch("/api/enrollments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }).then((response) => {
          if (!response.ok && isSupabaseConfigured) {
            toast.error("Inscrição salva localmente, mas não foi enviada ao Supabase.");
          }
        }).catch(() => {
          if (isSupabaseConfigured) {
            toast.error("Inscrição salva localmente, mas não foi enviada ao Supabase.");
          }
        });

        setState((current) => ({
          ...current,
          enrollments: [
            {
              id: enrollmentId,
              createdAt: new Date().toISOString(),
              status: "Confirmada",
              ...payload
            },
            ...current.enrollments
          ],
          students: [
            {
              id: studentId,
              name: payload.studentName,
              email: payload.email,
              phone: payload.phone,
              cpf: payload.cpf,
              organization: payload.organization,
              jobTitle: payload.jobTitle,
              courseId: payload.courseId,
              classId: payload.classId,
              enrollmentStatus: "Confirmada",
              certificateIssued: false,
              enrolledAt: new Date().toISOString(),
              paymentMethod: payload.paymentMethod
            },
            ...current.students
          ],
          classes: current.classes.map((item) =>
            item.id === payload.classId
              ? {
                  ...item,
                  filledSeats: item.filledSeats + 1,
                  availableSeats: Math.max(0, item.availableSeats - 1),
                  status: item.availableSeats - 1 <= 5 ? "Poucas vagas" : item.status
                }
              : item
          )
        }));

        toast.success("Inscrição realizada com sucesso.");
      },
      createLead: (payload) => {
        void fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }).then((response) => {
          if (!response.ok && isSupabaseConfigured) {
            toast.error("Lead salvo localmente, mas não foi enviado ao Supabase.");
          }
        }).catch(() => {
          if (isSupabaseConfigured) {
            toast.error("Lead salvo localmente, mas não foi enviado ao Supabase.");
          }
        });

        setState((current) => ({
          ...current,
          leads: [
            {
              id: `lead-${Date.now()}`,
              createdAt: new Date().toISOString(),
              status: "Novo",
              ...payload
            },
            ...current.leads
          ]
        }));
        toast.success("Lead cadastrado.");
      },
      updateLeadStatus: (id, status) => {
        setState((current) => ({
          ...current,
          leads: current.leads.map((lead) => (lead.id === id ? { ...lead, status } : lead))
        }));
        toast.success("Status do lead atualizado.");
      },
      upsertCourse: (course) => {
        setState((current) => {
          const exists = course.id && current.courses.some((item) => item.id === course.id);
          const nextCourse: Course = exists
            ? ({ ...current.courses.find((item) => item.id === course.id)!, ...course } as Course)
            : ({
                id: `course-${Date.now()}`,
                slug: slugify(course.title ?? "novo-curso"),
                title: course.title ?? "Novo curso",
                pathId: course.pathId ?? trainingPaths[0].id,
                pathName:
                  trainingPaths.find((item) => item.id === (course.pathId ?? trainingPaths[0].id))?.name ??
                  trainingPaths[0].name,
                modality: course.modality ?? "Ao vivo online",
                durationLabel: course.durationLabel ?? "8h",
                durationHours: course.durationHours ?? 8,
                level: course.level ?? "Básico",
                publicType: course.publicType ?? "Profissionais",
                price: course.price ?? 0,
                shortDescription: course.shortDescription ?? "Descrição curta do curso.",
                fullDescription: course.fullDescription ?? "Descrição completa do curso.",
                targetAudience: course.targetAudience ?? ["Profissionais"],
                objectives: course.objectives ?? ["Objetivo principal"],
                benefits: course.benefits ?? ["Material de apoio"],
                modules: course.modules ?? [],
                instructorId: course.instructorId ?? current.instructors[0]?.id ?? "inst-1",
                image: course.image ?? courseCoverByPath[course.pathId ?? trainingPaths[0].id] ?? defaultCourseCover,
                rating: course.rating ?? 4.8,
                studentsCount: course.studentsCount ?? 0,
                status: course.status ?? "Ativo",
                featured: course.featured ?? false,
                nextClassId: course.nextClassId ?? current.classes[0]?.id ?? ""
              } as Course);

          return {
            ...current,
            courses: exists
              ? current.courses.map((item) => (item.id === nextCourse.id ? nextCourse : item))
              : [nextCourse, ...current.courses]
          };
        });
        toast.success(course.id ? "Curso editado." : "Curso criado no admin.");
      },
      deleteCourse: (id) => {
        setState((current) => ({
          ...current,
          courses: current.courses.filter((item) => item.id !== id)
        }));
        toast.success("Curso excluído.");
      },
      duplicateCourse: (id) => {
        const source = state.courses.find((item) => item.id === id);
        if (!source) return;

        setState((current) => ({
          ...current,
          courses: [
            {
              ...source,
              id: `course-${Date.now()}`,
              slug: `${source.slug}-copia`,
              title: `${source.title} (Cópia)`
            },
            ...current.courses
          ]
        }));
        toast.success("Curso duplicado.");
      },
      upsertClass: (trainingClass) => {
        setState((current) => {
          const exists = trainingClass.id && current.classes.some((item) => item.id === trainingClass.id);
          const nextClass: TrainingClass = exists
            ? ({ ...current.classes.find((item) => item.id === trainingClass.id)!, ...trainingClass } as TrainingClass)
            : ({
                id: `class-${Date.now()}`,
                courseId: trainingClass.courseId ?? current.courses[0]?.id ?? "",
                startDate: trainingClass.startDate ?? new Date().toISOString(),
                endDate: trainingClass.endDate ?? new Date().toISOString(),
                time: trainingClass.time ?? "09:00 às 17:00",
                modality: trainingClass.modality ?? "Ao vivo online",
                location: trainingClass.location ?? "Online",
                instructorId: trainingClass.instructorId ?? current.instructors[0]?.id ?? "",
                totalSeats: trainingClass.totalSeats ?? 30,
                filledSeats: trainingClass.filledSeats ?? 0,
                availableSeats: trainingClass.availableSeats ?? 30,
                status: trainingClass.status ?? "Inscrições abertas",
                price: trainingClass.price ?? 0,
                notes: trainingClass.notes ?? "Turma criada no modo simulado."
              } as TrainingClass);

          return {
            ...current,
            classes: exists
              ? current.classes.map((item) => (item.id === nextClass.id ? nextClass : item))
              : [nextClass, ...current.classes]
          };
        });
        toast.success(trainingClass.id ? "Turma editada." : "Turma criada.");
      },
      deleteClass: (id) => {
        setState((current) => ({
          ...current,
          classes: current.classes.filter((item) => item.id !== id)
        }));
        toast.success("Turma excluída.");
      },
      upsertInstructor: (instructor) => {
        setState((current) => {
          const exists = instructor.id && current.instructors.some((item) => item.id === instructor.id);
          const nextInstructor: Instructor = exists
            ? ({ ...current.instructors.find((item) => item.id === instructor.id)!, ...instructor } as Instructor)
            : ({
                id: `inst-${Date.now()}`,
                name: instructor.name ?? "Novo instrutor",
                email: instructor.email ?? "instrutor@mock.com",
                phone: instructor.phone ?? "(61) 99999-0000",
                specialty: instructor.specialty ?? "Especialidade",
                bio: instructor.bio ?? "Mini bio do instrutor.",
                courseIds: instructor.courseIds ?? [],
                rating: instructor.rating ?? 4.8,
                avatar: instructor.avatar ?? "NI",
                status: instructor.status ?? "Ativo"
              } as Instructor);

          return {
            ...current,
            instructors: exists
              ? current.instructors.map((item) => (item.id === nextInstructor.id ? nextInstructor : item))
              : [nextInstructor, ...current.instructors]
          };
        });
        toast.success(instructor.id ? "Instrutor editado." : "Instrutor criado.");
      },
      deleteInstructor: (id) => {
        setState((current) => ({
          ...current,
          instructors: current.instructors.filter((item) => item.id !== id)
        }));
        toast.success("Instrutor excluído.");
      },
      updateStudent: (student) => {
        setState((current) => ({
          ...current,
          students: current.students.map((item) => (item.id === student.id ? { ...item, ...student } : item))
        }));
        toast.success("Aluno atualizado.");
      },
      updateEnrollmentStatus: (id, status) => {
        setState((current) => ({
          ...current,
          enrollments: current.enrollments.map((item) => (item.id === id ? { ...item, status } : item))
        }));
        toast.success("Status da inscrição atualizado.");
      },
      upsertBlogPost: (post) => {
        setState((current) => {
          const exists = post.id && current.blogPosts.some((item) => item.id === post.id);
          const nextPost: BlogPost = exists
            ? ({ ...current.blogPosts.find((item) => item.id === post.id)!, ...post } as BlogPost)
            : ({
                id: `post-${Date.now()}`,
                title: post.title ?? "Novo post",
                slug: slugify(post.title ?? "novo-post"),
                summary: post.summary ?? "Resumo do artigo.",
                content: post.content ?? "Conteúdo do artigo.",
                category: post.category ?? "Tecnologia",
                tags: post.tags ?? ["novo"],
                author: post.author ?? "Equipe RH Cursos",
                date: new Date().toISOString(),
                readingTime: post.readingTime ?? "5 min",
                status: post.status ?? "Rascunho",
                image: post.image ?? "https://images.unsplash.com/photo-1516321318423",
                relatedCourseId: post.relatedCourseId ?? current.courses[0]?.id ?? ""
              } as BlogPost);

          return {
            ...current,
            blogPosts: exists
              ? current.blogPosts.map((item) => (item.id === nextPost.id ? nextPost : item))
              : [nextPost, ...current.blogPosts]
          };
        });
        toast.success(post.id ? "Post atualizado." : "Post publicado.");
      },
      deleteBlogPost: (id) => {
        setState((current) => ({
          ...current,
          blogPosts: current.blogPosts.filter((item) => item.id !== id)
        }));
        toast.success("Post excluído.");
      },
      resetStore: () => {
        setState(initialState);
        window.localStorage.removeItem(STORAGE_KEY);
        toast.success("Base simulada restaurada.");
      }
    }),
    [state]
  );

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore() {
  const context = useContext(AppStoreContext);

  if (!context) {
    throw new Error("useAppStore must be used within AppStoreProvider");
  }

  return context;
}

export function useCourseBySlug(slug?: string) {
  const { courses } = useAppStore();
  return courses.find((course) => course.slug === slug);
}

export function useDashboardCharts() {
  const { classes, courses, enrollments, leads } = useAppStore();

  return {
    leadsByStatus: Object.entries(
      leads.reduce<Record<Lead["status"], number>>((acc, lead) => {
        acc[lead.status] = (acc[lead.status] ?? 0) + 1;
        return acc;
      }, {} as Record<Lead["status"], number>)
    ).map(([name, value]) => ({ name, value })),
    enrollmentsByPath: Object.entries(
      enrollments.reduce<Record<string, number>>((acc, enrollment) => {
        const course = courses.find((item) => item.id === enrollment.courseId);
        const path = course?.pathName ?? "Sem trilha";
        acc[path] = (acc[path] ?? 0) + 1;
        return acc;
      }, {})
    ).map(([name, value]) => ({ name, value })),
    revenueByMonth: ["Mai", "Jun", "Jul", "Ago", "Set"].map((month, index) => ({
      month,
      value: 32000 + index * 4500
    })),
    classesByModality: Object.entries(
      classes.reduce<Record<TrainingClass["modality"], number>>((acc, item) => {
        acc[item.modality] = (acc[item.modality] ?? 0) + 1;
        return acc;
      }, {} as Record<TrainingClass["modality"], number>)
    ).map(([name, value]) => ({ name, value }))
  };
}
