import type {
  BlogPost,
  Course,
  Instructor,
  Testimonial,
  TrainingClass,
} from "@/types";

/**
 * Dados mockados tipados, usados exclusivamente pelas stories do Storybook.
 *
 * Mantêm o mesmo formato dos tipos de domínio (`@/types`) para que os exemplos
 * reflitam a realidade do produto sem depender da store viva nem de rede.
 */
export const mockInstructor: Instructor = {
  id: "instructor-ana",
  name: "Ana Lima",
  email: "ana.lima@example.com",
  phone: "(61) 99999-2222",
  specialty: "eSocial e folha",
  bio: "Especialista em rotinas trabalhistas.",
  education: "MBA em Gestão de Pessoas",
  photoUrl: "/fixtures/ana.jpg",
  courseIds: ["course-esocial"],
  rating: 4.9,
  avatar: "/fixtures/ana.jpg",
  status: "Ativo",
};

export const mockCourse: Course = {
  id: "course-esocial",
  slug: "esocial-pratico",
  title: "eSocial Prático",
  pathId: "path-dp",
  pathName: "Departamento Pessoal",
  category: "Departamento Pessoal",
  categories: ["Departamento Pessoal", "eSocial"],
  modality: "Ao vivo online",
  modalities: ["Ao vivo online"],
  durationLabel: "16h",
  durationHours: 16,
  level: "Intermediário",
  price: 1200,
  shortDescription: "Operação prática de eventos do eSocial.",
  fullDescription: "Curso aplicado para fechamento, conferência e rotinas do eSocial.",
  targetAudience: ["Analistas de RH", "Departamento pessoal"],
  objectives: ["Validar eventos periódicos", "Reduzir inconsistências"],
  benefits: ["Checklists operacionais", "Casos práticos"],
  modules: [
    {
      title: "Eventos periódicos",
      description: "Conferência de remuneração e fechamento.",
      topics: ["S-1200", "S-1210"],
      duration: "8h",
    },
  ],
  instructorId: "instructor-ana",
  image: "/fixtures/esocial.jpg",
  rating: 4.8,
  studentsCount: 1,
  status: "Ativo",
  featured: true,
  featuredCourseIds: [],
  nextClassId: "class-esocial-jul",
};

export const mockClass: TrainingClass = {
  id: "class-esocial-jul",
  courseId: "course-esocial",
  startDate: "2026-07-10T09:00:00.000Z",
  endDate: "2026-07-11T18:00:00.000Z",
  time: "09:00 - 18:00",
  modality: "Ao vivo online",
  location: "Sala virtual",
  instructorId: "instructor-ana",
  totalSeats: 20,
  manualFilledSeats: 1,
  filledSeats: 6,
  availableSeats: 14,
  status: "Inscrições abertas",
  price: 1200,
  notes: "Turma regular.",
};

export const mockClassLowSeats: TrainingClass = {
  ...mockClass,
  id: "class-esocial-ago",
  startDate: "2026-08-14T09:00:00.000Z",
  endDate: "2026-08-15T18:00:00.000Z",
  filledSeats: 18,
  availableSeats: 2,
  status: "Poucas vagas",
};

export const mockBlogPost: BlogPost = {
  id: "post-esocial",
  title: "Checklist de eSocial para o fechamento mensal",
  slug: "checklist-esocial",
  summary: "Pontos essenciais para um fechamento sem inconsistências.",
  content: "Conteúdo editorial de apoio ao curso.",
  category: "eSocial",
  tags: ["eSocial", "RH"],
  author: "Equipe RH Cursos",
  date: "2026-06-01",
  readingTime: "5 min",
  status: "Publicado",
  image: "/fixtures/blog.jpg",
  relatedCourseId: "course-esocial",
};

export const mockTestimonial: Testimonial = {
  id: "testimonial-maria",
  name: "Maria Souza",
  role: "Analista de RH",
  organization: "Prefeitura Modelo",
  course: "eSocial Prático",
  text: "Conteúdo direto e aplicável. Saí da formação pronta para operar o eSocial.",
  rating: 5,
};

/** Conjunto pronto para semear a `AppStoreProvider` em stories interativas. */
export const mockStoreInitialData = {
  courses: [mockCourse],
  classes: [mockClass, mockClassLowSeats],
  instructors: [mockInstructor],
  blogPosts: [mockBlogPost],
  testimonials: [mockTestimonial],
};
