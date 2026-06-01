import type { DemoAccess } from "@/types";

export const demoAccessList: DemoAccess[] = [
  {
    role: "student",
    email: "ana.silva1@mockmail.com",
    password: "aluno123",
    name: "Ana Silva",
    description: "Acesso para validar a área do aluno, cursos inscritos, materiais e certificado simulado."
  },
  {
    role: "admin",
    email: "admin@rhcursos.demo",
    password: "admin123",
    name: "Admin RH Cursos",
    description: "Acesso total para testar dashboard, CRUD local, leads, inscrições, cursos e blog."
  },
  {
    role: "instructor",
    email: "mariana.teles@rhcursos.com",
    password: "instrutor123",
    name: "Mariana Teles",
    description: "Acesso opcional para visualizar turmas atribuídas e agenda do instrutor."
  }
];
