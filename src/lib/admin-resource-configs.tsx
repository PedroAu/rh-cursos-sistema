import {
  BookOpen,
  CalendarCheck,
  Clock,
  FileText,
  type LucideIcon,
  Newspaper,
  Tag,
  Target,
  TrendingUp,
  UserCheck,
  Users,
  UserX,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { SeatProgress } from "@/components/admin/seat-progress";
import { UserCell } from "@/components/admin/user-cell";
import { useAppStore } from "@/lib/app-store";
import { toOccupancyPercent } from "@/lib/occupancy";
import {
  COURSE_LEVEL_OPTIONS,
  COURSE_MODALITY_OPTIONS,
  COURSE_STATUS_OPTIONS,
} from "@/lib/domain/course-enums";
import {
  validateBlogPost,
  validateClass,
  validateCourse,
  validateEnrollmentCreate,
  validateEnrollment,
  validateInstructor,
  validateLead,
  validateStudent,
  type ValidationError,
} from "@/lib/admin-form-validation";
import type {
  BlogPost,
  Course,
  CourseModule,
  Enrollment,
  Instructor,
  Lead,
  Student,
  TrainingClass,
  TrainingPath,
} from "@/types";

// O form state genérico (ConfigDeps.form) é Record<string, unknown> — os
// inputs guardam string (text/select/date), number (number) ou string[]
// (array/multiselect). Estes helpers normalizam para o tipo esperado nos
// pontos de leitura, em vez de confiar em `any`.
function str(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return "";
}
function optStr(value: unknown): string | undefined {
  const result = str(value);
  return result ? result : undefined;
}
function strArr(value: unknown): string[] {
  return Array.isArray(value) ? value.map((item) => String(item)) : [];
}
function numOrUndef(value: unknown): number | undefined {
  if (value === "" || value === undefined || value === null) return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}
function modulesArr(value: unknown): CourseModule[] {
  return Array.isArray(value) ? (value as CourseModule[]) : [];
}

export type ResourceKey =
  | "courses"
  | "classes"
  | "students"
  | "leads"
  | "enrollments"
  | "instructors"
  | "blog";

export type FieldConfig = {
  key: string;
  label: string;
  type?:
    | "text"
    | "textarea"
    | "select"
    | "array"
    | "modules"
    | "multiselect"
    | "number"
    | "date"
    | "file"
    | "readonly";
  options?: Array<{ value: string; label: string }>;
  /** Sugestões (datalist) para campos `type: "array"` — não restringe, só orienta. */
  suggestions?: string[];
  required?: boolean;
  section?: string;
};

export type ColumnConfig<T> = {
  key: string;
  label: string;
  render: (row: T) => React.ReactNode;
  /** Valor textual usado no export CSV quando `render` produz markup composto. */
  exportValue?: (row: T) => string;
};

export type ResourceStat = {
  label: string;
  value: string;
  helper: string;
  icon?: LucideIcon;
};

export type ResourceConfig = {
  title: string;
  description: string;
  rows: Array<{ id: string }>;
  /** Stats bento opcionais — substituem os cards genéricos quando presentes. */
  stats?: ResourceStat[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnConfig<any>[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onEdit: (row: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onDelete?: (row: any) => void;
  onSave: () => Promise<void>;
  fields: FieldConfig[];
};

type ConfigDeps = {
  search: string;
  editingId: string | null;
  form: Record<string, unknown>;
  setForm: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
  setEditingId: (id: string | null) => void;
  setValidationErrors: (errors: ValidationError[]) => void;
  setOpen: (open: boolean) => void;
};

import React from "react";

function normalizeDateTimeForStorage(value?: string, fallbackHour = "09:00:00.000Z") {
  if (!value) return new Date().toISOString();
  return `${value}T${fallbackHour}`;
}

function formatAdminDate(value?: string) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getBadgeVariant(value: string) {
  if (
    value === "Confirmada" ||
    value === "Concluída" ||
    value === "Ativo" ||
    value === "Publicado" ||
    value === "Convertido" ||
    value === "Inscrições abertas"
  ) {
    return "success" as const;
  }

  if (
    value === "Aguardando pagamento" ||
    value === "Poucas vagas" ||
    value === "Em atendimento" ||
    value === "Em breve"
  ) {
    return "warning" as const;
  }

  if (
    value === "Cancelada" ||
    value === "Inativo" ||
    value === "Arquivado" ||
    value === "Perdido" ||
    value === "Encerrada"
  ) {
    return "danger" as const;
  }

  return "muted" as const;
}

function renderStatusBadge(value: string) {
  return <Badge variant={getBadgeVariant(value)}>{value}</Badge>;
}

function deriveEnrollmentOperationalStatus(
  enrollment: Enrollment,
  trainingClass?: TrainingClass
) {
  if (enrollment.status === "Cancelada") return "Cancelada pelo atendimento.";
  if (enrollment.status === "Concluída") return "Concluída e pronta para pós-curso.";

  if (!trainingClass) {
    return `${enrollment.status} com turma não localizada.`;
  }

  const now = Date.now();
  const startsAt = new Date(trainingClass.startDate).getTime();
  const endsAt = new Date(trainingClass.endDate).getTime();

  if (enrollment.status === "Confirmada") {
    if (endsAt < now) return "Confirmada em turma encerrada. Revisar conclusão.";
    if (startsAt <= now) return "Confirmada em turma em andamento.";
    return "Confirmada para turma futura.";
  }

  if (enrollment.status === "Aguardando pagamento") {
    if (startsAt <= now) return "Pagamento pendente com turma em andamento.";
    return "Pagamento pendente antes do início da turma.";
  }

  if (enrollment.status === "Pendente") {
    if (startsAt <= now) return "Aguardando confirmação com turma ativa.";
    return "Aguardando confirmação comercial.";
  }

  return enrollment.status;
}

export function buildResourceConfig(
  resource: ResourceKey,
  store: ReturnType<typeof useAppStore>,
  deps: ConfigDeps
): ResourceConfig {
  const { search, editingId, form, setForm, setEditingId, setValidationErrors, setOpen } = deps;

  switch (resource) {
    case "courses": {
      const rows = store.courses.filter((item) =>
        item.title.toLowerCase().includes(search.toLowerCase())
      );
      const pathOptions =
        store.trainingPaths?.map((p: TrainingPath) => ({ value: p.id, label: p.name })) || [];
      const categoryOptions = store.courseCategories ?? [];
      const modalityOptions = COURSE_MODALITY_OPTIONS;
      const featuredCourseOptions = store.courses.map((course) => ({ value: course.id, label: course.title }));
      const statusOptions = COURSE_STATUS_OPTIONS;

      const activeCourses = store.courses.filter((item) => item.status === "Ativo" || item.status === "Destaque").length;
      const enrolledStudents = store.students.length;
      const upcomingClasses = store.classes.filter((item) => {
        const startsAt = new Date(item.startDate).getTime();
        return startsAt >= Date.now();
      }).length;
      const completedEnrollments = store.enrollments.filter((item) => item.status === "Concluída").length;
      const totalEnrollments = store.enrollments.length;
      const completionRate = totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0;

      return {
        title: "Gestão de cursos",
        description: "Criar, editar, duplicar, ativar e organizar cursos da plataforma.",
        rows,
        stats: [
          {
            label: "Cursos ativos",
            value: String(activeCourses),
            helper: "Cursos com status Ativo ou Destaque.",
            icon: BookOpen,
          },
          {
            label: "Alunos matriculados",
            value: String(enrolledStudents),
            helper: "Alunos com ao menos uma inscrição.",
            icon: Users,
          },
          {
            label: "Turmas futuras",
            value: String(upcomingClasses),
            helper: "Turmas com início agendado.",
            icon: CalendarCheck,
          },
          {
            label: "Taxa de conclusão",
            value: `${completionRate}%`,
            helper: "Inscrições concluídas sobre o total.",
            icon: TrendingUp,
          },
        ],
        columns: [
          { key: "title", label: "Curso", render: (row: Course) => row.title },
          { key: "pathName", label: "Trilha", render: (row: Course) => row.pathName },
          { key: "modality", label: "Modalidade", render: (row: Course) => <Badge variant="muted">{row.modality}</Badge> },
          { key: "status", label: "Status", render: (row: Course) => renderStatusBadge(row.status) },
        ],
        onEdit: (row: Course) => {
          setEditingId(row.id);
          setForm({
            title: row.title,
            pathId: row.pathId,
            modalities: row.modalities?.length ? row.modalities : [row.modality],
            durationLabel: row.durationLabel,
            price: String(row.price),
            status: row.status,
            shortDescription: row.shortDescription,
            fullDescription: row.fullDescription,
            image: row.image,
            level: row.level,
            targetAudience: row.targetAudience || [],
            categories: row.categories?.length ? row.categories : row.category ? [row.category] : [],
            featuredCourseIds: row.featuredCourseIds || [],
            featured: row.featured ? "Sim" : "Não",
            objectives: row.objectives || [],
            benefits: row.benefits || [],
            modules: row.modules || [],
          });
          setValidationErrors([]);
          setOpen(true);
        },
        onDelete: (row: Course) => store.deleteCourse(row.id),
        onSave: async () => {
          const modalities = strArr(form.modalities);
          const categories = strArr(form.categories);
          const targetAudience = strArr(form.targetAudience);
          const objectives = strArr(form.objectives);
          const benefits = strArr(form.benefits);
          const modules = modulesArr(form.modules);

          const validation = validateCourse(
            {
              ...form,
              modality: modalities[0] ?? "",
              modalities: JSON.stringify(modalities),
              categories: JSON.stringify(categories),
              targetAudience: JSON.stringify(targetAudience),
              objectives: JSON.stringify(objectives),
              benefits: JSON.stringify(benefits),
            },
            modules
          );
          if (!validation.valid) { setValidationErrors(validation.errors); return; }
          try {
            await store.upsertCourse({
              id: editingId ?? undefined,
              title: str(form.title),
              pathId: str(form.pathId),
              modality: (modalities[0] ?? "Ao vivo online") as Course["modality"],
              modalities: modalities as Course["modality"][],
              durationLabel: str(form.durationLabel),
              durationHours: Number(str(form.durationLabel).replace(/\D/g, "") || 8),
              price: Number(form.price || 0),
              status: str(form.status) as Course["status"],
              shortDescription: str(form.shortDescription),
              fullDescription: str(form.fullDescription),
              image: str(form.image),
              level: str(form.level) as Course["level"],
              targetAudience,
              category: categories[0],
              categories,
              featured: form.featured === "Sim",
              featuredCourseIds: strArr(form.featuredCourseIds),
              objectives,
              benefits,
              modules,
            });
            setOpen(false);
            setValidationErrors([]);
          } catch (error) {
            toast.error(`Erro ao salvar: ${error instanceof Error ? error.message : "Tente novamente"}`);
          }
        },
        fields: [
          { key: "title", label: "Nome do curso", type: "text", required: true },
          { key: "pathId", label: "Trilha", type: "select", options: pathOptions, required: true },
          { key: "modalities", label: "Modalidades", type: "multiselect", options: modalityOptions, required: true },
          {
            key: "level", label: "Nível", type: "select", required: true,
            options: COURSE_LEVEL_OPTIONS,
          },
          { key: "status", label: "Status", type: "select", options: statusOptions, required: true },
          {
            key: "featured",
            label: "Curso destaque",
            type: "select",
            options: [
              { value: "Não", label: "Não" },
              { value: "Sim", label: "Sim" },
            ],
            required: true,
          },
          { key: "durationLabel", label: "Carga horária", type: "text", required: true },
          { key: "price", label: "Preço (R$)", type: "number", required: true },
          { key: "image", label: "URL da imagem", type: "text" },
          { key: "targetAudience", label: "Público-alvo", type: "array" },
          { key: "categories", label: "Categorias", type: "array", suggestions: categoryOptions },
          { key: "featuredCourseIds", label: "Cursos destaque relacionados", type: "multiselect", options: featuredCourseOptions },
          { key: "shortDescription", label: "Descrição curta", type: "textarea", required: true },
          { key: "fullDescription", label: "Descrição completa", type: "textarea", required: true },
          { key: "objectives", label: "Objetivos", type: "array" },
          { key: "benefits", label: "Benefícios", type: "array" },
          { key: "modules", label: "Módulos", type: "modules" },
        ] as FieldConfig[],
      };
    }

    case "classes": {
      const rows = store.classes.filter((item) => {
        const courseName = store.courses.find((c) => c.id === item.courseId)?.title ?? "";
        return courseName.toLowerCase().includes(search.toLowerCase());
      });
      const courseOptions = store.courses.map((c) => ({ value: c.id, label: c.title }));
      const selectedCourse = store.courses.find((c) => c.id === form.courseId);
      const getCourseModalities = (course: Course) =>
        course.modalities?.length ? course.modalities : [course.modality];
      const modalityOptions = selectedCourse
        ? getCourseModalities(selectedCourse).map((value) => ({ value, label: value }))
        : courseOptions.length
          ? store.courses
              .flatMap((course) => getCourseModalities(course))
              .filter((value, index, list) => list.indexOf(value) === index)
              .map((value) => ({ value, label: value }))
          : [];
      const classStatusOptions = [
        { value: "Inscrições abertas", label: "Inscrições abertas" },
        { value: "Poucas vagas", label: "Poucas vagas" },
        { value: "Encerrada", label: "Encerrada" },
        { value: "Em breve", label: "Em breve" },
      ];
      const instructorOptions = store.instructors.map((i) => ({ value: i.id, label: i.name }));
      const confirmedEnrollments = editingId
        ? store.enrollments.filter(
            (item) =>
              item.classId === editingId &&
              (item.status === "Confirmada" || item.status === "Aguardando pagamento" || item.status === "Concluída")
          ).length
        : 0;

      const activeClasses = store.classes.filter(
        (item) => item.status === "Inscrições abertas" || item.status === "Poucas vagas"
      ).length;
      const startingClasses = store.classes.filter((item) => {
        const startsAt = new Date(item.startDate).getTime();
        const now = Date.now();
        return startsAt >= now && startsAt <= now + 30 * 86400_000;
      }).length;
      const totalSeatsAll = store.classes.reduce((sum, item) => sum + item.totalSeats, 0);
      const filledSeatsAll = store.classes.reduce((sum, item) => sum + item.filledSeats, 0);
      const occupancyRate = toOccupancyPercent(filledSeatsAll, totalSeatsAll);

      return {
        title: "Gestão de turmas",
        description: "Editar calendário, status, instrutores e vagas das turmas.",
        rows,
        stats: [
          {
            label: "Turmas ativas",
            value: String(activeClasses),
            helper: "Com inscrições abertas ou poucas vagas.",
            icon: CalendarCheck,
          },
          {
            label: "Cursos no catálogo",
            value: String(store.courses.length),
            helper: "Total de cursos cadastrados.",
            icon: BookOpen,
          },
          {
            label: "Iniciando em 30 dias",
            value: String(startingClasses),
            helper: "Turmas com início no próximo mês.",
            icon: Users,
          },
          {
            label: "Taxa de ocupação",
            value: `${occupancyRate}%`,
            helper: "Vagas preenchidas sobre o total ofertado.",
            icon: TrendingUp,
          },
        ],
        columns: [
          {
            key: "course", label: "Curso",
            render: (row: TrainingClass) =>
              store.courses.find((course) => course.id === row.courseId)?.title ?? "--",
          },
          {
            key: "date", label: "Data",
            render: (row: TrainingClass) =>
              new Intl.DateTimeFormat("pt-BR").format(new Date(row.startDate)),
          },
          {
            key: "filledSeats", label: "Inscritos",
            render: (row: TrainingClass) => <SeatProgress filled={row.filledSeats} total={row.totalSeats} />,
          },
          { key: "status", label: "Status", render: (row: TrainingClass) => renderStatusBadge(row.status) },
        ],
        onEdit: (row: TrainingClass) => {
          const rowConfirmedEnrollments = store.enrollments.filter(
            (item) =>
              item.classId === row.id &&
              (item.status === "Confirmada" || item.status === "Aguardando pagamento" || item.status === "Concluída")
          ).length;
          setEditingId(row.id);
          setForm({
            courseId: row.courseId,
            startDate: row.startDate.slice(0, 10),
            endDate: row.endDate.slice(0, 10),
            time: row.time || "",
            modality: row.modality,
            status: row.status,
            location: row.location,
            instructorId: row.instructorId || "",
            totalSeats: String(row.totalSeats),
            manualFilledSeats: String(row.manualFilledSeats ?? Math.max(row.filledSeats - rowConfirmedEnrollments, 0)),
          });
          setValidationErrors([]);
          setOpen(true);
        },
        onDelete: (row: TrainingClass) => store.deleteClass(row.id),
        onSave: async () => {
          const validation = validateClass(form);
          if (!validation.valid) { setValidationErrors(validation.errors); return; }
          try {
            const totalSeats = Number(form.totalSeats || 0);
            const manualFilledSeats = Number(form.manualFilledSeats || 0);
            await store.upsertClass({
              id: editingId ?? undefined,
              courseId: str(form.courseId),
              startDate: normalizeDateTimeForStorage(str(form.startDate)),
              endDate: normalizeDateTimeForStorage(str(form.endDate), "18:00:00.000Z"),
              time: str(form.time),
              modality: str(form.modality) as TrainingClass["modality"],
              status: str(form.status) as TrainingClass["status"],
              location: str(form.location),
              instructorId: optStr(form.instructorId),
              totalSeats,
              manualFilledSeats,
              filledSeats: Math.min(totalSeats, confirmedEnrollments + manualFilledSeats),
              availableSeats: Math.max(0, totalSeats - (confirmedEnrollments + manualFilledSeats)),
            });
            setOpen(false);
            setValidationErrors([]);
          } catch (error) {
            toast.error(`Erro ao salvar: ${error instanceof Error ? error.message : "Tente novamente"}`);
          }
        },
        fields: [
          { key: "courseId", label: "Curso", type: "select", options: courseOptions, required: true },
          { key: "startDate", label: "Data de início", type: "date", required: true },
          { key: "endDate", label: "Data final", type: "date", required: true },
          { key: "time", label: "Horário(s)", type: "text", required: true },
          { key: "modality", label: "Modalidade", type: "select", options: modalityOptions, required: true },
          { key: "totalSeats", label: "Quantidade de vagas", type: "number", required: true },
          { key: "manualFilledSeats", label: "Vagas preenchidas manualmente", type: "number" },
          { key: "status", label: "Status", type: "select", options: classStatusOptions, required: true },
          { key: "instructorId", label: "Instrutor", type: "select", options: instructorOptions },
          { key: "location", label: "Local", type: "text" },
        ],
      };
    }

    case "students": {
      const rows = store.students.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
      const enrollmentStatusOptions = [
        { value: "Pendente", label: "Pendente" },
        { value: "Aguardando pagamento", label: "Aguardando pagamento" },
        { value: "Confirmada", label: "Confirmada" },
        { value: "Cancelada", label: "Cancelada" },
        { value: "Concluída", label: "Concluída" },
      ];

      const activeStudents = store.students.filter(
        (item) => item.enrollmentStatus === "Confirmada" || item.enrollmentStatus === "Concluída"
      ).length;
      const inactiveStudents = store.students.length - activeStudents;
      const certifiedStudents = store.students.filter((item) => item.certificateIssued).length;

      return {
        title: "Gestão de alunos",
        description: "Visualizar dados, curso, turma e status de inscrição.",
        rows,
        stats: [
          {
            label: "Total de alunos",
            value: String(store.students.length),
            helper: "Cadastros com ao menos uma inscrição.",
            icon: Users,
          },
          {
            label: "Ativos",
            value: String(activeStudents),
            helper: "Inscrições confirmadas ou concluídas.",
            icon: UserCheck,
          },
          {
            label: "Inativos",
            value: String(inactiveStudents),
            helper: "Pendentes, aguardando pagamento ou cancelados.",
            icon: UserX,
          },
          {
            label: "Certificados emitidos",
            value: String(certifiedStudents),
            helper: "Alunos com certificado já liberado.",
            icon: UserCheck,
          },
        ],
        columns: [
          {
            key: "name",
            label: "Aluno",
            render: (row: Student) => <UserCell name={row.name} email={row.email} />,
            exportValue: (row: Student) => `${row.name} <${row.email}>`,
          },
          { key: "organization", label: "Empresa/órgão", render: (row: Student) => row.organization },
          { key: "jobTitle", label: "Cargo", render: (row: Student) => row.jobTitle || "—" },
          { key: "status", label: "Status", render: (row: Student) => renderStatusBadge(row.enrollmentStatus) },
        ],
        onEdit: (row: Student) => {
          setEditingId(row.id);
          setForm({
            name: row.name,
            email: row.email,
            organization: row.organization,
            enrollmentStatus: row.enrollmentStatus,
          });
          setValidationErrors([]);
          setOpen(true);
        },
        onDelete: (row: Student) => store.deleteStudent(row.id),
        onSave: async () => {
          const validation = validateStudent(form);
          if (!validation.valid) { setValidationErrors(validation.errors); return; }
          try {
            if (editingId) {
              await store.updateStudent({
                id: editingId,
                name: str(form.name),
                email: str(form.email),
                organization: str(form.organization),
                enrollmentStatus: str(form.enrollmentStatus) as Student["enrollmentStatus"],
              });
            } else {
              await store.createStudent({
                name: str(form.name),
                email: str(form.email),
                organization: str(form.organization),
                enrollmentStatus: str(form.enrollmentStatus) as Student["enrollmentStatus"],
              });
            }
            setOpen(false);
            setValidationErrors([]);
          } catch (error) {
            toast.error(`Erro ao salvar: ${error instanceof Error ? error.message : "Tente novamente"}`);
          }
        },
        fields: [
          { key: "name", label: "Nome", type: "text", required: true },
          { key: "email", label: "E-mail", type: "text", required: true },
          { key: "organization", label: "Empresa / órgão", type: "text", required: true },
          { key: "enrollmentStatus", label: "Status", type: "select", options: enrollmentStatusOptions, required: true },
        ],
      };
    }

    case "leads": {
      const rows = store.leads.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
      const leadTypeOptions = [
        { value: "Curso", label: "Curso" },
        { value: "InCompany", label: "In Company" },
        { value: "Consultoria", label: "Consultoria" },
        { value: "Newsletter", label: "Newsletter" },
        { value: "Orçamento", label: "Orçamento" },
        { value: "Contato", label: "Contato" },
      ];
      const originOptions = [
        { value: "Site", label: "Site" },
        { value: "WhatsApp", label: "WhatsApp" },
        { value: "Blog", label: "Blog" },
        { value: "Indicação", label: "Indicação" },
        { value: "LinkedIn", label: "LinkedIn" },
        { value: "Consultoria", label: "Consultoria" },
        { value: "Especialista", label: "Especialista" },
        { value: "Orçamento In Company", label: "Orçamento In Company" },
        { value: "Contato", label: "Contato" },
        { value: "Newsletter", label: "Newsletter" },
      ];
      const leadStatusOptions = [
        { value: "Novo", label: "Novo" },
        { value: "Em atendimento", label: "Em atendimento" },
        { value: "Proposta enviada", label: "Proposta enviada" },
        { value: "Convertido", label: "Convertido" },
        { value: "Perdido", label: "Perdido" },
      ];

      const newLeads = store.leads.filter((item) => item.status === "Novo").length;
      const inProgressLeads = store.leads.filter(
        (item) => item.status === "Em atendimento" || item.status === "Proposta enviada"
      ).length;
      const convertedLeads = store.leads.filter((item) => item.status === "Convertido").length;
      const leadConversionRate = store.leads.length > 0 ? Math.round((convertedLeads / store.leads.length) * 100) : 0;

      return {
        title: "Gestão de leads",
        description: "Funil com origem, interesse e estágio comercial.",
        rows,
        stats: [
          {
            label: "Total de leads",
            value: String(store.leads.length),
            helper: "Contatos registrados no funil.",
            icon: Users,
          },
          {
            label: "Novos",
            value: String(newLeads),
            helper: "Ainda sem primeiro atendimento.",
            icon: UserCheck,
          },
          {
            label: "Em atendimento",
            value: String(inProgressLeads),
            helper: "Em contato ou com proposta enviada.",
            icon: Clock,
          },
          {
            label: "Taxa de conversão",
            value: `${leadConversionRate}%`,
            helper: "Leads convertidos sobre o total.",
            icon: Target,
          },
        ],
        columns: [
          {
            key: "name",
            label: "Lead",
            render: (row: Lead) => <UserCell name={row.name} email={row.email} />,
            exportValue: (row: Lead) => `${row.name} <${row.email}>`,
          },
          { key: "type", label: "Jornada", render: (row: Lead) => <Badge variant="default">{row.type}</Badge> },
          { key: "origin", label: "Origem", render: (row: Lead) => <Badge variant="muted">{row.origin}</Badge> },
          { key: "courseInterest", label: "Interesse", render: (row: Lead) => row.courseInterest },
          { key: "status", label: "Status", render: (row: Lead) => renderStatusBadge(row.status) },
        ],
        onEdit: (row: Lead) => {
          setEditingId(row.id);
          setForm({
            name: row.name,
            email: row.email,
            phone: row.phone || "",
            type: row.type,
            courseInterest: row.courseInterest,
            courseId: row.courseId || "",
            origin: row.origin,
            status: row.status,
            organization: row.organization || "",
            teamSize: row.teamSize?.toString() || "",
            preferredModality: row.preferredModality || "",
            trainingObjective: row.trainingObjective || "",
            trainingTheme: row.trainingTheme || "",
            mainChallenges: row.mainChallenges || "",
            message: row.message || "",
          });
          setValidationErrors([]);
          setOpen(true);
        },
        onDelete: (row: Lead) => store.deleteLead(row.id),
        onSave: async () => {
          const validation = validateLead(form);
          if (!validation.valid) { setValidationErrors(validation.errors); return; }
          try {
            if (editingId) {
              await store.updateLead({
                id: editingId,
                name: str(form.name),
                email: str(form.email),
                phone: optStr(form.phone) || "(61) 90000-0000",
                type: str(form.type) as Lead["type"],
                courseInterest: str(form.courseInterest),
                courseId: optStr(form.courseId),
                origin: str(form.origin) as Lead["origin"],
                status: str(form.status) as Lead["status"],
                organization: optStr(form.organization),
                teamSize: numOrUndef(form.teamSize),
                preferredModality: optStr(form.preferredModality),
                trainingObjective: optStr(form.trainingObjective),
                trainingTheme: optStr(form.trainingTheme),
                mainChallenges: optStr(form.mainChallenges),
              });
            } else {
              await store.createLead({
                name: str(form.name),
                email: str(form.email),
                phone: optStr(form.phone) || "(61) 90000-0000",
                type: str(form.type) as Lead["type"],
                courseInterest: str(form.courseInterest),
                courseId: optStr(form.courseId),
                origin: str(form.origin) as Lead["origin"],
                organization: optStr(form.organization),
                teamSize: numOrUndef(form.teamSize),
                preferredModality: optStr(form.preferredModality),
                trainingObjective: optStr(form.trainingObjective),
                trainingTheme: optStr(form.trainingTheme),
                mainChallenges: optStr(form.mainChallenges),
                message: optStr(form.message) || "Lead criado manualmente no admin.",
              });
            }
            setOpen(false);
            setValidationErrors([]);
          } catch (error) {
            toast.error(`Erro ao salvar: ${error instanceof Error ? error.message : "Tente novamente"}`);
          }
        },
        fields: [
          { key: "name", label: "Nome", type: "text", required: true },
          { key: "email", label: "E-mail", type: "text", required: true },
          { key: "phone", label: "Telefone", type: "text" },
          { key: "type", label: "Jornada comercial", type: "select", options: leadTypeOptions, required: true },
          { key: "courseInterest", label: "Interesse principal", type: "text", required: true },
          { key: "origin", label: "Origem", type: "select", options: originOptions, required: true },
          { key: "status", label: "Status", type: "select", options: leadStatusOptions, required: true },
          { key: "organization", label: "Empresa/Órgão", type: "text" },
          { key: "teamSize", label: "Tamanho da equipe", type: "number" },
          { key: "preferredModality", label: "Modalidade preferida", type: "text" },
          { key: "trainingObjective", label: "Objetivo do treinamento", type: "textarea" },
          { key: "trainingTheme", label: "Tema do treinamento", type: "textarea" },
          { key: "mainChallenges", label: "Desafios principais", type: "textarea" },
        ],
      };
    }

    case "enrollments": {
      const rows = store.enrollments.filter((item) =>
        item.studentName.toLowerCase().includes(search.toLowerCase())
      );
      const isEligibleEnrollmentClass = (status: string) =>
        status === "Inscrições abertas" ||
        status === "Poucas vagas" ||
        status === "Aberta" ||
        status === "PoucasVagas";
      const eligibleClasses = store.classes.filter(
        (item) => isEligibleEnrollmentClass(String(item.status))
      );
      const courseIdsWithClasses = new Set(eligibleClasses.map((item) => item.courseId));
      const courseOptions = store.courses
        .filter((course) => courseIdsWithClasses.has(course.id))
        .map((course) => ({ value: course.id, label: course.title }));
      const selectedCourseReference = str(form.courseId);
      const selectedCourse = store.courses.find(
        (course) =>
          course.id === selectedCourseReference ||
          course.slug === selectedCourseReference ||
          course.title === selectedCourseReference
      );
      const classOptions = store.classes
        .filter(
          (item) =>
            Boolean(selectedCourse?.id) &&
            item.courseId === selectedCourse?.id &&
            isEligibleEnrollmentClass(String(item.status))
        )
        .map((item) => ({
          value: item.id,
          label: `${store.courses.find((course) => course.id === item.courseId)?.title ?? "Curso"} • ${new Intl.DateTimeFormat("pt-BR").format(new Date(item.startDate))}`,
        }));
      const enrollmentTypeOptions = [
        { value: "Pessoa física", label: "Pessoa física" },
        { value: "Empresa", label: "Empresa" },
        { value: "Órgão público", label: "Órgão público" },
      ];
      const paymentMethodOptions = [
        { value: "Pix", label: "Pix" },
        { value: "Cartão", label: "Cartão" },
        { value: "Boleto", label: "Boleto" },
        { value: "Empenho", label: "Empenho" },
      ];
      const enrollmentStatusOptions = [
        { value: "Pendente", label: "Pendente" },
        { value: "Aguardando pagamento", label: "Aguardando pagamento" },
        { value: "Confirmada", label: "Confirmada" },
        { value: "Cancelada", label: "Cancelada" },
        { value: "Concluída", label: "Concluída" },
      ];

      const confirmedEnrollmentsTotal = store.enrollments.filter(
        (item) => item.status === "Confirmada" || item.status === "Concluída"
      ).length;
      const awaitingPaymentEnrollments = store.enrollments.filter(
        (item) => item.status === "Aguardando pagamento"
      ).length;
      const completedEnrollmentsTotal = store.enrollments.filter((item) => item.status === "Concluída").length;

      return {
        title: "Gestão de inscrições",
        description: "Acompanhar inscrição, curso, turma e forma de pagamento simulada.",
        rows,
        stats: [
          {
            label: "Total de inscrições",
            value: String(store.enrollments.length),
            helper: "Inscrições registradas na plataforma.",
            icon: Users,
          },
          {
            label: "Confirmadas",
            value: String(confirmedEnrollmentsTotal),
            helper: "Confirmadas ou já concluídas.",
            icon: UserCheck,
          },
          {
            label: "Aguardando pagamento",
            value: String(awaitingPaymentEnrollments),
            helper: "Pendentes de confirmação financeira.",
            icon: Clock,
          },
          {
            label: "Concluídas",
            value: String(completedEnrollmentsTotal),
            helper: "Capacitações finalizadas.",
            icon: TrendingUp,
          },
        ],
        columns: [
          {
            key: "studentName",
            label: "Aluno",
            render: (row: Enrollment) => <UserCell name={row.studentName} email={row.email} />,
            exportValue: (row: Enrollment) => `${row.studentName} <${row.email}>`,
          },
          {
            key: "course", label: "Curso",
            render: (row: Enrollment) =>
              store.courses.find((course) => course.id === row.courseId)?.title ?? "--",
          },
          {
            key: "paymentMethod",
            label: "Pagamento",
            render: (row: Enrollment) => <Badge variant="muted">{row.paymentMethod}</Badge>,
          },
          { key: "status", label: "Status", render: (row: Enrollment) => renderStatusBadge(row.status) },
        ],
        onEdit: (row: Enrollment) => {
          const selectedCourse = store.courses.find((course) => course.id === row.courseId);
          const selectedClass = store.classes.find((item) => item.id === row.classId);

          setEditingId(row.id);
          setForm({
            studentName: row.studentName,
            email: row.email,
            phone: row.phone,
            cpf: row.cpf,
            organization: row.organization,
            jobTitle: row.jobTitle,
            courseTitle: selectedCourse?.title ?? "Curso não localizado",
            classLabel: selectedClass
              ? `${formatAdminDate(selectedClass.startDate)} • ${selectedClass.modality}`
              : "Turma não localizada",
            createdAtLabel: formatAdminDate(row.createdAt),
            paymentMethod: row.paymentMethod,
            enrollmentType: row.enrollmentType,
            derivedStatus: deriveEnrollmentOperationalStatus(row, selectedClass),
            status: row.status,
            courseId: row.courseId,
            classId: row.classId,
            notes: row.notes,
          });
          setValidationErrors([]);
          setOpen(true);
        },
        onDelete: (row: Enrollment) => store.deleteEnrollment(row.id),
        onSave: async () => {
          try {
            if (editingId) {
              const validation = validateEnrollment(form);
              if (!validation.valid) { setValidationErrors(validation.errors); return; }
              await store.updateEnrollmentStatus(editingId, str(form.status) as Enrollment["status"]);
            } else {
              const validation = validateEnrollmentCreate(form);
              if (!validation.valid) { setValidationErrors(validation.errors); return; }
              await store.createEnrollmentAdmin({
                studentName: str(form.studentName),
                email: str(form.email),
                phone: str(form.phone),
                cpf: str(form.cpf),
                organization: str(form.organization),
                jobTitle: str(form.jobTitle),
                enrollmentType: str(form.enrollmentType) as Enrollment["enrollmentType"],
                paymentMethod: str(form.paymentMethod) as Enrollment["paymentMethod"],
                courseId: str(form.courseId),
                classId: str(form.classId),
                notes: str(form.notes),
              });
            }
            setOpen(false);
            setValidationErrors([]);
          } catch (error) {
            toast.error(`Erro ao salvar: ${error instanceof Error ? error.message : "Tente novamente"}`);
          }
        },
        fields: editingId
          ? [
              { key: "studentName", label: "Aluno", type: "readonly", section: "Contexto da inscrição" },
              { key: "email", label: "E-mail", type: "readonly", section: "Contexto da inscrição" },
              { key: "courseTitle", label: "Curso", type: "readonly", section: "Contexto da inscrição" },
              { key: "classLabel", label: "Turma", type: "readonly", section: "Contexto da inscrição" },
              { key: "createdAtLabel", label: "Data da inscrição", type: "readonly", section: "Contexto da inscrição" },
              { key: "paymentMethod", label: "Pagamento", type: "readonly", section: "Contexto da inscrição" },
              { key: "enrollmentType", label: "Tipo de inscrição", type: "readonly", section: "Contexto da inscrição" },
              { key: "derivedStatus", label: "Status derivado", type: "readonly", section: "Contexto da inscrição" },
              {
                key: "status",
                label: "Atualizar status",
                type: "select",
                options: enrollmentStatusOptions,
                required: true,
                section: "Ação operacional",
              },
            ]
          : [
              { key: "studentName", label: "Aluno", type: "text", required: true },
              { key: "email", label: "E-mail", type: "text", required: true },
              { key: "phone", label: "Telefone", type: "text", required: true },
              { key: "cpf", label: "CPF", type: "text", required: true },
              { key: "organization", label: "Empresa/Órgão", type: "text" },
              { key: "jobTitle", label: "Cargo", type: "text" },
              { key: "enrollmentType", label: "Tipo de inscrição", type: "select", options: enrollmentTypeOptions, required: true },
              { key: "paymentMethod", label: "Pagamento", type: "select", options: paymentMethodOptions, required: true },
              { key: "courseId", label: "Curso", type: "select", options: courseOptions, required: true },
              { key: "classId", label: "Turma", type: "select", options: classOptions, required: true },
              { key: "notes", label: "Observações", type: "textarea" },
            ],
      };
    }

    case "instructors": {
      const rows = store.instructors.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
      const courseOptions = store.courses.map((course) => ({ value: course.id, label: course.title }));
      const instructorStatusOptions = [
        { value: "Ativo", label: "Ativo" },
        { value: "Inativo", label: "Inativo" },
      ];

      const activeInstructors = store.instructors.filter((item) => item.status === "Ativo").length;
      const inactiveInstructors = store.instructors.length - activeInstructors;
      const linkedCourseIds = new Set(
        store.instructors.flatMap((item) => item.courseIds || [])
      );

      return {
        title: "Gestão de instrutores",
        description: "Criar, editar, vincular cursos e acompanhar especialidades.",
        rows,
        stats: [
          {
            label: "Total de instrutores",
            value: String(store.instructors.length),
            helper: "Especialistas cadastrados.",
            icon: Users,
          },
          {
            label: "Ativos",
            value: String(activeInstructors),
            helper: "Disponíveis para novas turmas.",
            icon: UserCheck,
          },
          {
            label: "Inativos",
            value: String(inactiveInstructors),
            helper: "Sem vínculo ativo no momento.",
            icon: UserX,
          },
          {
            label: "Cursos vinculados",
            value: String(linkedCourseIds.size),
            helper: "Cursos com instrutor designado.",
            icon: BookOpen,
          },
        ],
        columns: [
          {
            key: "name",
            label: "Instrutor",
            render: (row: Instructor) => <UserCell name={row.name} email={row.email} />,
            exportValue: (row: Instructor) => `${row.name} <${row.email}>`,
          },
          { key: "specialty", label: "Especialidade", render: (row: Instructor) => row.specialty },
          { key: "status", label: "Status", render: (row: Instructor) => renderStatusBadge(row.status) },
        ],
        onEdit: (row: Instructor) => {
          setEditingId(row.id);
          setForm({
            name: row.name,
            email: row.email,
            phone: row.phone || "",
            specialty: row.specialty,
            bio: row.bio || "",
            education: row.education || "",
            photoUrl: row.photoUrl || (row.avatar.startsWith("/") || row.avatar.startsWith("http") ? row.avatar : ""),
            status: row.status,
            courseIds: row.courseIds || [],
          });
          setValidationErrors([]);
          setOpen(true);
        },
        onDelete: (row: Instructor) => store.deleteInstructor(row.id),
        onSave: async () => {
          const validation = validateInstructor(form);
          if (!validation.valid) { setValidationErrors(validation.errors); return; }
          try {
            await store.upsertInstructor({
              id: editingId ?? undefined,
              name: str(form.name),
              email: str(form.email),
              phone: optStr(form.phone),
              specialty: optStr(form.specialty),
              bio: optStr(form.bio),
              education: optStr(form.education),
              photoUrl: optStr(form.photoUrl),
              status: str(form.status) as Instructor["status"],
              courseIds: strArr(form.courseIds),
            });
            setOpen(false);
            setValidationErrors([]);
          } catch (error) {
            toast.error(`Erro ao salvar: ${error instanceof Error ? error.message : "Tente novamente"}`);
          }
        },
        fields: [
          { key: "name", label: "Nome", type: "text", required: true },
          { key: "email", label: "E-mail", type: "text" },
          { key: "phone", label: "Telefone", type: "text" },
          { key: "specialty", label: "Especialidade", type: "text" },
          { key: "education", label: "Formação", type: "textarea" },
          { key: "photoUrl", label: "Foto do professor", type: "file" },
          { key: "bio", label: "Biografia", type: "textarea" },
          { key: "courseIds", label: "Cursos vinculados", type: "multiselect", options: courseOptions },
          { key: "status", label: "Status", type: "select", options: instructorStatusOptions, required: true },
        ],
      };
    }

    case "blog": {
      const rows = store.blogPosts.filter((item) =>
        item.title.toLowerCase().includes(search.toLowerCase())
      );
      const categoryOptions = [
        { value: "Licitações", label: "Licitações" },
        { value: "LGPD", label: "LGPD" },
        { value: "Compliance", label: "Compliance" },
        { value: "Departamento Pessoal", label: "Departamento Pessoal" },
        { value: "eSocial", label: "eSocial" },
        { value: "Gestão Pública", label: "Gestão Pública" },
        { value: "Liderança", label: "Liderança" },
        { value: "Tecnologia", label: "Tecnologia" },
        { value: "Assédio e Compliance", label: "Assédio e Compliance" },
      ];
      const blogStatusOptions = [
        { value: "Rascunho", label: "Rascunho" },
        { value: "Publicado", label: "Publicado" },
        { value: "Arquivado", label: "Arquivado" },
      ];
      const courseOptions = store.courses.map((c) => ({ value: c.id, label: c.title }));

      const publishedPosts = store.blogPosts.filter((item) => item.status === "Publicado").length;
      const draftPosts = store.blogPosts.filter((item) => item.status === "Rascunho").length;
      const activeCategories = new Set(
        store.blogPosts.filter((item) => item.status === "Publicado").map((item) => item.category)
      );

      return {
        title: "Gestão do blog",
        description: "CRUD local para posts, categorias e status editoriais.",
        rows,
        stats: [
          {
            label: "Total de posts",
            value: String(store.blogPosts.length),
            helper: "Conteúdos no acervo editorial.",
            icon: Newspaper,
          },
          {
            label: "Publicados",
            value: String(publishedPosts),
            helper: "Visíveis no blog público.",
            icon: FileText,
          },
          {
            label: "Rascunhos",
            value: String(draftPosts),
            helper: "Em produção, ainda não publicados.",
            icon: Clock,
          },
          {
            label: "Categorias ativas",
            value: String(activeCategories.size),
            helper: "Categorias com post publicado.",
            icon: Tag,
          },
        ],
        columns: [
          { key: "title", label: "Post", render: (row: BlogPost) => row.title },
          { key: "category", label: "Categoria", render: (row: BlogPost) => <Badge variant="muted">{row.category}</Badge> },
          { key: "author", label: "Autor", render: (row: BlogPost) => row.author },
          { key: "status", label: "Status", render: (row: BlogPost) => renderStatusBadge(row.status) },
        ],
        onEdit: (row: BlogPost) => {
          setEditingId(row.id);
          setForm({
            title: row.title,
            category: row.category,
            author: row.author,
            status: row.status,
            summary: row.summary,
            content: row.content,
            tags: row.tags || [],
            image: row.image || "",
            readingTime: row.readingTime || "",
            relatedCourseId: row.relatedCourseId || "",
          });
          setValidationErrors([]);
          setOpen(true);
        },
        onDelete: (row: BlogPost) => store.deleteBlogPost(row.id),
        onSave: async () => {
          const validation = validateBlogPost(form);
          if (!validation.valid) { setValidationErrors(validation.errors); return; }
          try {
            await store.upsertBlogPost({
              id: editingId ?? undefined,
              title: str(form.title),
              category: str(form.category) as BlogPost["category"],
              author: str(form.author),
              status: str(form.status) as BlogPost["status"],
              summary: str(form.summary),
              content: str(form.content),
              tags: strArr(form.tags),
              image: str(form.image),
              readingTime: optStr(form.readingTime) || "5 min",
              relatedCourseId: optStr(form.relatedCourseId),
            });
            setOpen(false);
            setValidationErrors([]);
          } catch (error) {
            toast.error(`Erro ao salvar: ${error instanceof Error ? error.message : "Tente novamente"}`);
          }
        },
        fields: [
          { key: "title", label: "Título", type: "text", required: true },
          { key: "category", label: "Categoria", type: "select", options: categoryOptions, required: true },
          { key: "author", label: "Autor", type: "text", required: true },
          { key: "status", label: "Status", type: "select", options: blogStatusOptions, required: true },
          { key: "summary", label: "Resumo", type: "textarea", required: true },
          { key: "content", label: "Conteúdo", type: "textarea", required: true },
          { key: "image", label: "URL da imagem", type: "text" },
          { key: "tags", label: "Tags", type: "array" },
          { key: "readingTime", label: "Tempo de leitura", type: "text" },
          { key: "relatedCourseId", label: "Curso relacionado", type: "select", options: courseOptions },
        ],
      };
    }

    default: {
      const exhaustive: never = resource;
      throw new Error(`Recurso de admin não suportado: ${String(exhaustive)}`);
    }
  }
}
