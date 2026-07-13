// Fonte única de verdade (cliente) para os enums de curso.
// Espelha exatamente os enums Postgres definidos em
// supabase/migrations/20260512193000_initial_rh_cursos_schema.sql.
// Qualquer divergência entre este módulo e o banco é bug (ADR-015).
import type { Course, CourseStatus } from "@/types";
import type { CourseRow } from "@/lib/supabase/mappers";

export type CourseModalityDbValue = CourseRow["modalidade"];
export type CourseLevelDbValue = CourseRow["nivel"];
export type CourseStatusDbValue = CourseRow["status"];

type EnumPair<DbValue extends string, Label extends string> = {
  dbValue: DbValue;
  label: Label;
};

export const COURSE_MODALITIES: Array<EnumPair<CourseModalityDbValue, Course["modality"]>> = [
  { dbValue: "Presencial", label: "Presencial" },
  { dbValue: "Online", label: "Ao vivo online" },
  { dbValue: "Hibrido", label: "Híbrido" },
  { dbValue: "InCompany", label: "In company" },
  { dbValue: "Gravado", label: "Gravado" },
];

export const COURSE_LEVELS: Array<EnumPair<CourseLevelDbValue, Course["level"]>> = [
  { dbValue: "Basico", label: "Básico" },
  { dbValue: "Intermediario", label: "Intermediário" },
  { dbValue: "Avancado", label: "Avançado" },
  { dbValue: "Misto", label: "Básico / Intermediário" },
];

export const COURSE_STATUSES: Array<EnumPair<CourseStatusDbValue, CourseStatus>> = [
  { dbValue: "Ativo", label: "Ativo" },
  { dbValue: "Inativo", label: "Inativo" },
  { dbValue: "Destaque", label: "Destaque" },
  { dbValue: "EmBreve", label: "Em breve" },
  { dbValue: "Rascunho", label: "Rascunho" },
  { dbValue: "Arquivado", label: "Arquivado" },
];

// Status que podem ser expostos no site público (Courses.tsx, Agenda.tsx,
// curso_public_content). Rascunho e Arquivado nunca entram nesta lista.
export const PUBLIC_COURSE_STATUSES: CourseStatus[] = ["Ativo", "Destaque", "Em breve"];

function buildDbToLabelMap<DbValue extends string, Label extends string>(
  pairs: Array<EnumPair<DbValue, Label>>
): Record<DbValue, Label> {
  return pairs.reduce(
    (map, pair) => {
      map[pair.dbValue] = pair.label;
      return map;
    },
    {} as Record<DbValue, Label>
  );
}

function buildLabelToDbMap<DbValue extends string, Label extends string>(
  pairs: Array<EnumPair<DbValue, Label>>
): Record<Label, DbValue> {
  return pairs.reduce(
    (map, pair) => {
      map[pair.label] = pair.dbValue;
      return map;
    },
    {} as Record<Label, DbValue>
  );
}

const MODALITY_DB_TO_LABEL = buildDbToLabelMap(COURSE_MODALITIES);
const MODALITY_LABEL_TO_DB = buildLabelToDbMap(COURSE_MODALITIES);
const LEVEL_DB_TO_LABEL = buildDbToLabelMap(COURSE_LEVELS);
const LEVEL_LABEL_TO_DB = buildLabelToDbMap(COURSE_LEVELS);
const STATUS_DB_TO_LABEL = buildDbToLabelMap(COURSE_STATUSES);
const STATUS_LABEL_TO_DB = buildLabelToDbMap(COURSE_STATUSES);

export function modalityDbToLabel(value: CourseModalityDbValue): Course["modality"] {
  return MODALITY_DB_TO_LABEL[value];
}

export function modalityLabelToDb(value: Course["modality"]): CourseModalityDbValue {
  return MODALITY_LABEL_TO_DB[value];
}

export function levelDbToLabel(value: CourseLevelDbValue): Course["level"] {
  return LEVEL_DB_TO_LABEL[value];
}

export function levelLabelToDb(value: Course["level"]): CourseLevelDbValue | undefined {
  return LEVEL_LABEL_TO_DB[value as keyof typeof LEVEL_LABEL_TO_DB];
}

export function statusDbToLabel(value: CourseStatusDbValue): CourseStatus {
  return STATUS_DB_TO_LABEL[value];
}

export function statusLabelToDb(value: CourseStatus): CourseStatusDbValue {
  return STATUS_LABEL_TO_DB[value];
}

export const COURSE_MODALITY_OPTIONS = COURSE_MODALITIES.map((pair) => ({
  value: pair.label,
  label: pair.label,
}));

export const COURSE_LEVEL_OPTIONS = COURSE_LEVELS.map((pair) => ({
  value: pair.label,
  label: pair.label,
}));

export const COURSE_STATUS_OPTIONS = COURSE_STATUSES.map((pair) => ({
  value: pair.label,
  label: pair.label,
}));

export const COURSE_STATUS_LABELS: CourseStatus[] = COURSE_STATUSES.map((pair) => pair.label);
