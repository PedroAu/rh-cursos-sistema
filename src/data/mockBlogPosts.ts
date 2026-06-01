import { mockCourses } from "@/data/mockCourses";
import { slugify } from "@/lib/utils";
import type { BlogPost } from "@/types";

const seeds = [
  {
    title: "Como reduzir retrabalho no departamento pessoal com processos mais claros",
    category: "Departamento Pessoal" as const,
    author: "Mariana Teles",
    tags: ["folha", "rotina", "produtividade"],
    courseIndex: 0
  },
  {
    title: "3 alertas para revisar antes de enviar eventos do eSocial",
    category: "eSocial" as const,
    author: "Gustavo Ribeiro",
    tags: ["esocial", "compliance", "eventos"],
    courseIndex: 5
  },
  {
    title: "Quando a inexigibilidade faz sentido para contratação de capacitação",
    category: "Gestão Pública" as const,
    author: "Ricardo Braga",
    tags: ["contratação", "gestão pública", "capacitação"],
    courseIndex: 12
  },
  {
    title: "Liderança humanizada: o que muda na rotina do gestor",
    category: "Liderança" as const,
    author: "Patrícia Nogueira",
    tags: ["liderança", "equipes", "gestão"],
    courseIndex: 18
  },
  {
    title: "Power BI para RH: por onde começar sem complicar",
    category: "Tecnologia" as const,
    author: "Bianca Salles",
    tags: ["power bi", "dashboards", "rh"],
    courseIndex: 20
  },
  {
    title: "Como prevenir assédio moral e sexual com políticas mais claras",
    category: "Assédio e Compliance" as const,
    author: "Felipe Azevedo",
    tags: ["compliance", "assédio", "políticas"],
    courseIndex: 17
  },
  {
    title: "FGTS Digital e DCTFWeb: onde equipes mais erram",
    category: "eSocial" as const,
    author: "Gustavo Ribeiro",
    tags: ["fgts digital", "dctfweb", "obrigações"],
    courseIndex: 7
  },
  {
    title: "Indicadores de treinamento que ajudam a provar valor para a gestão",
    category: "Tecnologia" as const,
    author: "Henrique Monteiro",
    tags: ["indicadores", "treinamento", "dados"],
    courseIndex: 24
  }
];

export const mockBlogPosts: BlogPost[] = seeds.map((seed, index) => {
  const course = mockCourses[seed.courseIndex];
  return {
    id: `post-${index + 1}`,
    title: seed.title,
    slug: slugify(seed.title),
    summary:
      "Conteúdo orientado à prática, com foco em clareza, segurança técnica e decisões mais consistentes no dia a dia.",
    content: [
      "Este conteúdo foi criado para demonstrar uma experiência editorial realista, com leitura fluida, sem exageros e conectada à jornada comercial da plataforma.",
      "A proposta é mostrar como a empresa pode educar o lead, reforçar autoridade e conectar o problema do público a uma solução formativa aplicável.",
      "Ao longo do artigo, a navegação deve favorecer leitura confortável, boa hierarquia e CTA contextual para o curso relacionado."
    ].join("\n\n"),
    category: seed.category,
    tags: seed.tags,
    author: seed.author,
    date: `2026-04-${String(index + 10).padStart(2, "0")}T10:00:00.000Z`,
    readingTime: `${4 + (index % 4)} min`,
    status: index === 6 ? "Rascunho" : index === 7 ? "Arquivado" : "Publicado",
    image: `https://images.unsplash.com/photo-${1521737604893 + index * 111}?auto=format&fit=crop&w=1200&q=80`,
    relatedCourseId: course.id
  };
});
