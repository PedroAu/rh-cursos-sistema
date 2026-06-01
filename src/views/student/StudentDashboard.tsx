import { Download, FileBadge, MessageCircle, PlayCircle } from "lucide-react";
import { toast } from "sonner";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { Link } from "@/lib/router-compat";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAppStore } from "@/lib/app-store";
import { currency, formatDate } from "@/lib/utils";

export function StudentDashboardPage() {
  const { currentSession, students, courses, classes } = useAppStore();
  const currentStudents = students.filter((item) => item.email === currentSession?.email).slice(0, 3);

  return (
    <section className="py-10">
      <div className="container space-y-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="ea-label">Bem-vindo(a) de volta</span>
            <h1 className="mt-2 text-primary">Dashboard Executivo</h1>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <DashboardCard label="Tempo de estudo" value="24.5h" helper="Resumo de atividade do aluno." />
            <DashboardCard label="Pontos" value="1.250 XP" helper="Indicador de progresso." />
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <DashboardCard label="Cursos inscritos" value={currentStudents.length || 3} helper="Resumo dos cursos vinculados ao aluno logado." />
          <DashboardCard label="Próximas aulas" value={2} helper="Visualização simulada das aulas mais próximas." />
          <DashboardCard label="Certificados" value={1} helper="Emissão local e demonstrativa de certificados." />
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
          <Card>
            <CardContent className="space-y-5 p-6">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-primary">Cursos em andamento</h2>
                <Button asChild variant="ghost">
                  <Link to="/cursos">Ver catálogo</Link>
                </Button>
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                {currentStudents.map((student) => {
                  const course = courses.find((item) => item.id === student.courseId);
                  const trainingClass = classes.find((item) => item.id === student.classId);
                  return (
                    <div key={student.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-prestige-gold">
                      <div className="relative h-48 overflow-hidden">
                        {course ? (
                          <img src={course.image} alt={course.title} className="h-full w-full object-cover transition duration-500 hover:scale-105" />
                        ) : null}
                        <span className="absolute left-4 top-4 rounded-full bg-deep-navy px-3 py-1 text-[10px] font-bold uppercase tracking-[0.05em] text-white">
                          {course?.pathName ?? "Curso"}
                        </span>
                      </div>
                      <div className="space-y-5 p-6">
                        <div>
                          <h3 className="text-xl font-bold text-deep-navy">{course?.title}</h3>
                          <div className="mt-2 text-sm text-text-muted">
                            Turma: {trainingClass ? formatDate(trainingClass.startDate) : "--"}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-deep-navy">Progresso</span>
                            <span className="text-prestige-gold">68%</span>
                          </div>
                          <Progress value={68} />
                        </div>
                        <div className="flex gap-3">
                          <Button className="flex-1" onClick={() => toast.success("Aula retomada.")}>
                            <PlayCircle className="h-4 w-4" />
                            Retomar aula
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => toast.success("Material baixado.")}>
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-5">
            <Card>
              <CardContent className="space-y-4 p-6">
                <h3 className="text-xl font-semibold">Certificados</h3>
                <p className="text-sm leading-6 text-muted-foreground">Visualização e emissão local para validar a jornada do aluno.</p>
                <Button onClick={() => toast.success("Certificado gerado.")}>
                  <FileBadge className="h-4 w-4" />
                  Emitir certificado simulado
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-4 p-6">
                <h3 className="text-xl font-semibold">Atendimento</h3>
                <p className="text-sm leading-6 text-muted-foreground">Envie dúvidas, veja status de inscrição e acompanhe próximos passos.</p>
                <Button variant="outline" onClick={() => toast.success("Dúvida simulada enviada.")}>
                  <MessageCircle className="h-4 w-4" />
                  Enviar dúvida
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-3 p-6">
                <h3 className="text-xl font-semibold">Dados cadastrais</h3>
                <p className="text-sm text-muted-foreground">{currentSession?.email}</p>
                <p className="text-sm text-muted-foreground">Pagamento mais recente: {currency(697)}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
