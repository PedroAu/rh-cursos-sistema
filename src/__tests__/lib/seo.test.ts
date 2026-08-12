import { describe, expect, it } from "vitest";

import { getPublicCourseName } from "@/lib/seo";
import { buildAgendaEventJsonLd } from "@/lib/seo";
import type { Course, TrainingClass } from "@/types";

const course: Course = {
  id: "course-1",
  slug: "esocial-leiaute-1-3",
  title: "eSocial Leiaute 1.3",
  pathId: "path-dp",
  pathName: "Departamento Pessoal",
  modality: "Ao vivo online",
  durationLabel: "8h",
  durationHours: 8,
  level: "Intermediário",
  price: 1200,
  shortDescription: "Atualização prática do eSocial para equipes de RH.",
  fullDescription: "Conteúdo completo sobre eSocial.",
  targetAudience: [],
  objectives: [],
  benefits: [],
  modules: [],
  instructorId: "instructor-1",
  image: "/images/course.jpg",
  rating: 5,
  studentsCount: 0,
  status: "Ativo",
  featured: false,
  nextClassId: "class-1"
};

const trainingClass = (overrides: Partial<TrainingClass> = {}): TrainingClass => ({
  id: "class-1",
  courseId: course.id,
  startDate: "2026-09-10",
  endDate: "2026-09-11",
  time: "08:00 às 17:00",
  modality: "Ao vivo online",
  location: "",
  instructorId: "instructor-1",
  totalSeats: 20,
  filledSeats: 0,
  availableSeats: 20,
  status: "Inscrições abertas",
  price: 1500,
  notes: "",
  ...overrides
});

describe("SEO de cursos", () => {
  it("expande o prefixo de curso e a sigla DP", () => {
    expect(getPublicCourseName("eSocial Leiaute 1.3")).toBe("Curso de eSocial Leiaute 1.3");
    expect(getPublicCourseName("DP na Prática (CLT)")).toBe("Curso de Departamento Pessoal na Prática (CLT)");
  });

  it("não duplica o prefixo quando o título já está padronizado", () => {
    expect(getPublicCourseName("Curso de Folha de Pagamento")).toBe("Curso de Folha de Pagamento");
  });

  it("preserva títulos naturais que já começam com Curso", () => {
    expect(getPublicCourseName("Curso Prático de Atualização do eSocial")).toBe(
      "Curso Prático de Atualização do eSocial"
    );
    expect(getPublicCourseName("Curso Completo de Departamento Pessoal")).toBe(
      "Curso Completo de Departamento Pessoal"
    );
    expect(getPublicCourseName("Curso de Prático de Atualização do eSocial")).toBe(
      "Curso Prático de Atualização do eSocial"
    );
    expect(getPublicCourseName("Curso de Completo de Departamento Pessoal")).toBe(
      "Curso Completo de Departamento Pessoal"
    );
  });

  it("gera eventos futuros com modalidade online e exclui turmas encerradas ou passadas", () => {
    const events = buildAgendaEventJsonLd(
      [course],
      [
        trainingClass(),
        trainingClass({ id: "class-past", startDate: "2026-08-11" }),
        trainingClass({ id: "class-closed", status: "Encerrada" }),
        trainingClass({ id: "class-unknown", courseId: "missing-course" })
      ],
      "2026-08-12"
    );

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      "@type": "Event",
      name: "Curso de eSocial Leiaute 1.3",
      startDate: "2026-09-10",
      endDate: "2026-09-11",
      eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
      location: {
        "@type": "VirtualLocation",
        url: "https://www.rhcursos.com.br/cursos/esocial-leiaute-1-3/"
      },
      offers: {
        "@type": "Offer",
        price: 1500,
        priceCurrency: "BRL"
      }
    });
  });

  it("descreve turmas presenciais e híbridas com local público", () => {
    const events = buildAgendaEventJsonLd(
      [course],
      [
        trainingClass({ id: "class-onsite", modality: "Presencial", location: "Brasília - DF" }),
        trainingClass({ id: "class-hybrid", modality: "Híbrido", location: "São Paulo - SP" })
      ],
      "2026-08-12"
    );

    expect(events[0]).toMatchObject({
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      location: { "@type": "Place", name: "Brasília - DF" }
    });
    expect(events[1]).toMatchObject({
      eventAttendanceMode: "https://schema.org/MixedEventAttendanceMode",
      location: [
        { "@type": "Place", name: "São Paulo - SP" },
        { "@type": "VirtualLocation" }
      ]
    });
  });
});
