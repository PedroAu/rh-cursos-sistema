import { describe, expect, it } from "vitest";

import {
  mapAssessmentToTestimonial,
  mapBlogPost,
  mapCourse,
  type AssessmentWithCourseRow,
  type BlogPostRow,
  type ClassRow,
  type CourseInstructorRow,
  type CourseRow
} from "@/lib/supabase/mappers";

const courseRow: CourseRow = {
  id: "course-1",
  titulo: "Curso de Teste",
  slug: "curso-de-teste",
  descricao_curta: "Resumo",
  descricao: "Descricao completa",
  ementa: [
    {
      titulo: "Modulo 1",
      descricao: "Conteudo",
      topicos: ["Topico A"],
      duracao: "2h"
    }
  ],
  objetivos: ["Objetivo"],
  beneficios: ["Beneficio"],
  publico_alvo: ["Publico"],
  carga_horaria: 8,
  modalidade: "Online",
  nivel: "Basico",
  categoria: "Tecnologia",
  trilha_id: "path-tech",
  trilha_nome: null,
  preco_base: 1200,
  status: "Destaque",
  destaque: false,
  imagem_capa: null,
  rating: 4.75,
  total_alunos: 42,
  created_at: "2026-06-01T10:00:00Z",
  updated_at: "2026-06-01T10:00:00Z",
  deleted_at: null
};

const classRow: ClassRow = {
  id: "class-1",
  curso_id: "course-1",
  instrutor_id: "inst-1",
  data_inicio: "2026-07-10",
  data_fim: "2026-07-11",
  horario: "09:00 as 17:00",
  local: "Online",
  vagas_total: 30,
  vagas_preenchidas: 10,
  vagas_restantes: 20,
  preco_turma: 1200,
  modalidade: "Online",
  status: "Aberta",
  observacoes: null,
  created_at: "2026-06-01T10:00:00Z",
  updated_at: "2026-06-01T10:00:00Z",
  deleted_at: null
};

const courseInstructorRow: CourseInstructorRow = {
  id: "join-1",
  curso_id: "course-1",
  instrutor_id: "inst-1",
  principal: true,
  created_at: "2026-06-01T10:00:00Z"
};

describe("Supabase mappers", () => {
  it("maps courses without depending on mock data fallbacks", () => {
    const course = mapCourse(courseRow, [courseInstructorRow], [classRow]);

    expect(course.pathName).toBe("Tecnologia e Dados");
    expect(course.image).toBe("/images/courses/tecnologia-inovacao.jpg");
    expect(course.status).toBe("Destaque");
    expect(course.featured).toBe(true);
    expect(course.instructorId).toBe("inst-1");
    expect(course.nextClassId).toBe("class-1");
  });

  it("maps published blog rows to public blog posts", () => {
    const row: BlogPostRow = {
      id: "post-1",
      titulo: "Post publicado",
      slug: "post-publicado",
      resumo: "Resumo do post",
      conteudo: "Conteudo completo",
      categoria: "Departamento Pessoal",
      tags: ["dp", "folha", 123],
      autor: "Equipe",
      publicado_em: "2026-06-02T10:00:00Z",
      tempo_leitura: null,
      status: "Publicado",
      imagem_url: null,
      curso_id: "course-1",
      created_at: "2026-06-01T10:00:00Z",
      updated_at: "2026-06-01T10:00:00Z",
      deleted_at: null
    };

    expect(mapBlogPost(row)).toEqual({
      id: "post-1",
      title: "Post publicado",
      slug: "post-publicado",
      summary: "Resumo do post",
      content: "Conteudo completo",
      category: "Departamento Pessoal",
      tags: ["dp", "folha"],
      author: "Equipe",
      date: "2026-06-02T10:00:00Z",
      readingTime: "5 min",
      status: "Publicado",
      image: "",
      relatedCourseId: "course-1"
    });
  });

  it("falls back unsupported blog categories to Tecnologia", () => {
    const row = {
      id: "post-2",
      titulo: "Post",
      slug: "post",
      resumo: "Resumo",
      conteudo: "Conteudo",
      categoria: "Categoria externa",
      tags: [],
      autor: "Equipe",
      publicado_em: null,
      tempo_leitura: "3 min",
      status: "Publicado",
      imagem_url: "/post.jpg",
      curso_id: null,
      created_at: "2026-06-01T10:00:00Z",
      updated_at: "2026-06-01T10:00:00Z",
      deleted_at: null
    } satisfies BlogPostRow;

    expect(mapBlogPost(row).category).toBe("Tecnologia");
    expect(mapBlogPost(row).date).toBe("2026-06-01T10:00:00Z");
  });

  it("maps public assessment rows to testimonials from available schema fields", () => {
    const testimonial = mapAssessmentToTestimonial({
      id: "avaliacao-1",
      inscricao_id: "enrollment-1",
      turma_id: "class-1",
      nota: 6,
      comentario: "Conteudo objetivo e aplicavel.",
      publicar: true,
      created_at: "2026-06-01T10:00:00Z",
      updated_at: "2026-06-01T10:00:00Z",
      deleted_at: null,
      turma: {
        curso: {
          titulo: "Curso de Teste"
        }
      }
    } satisfies AssessmentWithCourseRow);

    expect(testimonial).toEqual({
      id: "avaliacao-1",
      name: "Aluno RH Cursos",
      role: "Participante",
      organization: "Turma pública",
      course: "Curso de Teste",
      text: "Conteudo objetivo e aplicavel.",
      rating: 5
    });
  });
});
