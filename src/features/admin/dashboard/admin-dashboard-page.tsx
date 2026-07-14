"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { buildPerformanceStats } from "@/features/admin/dashboard/model/dashboard-activity";
import {
  ALL_ORIGINS_CHIP,
  buildLeadOriginChips,
  buildLeadsByOrigin,
  buildOverviewKpis,
  buildOverviewSubtitle,
  buildRecentLeadRows,
  buildUpcomingClasses
} from "@/features/admin/dashboard/model/dashboard-overview";
import { useAppStore } from "@/lib/app-store";
import { useRealTimeMetrics } from "@/lib/hooks/useRealTimeMetrics";
import { Link } from "@/lib/router-compat";
import { cn } from "@/lib/utils";
import type { LeadStatus } from "@/types";

function leadStatusToneClass(status: LeadStatus) {
  if (status === "Convertido") return "text-tk-success";
  if (status === "Perdido") return "text-tk-error";
  if (status === "Em atendimento") return "text-tk-accent";
  if (status === "Proposta enviada") return "text-tk-ink-muted";
  return "text-tk-brand";
}

function leadStatusDotClass(status: LeadStatus) {
  if (status === "Convertido") return "bg-tk-success";
  if (status === "Perdido") return "bg-tk-error";
  if (status === "Em atendimento") return "bg-tk-accent";
  if (status === "Proposta enviada") return "bg-tk-ink-muted";
  return "bg-tk-brand";
}

