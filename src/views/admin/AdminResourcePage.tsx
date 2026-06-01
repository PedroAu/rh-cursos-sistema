import { Plus } from "lucide-react";
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
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/lib/app-store";
import { useHotkey } from "@/hooks/use-hotkey";
import type { BlogPost, Course, Enrollment, Instructor, Lead, Student, TrainingClass } from "@/types";

type ResourceKey = "courses" | "classes" | "students" | "leads" | "enrollments" | "instructors" | "blog";

type FieldConfig = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "select" | "array" | "modules";
  options?: Array<{ value: string; label: string }>;
};

export function AdminResourcePage({ resource }: { resource: ResourceKey }) {
  const store = useAppStore();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});

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
              objectives: JSON.stringify(row.objectives),
              benefits: JSON.stringify(row.benefits),
              modules: JSON.stringify(row.modules)
            });
            setOpen(true);
          },
          onDelete: (row: Course) => store.deleteCourse(row.id),
          onSave: () => {
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
                objectives: form.objectives ? JSON.parse(form.objectives) : [],
                benefits: form.benefits ? JSON.parse(form.benefits) : [],
                modules: form.modules ? JSON.parse(form.modules) : []
              });
              setOpen(false);
            } catch {
              toast.error("Erro ao salvar. Verifique os dados JSON dos campos de lista.");
            }
          },
          fields: [
            { key: "title", label: "Nome do curso", type: "text" as const },
            { key: "pathId", label: "Trilha", type: "text" as const },
            { key: "modality", label: "Modalidade", type: "text" as const },
            { key: "durationLabel", label: "Carga horária", type: "text" as const },
            { key: "price", label: "Preço", type: "text" as const },
            { key: "level", label: "Nível", type: "select" as const, options: [
              { value: "Básico", label: "Básico" },
              { value: "Intermediário", label: "Intermediário" },
              { value: "Avançado", label: "Avançado" },
              { value: "Básico / Intermediário", label: "Básico / Intermediário" }
            ] },
            { key: "status", label: "Status", type: "text" as const },
            { key: "shortDescription", label: "Descrição curta", type: "textarea" as const },
            { key: "fullDescription", label: "Descrição completa", type: "textarea" as const },
            { key: "image", label: "URL da imagem", type: "text" as const },
            { key: "objectives", label: "Objetivos (JSON)", type: "textarea" as const },
            { key: "benefits", label: "Benefícios (JSON)", type: "textarea" as const },
            { key: "modules", label: "Módulos (JSON)", type: "textarea" as const }
          ] as FieldConfig[]
        };
      }
      case "classes": {
        const rows = store.classes.filter((item) => item.id.toLowerCase().includes(search.toLowerCase()));
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
            setForm({ courseId: row.courseId, startDate: row.startDate.slice(0, 10), modality: row.modality, status: row.status, location: row.location });
            setOpen(true);
          },
          onDelete: (row: TrainingClass) => store.deleteClass(row.id),
          onSave: () => {
            store.upsertClass({
              id: editingId ?? undefined,
              courseId: form.courseId,
              startDate: `${form.startDate}T09:00:00.000Z`,
              endDate: `${form.startDate}T18:00:00.000Z`,
              modality: form.modality as TrainingClass["modality"],
              status: form.status as TrainingClass["status"],
              location: form.location
            });
            setOpen(false);
          },
          fields: [
            { key: "courseId", label: "Curso" },
            { key: "startDate", label: "Data de início" },
            { key: "modality", label: "Modalidade" },
            { key: "status", label: "Status" },
            { key: "location", label: "Local" }
          ]
        };
      }
      case "students": {
        const rows = store.students.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));
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
            setForm({ name: row.name, email: row.email, organization: row.organization, enrollmentStatus: row.enrollmentStatus });
            setOpen(true);
          },
          onDelete: undefined,
          onSave: () => {
            if (!editingId) return;
            store.updateStudent({ id: editingId, name: form.name, email: form.email, organization: form.organization, enrollmentStatus: form.enrollmentStatus as Student["enrollmentStatus"] });
            setOpen(false);
          },
          fields: [
            { key: "name", label: "Nome" },
            { key: "email", label: "E-mail" },
            { key: "organization", label: "Empresa / órgão" },
            { key: "enrollmentStatus", label: "Status" }
          ]
        };
      }
      case "leads": {
        const rows = store.leads.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));
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
            setForm({ name: row.name, email: row.email, courseInterest: row.courseInterest, origin: row.origin, status: row.status });
            setOpen(true);
          },
          onDelete: undefined,
          onSave: () => {
            if (editingId) {
              store.updateLeadStatus(editingId, form.status as Lead["status"]);
            } else {
              store.createLead({
                name: form.name,
                email: form.email,
                phone: "(61) 90000-0000",
                courseInterest: form.courseInterest,
                origin: form.origin as Lead["origin"],
                message: "Lead criado manualmente no admin."
              });
            }
            setOpen(false);
          },
          fields: [
            { key: "name", label: "Nome" },
            { key: "email", label: "E-mail" },
            { key: "courseInterest", label: "Curso de interesse" },
            { key: "origin", label: "Origem" },
            { key: "status", label: "Status" }
          ]
        };
      }
      case "enrollments": {
        const rows = store.enrollments.filter((item) => item.studentName.toLowerCase().includes(search.toLowerCase()));
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
            setOpen(true);
          },
          onDelete: undefined,
          onSave: () => {
            if (!editingId) return;
            store.updateEnrollmentStatus(editingId, form.status as Enrollment["status"]);
            setOpen(false);
          },
          fields: [{ key: "status", label: "Status" }]
        };
      }
      case "instructors": {
        const rows = store.instructors.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));
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
            setForm({ name: row.name, email: row.email, specialty: row.specialty, status: row.status });
            setOpen(true);
          },
          onDelete: (row: Instructor) => store.deleteInstructor(row.id),
          onSave: () => {
            store.upsertInstructor({
              id: editingId ?? undefined,
              name: form.name,
              email: form.email,
              specialty: form.specialty,
              status: form.status as Instructor["status"]
            });
            setOpen(false);
          },
          fields: [
            { key: "name", label: "Nome" },
            { key: "email", label: "E-mail" },
            { key: "specialty", label: "Especialidade" },
            { key: "status", label: "Status" }
          ]
        };
      }
      case "blog": {
        const rows = store.blogPosts.filter((item) => item.title.toLowerCase().includes(search.toLowerCase()));
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
            setForm({ title: row.title, category: row.category, author: row.author, status: row.status });
            setOpen(true);
          },
          onDelete: (row: BlogPost) => store.deleteBlogPost(row.id),
          onSave: () => {
            store.upsertBlogPost({
              id: editingId ?? undefined,
              title: form.title,
              category: form.category as BlogPost["category"],
              author: form.author,
              status: form.status as BlogPost["status"]
            });
            setOpen(false);
          },
          fields: [
            { key: "title", label: "Título" },
            { key: "category", label: "Categoria" },
            { key: "author", label: "Autor" },
            { key: "status", label: "Status" }
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
          <Button onClick={() => { setEditingId(null); setForm({}); setOpen(true); }}>
            <Plus className="h-4 w-4" />
            Novo item
          </Button>
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar item" : "Criar novo item"}</DialogTitle>
              <DialogDescription>Formulário simplificado para validação do fluxo administrativo local.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 max-h-96 overflow-y-auto">
              {config.fields.map((field: FieldConfig) => {
                if (field.type === "textarea") {
                  return (
                    <div key={field.key} className="flex flex-col gap-2">
                      <label className="text-sm font-medium">{field.label}</label>
                      <textarea
                        placeholder={field.label}
                        value={form[field.key] ?? ""}
                        onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value }))}
                        className="min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  );
                }
                if (field.type === "select" && field.options) {
                  return (
                    <div key={field.key} className="flex flex-col gap-2">
                      <label className="text-sm font-medium">{field.label}</label>
                      <select
                        value={form[field.key] ?? ""}
                        onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value }))}
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="">Selecione uma opção...</option>
                        {field.options.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                }
                return (
                  <Input
                    key={field.key}
                    placeholder={field.label}
                    value={form[field.key] ?? ""}
                    onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value }))}
                  />
                );
              })}
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button
                  onClick={() => {
                    if (config.fields.some((field: FieldConfig) => !form[field.key] && field.key !== "status")) {
                      toast.error("Preencha os campos obrigatórios para continuar.");
                      return;
                    }
                    config.onSave();
                  }}
                >
                  Salvar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
