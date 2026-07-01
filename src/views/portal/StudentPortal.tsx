"use client";

import { useEffect, useState } from "react";
import { Alert, Badge, Card, Group, SimpleGrid, Stack, Table, Text, Title } from "@mantine/core";

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
    return <Text c="dimmed">Carregando contexto do aluno...</Text>;
  }

  if (error) {
    return (
      <Alert color="yellow" title="Portal do aluno indisponível">
        {error}
      </Alert>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <Stack gap="xl">
      <Stack gap={6}>
        <Title order={1}>Portal do aluno</Title>
        <Text c="dimmed">Acompanhe suas inscrições ativas e o contexto das próximas turmas.</Text>
      </Stack>

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md" id="perfil">
        <Card withBorder radius="lg" padding="lg">
          <Text size="sm" c="dimmed">Aluno</Text>
          <Title order={3} mt={6}>{data.profile.name}</Title>
          <Text mt={8}>{data.profile.email}</Text>
          <Text>{data.profile.phone || "Telefone não informado"}</Text>
        </Card>
        <Card withBorder radius="lg" padding="lg">
          <Text size="sm" c="dimmed">Organização</Text>
          <Title order={4} mt={6}>{data.profile.organization || "Pessoa física"}</Title>
          <Text mt={8}>{data.profile.jobTitle || "Cargo não informado"}</Text>
        </Card>
        <Card withBorder radius="lg" padding="lg">
          <Text size="sm" c="dimmed">Inscrições</Text>
          <Title order={2} mt={6}>{data.enrollments.length}</Title>
          <Text mt={8}>Somente registros vinculados à sua conta autenticada.</Text>
        </Card>
      </SimpleGrid>

      <Card withBorder radius="lg" padding="lg" id="inscricoes">
        <Group justify="space-between" align="end" mb="md">
          <div>
            <Title order={3}>Minhas inscrições</Title>
            <Text c="dimmed">Sem certificados, materiais ou histórico financeiro neste MVP.</Text>
          </div>
        </Group>

        {data.enrollments.length === 0 ? (
          <Alert color="blue" title="Nenhuma inscrição encontrada">
            Sua conta ainda não possui inscrições vinculadas.
          </Alert>
        ) : (
          <Table.ScrollContainer minWidth={760}>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Curso</Table.Th>
                  <Table.Th>Turma</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Pagamento</Table.Th>
                  <Table.Th>Certificado</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {data.enrollments.map((enrollment) => (
                  <Table.Tr key={enrollment.id}>
                    <Table.Td>{enrollment.class?.course?.title ?? "Curso indisponível"}</Table.Td>
                    <Table.Td>
                      <Stack gap={2}>
                        <Text>{enrollment.class ? formatDate(enrollment.class.startDate) : "Data indisponível"}</Text>
                        <Text size="sm" c="dimmed">
                          {enrollment.class?.modality ?? "Modalidade indisponível"}
                          {enrollment.class?.location ? ` • ${enrollment.class.location}` : ""}
                        </Text>
                      </Stack>
                    </Table.Td>
                    <Table.Td><Badge variant="light">{enrollment.status}</Badge></Table.Td>
                    <Table.Td>{enrollment.paymentMethod || "Não informado"}</Table.Td>
                    <Table.Td>{enrollment.certificateIssued ? "Emitido" : "Fora do MVP"}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}
      </Card>
    </Stack>
  );
}