export function AdminDashboardPage() {
  const appStore = useAppStore();
  const { courses, classes, students, leads, enrollments } = appStore;
  const rtData = useRealTimeMetrics({ courses, classes, students, leads, enrollments });
  const [activeOrigin, setActiveOrigin] = useState<string>(ALL_ORIGINS_CHIP);

  const subtitle = useMemo(() => buildOverviewSubtitle(), []);

  const kpis = useMemo(
    () => buildOverviewKpis({ classes: rtData.classes, enrollments: rtData.enrollments, leads: rtData.leads }),
    [rtData.classes, rtData.enrollments, rtData.leads]
  );

  const originChips = useMemo(() => buildLeadOriginChips(rtData.leads), [rtData.leads]);

  const recentLeads = useMemo(
    () => buildRecentLeadRows(rtData.leads, activeOrigin),
    [rtData.leads, activeOrigin]
  );

  const upcomingClasses = useMemo(
    () => buildUpcomingClasses({ classes: rtData.classes, courses: rtData.courses }),
    [rtData.classes, rtData.courses]
  );

  const leadsByOrigin = useMemo(() => buildLeadsByOrigin(rtData.leads), [rtData.leads]);

  const performanceStats = useMemo(
    () => buildPerformanceStats({ enrollments: rtData.enrollments, leads: rtData.leads }),
    [rtData.enrollments, rtData.leads]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="font-display text-[1.9rem] font-bold tracking-tight text-tk-ink">Visão geral</h1>
          <p className="mt-1 text-sm text-tk-ink-muted">{subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link to="/" className="text-sm font-semibold text-tk-brand hover:text-tk-brand-hover">
            Ver site →
          </Link>
          <Button type="button" variant="outline" size="sm">
            Novo curso
          </Button>
          <Button type="button" variant="primary" size="sm">
            Nova turma
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card
            key={kpi.key}
            className="rounded-tk-card border border-tk-line bg-tk-surface p-6 shadow-tk-glass transition hover:-translate-y-0.5 hover:shadow-tk-card"
          >
            <CardContent className="mt-0 space-y-3 p-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-tk-ink-muted">{kpi.label}</p>
              <p className="text-[2.05rem] font-bold tabular-nums text-tk-ink">{kpi.value}</p>
              {kpi.key === "ocupacao" ? (
                <div className="space-y-1.5">
                  <div
                    role="img"
                    aria-label={`Ocupação média de ${kpi.value}`}
                    className="h-2 w-full overflow-hidden rounded-tk-pill bg-tk-accent-soft"
                  >
                    <div className="h-full rounded-tk-pill bg-tk-brand" style={{ width: `${kpi.barPct ?? 0}%` }} />
                  </div>
                  <p className="text-sm text-tk-ink-muted">{kpi.helper}</p>
                </div>
              ) : (
                <p className={cn("text-sm font-semibold", kpi.tone === "positive" ? "text-tk-success" : "text-tk-ink-muted")}>
                  {kpi.helper}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_340px] xl:items-start">
        <Card className="overflow-hidden rounded-tk-card border border-tk-line bg-tk-surface p-0 shadow-tk-glass">
          <div className="flex items-center justify-between gap-4 border-b border-tk-line px-6 py-5">
            <h2 className="font-display text-[1.2rem] font-bold text-tk-ink">Leads recentes</h2>
            <Button asChild variant="ghost" size="sm" className="text-tk-brand hover:text-tk-brand-hover">
              <Link to="/admin/leads">Ver todos os leads →</Link>
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 px-6 py-4" role="group" aria-label="Filtrar leads por origem">
            {originChips.map((chip) => {
              const isActive = chip.name === activeOrigin;

              return (
                <button
                  key={chip.name}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActiveOrigin(chip.name)}
                  className={cn(
                    "rounded-tk-pill border px-3 py-1.5 text-sm font-semibold transition",
                    isActive ? "border-tk-brand bg-tk-brand text-white" : "border-tk-line text-tk-ink-muted hover:border-tk-brand"
                  )}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>

          <div className="overflow-x-auto">
            <Table className="min-w-[720px]">
              <TableHeader className="bg-tk-surface-2">
                <TableRow className="hover:bg-tk-surface-2">
                  <TableHead>Lead</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Interesse</TableHead>
                  <TableHead>Recebido</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">
                    <span className="sr-only">Ações</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentLeads.map((lead) => (
                  <TableRow key={lead.id} className="hover:bg-tk-surface-2">
                    <TableCell>
                      <p className="font-semibold text-tk-ink">{lead.name}</p>
                      {lead.organization ? <p className="mt-0.5 text-sm text-tk-ink-muted">{lead.organization}</p> : null}
                    </TableCell>
                    <TableCell>
                      <Badge variant="default" className="rounded-tk-pill">
                        {lead.origin}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-tk-ink">{lead.interest}</TableCell>
                    <TableCell className="text-sm text-tk-ink-muted">{lead.receivedLabel}</TableCell>
                    <TableCell>
                      <span className={cn("inline-flex items-center gap-2 text-sm font-semibold", leadStatusToneClass(lead.status))}>
                        <span className={cn("h-2 w-2 rounded-full", leadStatusDotClass(lead.status))} aria-hidden="true" />
                        {lead.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm" className="text-tk-brand hover:text-tk-brand-hover">
                        <Link to="/admin/leads">Abrir →</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {recentLeads.length === 0 ? (
              <p className="px-6 py-10 text-center text-sm text-tk-ink-muted">
                Nenhum lead com essa origem nos últimos 30 dias.
              </p>
            ) : null}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="overflow-hidden rounded-tk-card border border-tk-line bg-tk-surface p-0 shadow-tk-glass">
            <div className="flex items-center justify-between gap-4 border-b border-tk-line px-6 py-5">
              <h2 className="font-display text-[1.1rem] font-bold text-tk-ink">Próximas turmas</h2>
              <Button asChild variant="ghost" size="sm" className="text-tk-brand hover:text-tk-brand-hover">
                <Link to="/admin/turmas">Turmas →</Link>
              </Button>
            </div>
            <div className="divide-y divide-tk-line px-6 py-2">
              {upcomingClasses.map((turma) => (
                <div key={turma.id} className="grid grid-cols-[52px_1fr] gap-4 py-4">
                  <div className="text-center">
                    <p className="text-xl font-bold text-tk-ink">{turma.day}</p>
                    <p className="text-xs font-semibold uppercase text-tk-ink-muted">{turma.month}</p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="font-semibold text-tk-ink">{turma.title}</p>
                    <p className="text-sm text-tk-ink-muted">
                      {turma.modeLabel} · <span className={turma.hot ? "font-semibold text-tk-error" : ""}>{turma.seatsLabel}</span>
                    </p>
                    <div className="h-1.5 w-full overflow-hidden rounded-tk-pill bg-tk-accent-soft">
                      <div
                        className={cn("h-full rounded-tk-pill", turma.hot ? "bg-tk-error" : "bg-tk-accent")}
                        style={{ width: `${turma.occupancyPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              {upcomingClasses.length === 0 ? (
                <p className="py-8 text-center text-sm text-tk-ink-muted">Nenhuma turma programada.</p>
              ) : null}
            </div>
          </Card>

          {leadsByOrigin.showBreakdown ? (
            <Card className="overflow-hidden rounded-tk-card border border-tk-line bg-tk-surface p-0 shadow-tk-glass">
              <div className="flex items-center justify-between gap-4 border-b border-tk-line px-6 py-5">
                <h2 className="font-display text-[1.1rem] font-bold text-tk-ink">Leads por origem</h2>
                <Badge variant="muted" className="rounded-tk-pill">
                  30 dias
                </Badge>
              </div>
              <div className="space-y-3.5 px-6 py-5">
                {leadsByOrigin.items.map((item) => (
                  <div key={item.label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-tk-ink">{item.label}</span>
                      <span className="text-tk-ink-muted">{item.count}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-tk-pill bg-tk-accent-soft">
                      <div className="h-full rounded-tk-pill bg-tk-brand" style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ) : null}
        </div>
      </div>

      <Card className="border-[#0b4668] bg-[#0b4668] p-8 text-white">
        <div className="grid gap-8 xl:grid-cols-2 xl:items-start">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Relatório de Performance</h2>
              <p className="mt-4 max-w-[760px] text-lg leading-8 text-white/82">
                Analise o engajamento dos alunos por departamento e identifique as turmas com melhor aproveitamento do conteúdo.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="button" className="bg-[#f6be39] text-[#5f4700] hover:bg-[#ffcb5b]">Gerar Relatório PDF</Button>
              <Button type="button" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white">
                Configurar Alertas
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {performanceStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-[20px] border border-white/15 bg-white/10 p-5"
              >
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/74">{stat.label}</p>
                <p className="mt-3 text-[2rem] font-extrabold">{stat.value}</p>
                <div className="my-4 h-px bg-white/10" />
                <p className="text-sm text-white/74">{stat.helper}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
