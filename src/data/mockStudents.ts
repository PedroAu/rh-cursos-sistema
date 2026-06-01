import { addDays, formatISO } from "date-fns";

import { mockClasses } from "@/data/mockClasses";
import type { EnrollmentStatus, Student } from "@/types";

const firstNames = [
  "Ana",
  "Bruno",
  "Camila",
  "Diego",
  "Elaine",
  "Fabio",
  "Giovana",
  "Helena",
  "Igor",
  "Juliana",
  "Karla",
  "Leonardo",
  "Marcos",
  "Natália",
  "Otávio",
  "Paula",
  "Rafael",
  "Simone",
  "Tiago",
  "Viviane"
];

const lastNames = [
  "Silva",
  "Souza",
  "Lima",
  "Oliveira",
  "Costa",
  "Rocha",
  "Pereira",
  "Carvalho",
  "Ramos",
  "Ferreira"
];

const organizations = [
  "Prefeitura Municipal",
  "Autarquia Federal",
  "Empresa Privada",
  "Escritório Contábil",
  "Órgão de Controle",
  "Instituto de Formação",
  "Secretaria de Administração"
];

const jobTitles = [
  "Analista de RH",
  "Coordenador de DP",
  "Gestor Público",
  "Contador",
  "Advogada Trabalhista",
  "Analista de Folha",
  "Técnica Administrativa"
];

const enrollmentStatuses: EnrollmentStatus[] = [
  "Confirmada",
  "Aguardando pagamento",
  "Concluída",
  "Pendente"
];
const paymentMethods: Student["paymentMethod"][] = ["Pix", "Cartão", "Boleto", "Empenho"];

function generateCpf(index: number) {
  return `${String(100 + (index % 899)).padStart(3, "0")}.${String(200 + (index % 799)).padStart(
    3,
    "0"
  )}.${String(300 + (index % 699)).padStart(3, "0")}-${String(10 + (index % 89)).padStart(2, "0")}`;
}

export const mockStudents: Student[] = mockClasses.flatMap((trainingClass, classIndex) =>
  Array.from({ length: 10 }).map((_, studentIndex) => {
    const globalIndex = classIndex * 10 + studentIndex;
    const firstName = firstNames[globalIndex % firstNames.length];
    const lastName = lastNames[(globalIndex + classIndex) % lastNames.length];
    const name = `${firstName} ${lastName}`;

    return {
      id: `student-${globalIndex + 1}`,
      name,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${globalIndex + 1}@mockmail.com`,
      phone: `(61) 98${String(100000 + globalIndex).slice(-6)}`,
      cpf: generateCpf(globalIndex),
      organization: organizations[globalIndex % organizations.length],
      jobTitle: jobTitles[(globalIndex + 2) % jobTitles.length],
      courseId: trainingClass.courseId,
      classId: trainingClass.id,
      enrollmentStatus: enrollmentStatuses[globalIndex % enrollmentStatuses.length],
      certificateIssued: globalIndex % 3 === 0,
      enrolledAt: formatISO(addDays(new Date(trainingClass.startDate), -(studentIndex + 7))),
      paymentMethod: paymentMethods[globalIndex % paymentMethods.length]
    };
  })
);
