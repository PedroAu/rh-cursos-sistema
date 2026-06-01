import { toast } from "sonner";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAppStore } from "@/lib/app-store";
import { formatDate } from "@/lib/utils";

export function InstructorDashboardPage() {
  const { currentSession, instructors, classes, courses, students } = useAppStore();
  const instructor = instructors.find((item) => item.email === currentSession?.email) ?? instructors[0];
  const instructorClasses = classes.filter((item) => item.instructorId === instructor.id).slice(0, 4);

  return (
    <section className="page-section">
      <div className="container space-y-8">
        <div className="space-y-2">
          <span className="eyebrow">Dashboard do instrutor</span>
          <h1 className="text-4xl font-semibold">{instructor.name}</h1>
          <p className="text-base leading-7 text-muted-foreground">{instructor.bio}</p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <DashboardCard label="Turmas atribuídas" value={instructorClasses.length} helper="Visualização das turmas sob responsabilidade do instrutor." />
          <DashboardCard label="Cursos vinculados" value={instructor.courseIds.length || 4} helper="Cursos e trilhas atribuídos ao perfil do instrutor." />
          <DashboardCard label="Avaliação média" value={instructor.rating.toFixed(1)} helper="Feedback demonstrativo de alunos e turmas." />
        </div>

        <Card>
          <CardContent className="space-y-5 p-6">
            <h3 className="text-2xl font-semibold">Agenda de aulas</h3>
            <div className="grid gap-4">
              {instructorClasses.map((trainingClass) => {
                const course = courses.find((item) => item.id === trainingClass.courseId);
                const classStudents = students.filter((item) => item.classId === trainingClass.id);
                return (
                  <div key={trainingClass.id} className="rounded-3xl border border-border p-5">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                      <div>
                        <div className="font-semibold">{course?.title}</div>
                        <div className="mt-1 text-sm text-muted-foreground">
                          {formatDate(trainingClass.startDate)} • {trainingClass.time} • {classStudents.length} alunos
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => toast.success(`Turma ${trainingClass.id} visualizada.`)}>
                          Visualizar alunos
                        </Button>
                        <Button onClick={() => toast.success("Aula marcada como concluída em estado local.")}>
                          Marcar aula como concluída
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
