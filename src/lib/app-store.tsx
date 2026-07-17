"use client";

import {
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren
} from "react";
import { toast } from "sonner";

import { courseCoverByPath, defaultCourseCover } from "@/lib/course-covers";
import { debounce } from "@/lib/debounce";
import { getInitials } from "@/lib/get-initials";
import { slugify } from "@/lib/utils";
import { company } from "@/lib/company";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { invokeFunction, isFunctionsConfigured, getStableClientIp } from "@/lib/supabase/functions-client";
import {
  getSessionToken,
  clearSessionToken,
  decodeSessionToken,
  getSupabaseSession,
  setSessionToken,
  SESSION_ACTIVITY_SYNC_MS,
} from "@/lib/supabase/session-token";
import {
  fetchPublicBlogPostsFromSupabase,
  fetchPublicCatalogFromSupabase,
  isExplicitPublicTestBaselineEnabled
} from "@/lib/supabase/rh-cursos-api";
import { mapLead, type LeadRow } from "@/lib/supabase/mappers";
import { enrollmentReceiptSchema } from "@/lib/validation";
import type {
  BlogPost,
  Course,
  CurrentSession,
  Enrollment,
  Instructor,
  Lead,
  Student,
  TrainingClass
} from "@/types";

import { AdminStoreContext, type AdminStoreValue } from "@/lib/contexts/admin-context";
import { CourseStoreContext, type CourseStoreValue } from "@/lib/contexts/course-context";
import { SessionStoreContext, type SessionStoreValue } from "@/lib/contexts/session-context";
import { StudentStoreContext, type StudentStoreValue } from "@/lib/contexts/student-context";
import type {
  AdminEnrollmentPayload,
  AppState,
  AppStoreInitialData,
  LeadPayload,
  StudentPayload
} from "@/lib/contexts/store-types";

export type { AppStoreInitialData } from "@/lib/contexts/store-types";

/**
 * Interface pública agregada. Mantida por retrocompatibilidade: `useAppStore()`
 * compõe os quatro contextos de domínio e expõe o mesmo shape plano de antes.
 */
export type AppStoreValue = SessionStoreValue & CourseStoreValue & StudentStoreValue & AdminStoreValue;

const STORAGE_KEY = "rhcursos-demo-store-v4";

/**
 * Fallback de `courseCategories` quando não há catálogo real nem estado
 * atual: deriva das categorias do mock de cursos (não há mock dedicado).
 */
function deriveCourseCategoriesFromCourses(courses: Course[]): string[] {
  const categories = new Set<string>();
  for (const course of courses) {
    const values = course.categories?.length ? course.categories : course.category ? [course.category] : [];
    for (const value of values) categories.add(value);
  }
  return Array.from(categories).sort((a, b) => a.localeCompare(b, "pt-BR"));
}

type AdminMutation =
  | {
      resource: "courses" | "classes" | "students" | "instructors" | "blog" | "leads" | "enrollments";
      action: "upsert";
      payload: unknown;
    }
  | {
      resource: "students" | "enrollments";
      action: "create";
      payload: unknown;
    }
  | { resource: "courses" | "classes" | "students" | "instructors" | "blog" | "leads" | "enrollments"; action: "delete"; id: string }
  | { resource: "leads" | "enrollments"; action: "update-status"; id: string; status: string };

// Nasce vazio (sem mockCatalog/mockBlogPosts) até o bootstrap real completar
// (Story 16.1, AC4) — o catálogo público nunca deve exibir dado fictício
// como estado inicial de produção.
const initialState: AppState = {
  courses: [],
  classes: [],
  students: [],
  instructors: [],
  coursePublicContents: [],
  leads: [],
  enrollments: [],
  blogPosts: [],
  testimonials: [],
  trainingPaths: [],
  courseCategories: [],
  currentSession: null
};


const ARRAY_STATE_KEYS = [
  "courses",
  "classes",
  "students",
  "instructors",
  "coursePublicContents",
  "leads",
  "enrollments",
  "blogPosts",
  "testimonials",
  "trainingPaths",
  "courseCategories"
] as const satisfies readonly (keyof AppStoreInitialData)[];

type PublicCatalogSnapshot = Awaited<ReturnType<typeof fetchPublicCatalogFromSupabase>>;

function sanitizeInitialData(initialData?: AppStoreInitialData): AppStoreInitialData | undefined {
  if (!initialData) return initialData;

  const sanitized: AppStoreInitialData = { ...initialData };

  for (const key of ARRAY_STATE_KEYS) {
    if (key in sanitized && !Array.isArray(sanitized[key])) {
      delete sanitized[key];
    }
  }

  return sanitized;
}

/**
 * Sem fallback para mockCatalog (Story 16.1, AC5): uma busca bem-sucedida é
 * sempre a fonte da verdade, mesmo com 0 linhas — catálogo real vazio deve
 * aparecer vazio na UI, não ser mascarado por dado fictício. `catalog: null`
 * sinaliza falha de busca (rede/RLS/timeout): nesse caso preserva-se o que já
 * está em `current` (não regride para vazio nem substitui por mock); quem
 * chama é responsável por propagar o estado de erro visível (ver bootstrap
 * effect abaixo).
 */
function resolveCatalogBootstrapState(current: AppState, catalog: PublicCatalogSnapshot) {
  if (!catalog) {
    return {
      courses: current.courses,
      classes: current.classes,
      instructors: current.instructors,
      trainingPaths: current.trainingPaths,
      coursePublicContents: current.coursePublicContents,
      courseCategories: current.courseCategories
    };
  }

  return {
    courses: catalog.courses,
    classes: catalog.classes,
    instructors: catalog.instructors,
    trainingPaths: catalog.trainingPaths,
    coursePublicContents: catalog.coursePublicContents,
    courseCategories: catalog.courseCategories.length
      ? catalog.courseCategories
      : deriveCourseCategoriesFromCourses(catalog.courses)
  };
}

