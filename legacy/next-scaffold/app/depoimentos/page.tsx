import { TestimonialsExplorer } from "@/components/testimonials-explorer";
import { testimonials } from "@/lib/site-data";

export default function TestimonialsPage() {
  return (
    <section className="section">
      <div className="container stack-lg">
        <div className="section-heading">
          <span className="eyebrow">M05 • Prova social</span>
          <h1>Depoimentos e prova social</h1>
          <p>
            Estrutura pronta para crescer com os depoimentos reais do roadmap de coleta e
            alimentar home, cursos e CRM.
          </p>
        </div>
        <TestimonialsExplorer items={testimonials} />
      </div>
    </section>
  );
}
