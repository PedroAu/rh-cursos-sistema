export type UserRole = "lead" | "admin";

export type CourseStatus = "Ativo" | "Inativo" | "Destaque" | "Em breve";
export type ClassStatus = "Inscrições abertas" | "Poucas vagas" | "Encerrada" | "Em breve";
export type EnrollmentStatus =
  | "Pendente"
  | "Aguardando pagamento"
  | "Confirmada"
  | "Cancelada"
  | "Concluída";
export type LeadStatus = "Novo" | "Em atendimento" | "Proposta enviada" | "Convertido" | "Perdido";
export type BlogStatus = "Rascunho" | "Publicado" | "Arquivado";

export type TrainingPath = {
  id: string;
  code: string;
  name: string;
  shortName: string;
  slug: string;
  description: string;
  icon: string;
  courseCount: number;
};

export type CourseModule = {
  title: string;
  description: string;
  topics: string[];
  duration: string;
};

export type Course = {
  id: string;
  slug: string;
  title: string;
  pathId: string;
  pathName: string;
  category?: string;
  categories?: string[];
  modality: "Ao vivo online" | "Presencial" | "In company" | "Híbrido" | "Gravado";
  modalities?: Array<"Ao vivo online" | "Presencial" | "In company" | "Híbrido" | "Gravado">;
  durationLabel: string;
  durationHours: number;
  level: "Básico" | "Intermediário" | "Avançado" | "Básico / Intermediário" | "Básico / Avançado" | "Intermediário / Avançado";
  price: number;
  shortDescription: string;
  fullDescription: string;
  targetAudience: string[];
  objectives: string[];
  benefits: string[];
  modules: CourseModule[];
  instructorId: string;
  image: string;
  rating: number;
  studentsCount: number;
  status: CourseStatus;
  featured: boolean;
  featuredCourseIds?: string[];
  nextClassId: string;
};

export type TrainingClass = {
  id: string;
  courseId: string;
  startDate: string;
  endDate: string;
  time: string;
  modality: Course["modality"];
  location: string;
  instructorId: string;
  totalSeats: number;
  manualFilledSeats?: number;
  filledSeats: number;
  availableSeats: number;
  status: ClassStatus;
  price: number;
  notes: string;
};

export type Student = {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  organization: string;
  jobTitle: string;
  courseId: string;
  classId: string;
  enrollmentStatus: EnrollmentStatus;
  certificateIssued: boolean;
  enrolledAt: string;
  paymentMethod: "Pix" | "Cartão" | "Boleto" | "Empenho";
};

export type Instructor = {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  bio: string;
  education?: string;
  photoUrl?: string;
  courseIds: string[];
  rating: number;
  avatar: string;
  status: "Ativo" | "Inativo";
};

export type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  courseInterest: string;
  organization?: string;
  teamSize?: number;
  preferredModality?: string;
  trainingObjective?: string;
  mainChallenges?: string;
  origin: "Site" | "WhatsApp" | "Blog" | "Indicação" | "LinkedIn" | "Especialista" | "Orçamento In Company";
  status: LeadStatus;
  message: string;
  createdAt: string;
};

export type Testimonial = {
  id: string;
  name: string;
  role: string;
  organization: string;
  course: string;
  text: string;
  rating: number;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category:
    | "Departamento Pessoal"
    | "eSocial"
    | "Gestão Pública"
    | "Liderança"
    | "Tecnologia"
    | "Assédio e Compliance";
  tags: string[];
  author: string;
  date: string;
  readingTime: string;
  status: BlogStatus;
  image: string;
  relatedCourseId: string;
};

export type Enrollment = {
  id: string;
  studentName: string;
  email: string;
  phone: string;
  cpf: string;
  organization: string;
  jobTitle: string;
  enrollmentType: "Pessoa física" | "Empresa" | "Órgão público";
  paymentMethod: "Pix" | "Cartão" | "Boleto" | "Empenho";
  courseId: string;
  classId: string;
  status: EnrollmentStatus;
  createdAt: string;
  notes: string;
};

export type CurrentSession = {
  role: "admin";
  email: string;
  name: string;
};

export type DemoAccess = {
  role: Exclude<UserRole, "lead">;
  email: string;
  password: string;
  name: string;
  description: string;
};

export type DashboardMetric = {
  label: string;
  value: string | number;
  helper: string;
};
