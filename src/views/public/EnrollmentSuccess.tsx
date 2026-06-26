"use client";

import { useLocation, useSearchParams } from "@/lib/router-compat";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAppStore } from "@/lib/app-store";
import { formatDate } from "@/lib/utils";
import { Link } from "@/lib/router-compat";

const ENROLLMENT_SUCCESS_STORAGE_KEY = "__latest_enrollment_success__";

export function EnrollmentSuccessPage() {
  const location = useLocation();
  const [params] = useSearchParams();
  const { courses, classes, enrollments } = useAppStore();
  const navigationState = location.state as
    | { courseId: string; classId: string; studentName: string; paymentMethod: string }
    | undefined;
  const queryState =
    params.get("courseId") && params.get("classId")
      ? {
          courseId: params.get("courseId") ?? "",
          classId: params.get("classId") ?? "",
          studentName: params.get("studentName") ?? "",
          paymentMethod: params.get("paymentMethod") ?? ""
        }
      : undefined;
  const persistedState =
    typeof window !== "undefined"
      ? (() => {
          const stored = window.sessionStorage.getItem(ENROLLMENT_SUCCESS_STORAGE_KEY);
          if (!stored) return undefined;

          try {
            return JSON.parse(stored) as {
              courseId: string;
              classId: string;
              studentName: string;
              paymentMethod: string;
            };
          } catch {
            return undefined;
          }
        })()
      : undefined;
  const latestEnrollment = enrollments[0];
  const state = queryState ?? navigationState ?? persistedState ?? (latestEnrollment
    ? {
        courseId: latestEnrollment.courseId,
        classId: latestEnrollment.classId,
        studentName: latestEnrollment.studentName,
        paymentMethod: latestEnrollment.paymentMethod
      }
    : undefined);

  const course = courses.find((item) => item.id === state?.courseId);
  const trainingClass = classes.find((item) => item.id === state?.classId);

  return (
    <section className="page-section">
      <div className="container flex justify-center">
        <Card className="w-full max-w-4xl border-outline-variant">
          <CardContent className="space-y-8 p-8 text-center md:p-10">
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

            <div className="grid gap-4 text-left md:grid-cols-3">
              {[
                {
                  label: "1. Confirmação",
                  description: "A equipe valida a turma e envia o resumo do pedido para o e-mail cadastrado."
                },
                {
                  label: "2. Operação",
                  description: "Você recebe orientações de acesso, agenda e material de apoio da capacitação."
                },
                {
                  label: "3. Atendimento",
                  description: "Se necessário, ajustamos faturamento, pagamento e dados da inscrição com você."
                }
              ].map((item) => (
                <div key={item.label} className="surface-card p-5">
                  <p className="text-label font-bold uppercase tracking-[0.08em] text-label-secondary">{item.label}</p>
                  <p className="mt-2 text-sm leading-6 text-text-muted">{item.description}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild variant="outline"><Link to="/cursos">Ver outros cursos</Link></Button>
              <Button asChild variant="ghost"><Link to="/falar-com-especialista">Falar com atendimento</Link></Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
