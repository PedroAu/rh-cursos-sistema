import { AgendaBrowser } from "@/components/agenda-browser";
import { calendarEvents } from "@/lib/site-data";

export default function AgendaPage() {
  return (
    <section className="section">
      <div className="container stack-lg">
        <div className="section-heading">
          <span className="eyebrow">M04 • Agenda</span>
          <h1>Agenda e calendário de turmas</h1>
          <p>
            Visualize próximas datas, filtre por área e encontre a turma ideal sem fricção.
          </p>
        </div>
        <AgendaBrowser events={calendarEvents} />
      </div>
    </section>
  );
}
