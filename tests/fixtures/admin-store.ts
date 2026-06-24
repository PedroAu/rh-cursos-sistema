import type {
  BlogPost,
  Course,
  Enrollment,
  Instructor,
  Lead,
  Student,
  Testimonial,
  TrainingClass,
  TrainingPath,
} from "@/types";

export type AdminStoreFixture = {
  courses: Course[];
  classes: TrainingClass[];
  students: Student[];
  instructors: Instructor[];
  leads: Lead[];
  enrollments: Enrollment[];
  blogPosts: BlogPost[];
  testimonials: Testimonial[];
  trainingPaths: TrainingPath[];
  currentSession: null;
};

export const ADMIN_STORE_HARNESS_DESCRIPTOR = Object.freeze({
  mode: "mocked-admin-store",
  resetStrategy: "createAdminStoreFixture returns a fresh object graph per invocation",
  authStrategy: "no persisted session; callers must authenticate explicitly in route-level flows",
});

const trainingPaths = [
  {
    id: "path-dp",
    code: "DP",
    name: "Departamento Pessoal",
    shortName: "DP",
    slug: "departamento-pessoal",
    description: "Rotina trabalhista e folha para equipes de RH.",
    icon: "book-open",
    courseCount: 1,
  },
] satisfies TrainingPath[];

const courses = [
  {
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
  },
] satisfies Course[];

const classes = [
  {
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
  },
] satisfies TrainingClass[];

const students = [
  {
    id: "student-maria",
    name: "Maria Souza",
    email: "maria.souza@example.com",
    phone: "(61) 99999-1111",
    cpf: "111.222.333-44",
    organization: "Prefeitura Modelo",
    jobTitle: "Analista de RH",
    courseId: "course-esocial",
    classId: "class-esocial-jul",
    enrollmentStatus: "Confirmada",
    certificateIssued: false,
    enrolledAt: "2026-06-10T14:00:00.000Z",
    paymentMethod: "Pix",
  },
] satisfies Student[];

const instructors = [
  {
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
  },
] satisfies Instructor[];

const leads = [
  {
    id: "lead-convertido",
    name: "Carlos Lima",
    email: "carlos.lima@example.com",
    phone: "(61) 99999-3333",
    courseInterest: "course-esocial",
    organization: "RH Brasil",
    teamSize: 8,
    preferredModality: "Ao vivo online",
    trainingObjective: "Padronizar processos.",
    mainChallenges: "Fechamento mensal.",
    origin: "Site",
    status: "Convertido",
    message: "Tenho interesse no curso.",
    createdAt: "2026-06-11T09:00:00.000Z",
  },
  {
    id: "lead-novo",
    name: "Julia Rocha",
    email: "julia.rocha@example.com",
    phone: "(61) 99999-4444",
    courseInterest: "course-esocial",
    organization: "Instituto Modelo",
    origin: "LinkedIn",
    status: "Novo",
    message: "Solicito detalhes.",
    createdAt: "2026-06-09T16:00:00.000Z",
  },
] satisfies Lead[];

const enrollments = [
  {
    id: "enrollment-maria",
    studentName: "Maria Souza",
    email: "maria.souza@example.com",
    phone: "(61) 99999-1111",
    cpf: "111.222.333-44",
    organization: "Prefeitura Modelo",
    jobTitle: "Analista de RH",
    enrollmentType: "Órgão público",
    paymentMethod: "Pix",
    courseId: "course-esocial",
    classId: "class-esocial-jul",
    status: "Confirmada",
    createdAt: "2026-06-11T10:00:00.000Z",
    notes: "Inscrição confirmada.",
  },
  {
    id: "enrollment-pedro",
    studentName: "Pedro Alves",
    email: "pedro.alves@example.com",
    phone: "(61) 99999-5555",
    cpf: "555.666.777-88",
    organization: "Empresa Modelo",
    jobTitle: "Coordenador",
    enrollmentType: "Empresa",
    paymentMethod: "Boleto",
    courseId: "course-esocial",
    classId: "class-esocial-jul",
    status: "Concluída",
    createdAt: "2026-06-08T13:00:00.000Z",
    notes: "Concluiu a capacitação.",
  },
] satisfies Enrollment[];

const blogPosts = [
  {
    id: "post-esocial",
    title: "Checklist de eSocial",
    slug: "checklist-esocial",
    summary: "Pontos essenciais para fechamento.",
    content: "Conteúdo editorial de apoio ao curso.",
    category: "eSocial",
    tags: ["eSocial", "RH"],
    author: "Equipe Synkra",
    date: "2026-06-01",
    readingTime: "5 min",
    status: "Publicado",
    image: "/fixtures/blog.jpg",
    relatedCourseId: "course-esocial",
  },
] satisfies BlogPost[];

const testimonials = [
  {
    id: "testimonial-maria",
    name: "Maria Souza",
    role: "Analista de RH",
    organization: "Prefeitura Modelo",
    course: "eSocial Prático",
    text: "Conteúdo direto e aplicável.",
    rating: 5,
  },
] satisfies Testimonial[];

export function createAdminStoreFixture(): AdminStoreFixture {
  return {
    courses,
    classes,
    students,
    instructors,
    leads,
    enrollments,
    blogPosts,
    testimonials,
    trainingPaths,
    currentSession: null,
  };
}
