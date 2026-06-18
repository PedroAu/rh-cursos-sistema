import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const COURSE_SLUG =
  "curso-pratico-de-atualizacao-do-esocial-novo-leiaute-1-3-para-orgaos-publicos";

const routes: Array<{ name: string; path: string }> = [
  { name: "home", path: "/" },
  { name: "cursos (catalog)", path: "/cursos" },
  { name: "curso detail", path: `/cursos/${COURSE_SLUG}` },
  { name: "inscricao", path: `/inscricao/${COURSE_SLUG}` },
  { name: "contato", path: "/contato" },
  { name: "agenda", path: "/agenda" },
  { name: "login", path: "/login" },
];

for (const route of routes) {
  test(`${route.name} (${route.path}) has no critical or serious axe violations`, async ({
    page,
  }) => {
    await page.goto(route.path, { waitUntil: "networkidle" });

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    const seriousOrCritical = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious",
    );

    if (seriousOrCritical.length > 0) {
      console.log(
        `axe violations on ${route.path}:`,
        JSON.stringify(
          seriousOrCritical.map((v) => ({
            id: v.id,
            impact: v.impact,
            help: v.help,
            nodes: v.nodes.length,
            targets: v.nodes.map((n) => n.target),
          })),
          null,
          2,
        ),
      );
    }

    expect(
      seriousOrCritical,
      JSON.stringify(
        seriousOrCritical.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length })),
        null,
        2,
      ),
    ).toEqual([]);
  });
}
