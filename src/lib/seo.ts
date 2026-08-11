import type { Course, CoursePublicContent, TrainingClass } from "@/types";

export const SITE_URL = "https://www.rhcursos.com.br";

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "RH Cursos & Soluções",
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/images/brand/rh-cursos-logo-azul.png`,
  foundingDate: "2007",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Brasília",
    addressRegion: "DF",
    addressCountry: "BR"
  },
  telephone: "+55 61 3965-1929"
};

/**
 * Nome público/SEO dos cursos. Os slugs e os títulos persistidos continuam
 * sendo a fonte de verdade do catálogo; a expansão acontece apenas na
 * apresentação para manter a intenção de busca explícita.
 */
export function getPublicCourseName(title: string) {
  const expanded = title.trim().replace(/\bDP\b/gi, "Departamento Pessoal");

  if (/^curso\s+de\b/i.test(expanded)) {
    return expanded;
  }

  if (/^curso\b/i.test(expanded)) {
    return expanded.replace(/^curso\b/i, "Curso de");
  }

  return `Curso de ${expanded}`;
}

export function expandDepartmentPersonal(value: string) {
  return value.replace(/\bDP\b/gi, "Departamento Pessoal");
}

export function getCourseMetaDescription(course: Course) {
  const sourceTitle = course.title.toLowerCase();
  const title = getPublicCourseName(course.title);

  if (sourceTitle.includes("esocial") && sourceTitle.includes("leiaute 1.3")) {
    return "Curso prático de atualização do eSocial S-1.3 para órgãos públicos: eventos, prazos e conformidade na prática. Turmas abertas — garanta sua vaga.";
  }

  if (sourceTitle.includes("formação esocial") && sourceTitle.includes("rgps") && sourceTitle.includes("rpps")) {
    return "Formação completa de especialista em eSocial para órgãos públicos: regimes RGPS e RPPS, eventos e obrigações integradas. Inscreva-se na próxima turma.";
  }

  if (sourceTitle.includes("dp na prática") && sourceTitle.includes("clt")) {
    return "Curso de Departamento Pessoal na prática: admissão, folha, férias, rescisão e eSocial, do zero à autonomia total nas rotinas CLT. Certificado incluso.";
  }

  if (sourceTitle.includes("dp administração pública")) {
    return "Curso completo de Departamento Pessoal para a administração pública: folha do setor celetista com controle, conformidade e precisão. Veja a próxima turma.";
  }

  return `${title}: ${expandDepartmentPersonal(course.shortDescription)} Turmas abertas — conheça o conteúdo e garanta sua vaga.`;
}

function courseMode(modality: TrainingClass["modality"]) {
  if (modality === "Presencial") return "Onsite";
  if (modality === "Ao vivo online" || modality === "Gravado") return "Online";
  return "Blended";
}

function courseInstanceJsonLd(trainingClass: TrainingClass) {
  const instance: Record<string, unknown> = {
    "@type": "CourseInstance",
    courseMode: courseMode(trainingClass.modality),
    startDate: trainingClass.startDate,
    endDate: trainingClass.endDate
  };

  if (trainingClass.modality === "Presencial" && trainingClass.location) {
    instance.location = {
      "@type": "Place",
      name: trainingClass.location,
      address: trainingClass.location
    };
  }

  return instance;
}

export function getCourseFaqItems(course: Course, content?: CoursePublicContent, trainingClass?: TrainingClass) {
  if (content?.faqItems?.length) {
    return content.faqItems;
  }

  return [
    {
      question: "Como faço minha inscrição?",
      answer: trainingClass
        ? `Clique em “Enviar pré-inscrição”, selecione a turma e envie a solicitação para o ${getPublicCourseName(course.title)}.`
        : "Este curso ainda não tem turma aberta. Clique em “Manifestar interesse” para receber a próxima agenda."
    },
    {
      question: "Recebo certificado?",
      answer: `Sim. O ${getPublicCourseName(course.title)} tem carga de ${course.durationLabel} e certificado incluso conforme o fluxo de inscrição.`
    },
    {
      question: "Órgãos públicos podem contratar?",
      answer: "Sim. A RH Cursos atende órgãos públicos e empresas com turmas abertas, treinamentos in company e propostas sob medida."
    }
  ];
}

export function buildCourseJsonLd(
  course: Course,
  classes: TrainingClass[],
  content?: CoursePublicContent
) {
  const courseClasses = classes.filter((trainingClass) => trainingClass.courseId === course.id);
  const faqItems = getCourseFaqItems(course, content, courseClasses[0]);
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: getPublicCourseName(course.title),
    description: expandDepartmentPersonal(course.fullDescription || course.shortDescription),
    provider: organizationJsonLd,
    url: `${SITE_URL}/cursos/${course.slug}/`
  };

  if (courseClasses.length) {
    jsonLd.hasCourseInstance = courseClasses.map(courseInstanceJsonLd);
  }

  return {
    course: jsonLd,
    faq: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer
        }
      }))
    }
  };
}