function readInitialState(initialSession?: CurrentSession | null, initialData?: AppStoreInitialData) {
  return {
    ...initialState,
    ...sanitizeInitialData(initialData),
    currentSession: initialSession ?? null
  };
}

function clearLegacyStoredState() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}

function getAdminSessionTokenValue() {
  const stored = getSessionToken();
  if (stored) return stored;
  return null;
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

function createRealtimeSubscription(
  client: NonNullable<typeof supabase>,
  channelName: string,
  table: string,
  isActive: () => boolean,
  onChange: () => void
) {
  return client
    .channel(channelName)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table },
      () => {
        if (!isActive()) return;
        onChange();
      }
    )
    .subscribe((status) => {
      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        console.error(`Real-time subscription failed for channel '${channelName}': ${status}`);
      }
    });
}

function upsertCollection<T extends { id: string }>(
  collection: T[],
  exists: boolean,
  nextItem: T
): T[] {
  return exists
    ? collection.map((item) => (item.id === nextItem.id ? nextItem : item))
    : [nextItem, ...collection];
}

function restoreDeletedItem<T extends { id: string }>(
  collection: T[],
  removedItem: T,
  removedIndex: number
): T[] {
  const next = [...collection];
  next.splice(Math.min(Math.max(removedIndex, 0), next.length), 0, removedItem);
  return next;
}

function leadNaturalKey(lead: Lead) {
  return `${lead.name.trim().toLowerCase()}|${lead.email.trim().toLowerCase()}`;
}

function mergeLeads(current: Lead[], incoming: Lead[]) {
  const byKey = new Map<string, Lead>();

  for (const lead of current) {
    byKey.set(leadNaturalKey(lead), lead);
  }

  for (const lead of incoming) {
    byKey.set(leadNaturalKey(lead), lead);
  }

  return Array.from(byKey.values()).sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );
}

function buildLeadRecord(payload: LeadPayload, fallback?: Partial<Lead>): Lead {
  return {
    ...payload,
    id: fallback?.id ?? `lead-${Date.now()}`,
    createdAt: fallback?.createdAt ?? new Date().toISOString(),
    status: fallback?.status ?? payload.status ?? "Novo",
  };
}

function parseAdminLeadConfirmation(payload: unknown): Pick<Lead, "id" | "createdAt" | "status"> {
  const ok =
    payload && typeof payload === "object" && "ok" in payload
      ? (payload as { ok?: unknown }).ok
      : undefined;
  const data =
    payload && typeof payload === "object" && "data" in payload
      ? (payload as { data?: unknown }).data
      : null;
  const row = data && typeof data === "object"
    ? (data as { id?: unknown; created_at?: unknown; status_crm?: unknown })
    : null;
  const statusByDatabaseValue: Record<string, Lead["status"]> = {
    Novo: "Novo",
    Contatado: "Em atendimento",
    EmAtendimento: "Em atendimento",
    PropostaEnviada: "Proposta enviada",
    Convertido: "Convertido",
    Perdido: "Perdido",
  };
  const id = typeof row?.id === "string" ? row.id.trim() : "";
  const createdAt = typeof row?.created_at === "string" ? row.created_at : "";
  const status = typeof row?.status_crm === "string"
    ? statusByDatabaseValue[row.status_crm]
    : undefined;

  if (ok !== true || !id || !createdAt || Number.isNaN(Date.parse(createdAt)) || !status) {
    throw new Error("Resposta inválida ao cadastrar o lead.");
  }

  return { id, createdAt, status };
}

function buildStudentRecord(
  payload: StudentPayload,
  fallback?: Partial<Student>
): Student {
  return {
    id: fallback?.id ?? `student-${Date.now()}`,
    name: payload.name,
    email: payload.email,
    phone: payload.phone ?? fallback?.phone ?? "",
    cpf: payload.cpf ?? fallback?.cpf ?? "",
    organization: payload.organization,
    jobTitle: payload.jobTitle ?? fallback?.jobTitle ?? "",
    courseId: payload.courseId ?? fallback?.courseId ?? "",
    classId: payload.classId ?? fallback?.classId ?? "",
    enrollmentStatus: payload.enrollmentStatus ?? fallback?.enrollmentStatus ?? "Pendente",
    certificateIssued: fallback?.certificateIssued ?? false,
    enrolledAt: fallback?.enrolledAt ?? new Date().toISOString(),
    paymentMethod: payload.paymentMethod ?? fallback?.paymentMethod ?? "Pix",
  };
}

function buildEnrollmentRecord(
  payload: AdminEnrollmentPayload,
  fallbackId?: string,
  fallbackStatus: Enrollment["status"] = "Confirmada"
): Enrollment {
  return {
    id: fallbackId ?? `enrollment-${Date.now()}`,
    studentName: payload.studentName,
    email: payload.email,
    phone: payload.phone,
    cpf: payload.cpf,
    organization: payload.organization,
    jobTitle: payload.jobTitle,
    enrollmentType: payload.enrollmentType,
    paymentMethod: payload.paymentMethod,
    courseId: payload.courseId,
    classId: payload.classId,
    status: payload.status ?? fallbackStatus,
    createdAt: new Date().toISOString(),
    notes: payload.notes ?? "",
  };
}

/**
 * Persiste a mutação via Edge Function e só reporta sucesso quando a escrita
 * de fato aconteceu. Rejeita em caso de falha — quem chama decide o que fazer
 * (ex.: manter o modal do admin aberto e mostrar o erro) em vez de a UI
 * declarar sucesso otimista sobre uma escrita que não aconteceu.
 */
