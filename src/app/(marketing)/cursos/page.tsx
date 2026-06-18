import { CtaSection } from "@/components/shared/cta-section";
import { CourseCatalogFilters } from "@/components/shared/course-catalog-filters";
import { CourseArticleCard } from "@/components/shared/course-article-card";
import { PageHero } from "@/components/shared/page-hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getAgendaItems, getPublicCourses, type AgendaItem } from "@/lib/public-data";
import type { Course } from "@/lib/site-data";
import Link from "next/link";

type CoursesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getFirstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeSearchValue(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function getSearchableCourseText(course: Course) {
  return [
    course.title,
    course.category,
    course.summary,
    course.description,
    course.duration,
    course.format,
  ].join(" ");
}

function getCourseLevel(course: Course) {
  if (course.level) {
    return course.level;
  }

  const source = `${course.title} ${course.summary} ${course.description} ${course.outcomes.join(" ")}`.toLowerCase();

  if (source.includes("avanç") || source.includes("avanc") || source.includes("especialista")) {
    return "Avançado";
  }

  if (source.includes("fundamento") || source.includes("básic") || source.includes("basic")) {
    return "Fundamentos";
  }

  return "Aplicação prática";
}

function getDurationGroup(duration: string) {
  const hours = Number(duration.match(/\d+/)?.[0] ?? 0);

  if (!hours) return "Carga horária sob consulta";
  if (hours <= 16) return "Até 16h";
  if (hours <= 24) return "17h a 24h";
  return "Acima de 24h";
}

function normalizeOption(value: string | undefined) {
  return value && value.trim().length > 0 ? value.trim() : "Todos";
}

function resolveCurrentOption(options: string[], selectedOption: string) {
  if (selectedOption === "Todos") {
    return "Todos";
  }

  const normalizedSelectedOption = normalizeSearchValue(selectedOption);
  return (
    options.find((option) => normalizeSearchValue(option) === normalizedSelectedOption) ??
    "Todos"
  );
}

function getNextClassForCourse(course: Course, agendaItems: AgendaItem[]) {
  const today = new Date().toISOString().slice(0, 10);

  return agendaItems
    .filter((item) => item.courseSlug === course.slug && item.startDate >= today)
    .sort((first, second) => first.startDate.localeCompare(second.startDate))[0];
}

export default async function CoursesPage({ searchParams }: CoursesPageProps = {}) {
  const [courses, agendaItems] = await Promise.all([getPublicCourses(), getAgendaItems()]);
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const selectedTrail = normalizeOption(getFirstParam(resolvedSearchParams.trilha));
  const selectedFormat = normalizeOption(getFirstParam(resolvedSearchParams.modalidade));
  const selectedDuration = normalizeOption(getFirstParam(resolvedSearchParams.duracao));
  const selectedAudience = normalizeOption(getFirstParam(resolvedSearchParams.publico));
  const selectedAvailability = normalizeOption(getFirstParam(resolvedSearchParams.turma));
  const selectedLevel = normalizeOption(getFirstParam(resolvedSearchParams.nivel));
  const searchQuery = getFirstParam(resolvedSearchParams.busca)?.trim() ?? "";
  const normalizedQuery = normalizeSearchValue(searchQuery);
  const trails = ["Todos", ...Array.from(new Set(courses.map((course) => course.category)))];
  const currentTrail = resolveCurrentOption(trails, selectedTrail);
  const formats = ["Todos", ...Array.from(new Set(courses.map((course) => course.format)))];
  const durations = ["Todos", ...Array.from(new Set(courses.map((course) => getDurationGroup(course.duration))))];
  const audiences = [
    "Todos",
    ...Array.from(new Set(courses.flatMap((course) => course.audience).filter(Boolean))),
  ];
  const availabilityOptions = ["Todos", "Com próxima turma", "Sob consulta"];
  const levels = ["Todos", ...Array.from(new Set(courses.map(getCourseLevel)))];
  const currentFormat = resolveCurrentOption(formats, selectedFormat);
  const currentDuration = resolveCurrentOption(durations, selectedDuration);
  const currentAudience = resolveCurrentOption(audiences, selectedAudience);
  const currentAvailability = resolveCurrentOption(availabilityOptions, selectedAvailability);
  const currentLevel = resolveCurrentOption(levels, selectedLevel);
  const filteredCourses = courses.filter((course) => {
    const nextClass = getNextClassForCourse(course, agendaItems);
    const matchesTrail = currentTrail === "Todos" || course.category === currentTrail;
    const matchesFormat = currentFormat === "Todos" || course.format === currentFormat;
    const matchesDuration = currentDuration === "Todos" || getDurationGroup(course.duration) === currentDuration;
    const matchesAudience = currentAudience === "Todos" || course.audience.includes(currentAudience);
    const matchesAvailability =
      currentAvailability === "Todos" ||
      (currentAvailability === "Com próxima turma" && Boolean(nextClass)) ||
      (currentAvailability === "Sob consulta" && !nextClass);
    const matchesLevel = currentLevel === "Todos" || getCourseLevel(course) === currentLevel;
    const matchesSearch = normalizedQuery
      ? normalizeSearchValue(getSearchableCourseText(course)).includes(normalizedQuery)
      : true;

    return (
      matchesTrail &&
      matchesFormat &&
      matchesDuration &&
      matchesAudience &&
      matchesAvailability &&
      matchesLevel &&
      matchesSearch
    );
  });
  const suggestedTrails = trails.filter((trail) => trail !== "Todos").slice(0, 3);

  return (
    <>
      <PageHero
        eyebrow="CATALOGO"
        title="Catálogo de Cursos"
        description="Capacitação de excelência para profissionais de RH e Gestão Pública com foco em resultados práticos e conformidade legal."
        align="center"
        showPanel={false}
      />

      <section className="relative z-[2] mx-auto -mt-6 w-full max-w-page px-6 xl:-mt-8">
        <CourseCatalogFilters
          key={`${currentTrail}:${searchQuery}`}
          trails={trails}
          currentTrail={currentTrail}
          formats={formats}
          currentFormat={currentFormat}
          durations={durations}
          currentDuration={currentDuration}
          audiences={audiences}
          currentAudience={currentAudience}
          availabilityOptions={availabilityOptions}
          currentAvailability={currentAvailability}
          levels={levels}
          currentLevel={currentLevel}
          searchQuery={searchQuery}
          resultsCount={filteredCourses.length}
        />
      </section>

      <section className="mx-auto w-full max-w-page px-6 py-8 md:py-12 xl:py-16">
        <div className="space-y-8">
          <h2 className="font-heading text-3xl font-bold text-foreground">Cursos disponíveis</h2>

          {filteredCourses.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 xl:gap-8">
              {filteredCourses.map((course) => (
                <CourseArticleCard
                  key={course.slug}
                  course={course}
                  compact
                  level={getCourseLevel(course)}
                  durationGroup={getDurationGroup(course.duration)}
                  nextClass={getNextClassForCourse(course, agendaItems)}
                />
              ))}
            </div>
          ) : (
            <Card className="text-center">
              <CardContent className="p-6 md:p-8">
                <div className="mx-auto max-w-content-sm space-y-4">
                  <h3 className="font-heading text-2xl font-bold text-foreground">Nenhum curso encontrado</h3>
                  <p className="text-muted-foreground">
                  Não encontramos curso para esta combinação de busca e filtros. Limpe os filtros,
                  teste uma trilha próxima ou fale com um especialista para localizar a melhor opção.
                  </p>
                  {suggestedTrails.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-3">
                      {suggestedTrails.map((trail) => (
                        <Button key={trail} asChild variant="secondary">
                          <Link href={`/cursos?trilha=${encodeURIComponent(trail)}`}>
                            {trail}
                          </Link>
                        </Button>
                      ))}
                    </div>
                  ) : null}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Button asChild>
                      <Link href="/cursos">Limpar filtros</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href="/especialista">Falar com especialista</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <section className="mx-auto w-full max-w-page px-6 py-16 md:py-24 xl:py-32">
        <CtaSection
          title="Precisa de um treinamento personalizado?"
          text="Nossas soluções In Company são adaptadas às necessidades específicas da sua organização ou órgão público."
          primaryHref="/in-company"
          primaryLabel="Solicitar Proposta"
        />
      </section>
    </>
  );
}
