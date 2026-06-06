import { useLocation } from "@/lib/router-compat";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAppStore } from "@/lib/app-store";
import { formatDate } from "@/lib/utils";
import { Link } from "@/lib/router-compat";

export function EnrollmentSuccessPage() {
  const location = useLocation();
  const { courses, classes } = useAppStore();
  const state = location.state as
    | { courseId: string; classId: string; studentName: string; paymentMethod: string }
    | undefined;

  const course = courses.find((item) => item.id === state?.courseId);
  const trainingClass = classes.find((item) => item.id === state?.classId);

  return (
    <section className="page-section">
      <div className="container flex justify-center">
        <Card className="w-full max-w-3xl">
          <CardContent className="space-y-6 p-8 text-center">
            <span className="eyebrow">Inscrição recebida com sucesso</span>
            <h1 className="text-4xl font-extrabold text-primary">Tudo pronto para a próxima etapa.</h1>
            <p className="text-base leading-7 text-muted-foreground">
              Recebemos sua inscrição. Confira o resumo e acompanhe os próximos passos pelo seu e-mail.
            </p>

            <div className="grid gap-4 rounded-lg bg-secondary/60 p-6 text-left md:grid-cols-2">
              <div>
                <div className="text-xs uppercase tracking-[0.16em] text-primary/70">Curso</div>
                <div className="mt-2 font-semibold text-foreground">{course?.title ?? "Curso selecionado"}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.16em] text-primary/70">Turma</div>
                <div className="mt-2 font-semibold text-foreground">{trainingClass ? formatDate(trainingClass.startDate) : "Turma escolhida"}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.16em] text-primary/70">Aluno</div>
                <div className="mt-2 font-semibold text-foreground">{state?.studentName ?? "Participante"}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.16em] text-primary/70">Forma de pagamento</div>
                <div className="mt-2 font-semibold text-foreground">{state?.paymentMethod ?? "Pagamento"}</div>
              </div>
            </div>

            <div className="space-y-2 text-sm leading-7 text-muted-foreground">
              <p>Próximos passos: confirmação da turma, envio de orientações, materiais e certificado pela equipe RH Cursos.</p>
            </div>

            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild variant="outline"><Link to="/cursos">Ver outros cursos</Link></Button>
              <Button asChild variant="ghost"><a href="#atendimento">Falar com atendimento</a></Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
