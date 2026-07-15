"use client";

import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAppStore } from "@/lib/app-store";
import { Link, useLocation, useNavigate } from "@/lib/router-compat";
import { formatDate } from "@/lib/utils";

const PRE_ENROLLMENT_RECEIPT_STORAGE_KEY = "__latest_pre_enrollment_receipt__";

type ReceiptState = {
  enrollmentId: string;
  courseId: string;
  classId: string;
};

function isReceiptState(value: unknown): value is ReceiptState {
  if (!value || typeof value !== "object") return false;
  const allowedKeys = new Set(["enrollmentId", "courseId", "classId"]);
  const keys = Object.keys(value);
  if (keys.length !== allowedKeys.size || keys.some((key) => !allowedKeys.has(key))) {
    return false;
  }
  const candidate = value as Partial<ReceiptState>;
  return [candidate.enrollmentId, candidate.courseId, candidate.classId].every(
    (item) =>
      typeof item === "string" &&
      item.length > 0 &&
      item.length <= 80 &&
      /^[A-Za-z0-9_-]+$/.test(item),
  );
}

function readStoredReceipt() {
  if (typeof window === "undefined") return undefined;
  const stored = window.sessionStorage.getItem(PRE_ENROLLMENT_RECEIPT_STORAGE_KEY);
  if (!stored) return undefined;

  try {
    const parsed: unknown = JSON.parse(stored);
    return isReceiptState(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

export function EnrollmentSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { courses, classes } = useAppStore();
  const navigationState = isReceiptState(location.state) ? location.state : undefined;
  const receipt = navigationState ?? readStoredReceipt();

  if (!receipt) {
    return (
      <section className="page-section">
        <div className="container">
          <EmptyState
            title="Nenhuma pré-inscrição recente"
            description="Envie uma solicitação a partir da página de um curso para receber uma referência."
            actionLabel="Voltar ao catálogo"
            onAction={() => navigate("/cursos")}
          />
        </div>
      </section>
    );
  }

  const course = courses.find((item) => item.id === receipt.courseId);
  const trainingClass = classes.find((item) => item.id === receipt.classId);

  return (
    <section className="page-section">
      <div className="container flex justify-center">
        <Card className="w-full max-w-4xl border-outline-variant">
          <CardContent className="space-y-8 p-8 text-center md:p-10">
            <span className="eyebrow">Pré-inscrição recebida</span>
            <h1 className="text-4xl font-extrabold text-tk-brand">
              Sua solicitação está pendente de análise.
            </h1>
            <p className="text-base leading-7 text-tk-ink-muted">
              Registramos seu interesse. A equipe confirmará disponibilidade e próximos passos pelos canais informados.
            </p>

            <div className="grid gap-4 rounded-lg bg-tk-accent-soft/60 p-6 text-left md:grid-cols-2">
              <div>
                <div className="text-xs uppercase tracking-[0.16em] text-tk-brand/70">Curso</div>
                <div className="mt-2 font-semibold text-foreground">
                  {course?.title ?? "Curso selecionado"}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.16em] text-tk-brand/70">Turma solicitada</div>
                <div className="mt-2 font-semibold text-foreground">
                  {trainingClass ? formatDate(trainingClass.startDate) : "Turma selecionada"}
                </div>
              </div>
              <div className="md:col-span-2">
                <div className="text-xs uppercase tracking-[0.16em] text-tk-brand/70">Referência</div>
                <div className="mt-2 break-all font-mono text-sm font-semibold text-foreground">
                  {receipt.enrollmentId}
                </div>
              </div>
            </div>

            <div className="grid gap-4 text-left md:grid-cols-3">
              {[
                {
                  label: "1. Recebimento",
                  description: "A referência acima comprova que a solicitação foi persistida.",
                },
                {
                  label: "2. Análise",
                  description: "A equipe valida turma, disponibilidade e dados necessários.",
                },
                {
                  label: "3. Retorno",
                  description: "Você recebe orientação antes de qualquer confirmação ou condição comercial.",
                },
              ].map((item) => (
                <div key={item.label} className="surface-card p-5">
                  <p className="text-label font-bold uppercase tracking-[0.08em] text-label-secondary">
                    {item.label}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-tk-ink-muted">{item.description}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild variant="outline">
                <Link to="/cursos">Ver outros cursos</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link to="/falar-com-especialista">Falar com atendimento</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
