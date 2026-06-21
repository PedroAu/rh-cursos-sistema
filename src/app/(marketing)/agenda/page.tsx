import { AgendaBrowser } from "@/components/shared/agenda-browser";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { PageHero } from "@/components/shared/page-hero";
import { getAgendaItems } from "@/lib/public-data";

type AgendaPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getFirstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AgendaPage({ searchParams }: AgendaPageProps = {}) {
  const items = await getAgendaItems();
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const initialView = getFirstParam(resolvedSearchParams.visualizacao) === "lista" ? "lista" : "calendario";
  const statuses = new Set(items.map((item) => item.status));
  const formats = new Set(items.map((item) => item.format));
  const locations = new Set(items.map((item) => item.location));
  const months = new Set(items.map((item) => item.startDate.slice(0, 7)));
  const requestedStatus = getFirstParam(resolvedSearchParams.status) ?? "Todos";
  const requestedFormat = getFirstParam(resolvedSearchParams.modalidade) ?? "Todos";
  const requestedLocation = getFirstParam(resolvedSearchParams.local) ?? "Todos";
  const requestedMonth = getFirstParam(resolvedSearchParams.mes) ?? "Todos";
  const initialStatus = requestedStatus === "Todos" || statuses.has(requestedStatus) ? requestedStatus : "Todos";
  const initialFormat = requestedFormat === "Todos" || formats.has(requestedFormat) ? requestedFormat : "Todos";
  const initialLocation = requestedLocation === "Todos" || locations.has(requestedLocation) ? requestedLocation : "Todos";
  const initialMonth = requestedMonth === "Todos" || months.has(requestedMonth) ? requestedMonth : "Todos";

  return (
    <>
      <PageHero
        eyebrow="AGENDA"
        title="Agenda de Turmas"
        description="Consulte as próximas turmas, formatos disponíveis e datas previstas para planejar sua participação com antecedência."
        meta={["Turmas abertas", "Online e presencial", "Atualização contínua"]}
        align="center"
        showPanel={false}
      />

      <Section size="lg">
        <Container>
          <AgendaBrowser
            key={`${getFirstParam(resolvedSearchParams.busca) ?? ""}:${initialStatus}:${initialFormat}:${initialLocation}:${initialMonth}:${initialView}`}
            items={items}
            initialFormat={initialFormat}
            initialLocation={initialLocation}
            initialMonth={initialMonth}
            initialSearch={getFirstParam(resolvedSearchParams.busca)?.trim() ?? ""}
            initialStatus={initialStatus}
            initialView={initialView}
          />
        </Container>
      </Section>
    </>
  );
}
