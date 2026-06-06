import { Plus, Download } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { DataTable } from "@/components/admin/data-table";
import { EmptyState } from "@/components/common/empty-state";
import { SearchInput } from "@/components/common/search-input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  ArrayInput,
  SelectField,
  ModulesBuilder,
  MultiSelectField
} from "@/components/admin/form-fields";
import { useAppStore } from "@/lib/app-store";
import { useHotkey } from "@/hooks/use-hotkey";
import {
  validateCourse,
  validateClass,
  validateStudent,
  validateLead,
  validateEnrollment,
  validateInstructor,
  validateBlogPost,
  type ValidationError
} from "@/lib/admin-form-validation";
import type { BlogPost, Course, Enrollment, Instructor, Lead, Student, TrainingClass } from "@/types";

type ResourceKey = "courses" | "classes" | "students" | "leads" | "enrollments" | "instructors" | "blog";

type FieldConfig = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "select" | "array" | "modules" | "multiselect" | "number" | "date";
  options?: Array<{ value: string; label: string }>;
  required?: boolean;
};

function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) {
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.map(h => `"${h}"`).join(","),
    ...data.map(row =>
      headers.map(h => {
        const value = row[h];
        if (Array.isArray(value)) {
          return `"${value.join("; ")}"`;
        }
        return `"${String(value ?? "").replace(/"/g, '""')}"`;
      }).join(",")
    )
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}-${new Date().toISOString().split("T")[0]}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function AdminResourcePage({ resource }: { resource: ResourceKey }) {
  const store = useAppStore();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const errorsByField = useMemo(() => {
    const result: { [key: string]: string } = {};
    validationErrors.forEach(e => {
      if (!result[e.field]) {
        result[e.field] = e.message;
      }
    });
    return result;
  }, [validationErrors]);

  useHotkey(
    (event) => event.key.toLowerCase() === "n" && window.location.pathname.startsWith("/admin"),
    (event) => {
      event.preventDefault();
      setEditingId(null);
      setForm({});
      setOpen(true);
    }
  );

  const config = useMemo(() => {
    switch (resource) {
      case "courses": {
        const rows = store.courses.filter((item) => item.title.toLowerCase().includes(search.toLowerCase()));
        const pathOptions = store.trainingPaths?.map((p: any) => ({ value: p.id, label: p.name })) || [];
        const modalityOptions = [
          { value: "Ao vivo online", label: "Ao vivo online" },
          { value: "Presencial", label: "Presencial" },
          { value: "In company", label: "In company" },
          { value: "Híbrido", label: "Híbrido" },
          { value: "Gravado", label: "Gravado" }
        ];
        const statusOptions = [
          { value: "Ativo", label: "Ativo" },
          { value: "Inativo", label: "Inativo" },
          { value: "Destaque", label: "Destaque" },
          { value: "Em breve", label: "Em breve" }
        ];

        return {
          title: "Gestão de cursos",
          description: "Criar, editar, duplicar, ativar e organizar cursos da plataforma.",
          rows,
          columns: [
            { key: "title", label: "Curso", render: (row: Course) => row.title },
            { key: "pathName", label: "Trilha", render: (row: Course) => row.pathName },
            { key: "modality", label: "Modalidade", render: (row: Course) => row.modality },
            { key: "status", label: "Status", render: (row: Course) => row.status }
          ],
          onEdit: (row: Course) => {
            setEditingId(row.id);
            setForm({
              title: row.title,
              pathId: row.pathId,
              modality: row.modality,
              durationLabel: row.durationLabel,
              price: String(row.price),
              status: row.status,
              shortDescription: row.shortDescription,
              fullDescription: row.fullDescription,
              image: row.image,
              level: row.level,
              objectives: row.objectives || [],
              benefits: row.benefits || [],
              modules: row.modules || []
            });
            setValidationErrors([]);
            setOpen(true);
          },
          onDelete: (row: Course) => store.deleteCourse(row.id),
          onSave: () => {
            const validation = validateCourse(
              { ...form, objectives: JSON.stringify(form.objectives), benefits: JSON.stringify(form.benefits) },
              form.modules
            );

            if (!validation.valid) {
              setValidationErrors(validation.errors);
              return;
            }

            try {
              store.upsertCourse({
                id: editingId ?? undefined,
                title: form.title,
                pathId: form.pathId,
                modality: form.modality as Course["modality"],
                durationLabel: form.durationLabel,
                durationHours: Number(form.durationLabel?.replace(/\D/g, "") || 8),
                price: Number(form.price || 0),
                status: form.status as Course["status"],
                shortDescription: form.shortDescription,
                fullDescription: form.fullDescription,
                image: form.image,
                level: form.level as Course["level"],
                objectives: form.objectives || [],
                benefits: form.benefits || [],
                modules: form.modules || []
              });
              toast.success(editingId ? "Curso atualizado com sucesso!" : "Curso criado com sucesso!");
              setOpen(false);
              setValidationErrors([]);
            } catch (error) {
              toast.error(`Erro ao salvar: ${error instanceof Error ? error.message : "Tente novamente"}`);
            }
          },
          fields: [
            { key: "title", label: "Nome do curso", type: "text", required: true },
            { key: "pathId", label: "Trilha", type: "select", options: pathOptions, required: true },
            { key: "modality", label: "Modalidade", type: "select", options: modalityOptions, required: true },
            { key: "level", label: "Nível", type: "select", options: [
              { value: "Básico", label: "Básico" },
              { value: "Intermediário", label: "Intermediário" },
              { value: "Avançado", label: "Avançado" },
              { value: "Básico / Intermediário", label: "Básico / Intermediário" }
            ], required: true },
            { key: "status", label: "Status", type: "select", options: statusOptions, required: true },
            { key: "durationLabel", label: "Carga horária", type: "text", required: true },
            { key: "price", label: "Preço (R$)", type: "number", required: true },
            { key: "image", label: "URL da imagem", type: "text" },
            { key: "shortDescription", label: "Descrição curta", type: "textarea", required: true },
            { key: "fullDescription", label: "Descrição completa", type: "textarea", required: true },
            { key: "objectives", label: "Objetivos", type: "array" },
            { key: "benefits", label: "Benefícios", type: "array" },
            { key: "modules", label: "Módulos", type: "modules" }
          ] as FieldConfig[]
        };
      }
      case "classes": {
        const rows = store.classes.filter((item) => item.id.toLowerCase().includes(search.toLowerCase()));
        const courseOptions = store.courses.map(c => ({ value: c.id, label: c.title }));
        const modalityOptions = [
          { value: "Ao vivo online", label: "Ao vivo online" },
          { value: "Presencial", label: "Presencial" },
          { value: "In company", label: "In company" },
          { value: "Híbrido", label: "Híbrido" },
          { value: "Gravado", label: "Gravado" }
        ];
        const classStatusOptions = [
          { value: "Inscrições abertas", label: "Inscrições abertas" },
          { value: "Poucas vagas", label: "Poucas vagas" },
          { value: "Encerrada", label: "Encerrada" },
          { value: "Em breve", label: "Em breve" }
        ];
        const instructorOptions = store.instructors.map(i => ({ value: i.id, label: i.name }));

        return {
          title: "Gestão de turmas",
          description: "Editar calendário, status, instrutores e vagas das turmas.",
          rows,
          columns: [
            { key: "id", label: "ID", render: (row: TrainingClass) => row.id },
            { key: "course", label: "Curso", render: (row: TrainingClass) => store.courses.find((course) => course.id === row.courseId)?.title ?? "--" },
            { key: "date", label: "Data", render: (row: TrainingClass) => new Intl.DateTimeFormat("pt-BR").format(new Date(row.startDate)) },
            { key: "status", label: "Status", render: (row: TrainingClass) => row.status }
          ],
          onEdit: (row: TrainingClass) => {
            setEditingId(row.id);
            setForm({
              courseId: row.courseId,
              startDate: row.startDate.slice(0, 10),
              modality: row.modality,
              status: row.status,
              location: row.location,
              instructorId: row.instructorId || ""
            });
            setValidationErrors([]);
            setOpen(true);
          },
          onDelete: (row: TrainingClass) => store.deleteClass(row.id),
          onSave: () => {
            const validation = validateClass(form);

            if (!validation.valid) {
              setValidationErrors(validation.errors);
              return;
            }

            try {
              store.upsertClass({
                id: editingId ?? undefined,
                courseId: form.courseId,
                startDate: `${form.startDate}T09:00:00.000Z`,
                endDate: `${form.startDate}T18:00:00.000Z`,
                modality: form.modality as TrainingClass["modality"],
                status: form.status as TrainingClass["status"],
                location: form.location,
                instructorId: form.instructorId || undefined
              });
              toast.success(editingId ? "Turma atualizada com sucesso!" : "Turma criada com sucesso!");
              setOpen(false);
              setValidationErrors([]);
            } catch (error) {
              toast.error(`Erro ao salvar: ${error instanceof Error ? error.message : "Tente novamente"}`);
            }
          },
          fields: [
            { key: "courseId", label: "Curso", type: "select", options: courseOptions, required: true },
            { key: "startDate", label: "Data de início", type: "date", required: true },
            { key: "modality", label: "Modalidade", type: "select", options: modalityOptions, required: true },
            { key: "status", label: "Status", type: "select", options: classStatusOptions, required: true },
            { key: "instructorId", label: "Instrutor", type: "select", options: instructorOptions },
            { key: "location", label: "Local", type: "text" }
          ]
        };
      }
      case "students": {
        const rows = store.students.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));
        const enrollmentStatusOptions = [
          { value: "Pendente", label: "Pendente" },
          { value: "Aguardando pagamento", label: "Aguardando pagamento" },
          { value: "Confirmada", label: "Confirmada" },
          { value: "Cancelada", label: "Cancelada" },
          { value: "Concluída", label: "Concluída" }
        ];

        return {
          title: "Gestão de alunos",
          description: "Visualizar dados, curso, turma e status de inscrição.",
          rows,
          columns: [
            { key: "name", label: "Aluno", render: (row: Student) => row.name },
            { key: "email", label: "E-mail", render: (row: Student) => row.email },
            { key: "organization", label: "Empresa/órgão", render: (row: Student) => row.organization },
            { key: "status", label: "Status", render: (row: Student) => row.enrollmentStatus }
          ],
          onEdit: (row: Student) => {
            setEditingId(row.id);
            setForm({
              name: row.name,
              email: row.email,
              organization: row.organization,
              enrollmentStatus: row.enrollmentStatus
            });
            setValidationErrors([]);
            setOpen(true);
          },
          onDelete: undefined,
          onSave: () => {
            if (!editingId) return;

            const validation = validateStudent(form);
            if (!validation.valid) {
              setValidationErrors(validation.errors);
              return;
            }

            try {
              store.updateStudent({
                id: editingId,
                name: form.name,
                email: form.email,
                organization: form.organization,
                enrollmentStatus: form.enrollmentStatus as Student["enrollmentStatus"]
              });
              toast.success("Aluno atualizado com sucesso!");
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
            { key: "enrollmentStatus", label: "Status", type: "select", options: enrollmentStatusOptions, required: true }
          ]
        };
      }
      case "leads": {
        const rows = store.leads.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));
        const courseOptions = store.courses.map(c => ({ value: c.id, label: c.title }));
        const originOptions = [
          { value: "Site", label: "Site" },
          { value: "WhatsApp", label: "WhatsApp" },
          { value: "Blog", label: "Blog" },
          { value: "Indicação", label: "Indicação" },
          { value: "LinkedIn", label: "LinkedIn" }
        ];
        const leadStatusOptions = [
          { value: "Novo", label: "Novo" },
          { value: "Em atendimento", label: "Em atendimento" },
          { value: "Proposta enviada", label: "Proposta enviada" },
          { value: "Convertido", label: "Convertido" },
          { value: "Perdido", label: "Perdido" }
        ];

        return {
          title: "Gestão de leads",
          description: "Funil com origem, interesse e estágio comercial.",
          rows,
          columns: [
            { key: "name", label: "Lead", render: (row: Lead) => row.name },
            { key: "origin", label: "Origem", render: (row: Lead) => row.origin },
            { key: "courseInterest", label: "Interesse", render: (row: Lead) => row.courseInterest },
            { key: "status", label: "Status", render: (row: Lead) => row.status }
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
              mainChallenges: row.mainChallenges || ""
            });
            setValidationErrors([]);
            setOpen(true);
          },
          onDelete: undefined,
          onSave: () => {
            const validation = validateLead(form);

            if (!validation.valid) {
              setValidationErrors(validation.errors);
              return;
            }

            try {
              if (editingId) {
                store.updateLeadStatus(editingId, form.status as Lead["status"]);
              } else {
                store.createLead({
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
                  message: form.message || "Lead criado manualmente no admin."
                });
              }
              toast.success(editingId ? "Lead atualizado com sucesso!" : "Lead criado com sucesso!");
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
            { key: "mainChallenges", label: "Desafios principais", type: "textarea" }
          ]
        };
      }
      case "enrollments": {
        const rows = store.enrollments.filter((item) => item.studentName.toLowerCase().includes(search.toLowerCase()));
        const enrollmentStatusOptions = [
          { value: "Pendente", label: "Pendente" },
          { value: "Aguardando pagamento", label: "Aguardando pagamento" },
          { value: "Confirmada", label: "Confirmada" },
          { value: "Cancelada", label: "Cancelada" },
          { value: "Concluída", label: "Concluída" }
        ];

        return {
          title: "Gestão de inscrições",
          description: "Acompanhar inscrição, curso, turma e forma de pagamento simulada.",
          rows,
          columns: [
            { key: "studentName", label: "Aluno", render: (row: Enrollment) => row.studentName },
            { key: "course", label: "Curso", render: (row: Enrollment) => store.courses.find((course) => course.id === row.courseId)?.title ?? "--" },
            { key: "paymentMethod", label: "Pagamento", render: (row: Enrollment) => row.paymentMethod },
            { key: "status", label: "Status", render: (row: Enrollment) => row.status }
          ],
          onEdit: (row: Enrollment) => {
            setEditingId(row.id);
            setForm({ status: row.status });
            setValidationErrors([]);
            setOpen(true);
          },
          onDelete: undefined,
          onSave: () => {
            if (!editingId) return;

            const validation = validateEnrollment(form);
            if (!validation.valid) {
              setValidationErrors(validation.errors);
              return;
            }

            try {
              store.updateEnrollmentStatus(editingId, form.status as Enrollment["status"]);
              toast.success("Inscrição atualizada com sucesso!");
              setOpen(false);
              setValidationErrors([]);
            } catch (error) {
              toast.error(`Erro ao salvar: ${error instanceof Error ? error.message : "Tente novamente"}`);
            }
          },
          fields: [
            { key: "status", label: "Status", type: "select", options: enrollmentStatusOptions, required: true }
          ]
        };
      }
      case "instructors": {
        const rows = store.instructors.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));
        const instructorStatusOptions = [
          { value: "Ativo", label: "Ativo" },
          { value: "Inativo", label: "Inativo" }
        ];

        return {
          title: "Gestão de instrutores",
          description: "Criar, editar, vincular cursos e acompanhar especialidades.",
          rows,
          columns: [
            { key: "name", label: "Instrutor", render: (row: Instructor) => row.name },
            { key: "email", label: "E-mail", render: (row: Instructor) => row.email },
            { key: "specialty", label: "Especialidade", render: (row: Instructor) => row.specialty },
            { key: "status", label: "Status", render: (row: Instructor) => row.status }
          ],
          onEdit: (row: Instructor) => {
            setEditingId(row.id);
            setForm({
              name: row.name,
              email: row.email,
              phone: row.phone || "",
              specialty: row.specialty,
              bio: row.bio || "",
              status: row.status,
              courseIds: row.courseIds || []
            });
            setValidationErrors([]);
            setOpen(true);
          },
          onDelete: (row: Instructor) => store.deleteInstructor(row.id),
          onSave: () => {
            const validation = validateInstructor(form);

            if (!validation.valid) {
              setValidationErrors(validation.errors);
              return;
            }

            try {
              store.upsertInstructor({
                id: editingId ?? undefined,
                name: form.name,
                email: form.email,
                phone: form.phone || undefined,
                specialty: form.specialty,
                bio: form.bio || undefined,
                status: form.status as Instructor["status"],
                courseIds: form.courseIds || []
              });
              toast.success(editingId ? "Instrutor atualizado com sucesso!" : "Instrutor criado com sucesso!");
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
            { key: "specialty", label: "Especialidade", type: "text", required: true },
            { key: "bio", label: "Biografia", type: "textarea" },
            { key: "status", label: "Status", type: "select", options: instructorStatusOptions, required: true }
          ]
        };
      }
      case "blog": {
        const rows = store.blogPosts.filter((item) => item.title.toLowerCase().includes(search.toLowerCase()));
        const categoryOptions = [
          { value: "Departamento Pessoal", label: "Departamento Pessoal" },
          { value: "eSocial", label: "eSocial" },
          { value: "Gestão Pública", label: "Gestão Pública" },
          { value: "Liderança", label: "Liderança" },
          { value: "Tecnologia", label: "Tecnologia" },
          { value: "Assédio e Compliance", label: "Assédio e Compliance" }
        ];
        const blogStatusOptions = [
          { value: "Rascunho", label: "Rascunho" },
          { value: "Publicado", label: "Publicado" },
          { value: "Arquivado", label: "Arquivado" }
        ];
        const courseOptions = store.courses.map(c => ({ value: c.id, label: c.title }));

        return {
          title: "Gestão do blog",
          description: "CRUD local para posts, categorias e status editoriais.",
          rows,
          columns: [
            { key: "title", label: "Post", render: (row: BlogPost) => row.title },
            { key: "category", label: "Categoria", render: (row: BlogPost) => row.category },
            { key: "author", label: "Autor", render: (row: BlogPost) => row.author },
            { key: "status", label: "Status", render: (row: BlogPost) => row.status }
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
              relatedCourseId: row.relatedCourseId || ""
            });
            setValidationErrors([]);
            setOpen(true);
          },
          onDelete: (row: BlogPost) => store.deleteBlogPost(row.id),
          onSave: () => {
            const validation = validateBlogPost(form);

            if (!validation.valid) {
              setValidationErrors(validation.errors);
              return;
            }

            try {
              store.upsertBlogPost({
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
                relatedCourseId: form.relatedCourseId || undefined
              });
              toast.success(editingId ? "Post atualizado com sucesso!" : "Post criado com sucesso!");
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
            { key: "relatedCourseId", label: "Curso relacionado", type: "select", options: courseOptions }
          ]
        };
      }
    }
  }, [editingId, resource, search, store, form]);

  const rows = config.rows as Array<{ id: string }>;

  return (
    <section className="page-section">
      <div className="container space-y-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <span className="eyebrow">{config.title}</span>
            <h1 className="mt-3 text-4xl font-semibold">{config.title}</h1>
            <p className="mt-2 max-w-3xl text-base leading-7 text-muted-foreground">{config.description}</p>
          </div>
          <div className="flex gap-2">
            {config.rows.length > 0 && (
              <Button variant="outline" onClick={() => exportToCSV(config.rows, resource)}>
                <Download className="h-4 w-4" />
                Exportar CSV
              </Button>
            )}
            <Button onClick={() => { setEditingId(null); setForm({}); setOpen(true); }}>
              <Plus className="h-4 w-4" />
              Novo item
            </Button>
          </div>
        </div>

        <div className="surface-card space-y-4 p-5">
          <SearchInput value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nome, título ou referência..." />
          {rows.length ? (
            <DataTable
              data={rows}
              columns={config.columns as never}
              onEdit={config.onEdit as never}
              onDelete={config.onDelete as never}
            />
          ) : (
            <EmptyState title="Nenhum registro encontrado." description="Crie um novo item para validar o CRUD local desta área." actionLabel="Criar agora" onAction={() => setOpen(true)} />
          )}
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar item" : "Criar novo item"}</DialogTitle>
              <DialogDescription>
                Preencha os campos obrigatórios marcados com *
              </DialogDescription>
            </DialogHeader>

            {validationErrors.length > 0 && (
              <div className="rounded-md bg-destructive/10 p-3 border border-destructive/20">
                <p className="text-sm font-medium text-destructive mb-2">Erros encontrados:</p>
                <ul className="text-xs text-destructive space-y-1">
                  {validationErrors.map((error, i) => (
                    <li key={i} className="flex gap-2">
                      <span>•</span>
                      <span>{error.message}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid gap-4">
              {config.fields.map((field) => {
                const fieldError = errorsByField[field.key];

                if (field.type === "modules") {
                  return (
                    <ModulesBuilder
                      key={field.key}
                      label={field.label}
                      value={form[field.key] || []}
                      onChange={(v) => setForm((current) => ({ ...current, [field.key]: v }))}
                      error={fieldError}
                    />
                  );
                }

                if (field.type === "array") {
                  return (
                    <ArrayInput
                      key={field.key}
                      label={field.label}
                      value={form[field.key] || []}
                      onChange={(v) => setForm((current) => ({ ...current, [field.key]: v }))}
                      error={fieldError}
                    />
                  );
                }

                if (field.type === "multiselect" && field.options) {
                  return (
                    <MultiSelectField
                      key={field.key}
                      label={field.label}
                      value={form[field.key] || []}
                      options={field.options}
                      onChange={(v) => setForm((current) => ({ ...current, [field.key]: v }))}
                      error={fieldError}
                    />
                  );
                }

                if (field.type === "select" && field.options) {
                  return (
                    <SelectField
                      key={field.key}
                      label={field.label}
                      value={form[field.key] ?? ""}
                      options={field.options}
                      onChange={(v) => setForm((current) => ({ ...current, [field.key]: v }))}
                      required={field.required}
                      error={fieldError}
                    />
                  );
                }

                if (field.type === "textarea") {
                  return (
                    <div key={field.key} className="flex flex-col gap-2">
                      <label className="text-sm font-medium">
                        {field.label}
                        {field.required && <span className="text-destructive ml-1">*</span>}
                      </label>
                      <textarea
                        placeholder={field.label}
                        value={form[field.key] ?? ""}
                        onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value }))}
                        className="min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      {fieldError && <p className="text-xs text-destructive">{fieldError}</p>}
                    </div>
                  );
                }

                if (field.type === "number") {
                  return (
                    <div key={field.key} className="flex flex-col gap-2">
                      <label className="text-sm font-medium">
                        {field.label}
                        {field.required && <span className="text-destructive ml-1">*</span>}
                      </label>
                      <input
                        type="number"
                        placeholder={field.label}
                        value={form[field.key] ?? ""}
                        onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value }))}
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      {fieldError && <p className="text-xs text-destructive">{fieldError}</p>}
                    </div>
                  );
                }

                if (field.type === "date") {
                  return (
                    <div key={field.key} className="flex flex-col gap-2">
                      <label className="text-sm font-medium">
                        {field.label}
                        {field.required && <span className="text-destructive ml-1">*</span>}
                      </label>
                      <input
                        type="date"
                        value={form[field.key] ?? ""}
                        onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value }))}
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      {fieldError && <p className="text-xs text-destructive">{fieldError}</p>}
                    </div>
                  );
                }

                return (
                  <div key={field.key} className="flex flex-col gap-2">
                    <label className="text-sm font-medium">
                      {field.label}
                      {field.required && <span className="text-destructive ml-1">*</span>}
                    </label>
                    <Input
                      placeholder={field.label}
                      value={form[field.key] ?? ""}
                      onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value }))}
                    />
                    {fieldError && <p className="text-xs text-destructive">{fieldError}</p>}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-3">
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button onClick={() => config.onSave()}>
                Salvar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
