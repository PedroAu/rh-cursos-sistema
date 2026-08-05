import type { Course, Enrollment, Lead, TrainingClass } from "@/types";
import { formatRelativeTime } from "@/features/admin/dashboard/model/dashboard-activity";
import { toOccupancyPercent } from "@/lib/occupancy";
import { parseDate } from "@/lib/utils";

const DAY_MS = 24 * 60 * 60 * 1000;
const MONTH_ABBREV = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

function isWithinDays(iso: string, days: number, now: number) {
  const value = new Date(iso).getTime();
  return !Number.isNaN(value) && value <= now && now - value <= days * DAY_MS;
}

function getRecentLeads(leads: Lead[], now: number) {
  return leads.filter((lead) => isWithinDays(lead.createdAt, 30, now));
}

/**
 * Gera o subtítulo dinâmico do cabeçalho ("Sexta-feira, 3 de julho de 2026 ·
 * últimos 30 dias"), conforme spec §2 — capitalização do dia da semana.
 */
export function buildOverviewSubtitle(now: number = Date.now()): string {
  const formatted = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date(now));

  return `${formatted.charAt(0).toUpperCase()}${formatted.slice(1)} · últimos 30 dias`;
}

export type OverviewKpi = {
  key: "matriculas" | "leads" | "turmas" | "ocupacao";
  label: string;
  value: string;
  helper: string;
  tone: "positive" | "neutral";
  barPct?: number;
};

type OverviewKpiInput = {
  classes: TrainingClass[];
  enrollments: Enrollment[];
  leads: Lead[];
};

/** As 4 métricas do canvas Trust Keith (AC2, spec §3/§6) — substituem os KPIs herdados da Épica 10. */
export function buildOverviewKpis({ classes, enrollments, leads }: OverviewKpiInput, now: number = Date.now()): OverviewKpi[] {
  const nowDate = new Date(now);
  const monthStart = new Date(nowDate.getFullYear(), nowDate.getMonth(), 1).getTime();
  const prevMonthStart = new Date(nowDate.getFullYear(), nowDate.getMonth() - 1, 1).getTime();

  const enrollmentsThisMonth = enrollments.filter((item) => {
    const t = new Date(item.createdAt).getTime();
    return !Number.isNaN(t) && t >= monthStart && t <= now;
  }).length;

  const enrollmentsPrevMonth = enrollments.filter((item) => {
    const t = new Date(item.createdAt).getTime();
    return !Number.isNaN(t) && t >= prevMonthStart && t < monthStart;
  }).length;

  const matriculasDelta = enrollmentsPrevMonth > 0
    ? Math.round(((enrollmentsThisMonth - enrollmentsPrevMonth) / enrollmentsPrevMonth) * 100)
    : null;

  const leadsRecent = getRecentLeads(leads, now);
  const leadsAguardando = leadsRecent.filter((lead) => lead.status === "Novo").length;

  const turmasAbertas = classes.filter((item) => item.status === "Inscrições abertas");
  const turmasProximas = turmasAbertas.filter((item) => {
    const t = parseDate(item.startDate).getTime();
    return !Number.isNaN(t) && t >= now && t - now <= 45 * DAY_MS;
  }).length;

  // Turmas com totalSeats=0 são excluídas do denominador: incluí-las
  // contribuiria 0 na soma e diluiria a média (ex.: 30/30 + turma sem vagas
  // -> 50% em vez de 100%).
  const ocupacaoBase = (turmasAbertas.length > 0 ? turmasAbertas : classes).filter((item) => item.totalSeats > 0);
  const ocupacaoMedia = ocupacaoBase.length > 0
    ? Math.round(ocupacaoBase.reduce((sum, item) => sum + toOccupancyPercent(item.filledSeats, item.totalSeats), 0) / ocupacaoBase.length)
    : 0;

  return [
    {
      key: "matriculas",
      label: "Matrículas no mês",
      value: String(enrollmentsThisMonth),
      helper: matriculasDelta === null
        ? "Sem comparativo com o mês anterior."
        : `${matriculasDelta >= 0 ? "▲" : "▼"} ${Math.abs(matriculasDelta)}% vs. mês anterior`,
      tone: matriculasDelta === null || matriculasDelta >= 0 ? "positive" : "neutral"
    },
    {
      key: "leads",
      label: "Leads novos",
      value: String(leadsRecent.length),
      helper: `▲ ${leadsAguardando} aguardando contato`,
      tone: "positive"
    },
    {
      key: "turmas",
      label: "Turmas abertas",
      value: String(turmasAbertas.length),
      helper: `${turmasProximas} inicia${turmasProximas === 1 ? "" : "m"} em até 45 dias`,
      tone: "neutral"
    },
    {
      key: "ocupacao",
      label: "Ocupação média",
      value: `${ocupacaoMedia}%`,
      helper: "Média de ocupação das turmas abertas.",
      tone: "neutral",
      barPct: ocupacaoMedia
    }
  ];
}

