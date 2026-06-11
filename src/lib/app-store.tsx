"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
import { company } from "@/lib/company";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { invokeFunction, isFunctionsConfigured } from "@/lib/supabase/functions-client";
import {
  getSessionToken,
  clearSessionToken,
  decodeSessionToken,
  getSupabaseSession,
} from "@/lib/supabase/session-token";
import { fetchPublicCatalogFromSupabase, fetchLeadsFromSupabase } from "@/lib/supabase/rh-cursos-api";
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
type LeadPayload = Omit<Lead, "id" | "createdAt" | "status">;

type AppStoreValue = AppState & {
  trainingPaths: typeof trainingPaths;
  demoAccessList: DemoAccess[];
  login: (role: CurrentSession["role"], email: string, password: string, name?: string) => boolean;
  setSession: (session: CurrentSession) => void;
  logout: () => void;
  createEnrollment: (payload: EnrollmentPayload) => Promise<void>;
  createLead: (payload: LeadPayload) => Promise<void>;
  updateLeadStatus: (id: string, status: Lead["status"]) => Promise<void>;
  updateLead: (payload: Partial<Lead> & { id: string }) => Promise<void>;
  upsertCourse: (course: Partial<Course>) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  duplicateCourse: (id: string) => void;
  upsertClass: (trainingClass: Partial<TrainingClass>) => Promise<void>;
  deleteClass: (id: string) => Promise<void>;
  upsertInstructor: (instructor: Partial<Instructor>) => Promise<void>;
  deleteInstructor: (id: string) => Promise<void>;
  updateStudent: (student: Partial<Student> & { id: string }) => Promise<void>;
  updateEnrollmentStatus: (id: string, status: EnrollmentStatus) => Promise<void>;
  upsertBlogPost: (post: Partial<BlogPost>) => Promise<void>;
  deleteBlogPost: (id: string) => Promise<void>;
  resetStore: () => void;
};

const STORAGE_KEY = "rhcursos-demo-store-v4";

type AdminMutation =
  | { resource: "courses" | "classes" | "students" | "instructors" | "blog" | "leads"; action: "upsert"; payload: unknown }
  | { resource: "courses" | "classes" | "instructors" | "blog"; action: "delete"; id: string }
  | { resource: "leads" | "enrollments"; action: "update-status"; id: string; status: string };

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

function readInitialState(initialSession?: CurrentSession | null) {
  return initialSession
    ? { ...initialState, currentSession: initialSession }
    : initialState;
}

function readStoredState(initialSession?: CurrentSession | null) {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return null;
  }

  try {
    const parsed = JSON.parse(stored) as AppState;
    return initialSession ? { ...parsed, currentSession: initialSession } : parsed;
  } catch {
    return null;
  }
}

function countConfirmedEnrollments(enrollments: Enrollment[], classId: string) {
  return enrollments.filter(
    (item) =>
      item.classId === classId &&
      (item.status === "Confirmada" || item.status === "Aguardando pagamento" || item.status === "Concluída")
  ).length;
}

function deriveClassCapacity(trainingClass: TrainingClass, enrollments: Enrollment[]) {
  const siteFilledSeats = countConfirmedEnrollments(enrollments, trainingClass.id);
  const manualFilledSeats = Math.max(
    trainingClass.manualFilledSeats ?? trainingClass.filledSeats - siteFilledSeats,
    0
  );
  const filledSeats = Math.min(trainingClass.totalSeats, manualFilledSeats + siteFilledSeats);

  return {
    manualFilledSeats,
    filledSeats,
    availableSeats: Math.max(0, trainingClass.totalSeats - filledSeats),
  };
}

function persistAdminMutation(mutation: AdminMutation): Promise<void> {
  if (!isFunctionsConfigured) return Promise.resolve();

  return invokeFunction("admin-resources", {
    body: mutation,
    sessionToken: getSessionToken() ?? undefined
  }).then((response) => {
    if (!response.ok) {
      toast.error("Alteração salva localmente, mas não foi enviada ao Supabase.");
    }
  }).catch(() => {
    toast.error("Alteração salva localmente, mas não foi enviada ao Supabase.");
  });
}

async function getFunctionErrorMessage(response: Response, fallback: string) {
  try {
    const payload = (await response.json()) as { error?: string };
    if (payload?.error) return payload.error;
  } catch {
    // Ignora payloads não JSON e usa fallback.
  }

  return fallback;
}

