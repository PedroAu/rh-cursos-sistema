import {
  IconBook,
  IconCalendarEvent,
  IconFileAnalytics,
  IconMessageCircle,
  IconReceipt,
  IconTrendingDown,
  IconTrendingUp,
  IconUserPlus,
  IconUsers,
} from "@tabler/icons-react";
import Link from "next/link";

import { requireAdmin } from "@/lib/auth";
import { AdminMetricCard } from "@/components/admin/admin-metric-card";
import { AdminPageIntro } from "@/components/admin/admin-page-intro";
import { AdminTableEmpty } from "@/components/admin/admin-table-empty";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAdminDashboardSnapshot } from "@/lib/admin-data";
import { Container } from "@/components/layout/container";

export default async function AdminDashboardPage() {
  const profile = await requireAdmin();
  const snapshot = await getAdminDashboardSnapshot();

  const activities = [
    ...snapshot.recentLeads.slice(0, 2).map((lead) => ({
      icon: <IconUserPlus size={20} />,
      color: "green",
      title: `Novo lead: ${lead.name}`,
      description: `${lead.interest} · ${lead.crmStatus}`,
      time: lead.createdAt,
    })),
    ...snapshot.upcomingTurmas.slice(0, 1).map((turma) => ({
      icon: <IconCalendarEvent size={20} />,
      color: "navy",
      title: `Turma agendada: ${turma.courseTitle}`,
      description: `${turma.startDate} · ${turma.location}`,
      time: turma.status,
    })),
    ...snapshot.recentCourses.slice(0, 1).map((course) => ({
      icon: <IconReceipt size={20} />,
      color: "gold",
      title: `Curso atualizado: ${course.title}`,
      description: `${course.category} · ${course.status}`,
      time: course.price,
    })),
  ];

  return (
    <Container variant="admin" padded={false}>
      <div className="space-y-8">
        <AdminPageIntro
          badge="SESSAO PROTEGIDA"
          title="Visão Geral"
          description={`Acompanhe operação, agenda, cursos e fila comercial. Bem-vindo, ${profile.nome || profile.email}.`}
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <AdminMetricCard
            detail="Aguardam triagem"
            icon={<IconUsers size={20} />}
            label="Leads novos"
            value={snapshot.newLeadsCount}
          />
          <AdminMetricCard
            detail="Próximos 30 dias"
            icon={<IconBook size={20} />}
            label="Turmas na agenda"
            tone="gold"
            value={snapshot.nextThirtyDaysTurmasCount}
          />
          <AdminMetricCard
            detail="Precisam de agenda"
            icon={<IconCalendarEvent size={20} />}
            label="Cursos sem turma"
            value={snapshot.coursesWithoutClassCount}
          />
          <AdminMetricCard
            detail="Revisar publicação"
            icon={<IconMessageCircle size={20} />}
            label="Cursos em rascunho"
            negative
            value={snapshot.draftCoursesCount}
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="font-heading text-2xl font-bold text-brand-navy-700">
                  Gerenciar Cursos
                </h2>
                <Button asChild>
                  <Link href="/admin/cursos">Ver cursos</Link>
                </Button>
              </div>
              <Card>
                <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/60">
                      <TableRow>
                        <TableHead>Título</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Inscrições</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {snapshot.recentCourses.length === 0 ? (
                        <AdminTableEmpty
                          colSpan={4}
                          description="Cadastre um curso para acompanhá-lo aqui."
                          title="Nenhum curso cadastrado"
                        />
                      ) : null}
                      {snapshot.recentCourses.map((course) => (
                        <TableRow key={course.id}>
                          <TableCell>
                            <div className="space-y-0.5">
                              <p className="font-bold text-foreground">{course.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {course.slug}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {course.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className={course.status === "Rascunho" ? "size-2 rounded-full bg-amber-600" : "size-2 rounded-full bg-emerald-600"} />
                              <span className="text-sm">{course.status}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1.5">
                              <p className="text-sm">{course.seatsLabel}</p>
                              <Progress value={course.occupancy} />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                </CardContent>
              </Card>
          </section>

          <aside className="space-y-4">
              <h2 className="font-heading text-2xl font-bold text-brand-navy-700">
                Atividades Recentes
              </h2>
              <Card>
                <CardContent className="space-y-6 p-6">
                  {activities.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Nenhuma atividade recente registrada.
                    </p>
                  ) : null}
                  {activities.map((activity) => (
                    <div className="flex items-start gap-4" key={`${activity.title}-${activity.time}`}>
                      <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-navy-50 text-brand-navy-700">
                        {activity.icon}
                      </span>
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold text-foreground">
                          {activity.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {activity.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
          </aside>
        </div>

        <Card className="border-0 bg-brand-navy-900 text-white shadow-md">
          <CardContent className="grid gap-8 p-6 md:p-8 md:grid-cols-[1.3fr_0.7fr] md:items-center">
              <div className="space-y-4">
                <span className="inline-flex size-12 items-center justify-center rounded-md bg-brand-gold text-brand-navy-900">
                  <IconFileAnalytics size={26} />
                </span>
                <h2 className="font-heading text-3xl font-bold">Relatório de Performance</h2>
                <p className="max-w-2xl text-white/75">
                  Acompanhe sinais operacionais reais para priorizar triagem comercial, agenda de turmas e manutenção do catálogo.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button variant="gold">
                    Gerar Relatório PDF
                  </Button>
                  <Button variant="inverse">
                    <IconTrendingUp size={16} />
                    Configurar Alertas
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  ["Leads", snapshot.leadsCount, <IconTrendingUp size={18} key="up" />],
                  ["Turmas críticas", snapshot.criticalOccupancyTurmasCount, <IconTrendingUp size={18} key="up2" />],
                  ["Cursos", snapshot.coursesCount, <IconTrendingDown size={18} key="down" />],
                  ["Usuários", snapshot.profilesCount, <IconTrendingUp size={18} key="up3" />],
                ].map(([label, value, icon]) => (
                  <div className="rounded-lg border border-white/15 bg-white/10 p-4" key={String(label)}>
                    <div className="flex items-center gap-2">
                      {icon}
                      <p className="text-xs font-bold uppercase text-white/70">
                        {label}
                      </p>
                    </div>
                    <p className="mt-2 text-xl font-extrabold">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
