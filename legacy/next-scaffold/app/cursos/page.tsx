import { CourseCatalog } from "@/components/course-catalog";
import { courses } from "@/lib/site-data";

export default async function CoursesPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = await searchParams;
  const getValue = (value?: string | string[]) => (Array.isArray(value) ? value[0] : value) ?? "";

  return (
    <section className="section">
      <div className="container stack-lg">
        <div className="section-heading">
          <span className="eyebrow">M02 • Catálogo</span>
          <h1>Catálogo de cursos</h1>
          <p>
            Encontre a trilha certa por área, modalidade, nível e momento da sua equipe.
          </p>
        </div>
        <CourseCatalog
          courses={courses}
          initialFilters={{
            query: getValue(filters?.query),
            area: getValue(filters?.area),
            modality: getValue(filters?.modality),
            level: getValue(filters?.level)
          }}
        />
      </div>
    </section>
  );
}
