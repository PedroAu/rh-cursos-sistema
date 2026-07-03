"use client";

import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { fetchStudentPortalData, type StudentPortalData } from "@/lib/supabase/portal-data";
import { supabase } from "@/lib/supabase/client";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(value));
}

export function StudentPortal() {
  const [data, setData] = useState<StudentPortalData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    if (!supabase) {
      setError("Supabase não configurado para carregar o portal do aluno.");
      setLoading(false);
      return;
    }

    void fetchStudentPortalData(supabase)
      .then((result) => {
        if (!active) return;
        setData(result);
      })
      .catch((reason) => {
        if (!active) return;
        setError(reason instanceof Error ? reason.message : "Não foi possível carregar o portal do aluno.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <p className="text-sm text-tk-ink-muted">Carregando contexto do aluno...</p>;
  }

  if (error) {
    return (
      <div role="alert" className="rounded-lg border border-warning/25 bg-warning/10 px-4 py-3 text-sm text-warning">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-semibold">Portal do aluno indisponível</p>
            <p className="mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-bold text-tk-ink">Portal do aluno</h1>
        <p className="text-tk-ink-muted">Acompanhe suas inscrições ativas e o contexto das próximas turmas.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3" id="perfil">
        <Card>
          <p className="text-sm text-tk-ink-muted">Aluno</p>
          <h3 className="mt-1.5 text-xl font-semibold text-tk-ink">{data.profile.name}</h3>
          <p className="mt-2 text-tk-ink">{data.profile.email}</p>
          <p className="text-tk-ink">{data.profile.phone || "Telefone não informado"}</p>
        </Card>
        <Card>
          <p className="text-sm text-tk-ink-muted">Organização</p>
          <h4 className="mt-1.5 text-lg font-semibold text-tk-ink">{data.profile.organization || "Pessoa física"}</h4>
          <p className="mt-2 text-tk-ink">{data.profile.jobTitle || "Cargo não informado"}</p>
        </Card>
        <Card>
          <p className="text-sm text-tk-ink-muted">Inscrições</p>
          <h2 className="mt-1.5 text-2xl font-bold text-tk-ink">{data.enrollments.length}</h2>
          <p className="mt-2 text-tk-ink">Somente registros vinculados à sua conta autenticada.</p>
        </Card>
      </div>

      <Card id="inscricoes">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h3 className="text-xl font-semibold text-tk-ink">Minhas inscrições</h3>
            <p className="text-tk-ink-muted">Sem certificados, materiais ou histórico financeiro neste MVP.</p>
          </div>
        </div>

        {data.enrollments.length === 0 ? (
          <div className="rounded-2xl bg-tk-surface-2 p-8 text-center">
            <p className="font-semibold text-tk-ink">Nenhuma inscrição encontrada</p>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-tk-ink-muted">
              Sua conta ainda não possui inscrições vinculadas.
            </p>
          </div>
        ) : (
          <Table className="min-w-[760px]">
            <TableHeader>
              <TableRow>
                <TableHead>Curso</TableHead>
                <TableHead>Turma</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead>Certificado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.enrollments.map((enrollment) => (
                <TableRow key={enrollment.id}>
                  <TableCell>{enrollment.class?.course?.title ?? "Curso indisponível"}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span>{enrollment.class ? formatDate(enrollment.class.startDate) : "Data indisponível"}</span>
                      <span className="text-sm text-tk-ink-muted">
                        {enrollment.class?.modality ?? "Modalidade indisponível"}
                        {enrollment.class?.location ? ` • ${enrollment.class.location}` : ""}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="muted">{enrollment.status}</Badge>
                  </TableCell>
                  <TableCell>{enrollment.paymentMethod || "Não informado"}</TableCell>
                  <TableCell>{enrollment.certificateIssued ? "Emitido" : "Fora do MVP"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