export function AppStoreProvider({
  children,
  initialSession = null
}: PropsWithChildren<{ initialSession?: CurrentSession | null }>) {
  const [state, setState] = useState<AppState>(() => readInitialState(initialSession));
  const [isStoreHydrated, setIsStoreHydrated] = useState(false);

  // Ref espelhando o state para callbacks estáveis lerem o valor atual sem
  // recriar sua identidade a cada mudança (evita re-renders em cascata).
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
    if (isStoreHydrated) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [isStoreHydrated, state]);

  useEffect(() => {
    const storedState = readStoredState(initialSession);
    if (storedState) {
      setState(storedState);
    }
    setIsStoreHydrated(true);
  }, [initialSession]);

  // Reconciliação de sessão na inicialização: a sessão server-side do admin
  // entra por prop; como fallback, reidratamos o payload do token HMAC salvo no
  // browser para manter consistência com as Edge Functions existentes.
  useEffect(() => {
    if (initialSession) {
      setState((current) => {
        if (
          current.currentSession?.role === initialSession.role &&
          current.currentSession?.email === initialSession.email &&
          current.currentSession?.name === initialSession.name
        ) {
          return current;
        }

        return { ...current, currentSession: initialSession };
      });
      return;
    }

    const decoded = decodeSessionToken(getSessionToken());

    setState((current) => {
      if (decoded) {
        // Token válido: restauração otimista da sessão.
        if (
          current.currentSession?.role === decoded.role &&
          current.currentSession?.email === decoded.email &&
          current.currentSession?.name === decoded.name
        ) {
          return current;
        }
        return { ...current, currentSession: decoded };
      }

      // Sem token (ou malformado): se há sessão no state persistido, é estado
      // inconsistente — limpar para forçar novo login.
      if (current.currentSession) {
        return { ...current, currentSession: null };
      }
      return current;
    });
  }, [initialSession]);

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

    // Reidrata a sessão do Supabase Auth (JWT em localStorage) e, com o cliente
    // já autenticado como `authenticated`, busca os leads diretamente via RLS
    // (policy lead_admin_select / is_admin). Sem JWT, nenhuma leitura admin ocorre.
    const stored = getSupabaseSession();
    if (stored && supabase) {
      supabase.auth
        .setSession({
          access_token: stored.access_token,
          refresh_token: stored.refresh_token,
        })
        .then(({ error }) => {
          if (!active || error) return;
          return fetchLeadsFromSupabase().then((leads) => {
            if (!active || !leads?.length) return;
            setState((current) => ({ ...current, leads }));
          });
        })
        .catch(() => undefined);
    }

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback<AppStoreValue["login"]>((role, email, password, name) => {
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

    const fallbackName = matchedAccess.name ?? name ?? email.split("@")[0];

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
  }, []);

  const setSession = useCallback<AppStoreValue["setSession"]>((session) => {
    setState((current) => ({ ...current, currentSession: session }));
    toast.success("Login realizado.");
  }, []);

  const logout = useCallback<AppStoreValue["logout"]>(() => {
    void fetch("/api/auth/session", { method: "DELETE" }).catch(() => undefined);
    if (supabase) {
      void supabase.auth.signOut().catch(() => undefined);
    }
    clearSessionToken();
    setState((current) => ({ ...current, currentSession: null }));
    toast.success("Sessão encerrada.");
  }, []);

  const createEnrollment = useCallback<AppStoreValue["createEnrollment"]>(async (payload) => {
    if (isFunctionsConfigured) {
      try {
        const response = await invokeFunction("enrollments", { body: payload });

        if (!response.ok) {
          throw new Error(await getFunctionErrorMessage(response, "Não foi possível registrar a inscrição."));
        }
      } catch (error) {
        if (error instanceof Error && /fetch/i.test(error.message)) {
          toast.error("Serviço indisponível no momento. Inscrição registrada localmente para validação.");
        } else {
          throw error;
        }
      }
    }

    const enrollmentId = `enrollment-${Date.now()}`;
    const studentId = `student-sim-${Date.now()}`;

    setState((current) => {
      const enrollments = [
        {
          id: enrollmentId,
          createdAt: new Date().toISOString(),
          status: "Confirmada" as const,
          ...payload
        },
        ...current.enrollments
      ];

      return {
        ...current,
        enrollments,
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
        classes: current.classes.map((item) => {
          if (item.id !== payload.classId) return item;
          const capacity = deriveClassCapacity(item, enrollments);
          return {
            ...item,
            ...capacity,
            status: capacity.availableSeats <= 5 ? "Poucas vagas" : item.status
          };
        })
      };
    });

    toast.success(
      isFunctionsConfigured
        ? "Inscrição realizada com sucesso."
        : "Inscrição registrada localmente no modo de desenvolvimento."
    );
  }, []);

  const createLead = useCallback<AppStoreValue["createLead"]>(async (payload) => {
    if (isFunctionsConfigured) {
      try {
        const response = await invokeFunction("leads", { body: payload });

        if (!response.ok) {
          throw new Error(await getFunctionErrorMessage(response, "Não foi possível enviar sua mensagem."));
        }
      } catch (error) {
        if (error instanceof Error && /fetch/i.test(error.message)) {
          toast.error("Serviço indisponível no momento. Solicitação registrada localmente para validação.");
        } else {
          throw error;
        }
      }
    }

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
    toast.success(
      isFunctionsConfigured
        ? "Lead cadastrado."
        : "Lead registrado localmente no modo de desenvolvimento."
    );
  }, []);

  const updateLeadStatus = useCallback<AppStoreValue["updateLeadStatus"]>((id, status) => {
    setState((current) => ({
      ...current,
      leads: current.leads.map((lead) => (lead.id === id ? { ...lead, status } : lead))
    }));
    toast.success("Status do lead atualizado.");
    return persistAdminMutation({ resource: "leads", action: "update-status", id, status });
  }, []);

  const updateLead = useCallback<AppStoreValue["updateLead"]>((payload) => {
    setState((current) => ({
      ...current,
      leads: current.leads.map((lead) => (lead.id === payload.id ? { ...lead, ...payload } : lead))
    }));
    toast.success("Lead atualizado.");
    return persistAdminMutation({ resource: "leads", action: "upsert", payload });
  }, []);

  const upsertCourse = useCallback<AppStoreValue["upsertCourse"]>((course) => {
    const snapshot = stateRef.current;
    const exists = course.id && snapshot.courses.some((item) => item.id === course.id);
    const nextCourse: Course = exists
      ? ({ ...snapshot.courses.find((item) => item.id === course.id)!, ...course } as Course)
      : ({
          id: `course-${Date.now()}`,
          slug: slugify(course.title ?? "novo-curso"),
          title: course.title ?? "Novo curso",
          pathId: course.pathId ?? trainingPaths[0].id,
          pathName:
            trainingPaths.find((item) => item.id === (course.pathId ?? trainingPaths[0].id))?.name ??
            trainingPaths[0].name,
          modality: course.modality ?? course.modalities?.[0] ?? "Ao vivo online",
          modalities: course.modalities ?? (course.modality ? [course.modality] : ["Ao vivo online"]),
          durationLabel: course.durationLabel ?? "8h",
          durationHours: course.durationHours ?? 8,
          level: course.level ?? "Básico",
          category: course.category ?? course.categories?.[0] ?? trainingPaths[0].shortName,
          categories: course.categories ?? (course.category ? [course.category] : [trainingPaths[0].shortName]),
          price: course.price ?? 0,
          shortDescription: course.shortDescription ?? "Descrição curta do curso.",
          fullDescription: course.fullDescription ?? "Descrição completa do curso.",
          targetAudience: course.targetAudience ?? ["Profissionais"],
          objectives: course.objectives ?? ["Objetivo principal"],
          benefits: course.benefits ?? ["Material de apoio"],
          modules: course.modules ?? [],
          instructorId: course.instructorId ?? snapshot.instructors[0]?.id ?? "inst-1",
          image: course.image ?? courseCoverByPath[course.pathId ?? trainingPaths[0].id] ?? defaultCourseCover,
          rating: course.rating ?? 4.8,
          studentsCount: course.studentsCount ?? 0,
          status: course.status ?? "Ativo",
          featured: course.featured ?? false,
          featuredCourseIds: course.featuredCourseIds ?? [],
          nextClassId: course.nextClassId ?? snapshot.classes[0]?.id ?? ""
        } as Course);

    setState((current) => ({
      ...current,
      courses: exists
        ? current.courses.map((item) => (item.id === nextCourse.id ? nextCourse : item))
        : [nextCourse, ...current.courses]
    }));
    toast.success(course.id ? "Curso editado." : "Curso criado no admin.");
    return persistAdminMutation({ resource: "courses", action: "upsert", payload: nextCourse });
  }, []);

  const deleteCourse = useCallback<AppStoreValue["deleteCourse"]>((id) => {
    setState((current) => ({
      ...current,
      courses: current.courses.filter((item) => item.id !== id)
    }));
    toast.success("Curso excluído.");
    return persistAdminMutation({ resource: "courses", action: "delete", id });
  }, []);

  const duplicateCourse = useCallback<AppStoreValue["duplicateCourse"]>((id) => {
    const source = stateRef.current.courses.find((item) => item.id === id);
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
  }, []);

  const upsertClass = useCallback<AppStoreValue["upsertClass"]>((trainingClass) => {
    const snapshot = stateRef.current;
    const exists = trainingClass.id && snapshot.classes.some((item) => item.id === trainingClass.id);
    const baseClass: TrainingClass = exists
      ? ({ ...snapshot.classes.find((item) => item.id === trainingClass.id)!, ...trainingClass } as TrainingClass)
      : ({
          id: `class-${Date.now()}`,
          courseId: trainingClass.courseId ?? snapshot.courses[0]?.id ?? "",
          startDate: trainingClass.startDate ?? new Date().toISOString(),
          endDate: trainingClass.endDate ?? trainingClass.startDate ?? new Date().toISOString(),
          time: trainingClass.time ?? "09:00 às 17:00",
          modality: trainingClass.modality ?? "Ao vivo online",
          location: trainingClass.location ?? "Online",
          instructorId: trainingClass.instructorId ?? snapshot.instructors[0]?.id ?? "",
          totalSeats: trainingClass.totalSeats ?? 30,
          manualFilledSeats: trainingClass.manualFilledSeats ?? trainingClass.filledSeats ?? 0,
          filledSeats: trainingClass.filledSeats ?? 0,
          availableSeats: trainingClass.availableSeats ?? 30,
          status: trainingClass.status ?? "Inscrições abertas",
          price: trainingClass.price ?? 0,
          notes: trainingClass.notes ?? "Turma criada no modo simulado."
        } as TrainingClass);
    const nextClass = {
      ...baseClass,
      ...deriveClassCapacity(baseClass, snapshot.enrollments)
    };

    setState((current) => ({
      ...current,
      classes: exists
        ? current.classes.map((item) => (item.id === nextClass.id ? nextClass : item))
        : [nextClass, ...current.classes]
    }));
    toast.success(trainingClass.id ? "Turma editada." : "Turma criada.");
    return persistAdminMutation({ resource: "classes", action: "upsert", payload: nextClass });
  }, []);

  const deleteClass = useCallback<AppStoreValue["deleteClass"]>((id) => {
    setState((current) => ({
      ...current,
      classes: current.classes.filter((item) => item.id !== id)
    }));
    toast.success("Turma excluída.");
    return persistAdminMutation({ resource: "classes", action: "delete", id });
  }, []);

  const upsertInstructor = useCallback<AppStoreValue["upsertInstructor"]>((instructor) => {
    const snapshot = stateRef.current;
    const exists = instructor.id && snapshot.instructors.some((item) => item.id === instructor.id);
    const nextInstructor: Instructor = exists
      ? ({
          ...snapshot.instructors.find((item) => item.id === instructor.id)!,
          ...instructor,
          avatar:
            instructor.photoUrl ||
            instructor.avatar ||
            snapshot.instructors.find((item) => item.id === instructor.id)!.avatar,
        } as Instructor)
      : ({
          id: `inst-${Date.now()}`,
          name: instructor.name ?? "Novo instrutor",
          email: instructor.email ?? "",
          phone: instructor.phone ?? company.phones.primary,
          specialty: instructor.specialty ?? "",
          bio: instructor.bio ?? "Mini bio do instrutor.",
          education: instructor.education ?? "",
          photoUrl: instructor.photoUrl ?? "",
          courseIds: instructor.courseIds ?? [],
          rating: instructor.rating ?? 4.8,
          avatar:
            instructor.photoUrl ??
            instructor.avatar ??
            instructor.name?.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() ??
            "NI",
          status: instructor.status ?? "Ativo"
        } as Instructor);

    setState((current) => ({
      ...current,
      instructors: exists
        ? current.instructors.map((item) => (item.id === nextInstructor.id ? nextInstructor : item))
        : [nextInstructor, ...current.instructors]
    }));
    toast.success(instructor.id ? "Instrutor editado." : "Instrutor criado.");
    return persistAdminMutation({ resource: "instructors", action: "upsert", payload: nextInstructor });
  }, []);

  const deleteInstructor = useCallback<AppStoreValue["deleteInstructor"]>((id) => {
    setState((current) => ({
      ...current,
      instructors: current.instructors.filter((item) => item.id !== id)
    }));
    toast.success("Instrutor excluído.");
    return persistAdminMutation({ resource: "instructors", action: "delete", id });
  }, []);

  const updateStudent = useCallback<AppStoreValue["updateStudent"]>((student) => {
    setState((current) => ({
      ...current,
      students: current.students.map((item) => (item.id === student.id ? { ...item, ...student } : item))
    }));
    toast.success("Aluno atualizado.");
    return persistAdminMutation({ resource: "students", action: "upsert", payload: student });
  }, []);

  const updateEnrollmentStatus = useCallback<AppStoreValue["updateEnrollmentStatus"]>((id, status) => {
    setState((current) => {
      const enrollments = current.enrollments.map((item) => (item.id === id ? { ...item, status } : item));

      return {
        ...current,
        enrollments,
        classes: current.classes.map((item) => ({
          ...item,
          ...deriveClassCapacity(item, enrollments)
        }))
      };
    });
    toast.success("Status da inscrição atualizado.");
    return persistAdminMutation({ resource: "enrollments", action: "update-status", id, status });
  }, []);

  const upsertBlogPost = useCallback<AppStoreValue["upsertBlogPost"]>((post) => {
    const snapshot = stateRef.current;
    const exists = post.id && snapshot.blogPosts.some((item) => item.id === post.id);
    const nextPost: BlogPost = exists
      ? ({ ...snapshot.blogPosts.find((item) => item.id === post.id)!, ...post } as BlogPost)
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
          relatedCourseId: post.relatedCourseId ?? snapshot.courses[0]?.id ?? ""
        } as BlogPost);

    setState((current) => ({
      ...current,
      blogPosts: exists
        ? current.blogPosts.map((item) => (item.id === nextPost.id ? nextPost : item))
        : [nextPost, ...current.blogPosts]
    }));
    toast.success(post.id ? "Post atualizado." : "Post publicado.");
    return persistAdminMutation({ resource: "blog", action: "upsert", payload: nextPost });
  }, []);

  const deleteBlogPost = useCallback<AppStoreValue["deleteBlogPost"]>((id) => {
    setState((current) => ({
      ...current,
      blogPosts: current.blogPosts.filter((item) => item.id !== id)
    }));
    toast.success("Post excluído.");
    return persistAdminMutation({ resource: "blog", action: "delete", id });
  }, []);

  const resetStore = useCallback<AppStoreValue["resetStore"]>(() => {
    setState(initialState);
    window.localStorage.removeItem(STORAGE_KEY);
    toast.success("Base simulada restaurada.");
  }, []);

  const value = useMemo<AppStoreValue>(
    () => ({
      ...state,
      trainingPaths,
      demoAccessList,
      login,
      setSession,
      logout,
      createEnrollment,
      createLead,
      updateLeadStatus,
      updateLead,
      upsertCourse,
      deleteCourse,
      duplicateCourse,
      upsertClass,
      deleteClass,
      upsertInstructor,
      deleteInstructor,
      updateStudent,
      updateEnrollmentStatus,
      upsertBlogPost,
      deleteBlogPost,
      resetStore
    }),
    [
      state,
      login,
      setSession,
      logout,
      createEnrollment,
      createLead,
      updateLeadStatus,
      updateLead,
      upsertCourse,
      deleteCourse,
      duplicateCourse,
      upsertClass,
      deleteClass,
      upsertInstructor,
      deleteInstructor,
      updateStudent,
      updateEnrollmentStatus,
      upsertBlogPost,
      deleteBlogPost,
      resetStore
    ]
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
    revenueByMonth: (() => {
      const byMonth: Record<string, number> = {};
      enrollments.forEach((enrollment) => {
        if (enrollment.status !== "Confirmada" && enrollment.status !== "Concluída") return;
        const course = courses.find((c) => c.id === enrollment.courseId);
        if (!course) return;
        const date = new Date(enrollment.createdAt);
        const key = date.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
        byMonth[key] = (byMonth[key] ?? 0) + course.price;
      });
      return Object.entries(byMonth)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, value]) => ({ month, value }));
    })(),
    classesByModality: Object.entries(
      classes.reduce<Record<TrainingClass["modality"], number>>((acc, item) => {
        acc[item.modality] = (acc[item.modality] ?? 0) + 1;
        return acc;
      }, {} as Record<TrainingClass["modality"], number>)
    ).map(([name, value]) => ({ name, value }))
  };
}