function persistAdminMutation(
  mutation: AdminMutation,
  successMessage?: string
): Promise<{ id?: string } | undefined> {
  if (!isFunctionsConfigured) {
    if (successMessage) toast.success(successMessage);
    return Promise.resolve(undefined);
  }

  return invokeFunction("admin-resources", {
    body: mutation,
    sessionToken: getAdminSessionTokenValue() ?? undefined,
    ...(mutation.action === "delete" ? { keepalive: true } : {}),
  })
    .then(async (response) => {
      if (!response.ok) {
        const message = await getFunctionErrorMessage(
          response,
          "Não foi possível sincronizar a alteração com o Supabase."
        );
        toast.error(message);
        throw new Error(message);
      }
      if (successMessage) toast.success(successMessage);
      const body = (await response.json().catch(() => null)) as { data?: { id?: string } } | null;
      return body?.data;
    })
    .catch((error) => {
      const message = error instanceof Error ? error.message : "Não foi possível sincronizar a alteração com o Supabase.";
      throw new Error(message);
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

async function fetchAdminLeads(sessionToken: string): Promise<Lead[]> {
  const response = await invokeFunction("admin-resources", {
    body: {
      resource: "leads",
      action: "list",
    },
    sessionToken,
  });

  if (!response.ok) {
    throw new Error(await getFunctionErrorMessage(response, "Não foi possível carregar os leads."));
  }

  const payload = (await response.json().catch(() => null)) as
    | {
        data?: LeadRow[];
      }
    | null;

  return Array.isArray(payload?.data) ? payload.data.map(mapLead) : [];
}

function shouldUseLocalEnrollmentProxy() {
  if (typeof window === "undefined") return false;

  return (
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "localhost"
  );
}

export function AppStoreProvider({
  children,
  initialSession = null,
  initialData,
  bootstrapPublicData = true
}: PropsWithChildren<{
  initialSession?: CurrentSession | null;
  initialData?: AppStoreInitialData;
  bootstrapPublicData?: boolean;
}>) {
  const [state, setState] = useState<AppState>(() => readInitialState(initialSession, initialData));

  // Ref espelhando o state para callbacks estáveis lerem o valor atual sem
  // recriar sua identidade a cada mudança (evita re-renders em cascata).
  const stateRef = useRef(state);
  const logoutInProgressRef = useRef(false);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const catalogFetchVersionRef = useRef(0);

  useEffect(() => {
    clearLegacyStoredState();
  }, []);

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
    if (typeof window === "undefined") return;
    if (!state.currentSession && !getSessionToken()) return;

    let cancelled = false;

    const syncSession = async () => {
      if (logoutInProgressRef.current) return;

      try {
        const response = await fetch("/api/auth/session", {
          method: "GET",
          headers: { Accept: "application/json" },
          cache: "no-store",
        });

        if (cancelled) return;

        if (response.status === 401) {
          clearSessionToken();
          setState((current) =>
            current.currentSession ? { ...current, currentSession: null } : current
          );
          return;
        }

        if (!response.ok) return;

        const payload = (await response.json().catch(() => null)) as
          | {
              session?: CurrentSession;
              token?: string | null;
            }
          | null;

        const nextSession = payload?.session ?? null;
        if (!nextSession) return;

        // Preserva tokens reais já emitidos pelas Edge Functions administrativas.
        // O GET /api/auth/session retorna o token HMAC do cookie SSR, que não pode
        // substituir um token de sessão já pronto para `admin-resources`.
        if (payload?.token && !getSessionToken()) {
          setSessionToken(payload.token);
        }

        setState((current) => {
          if (
            current.currentSession?.role === nextSession.role &&
            current.currentSession?.email === nextSession.email &&
            current.currentSession?.name === nextSession.name
          ) {
            return current;
          }

          return { ...current, currentSession: nextSession };
        });
      } catch {
        // Mantém a sessão atual e tenta novamente na próxima interação visível.
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void syncSession();
      }
    };

    void syncSession();
    window.addEventListener("focus", syncSession);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void syncSession();
      }
    }, SESSION_ACTIVITY_SYNC_MS);

    return () => {
      cancelled = true;
      window.removeEventListener("focus", syncSession);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.clearInterval(intervalId);
    };
  }, [state.currentSession]);

  useEffect(() => {
    // Guard explícito de ambiente: subscriptions real-time dependem de WebSocket
    // do browser. Evita side effects de rede em SSR ou em ambientes sem window.
    if (typeof window === "undefined") return;
    if (!isSupabaseConfigured || !supabase) return;

    let active = true;
    const subscriptions: ReturnType<typeof supabase.channel>[] = [];
    const client = supabase;
    const publicTestBaselineEnabled = isExplicitPublicTestBaselineEnabled();

    const scheduleCatalogRefetch = debounce(() => {
      if (!active) return;
      catalogFetchVersionRef.current += 1;
      const fetchVersion = catalogFetchVersionRef.current;

      fetchPublicCatalogFromSupabase()
        .then((updated) => {
          if (!active || !updated || fetchVersion !== catalogFetchVersionRef.current) return;
          setState((current) => ({
            ...current,
            courses: updated.courses,
            classes: updated.classes,
            instructors: updated.instructors,
            trainingPaths: updated.trainingPaths,
            coursePublicContents: updated.coursePublicContents,
            courseCategories: updated.courseCategories.length ? updated.courseCategories : current.courseCategories
          }));
        })
        .catch(() => undefined);
    }, 300);

    const scheduleBlogRefetch = debounce(() => {
      if (!active) return;
      fetchPublicBlogPostsFromSupabase()
        .then((updated) => {
          if (!active || !updated) return;
          setState((current) => ({ ...current, blogPosts: updated }));
        })
        .catch(() => undefined);
    }, 300);

    const scheduleLeadRefetch = debounce(() => {
      if (!active) return;
      // REC-206: o refetch de leads disparado por realtime também trafega
      // exclusivamente pelo BFF same-origin (admin-resources leads/list,
      // HMAC via requireAdmin), nunca pelo cliente Supabase direto — este era
      // o contrato duplicado de leitura de leads e foi removido.
      const adminSessionToken = getAdminSessionTokenValue();
      if (!adminSessionToken) return;
      fetchAdminLeads(adminSessionToken)
        .then((updated) => {
          if (!active || !updated.length) return;
          setState((current) => ({ ...current, leads: mergeLeads(current.leads, updated) }));
        })
        .catch(() => undefined);
    }, 300);

    if (bootstrapPublicData) {
      Promise.all([
        fetchPublicCatalogFromSupabase(),
        fetchPublicBlogPostsFromSupabase()
      ])
        .then(([catalog, blogPosts]) => {
          if (!active) return;

          setState((current) => ({
            ...current,
            ...resolveCatalogBootstrapState(current, catalog),
            blogPosts: blogPosts ?? []
          }));

          // Real-time subscriptions para cursos após dados iniciais carregarem
          if (active && supabase && !publicTestBaselineEnabled) {
            const courseSub = createRealtimeSubscription(
              supabase,
              "curso_changes",
              "curso",
              () => active,
              scheduleCatalogRefetch
            );

            // Real-time subscriptions para blog posts
            const blogSub = createRealtimeSubscription(
              supabase,
              "blog_changes",
              "post_blog",
              () => active,
              scheduleBlogRefetch
            );

            // Real-time para instrutores (dado público do catálogo). Refetch do
            // catálogo completo mantém cursos/turmas/instrutores consistentes.
            const instructorSub = createRealtimeSubscription(
              supabase,
              "instrutor_changes",
              "instrutor",
              () => active,
              scheduleCatalogRefetch
            );

            const courseContentSub = createRealtimeSubscription(
              supabase,
              "curso_public_content_changes",
              "curso_public_content",
              () => active,
              scheduleCatalogRefetch
            );

            subscriptions.push(courseSub, blogSub, instructorSub, courseContentSub);
          }
        })
        .catch((error) => {
          if (!active) return;
          // Erro de rede/RLS/timeout: propaga um estado de erro visível (log +
          // toast) em vez de mascarar com dado mock (Story 16.1, AC5).
          // Preserva o catálogo/blog atual em memória — não regride para vazio.
          console.error("Falha ao carregar catálogo público do Supabase:", error);
          toast.error("Não foi possível atualizar o catálogo de cursos. Tente novamente em instantes.");
          setState((current) => ({
            ...current,
            ...resolveCatalogBootstrapState(current, null)
          }));
        });
    }

    // Lazy load admin data apenas quando há sessão ativa
    const adminSessionToken = getAdminSessionTokenValue();

    if (adminSessionToken) {
      fetchAdminLeads(adminSessionToken)
        .then((leads) => {
          if (!active || !leads.length) return;
          setState((current) => ({ ...current, leads: mergeLeads(current.leads, leads) }));
        })
        .catch(() => undefined);
    }

    const stored = getSupabaseSession();
    if (stored && supabase) {
      supabase.auth
        .setSession({
          access_token: stored.access_token,
          refresh_token: stored.refresh_token,
        })
        .then(({ error }) => {
          if (!active || error || !supabase) return;

          // REC-206: a leitura de leads é servida exclusivamente pelo BFF
          // same-origin (fetchAdminLeads, acima). A sessão Supabase Auth aqui
          // habilita apenas as subscriptions realtime sob RLS — o contrato
          // duplicado de leitura de leads via cliente Supabase direto foi
          // removido. A consolidação do transporte realtime (WebSocket direto
          // ao Supabase) permanece fora do escopo desta story.
          const leadSub = createRealtimeSubscription(
            supabase,
            "lead_changes",
            "lead",
            () => active,
            scheduleLeadRefetch
          );

          subscriptions.push(leadSub);

          // O bootstrap administrativo contém também registros inativos.
          // Um refetch público não pode substituir esse conjunto por uma
          // visão RLS reduzida após eventos de inscrição/aluno.
          if (bootstrapPublicData) {
            // Mudanças em inscrição afetam a capacidade das turmas (vagas),
            // por isso refetch do catálogo para reconciliar as contagens.
            const enrollmentSub = createRealtimeSubscription(
              supabase,
              "inscricao_changes",
              "inscricao",
              () => active,
              scheduleCatalogRefetch
            );

            // Alterações em aluno podem refletir nas estatísticas do catálogo
            // (total de alunos por curso).
            const studentSub = createRealtimeSubscription(
              supabase,
              "aluno_changes",
              "aluno",
              () => active,
              scheduleCatalogRefetch
            );

            subscriptions.push(enrollmentSub, studentSub);
          }
        })
        .catch(() => undefined);
    }

    return () => {
      active = false;
      // Cleanup todas as subscriptions
      subscriptions.forEach(channel => {
        client.removeChannel(channel);
      });
    };
  }, [bootstrapPublicData]);

  const setSession = useCallback<AppStoreValue["setSession"]>((session) => {
    logoutInProgressRef.current = false;
    setState((current) => ({ ...current, currentSession: session }));
    toast.success("Login realizado.");
  }, []);

  const logout = useCallback<AppStoreValue["logout"]>(() => {
    logoutInProgressRef.current = true;
    const accessToken = getSupabaseSession()?.access_token;
    const notifyLocalOnlyFallback = () => {
      toast.success("Sessão local encerrada.");
      if (accessToken) {
        toast.error("Não foi possível confirmar a revogação global da sessão.");
      }
    };

    void (async () => {
      try {
        const clientIp = getStableClientIp();
        const response = await fetch("/api/auth/session", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "cf-connecting-ip": clientIp,
            "x-forwarded-for": clientIp,
            "x-real-ip": clientIp
          },
          body: JSON.stringify({ accessToken })
        });

        if (!response.ok) {
          notifyLocalOnlyFallback();
          return;
        }

        const payload = (await response.json().catch(() => null)) as
          | { mode?: "global" | "local-only"; revoked?: boolean }
          | null;

        if (payload?.mode === "global" && payload.revoked) {
          toast.success("Sessão global encerrada.");
          return;
        }

        notifyLocalOnlyFallback();
      } catch {
        notifyLocalOnlyFallback();
      } finally {
        clearSessionToken();
        setState((current) => (current.currentSession ? { ...current, currentSession: null } : current));
      }
    })();

    if (supabase) {
      void supabase.auth.signOut().catch(() => undefined);
    }
    clearSessionToken();
    setState((current) => ({ ...current, currentSession: null }));
  }, []);

  const createEnrollment = useCallback<AppStoreValue["createEnrollment"]>(async (payload) => {
    let response: Response;

    if (shouldUseLocalEnrollmentProxy()) {
      response = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else if (isFunctionsConfigured) {
      response = await invokeFunction("enrollments", { body: payload });
    } else {
      throw new Error("Pré-inscrição indisponível no momento.");
    }

    if (!response.ok) {
      throw new Error(await getFunctionErrorMessage(response, "Não foi possível enviar a pré-inscrição."));
    }

    const responsePayload = await response.json().catch(() => null);
    const parsedReceipt = enrollmentReceiptSchema.safeParse(responsePayload);
    if (!parsedReceipt.success) {
      throw new Error("Resposta inválida ao enviar a pré-inscrição.");
    }

    const receipt = {
      enrollmentId: parsedReceipt.data.enrollmentId,
      classId: parsedReceipt.data.classId,
    };
    const createdAt = new Date().toISOString();

    setState((current) => {
      const enrollments = [
        {
          id: receipt.enrollmentId,
          createdAt,
          status: "Pendente" as const,
          ...payload,
          classId: receipt.classId,
          paymentMethod: null,
        },
        ...current.enrollments
      ];

      return {
        ...current,
        enrollments,
        students: current.students,
        classes: current.classes,
      };
    });

    return receipt;
  }, []);

  const createStudent = useCallback<AppStoreValue["createStudent"]>(async (payload) => {
    const persisted = await persistAdminMutation(
      { resource: "students", action: "create", payload },
      undefined
    );
    const persistedId = typeof persisted?.id === "string" ? persisted.id.trim() : "";

    if (isFunctionsConfigured && !persistedId) {
      throw new Error("Resposta inválida ao criar o aluno.");
    }

    setState((current) => ({
      ...current,
      students: [
        buildStudentRecord(payload, {
          id: persistedId || undefined,
          courseId: payload.courseId ?? current.courses[0]?.id ?? "",
          classId: payload.classId ?? current.classes[0]?.id ?? "",
        }),
        ...current.students,
      ],
    }));
    toast.success(isFunctionsConfigured ? "Aluno criado." : "Aluno registrado apenas nesta sessão de desenvolvimento.");
  }, []);

  const deleteStudent = useCallback<AppStoreValue["deleteStudent"]>(async (id) => {
    const snapshot = stateRef.current.students;
    const removedIndex = snapshot.findIndex((item) => item.id === id);
    const removedItem = removedIndex >= 0 ? snapshot[removedIndex] : null;

    setState((current) => ({
      ...current,
      students: current.students.filter((item) => item.id !== id),
    }));

    try {
      await persistAdminMutation({ resource: "students", action: "delete", id }, undefined);
    } catch (error) {
      if (removedItem) {
        setState((current) => ({
          ...current,
          students: restoreDeletedItem(current.students, removedItem, removedIndex),
        }));
      }
      throw error;
    }
    toast.success("Aluno excluído.");
  }, []);

  const createEnrollmentAdmin = useCallback<AppStoreValue["createEnrollmentAdmin"]>(async (payload) => {
    const result = await persistAdminMutation(
      { resource: "enrollments", action: "create", payload },
      undefined
    );
    setState((current) => {
      const student = buildStudentRecord(
        {
          name: payload.studentName,
          email: payload.email,
          phone: payload.phone,
          cpf: payload.cpf,
          organization: payload.organization,
          jobTitle: payload.jobTitle,
          enrollmentStatus: payload.status ?? "Confirmada",
          courseId: payload.courseId,
          classId: payload.classId,
          paymentMethod: payload.paymentMethod,
        },
        {
          courseId: payload.courseId,
          classId: payload.classId,
          enrolledAt: new Date().toISOString(),
        }
      );
      const enrollment = buildEnrollmentRecord(payload, result?.id);
      const nextEnrollments = [enrollment, ...current.enrollments];

      return {
        ...current,
        enrollments: nextEnrollments,
        students: [student, ...current.students],
        classes: current.classes.map((item) => {
          if (item.id !== payload.classId) return item;
          const capacity = deriveClassCapacity(item, nextEnrollments);
          return {
            ...item,
            ...capacity,
            status: capacity.availableSeats <= 5 ? "Poucas vagas" : item.status,
          };
        }),
      };
    });

    toast.success(isFunctionsConfigured ? "Inscrição criada." : "Inscrição criada apenas nesta sessão de desenvolvimento.");
  }, []);

  const deleteEnrollment = useCallback<AppStoreValue["deleteEnrollment"]>(async (id) => {
    const snapshot = stateRef.current.enrollments;
    const removedIndex = snapshot.findIndex((item) => item.id === id);
    const removedItem = removedIndex >= 0 ? snapshot[removedIndex] : null;

    setState((current) => {
      const enrollment = current.enrollments.find((item) => item.id === id);
      const nextEnrollments = current.enrollments.filter((item) => item.id !== id);

      return {
        ...current,
        enrollments: nextEnrollments,
        classes: enrollment
          ? current.classes.map((item) => {
              if (item.id !== enrollment.classId) return item;
              const capacity = deriveClassCapacity(item, nextEnrollments);
              return {
                ...item,
                ...capacity,
                status: capacity.availableSeats <= 5 ? "Poucas vagas" : item.status,
              };
            })
          : current.classes,
      };
    });

    try {
      await persistAdminMutation({ resource: "enrollments", action: "delete", id }, undefined);
    } catch (error) {
      if (removedItem) {
        setState((current) => ({
          ...current,
          enrollments: restoreDeletedItem(current.enrollments, removedItem, removedIndex),
          classes: current.classes.map((item) => ({
            ...item,
            ...deriveClassCapacity(item, restoreDeletedItem(current.enrollments, removedItem, removedIndex)),
          })),
        }));
      }
      throw error;
    }
    toast.success("Inscrição excluída.");
  }, []);

  const deleteLead = useCallback<AppStoreValue["deleteLead"]>(async (id) => {
    const snapshot = stateRef.current.leads;
    const removedIndex = snapshot.findIndex((item) => item.id === id);
    const removedItem = removedIndex >= 0 ? snapshot[removedIndex] : null;

    setState((current) => ({
      ...current,
      leads: current.leads.filter((item) => item.id !== id),
    }));

    try {
      await persistAdminMutation({ resource: "leads", action: "delete", id }, undefined);
    } catch (error) {
      if (removedItem) {
        setState((current) => ({
          ...current,
          leads: restoreDeletedItem(current.leads, removedItem, removedIndex),
        }));
      }
      throw error;
    }
    toast.success("Lead excluído.");
  }, []);

  const createLead = useCallback<AppStoreValue["createLead"]>(async (payload) => {
    const adminSessionToken = getAdminSessionTokenValue() ?? undefined;
    const usedAdminMutation = Boolean(isFunctionsConfigured && adminSessionToken);
    let confirmedLead: Pick<Lead, "id" | "createdAt" | "status"> | undefined;

    if (!isFunctionsConfigured && process.env.NODE_ENV === "production") {
      throw new Error("Serviço de atendimento indisponível. Tente novamente mais tarde.");
    }

    if (usedAdminMutation) {
      let response: Response;

      try {
        response = await invokeFunction("admin-resources", {
          body: {
            resource: "leads",
            action: "create",
            payload: {
              ...payload,
              status: "Novo",
            },
          },
          sessionToken: adminSessionToken,
        });
      } catch {
        throw new Error("Serviço indisponível no momento. A solicitação não foi enviada.");
      }

      if (!response.ok) {
        throw new Error(await getFunctionErrorMessage(response, "Não foi possível cadastrar o lead."));
      }

      const responsePayload = await response.json().catch(() => null);
      confirmedLead = parseAdminLeadConfirmation(responsePayload);
    }

    if (isFunctionsConfigured && !usedAdminMutation) {
      let response: Response;

      try {
        response = await invokeFunction("leads", { body: payload });
      } catch {
        throw new Error("Serviço indisponível no momento. A solicitação não foi enviada.");
      }

      if (!response.ok) {
        throw new Error(await getFunctionErrorMessage(response, "Não foi possível cadastrar o lead."));
      }
    }

    startTransition(() => {
      setState((current) => ({
        ...current,
        leads: mergeLeads(current.leads, [buildLeadRecord(payload, confirmedLead)])
      }));
    });
  }, []);

  const updateLeadStatus = useCallback<AppStoreValue["updateLeadStatus"]>((id, status) => {
    setState((current) => ({
      ...current,
      leads: current.leads.map((lead) => (lead.id === id ? { ...lead, status } : lead))
    }));
    return persistAdminMutation({ resource: "leads", action: "update-status", id, status }, "Status do lead atualizado.").then(() => undefined);
  }, []);

  const updateLead = useCallback<AppStoreValue["updateLead"]>((payload) => {
    setState((current) => ({
      ...current,
      leads: current.leads.map((lead) => (lead.id === payload.id ? { ...lead, ...payload } : lead))
    }));
    return persistAdminMutation({ resource: "leads", action: "upsert", payload }, "Lead atualizado.").then(() => undefined);
  }, []);

  const upsertCourse = useCallback<AppStoreValue["upsertCourse"]>(async (course) => {
    const snapshot = stateRef.current;
    const trainingPaths = snapshot.trainingPaths;
    const defaultPath = trainingPaths[0];
    const resolvedPathId = course.pathId ?? defaultPath?.id ?? "";
    const exists = course.id && snapshot.courses.some((item) => item.id === course.id);
    const resolvedModalities = course.modalities?.length
      ? course.modalities
      : course.modality
        ? [course.modality]
        : ["Ao vivo online"];
    const primaryModality = resolvedModalities[0] ?? "Ao vivo online";
    const nextCourse: Course = exists
      ? ({
          ...snapshot.courses.find((item) => item.id === course.id)!,
          ...course,
          modality: primaryModality,
          modalities: resolvedModalities
        } as Course)
      : ({
          id: `course-${Date.now()}`,
          slug: slugify(course.title ?? "novo-curso"),
          title: course.title ?? "Novo curso",
          pathId: resolvedPathId,
          pathName:
            trainingPaths.find((item) => item.id === resolvedPathId)?.name ??
            defaultPath?.name ??
            "",
          modality: primaryModality,
          modalities: resolvedModalities,
          durationLabel: course.durationLabel ?? "8h",
          durationHours: course.durationHours ?? 8,
          level: course.level ?? "Básico",
          category: course.category ?? course.categories?.[0] ?? defaultPath?.shortName ?? "",
          categories:
            course.categories ??
            (course.category
              ? [course.category]
              : defaultPath?.shortName
                ? [defaultPath.shortName]
                : []),
          price: course.price ?? 0,
          shortDescription: course.shortDescription ?? "Descrição curta do curso.",
          fullDescription: course.fullDescription ?? "Descrição completa do curso.",
          targetAudience: course.targetAudience ?? ["Profissionais"],
          objectives: course.objectives ?? ["Objetivo principal"],
          benefits: course.benefits ?? ["Material de apoio"],
          modules: course.modules ?? [],
          instructorId: course.instructorId ?? snapshot.instructors[0]?.id ?? "inst-1",
          image: course.image ?? courseCoverByPath[resolvedPathId] ?? defaultCourseCover,
          rating: course.rating ?? 0,
          studentsCount: course.studentsCount ?? 0,
          status: course.status ?? "Ativo",
          featured: course.featured ?? false,
          featuredCourseIds: course.featuredCourseIds ?? [],
          nextClassId: course.nextClassId ?? snapshot.classes[0]?.id ?? ""
        } as Course);

    await persistAdminMutation(
      { resource: "courses", action: "upsert", payload: nextCourse },
      course.id ? "Curso editado." : "Curso criado no admin."
    );
    setState((current) => ({
      ...current,
      courses: upsertCollection(current.courses, Boolean(exists), nextCourse)
    }));
  }, []);

  const deleteCourse = useCallback<AppStoreValue["deleteCourse"]>(async (id) => {
    const snapshot = stateRef.current.courses;
    const removedIndex = snapshot.findIndex((item) => item.id === id);
    const removedItem = removedIndex >= 0 ? snapshot[removedIndex] : null;

    setState((current) => ({
      ...current,
      courses: current.courses.filter((item) => item.id !== id)
    }));

    try {
      await persistAdminMutation({ resource: "courses", action: "delete", id }, "Curso excluído.");
    } catch (error) {
      if (removedItem) {
        setState((current) => ({
          ...current,
          courses: restoreDeletedItem(current.courses, removedItem, removedIndex),
        }));
      }
      throw error;
    }
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

  const upsertClass = useCallback<AppStoreValue["upsertClass"]>(async (trainingClass) => {
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
          instructorId: trainingClass.instructorId ?? "",
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

    await persistAdminMutation(
      { resource: "classes", action: "upsert", payload: nextClass },
      trainingClass.id ? "Turma editada." : "Turma criada."
    );
    setState((current) => ({
      ...current,
      classes: upsertCollection(current.classes, Boolean(exists), nextClass)
    }));
  }, []);

  const deleteClass = useCallback<AppStoreValue["deleteClass"]>(async (id) => {
    const snapshot = stateRef.current.classes;
    const removedIndex = snapshot.findIndex((item) => item.id === id);
    const removedItem = removedIndex >= 0 ? snapshot[removedIndex] : null;

    setState((current) => ({
      ...current,
      classes: current.classes.filter((item) => item.id !== id)
    }));

    try {
      await persistAdminMutation({ resource: "classes", action: "delete", id }, "Turma excluída.");
    } catch (error) {
      if (removedItem) {
        setState((current) => ({
          ...current,
          classes: restoreDeletedItem(current.classes, removedItem, removedIndex),
        }));
      }
      throw error;
    }
  }, []);

  const upsertInstructor = useCallback<AppStoreValue["upsertInstructor"]>(async (instructor) => {
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
            (instructor.name ? getInitials(instructor.name) : undefined) ??
            "NI",
          status: instructor.status ?? "Ativo"
        } as Instructor);

    await persistAdminMutation(
      { resource: "instructors", action: "upsert", payload: nextInstructor },
      instructor.id ? "Instrutor editado." : "Instrutor criado."
    );
    setState((current) => ({
      ...current,
      instructors: upsertCollection(current.instructors, Boolean(exists), nextInstructor)
    }));
  }, []);

  const deleteInstructor = useCallback<AppStoreValue["deleteInstructor"]>(async (id) => {
    const snapshot = stateRef.current.instructors;
    const removedIndex = snapshot.findIndex((item) => item.id === id);
    const removedItem = removedIndex >= 0 ? snapshot[removedIndex] : null;

    setState((current) => ({
      ...current,
      instructors: current.instructors.filter((item) => item.id !== id)
    }));

    try {
      await persistAdminMutation({ resource: "instructors", action: "delete", id }, "Instrutor excluído.");
    } catch (error) {
      if (removedItem) {
        setState((current) => ({
          ...current,
          instructors: restoreDeletedItem(current.instructors, removedItem, removedIndex),
        }));
      }
      throw error;
    }
  }, []);

  const updateStudent = useCallback<AppStoreValue["updateStudent"]>((student) => {
    setState((current) => ({
      ...current,
      students: current.students.map((item) => (item.id === student.id ? { ...item, ...student } : item))
    }));
    return persistAdminMutation({ resource: "students", action: "upsert", payload: student }, "Aluno atualizado.").then(() => undefined);
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
    return persistAdminMutation(
      { resource: "enrollments", action: "update-status", id, status },
      "Status da inscrição atualizado."
    ).then(() => undefined);
  }, []);

  const upsertBlogPost = useCallback<AppStoreValue["upsertBlogPost"]>(async (post) => {
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
          relatedCourseId: post.relatedCourseId ?? ""
        } as BlogPost);

    await persistAdminMutation(
      { resource: "blog", action: "upsert", payload: nextPost },
      post.id ? "Post atualizado." : "Post publicado."
    );
    startTransition(() => {
      setState((current) => ({
        ...current,
        blogPosts: upsertCollection(current.blogPosts, Boolean(exists), nextPost)
      }));
    });
  }, []);

  const deleteBlogPost = useCallback<AppStoreValue["deleteBlogPost"]>(async (id) => {
    const snapshot = stateRef.current.blogPosts;
    const removedIndex = snapshot.findIndex((item) => item.id === id);
    const removedItem = removedIndex >= 0 ? snapshot[removedIndex] : null;

    setState((current) => ({
      ...current,
      blogPosts: current.blogPosts.filter((item) => item.id !== id)
    }));

    try {
      await persistAdminMutation({ resource: "blog", action: "delete", id }, "Post excluído.");
    } catch (error) {
      if (removedItem) {
        setState((current) => ({
          ...current,
          blogPosts: restoreDeletedItem(current.blogPosts, removedItem, removedIndex),
        }));
      }
      throw error;
    }
  }, []);

  const resetStore = useCallback<AppStoreValue["resetStore"]>(() => {
    setState((current) => ({ ...initialState, currentSession: current.currentSession }));
    window.localStorage.removeItem(STORAGE_KEY);
    toast.success("Estado da aplicação limpo.");
  }, []);

  // Fatias memoizadas por domínio. Cada slice só muda quando os dados ou as
  // ações daquele domínio mudam — como o estado é atualizado por spread
  // imutável, as referências das demais fatias permanecem estáveis e seus
  // consumidores não re-renderizam. Esse é o ganho de performance do split.
  const sessionValue = useMemo<SessionStoreValue>(
    () => ({
      currentSession: state.currentSession,
      setSession,
      logout
    }),
    [state.currentSession, setSession, logout]
  );

  const courseValue = useMemo<CourseStoreValue>(
    () => ({
      courses: state.courses,
      classes: state.classes,
      instructors: state.instructors,
      trainingPaths: state.trainingPaths,
      courseCategories: state.courseCategories,
      coursePublicContents: state.coursePublicContents,
      testimonials: state.testimonials,
      upsertCourse,
      deleteCourse,
      duplicateCourse,
      upsertClass,
      deleteClass,
      upsertInstructor,
      deleteInstructor
    }),
    [
      state.courses,
      state.classes,
      state.instructors,
      state.trainingPaths,
      state.courseCategories,
      state.coursePublicContents,
      state.testimonials,
      upsertCourse,
      deleteCourse,
      duplicateCourse,
      upsertClass,
      deleteClass,
      upsertInstructor,
      deleteInstructor
    ]
  );

  const studentValue = useMemo<StudentStoreValue>(
    () => ({
      students: state.students,
      enrollments: state.enrollments,
      createEnrollment,
      createEnrollmentAdmin,
      createStudent,
      updateStudent,
      deleteStudent,
      updateEnrollmentStatus,
      deleteEnrollment
    }),
    [
      state.students,
      state.enrollments,
      createEnrollment,
      createEnrollmentAdmin,
      createStudent,
      updateStudent,
      deleteStudent,
      updateEnrollmentStatus,
      deleteEnrollment
    ]
  );

  const adminValue = useMemo<AdminStoreValue>(
    () => ({
      leads: state.leads,
      blogPosts: state.blogPosts,
      createLead,
      updateLeadStatus,
      updateLead,
      deleteLead,
      createStudent,
      deleteStudent,
      createEnrollmentAdmin,
      deleteEnrollment,
      upsertBlogPost,
      deleteBlogPost,
      resetStore
    }),
    [
      state.leads,
      state.blogPosts,
      createLead,
      updateLeadStatus,
      updateLead,
      deleteLead,
      createStudent,
      deleteStudent,
      createEnrollmentAdmin,
      deleteEnrollment,
      upsertBlogPost,
      deleteBlogPost,
      resetStore
    ]
  );

  return (
    <SessionStoreContext.Provider value={sessionValue}>
      <CourseStoreContext.Provider value={courseValue}>
        <StudentStoreContext.Provider value={studentValue}>
          <AdminStoreContext.Provider value={adminValue}>{children}</AdminStoreContext.Provider>
        </StudentStoreContext.Provider>
      </CourseStoreContext.Provider>
    </SessionStoreContext.Provider>
  );
}

/**
 * Hook agregado de retrocompatibilidade. Compõe os quatro contextos de domínio
 * no mesmo shape plano histórico. Componentes que precisam de um único domínio
 * devem preferir os hooks específicos (`useCourseStore`, `useStudentStore`,
 * `useAdminStore`, `useSessionStore`) para isolar re-renders.
 */
export function useAppStore(): AppStoreValue {
  const session = useContext(SessionStoreContext);
  const course = useContext(CourseStoreContext);
  const student = useContext(StudentStoreContext);
  const admin = useContext(AdminStoreContext);

  if (!session || !course || !student || !admin) {
    throw new Error("useAppStore must be used within AppStoreProvider");
  }

  return useMemo(
    () => ({ ...session, ...course, ...student, ...admin }),
    [session, course, student, admin]
  );
}

export { useSessionStore } from "@/lib/contexts/session-context";
export { useCourseStore, useCourseBySlug } from "@/lib/contexts/course-context";
export { useStudentStore } from "@/lib/contexts/student-context";
export { useAdminStore } from "@/lib/contexts/admin-context";

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
