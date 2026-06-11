import { BookOpen, CalendarCheck, type LucideIcon, TrendingUp, Users } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { SeatProgress } from "@/components/admin/seat-progress";
import { useAppStore } from "@/lib/app-store";
import {
  validateBlogPost,
  validateClass,
  validateCourse,
  validateEnrollment,
  validateInstructor,
  validateLead,
  validateStudent,
  type ValidationError,
} from "@/lib/admin-form-validation";
import type {
  BlogPost,
  Course,
  Enrollment,
  Instructor,
  Lead,
  Student,
  TrainingClass,
  TrainingPath,
} from "@/types";

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
  required?: boolean;
  section?: string;
};

export type ColumnConfig<T> = {
  key: string;
  label: string;
  render: (row: T) => React.ReactNode;
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setForm: React.Dispatch<React.SetStateAction<Record<string, any>>>;
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
      const modalityOptions = [
        { value: "Ao vivo online", label: "Ao vivo online" },
        { value: "Presencial", label: "Presencial" },
        { value: "In company", label: "In company" },
        { value: "Híbrido", label: "Híbrido" },
        { value: "Gravado", label: "Gravado" },
      ];
      const featuredCourseOptions = store.courses.map((course) => ({ value: course.id, label: course.title }));
      const statusOptions = [
        { value: "Ativo", label: "Ativo" },
        { value: "Inativo", label: "Inativo" },
        { value: "Destaque", label: "Destaque" },
        { value: "Em breve", label: "Em breve" },
      ];

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
          const validation = validateCourse(
            {
              ...form,
              modality: form.modalities?.[0] ?? "",
              modalities: JSON.stringify(form.modalities || []),
              categories: JSON.stringify(form.categories || []),
              targetAudience: JSON.stringify(form.targetAudience || []),
              objectives: JSON.stringify(form.objectives),
              benefits: JSON.stringify(form.benefits),
            },
            form.modules
          );
          if (!validation.valid) { setValidationErrors(validation.errors); return; }
          try {
            await store.upsertCourse({
              id: editingId ?? undefined,
              title: form.title,
              pathId: form.pathId,
              modality: (form.modalities?.[0] ?? "Ao vivo online") as Course["modality"],
              modalities: (form.modalities || []) as Course["modality"][],
              durationLabel: form.durationLabel,
              durationHours: Number(form.durationLabel?.replace(/\D/g, "") || 8),
              price: Number(form.price || 0),
              status: form.status as Course["status"],
              shortDescription: form.shortDescription,
              fullDescription: form.fullDescription,
              image: form.image,
              level: form.level as Course["level"],
              targetAudience: form.targetAudience || [],
              category: form.categories?.[0],
              categories: form.categories || [],
              featured: form.featured === "Sim",
              featuredCourseIds: form.featuredCourseIds || [],
              objectives: form.objectives || [],
              benefits: form.benefits || [],
              modules: form.modules || [],
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
            options: [
              { value: "Básico", label: "Básico" },
              { value: "Intermediário", label: "Intermediário" },
              { value: "Avançado", label: "Avançado" },
              { value: "Básico / Intermediário", label: "Básico / Intermediário" },
            ],
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
          { key: "categories", label: "Categorias", type: "array" },
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
      const modalityOptions = selectedCourse
        ? [{ value: selectedCourse.modality, label: selectedCourse.modality }]
        : courseOptions.length
          ? store.courses
              .map((course) => course.modality)
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
      const occupancyRate = totalSeatsAll > 0 ? Math.round((filledSeatsAll / totalSeatsAll) * 100) : 0;

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
              courseId: form.courseId,
              startDate: normalizeDateTimeForStorage(form.startDate),
              endDate: normalizeDateTimeForStorage(form.endDate, "18:00:00.000Z"),
              time: form.time,
              modality: form.modality as TrainingClass["modality"],
              status: form.status as TrainingClass["status"],
              location: form.location,
              instructorId: form.instructorId || undefined,
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

      return {
        title: "Gestão de alunos",
        description: "Visualizar dados, curso, turma e status de inscrição.",
        rows,
        columns: [
          { key: "name", label: "Aluno", render: (row: Student) => row.name },
          { key: "email", label: "E-mail", render: (row: Student) => row.email },
          { key: "organization", label: "Empresa/órgão", render: (row: Student) => row.organization },
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
        onDelete: undefined,
        onSave: async () => {
          if (!editingId) return;
          const validation = validateStudent(form);
          if (!validation.valid) { setValidationErrors(validation.errors); return; }
          try {
            await store.updateStudent({
              id: editingId,
              name: form.name,
              email: form.email,
              organization: form.organization,
              enrollmentStatus: form.enrollmentStatus as Student["enrollmentStatus"],
            });
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
      const courseOptions = store.courses.map((c) => ({ value: c.id, label: c.title }));
      const originOptions = [
        { value: "Site", label: "Site" },
        { value: "WhatsApp", label: "WhatsApp" },
        { value: "Blog", label: "Blog" },
        { value: "Indicação", label: "Indicação" },
        { value: "LinkedIn", label: "LinkedIn" },
      ];
      const leadStatusOptions = [
        { value: "Novo", label: "Novo" },
        { value: "Em atendimento", label: "Em atendimento" },
        { value: "Proposta enviada", label: "Proposta enviada" },
        { value: "Convertido", label: "Convertido" },
        { value: "Perdido", label: "Perdido" },
      ];

      return {
        title: "Gestão de leads",
        description: "Funil com origem, interesse e estágio comercial.",
        rows,
        columns: [
          { key: "name", label: "Lead", render: (row: Lead) => row.name },
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
            courseInterest: row.courseInterest,
            origin: row.origin,
            status: row.status,
            organization: row.organization || "",
            teamSize: row.teamSize?.toString() || "",
            preferredModality: row.preferredModality || "",
            trainingObjective: row.trainingObjective || "",
            mainChallenges: row.mainChallenges || "",
            message: row.message || "",
          });
          setValidationErrors([]);
          setOpen(true);
        },
        onDelete: undefined,
        onSave: async () => {
          const validation = validateLead(form);
          if (!validation.valid) { setValidationErrors(validation.errors); return; }
          try {
            if (editingId) {
              await store.updateLead({
                id: editingId,
                name: form.name,
                email: form.email,
                phone: form.phone || "(61) 90000-0000",
                courseInterest: form.courseInterest,
                origin: form.origin as Lead["origin"],
                status: form.status as Lead["status"],
                organization: form.organization || undefined,
                teamSize: form.teamSize ? parseInt(form.teamSize) : undefined,
                preferredModality: form.preferredModality || undefined,
                trainingObjective: form.trainingObjective || undefined,
                mainChallenges: form.mainChallenges || undefined,
              });
            } else {
              await store.createLead({
                name: form.name,
                email: form.email,
                phone: form.phone || "(61) 90000-0000",
                courseInterest: form.courseInterest,
                origin: form.origin as Lead["origin"],
                organization: form.organization || undefined,
                teamSize: form.teamSize ? parseInt(form.teamSize) : undefined,
                preferredModality: form.preferredModality || undefined,
                trainingObjective: form.trainingObjective || undefined,
                mainChallenges: form.mainChallenges || undefined,
                message: form.message || "Lead criado manualmente no admin.",
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
          { key: "courseInterest", label: "Curso de interesse", type: "select", options: courseOptions, required: true },
          { key: "origin", label: "Origem", type: "select", options: originOptions, required: true },
          { key: "status", label: "Status", type: "select", options: leadStatusOptions, required: true },
          { key: "organization", label: "Empresa/Órgão", type: "text" },
          { key: "teamSize", label: "Tamanho da equipe", type: "number" },
          { key: "preferredModality", label: "Modalidade preferida", type: "text" },
          { key: "trainingObjective", label: "Objetivo do treinamento", type: "textarea" },
          { key: "mainChallenges", label: "Desafios principais", type: "textarea" },
        ],
      };
    }

    case "enrollments": {
      const rows = store.enrollments.filter((item) =>
        item.studentName.toLowerCase().includes(search.toLowerCase())
      );
      const enrollmentStatusOptions = [
        { value: "Pendente", label: "Pendente" },
        { value: "Aguardando pagamento", label: "Aguardando pagamento" },
        { value: "Confirmada", label: "Confirmada" },
        { value: "Cancelada", label: "Cancelada" },
        { value: "Concluída", label: "Concluída" },
      ];

      return {
        title: "Gestão de inscrições",
        description: "Acompanhar inscrição, curso, turma e forma de pagamento simulada.",
        rows,
        columns: [
          { key: "studentName", label: "Aluno", render: (row: Enrollment) => row.studentName },
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
            studentEmail: row.email,
            courseTitle: selectedCourse?.title ?? "Curso não localizado",
            classLabel: selectedClass
              ? `${formatAdminDate(selectedClass.startDate)} • ${selectedClass.modality}`
              : "Turma não localizada",
            createdAtLabel: formatAdminDate(row.createdAt),
            paymentMethod: row.paymentMethod,
            enrollmentType: row.enrollmentType,
            derivedStatus: deriveEnrollmentOperationalStatus(row, selectedClass),
            status: row.status,
          });
          setValidationErrors([]);
          setOpen(true);
        },
        onDelete: undefined,
        onSave: async () => {
          if (!editingId) return;
          const validation = validateEnrollment(form);
          if (!validation.valid) { setValidationErrors(validation.errors); return; }
          try {
            await store.updateEnrollmentStatus(editingId, form.status as Enrollment["status"]);
            setOpen(false);
            setValidationErrors([]);
          } catch (error) {
            toast.error(`Erro ao salvar: ${error instanceof Error ? error.message : "Tente novamente"}`);
          }
        },
        fields: [
          { key: "studentName", label: "Aluno", type: "readonly", section: "Contexto da inscrição" },
          { key: "studentEmail", label: "E-mail", type: "readonly", section: "Contexto da inscrição" },
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
        ],
      };
    }

    case "instructors": {
      const rows = store.instructors.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
      const instructorStatusOptions = [
        { value: "Ativo", label: "Ativo" },
        { value: "Inativo", label: "Inativo" },
      ];

      return {
        title: "Gestão de instrutores",
        description: "Criar, editar, vincular cursos e acompanhar especialidades.",
        rows,
        columns: [
          { key: "name", label: "Instrutor", render: (row: Instructor) => row.name },
          { key: "email", label: "E-mail", render: (row: Instructor) => row.email },
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
              name: form.name,
              email: form.email,
              phone: form.phone || undefined,
              specialty: form.specialty || undefined,
              bio: form.bio || undefined,
              education: form.education || undefined,
              photoUrl: form.photoUrl || undefined,
              status: form.status as Instructor["status"],
              courseIds: form.courseIds || [],
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
          { key: "status", label: "Status", type: "select", options: instructorStatusOptions, required: true },
        ],
      };
    }

    case "blog": {
      const rows = store.blogPosts.filter((item) =>
        item.title.toLowerCase().includes(search.toLowerCase())
      );
      const categoryOptions = [
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

      return {
        title: "Gestão do blog",
        description: "CRUD local para posts, categorias e status editoriais.",
        rows,
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
              title: form.title,
              category: form.category as BlogPost["category"],
              author: form.author,
              status: form.status as BlogPost["status"],
              summary: form.summary,
              content: form.content,
              tags: form.tags || [],
              image: form.image,
              readingTime: form.readingTime || "5 min",
              relatedCourseId: form.relatedCourseId || undefined,
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