export type LeadOriginChip = {
  name: string;
  label: string;
};

export const ALL_ORIGINS_CHIP = "todas";

/** Chips de filtro por origem — apenas origens presentes nos leads dos últimos 30 dias (AC3, §6). */
export function buildLeadOriginChips(leads: Lead[], now: number = Date.now()): LeadOriginChip[] {
  const recent = getRecentLeads(leads, now);
  const origins = Array.from(new Set(recent.map((lead) => lead.origin)));

  return [{ name: ALL_ORIGINS_CHIP, label: "Todas" }, ...origins.map((origin) => ({ name: origin, label: origin }))];
}

export type RecentLeadRow = {
  id: string;
  name: string;
  organization?: string;
  origin: Lead["origin"];
  interest: string;
  receivedLabel: string;
  status: Lead["status"];
};

/** Linhas da tabela "Leads recentes", filtradas por origem e ordenadas do mais recente (AC3, §4, §6). */
export function buildRecentLeadRows(leads: Lead[], activeOrigin: string, now: number = Date.now()): RecentLeadRow[] {
  const recent = getRecentLeads(leads, now);
  const filtered = activeOrigin === ALL_ORIGINS_CHIP ? recent : recent.filter((lead) => lead.origin === activeOrigin);

  return filtered
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((lead) => ({
      id: lead.id,
      name: lead.name,
      organization: lead.organization,
      origin: lead.origin,
      interest: lead.courseInterest,
      receivedLabel: formatRelativeTime(new Date(lead.createdAt).toISOString(), now),
      status: lead.status
    }));
}

export type UpcomingClassCard = {
  id: string;
  day: string;
  month: string;
  title: string;
  modeLabel: string;
  seatsLabel: string;
  occupancyPct: number;
  hot: boolean;
};

type UpcomingClassInput = {
  classes: TrainingClass[];
  courses: Course[];
};

/** Turmas ordenadas por proximidade de início, com fallback de lista vazia (AC4, §5, §6, §8.1). */
export function buildUpcomingClasses({ classes, courses }: UpcomingClassInput, now: number = Date.now(), limit = 4): UpcomingClassCard[] {
  return classes
    .filter((item) => {
    const t = parseDate(item.startDate).getTime();
      return !Number.isNaN(t) && t >= now && item.status !== "Encerrada";
    })
    .sort((a, b) => parseDate(a.startDate).getTime() - parseDate(b.startDate).getTime())
    .slice(0, limit)
    .map((item) => {
    const start = parseDate(item.startDate);
      const course = courses.find((entry) => entry.id === item.courseId);
      const occupancyPct = toOccupancyPercent(item.filledSeats, item.totalSeats);
      const availableSeats = Math.max(item.availableSeats, 0);

      return {
        id: item.id,
        day: String(start.getDate()).padStart(2, "0"),
        month: MONTH_ABBREV[start.getMonth()],
        title: course?.title ?? "Turma",
        modeLabel: item.modality,
        seatsLabel: availableSeats > 0
          ? `${availableSeats} vaga${availableSeats === 1 ? "" : "s"} restante${availableSeats === 1 ? "" : "s"}`
          : "Esgotada",
        occupancyPct,
        hot: occupancyPct >= 90
      };
    });
}

export type LeadOriginBreakdown = {
  label: string;
  count: number;
  pct: number;
};

/** Agregação de leads por origem nos últimos 30 dias; oculta o card se não houver leads no período (§5b, §6). */
export function buildLeadsByOrigin(leads: Lead[], now: number = Date.now()): { items: LeadOriginBreakdown[]; showBreakdown: boolean } {
  const recent = getRecentLeads(leads, now);

  if (recent.length === 0) {
    return { items: [], showBreakdown: false };
  }

  const counts = recent.reduce<Record<string, number>>((acc, lead) => {
    acc[lead.origin] = (acc[lead.origin] ?? 0) + 1;
    return acc;
  }, {});

  const max = Math.max(...Object.values(counts));
  const items = Object.entries(counts)
    .map(([label, count]) => ({ label, count, pct: max > 0 ? Math.round((count / max) * 100) : 0 }))
    .sort((a, b) => b.count - a.count);

  return { items, showBreakdown: true };
}
