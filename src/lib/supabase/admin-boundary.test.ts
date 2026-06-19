import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const CLIENT_DIRECTIVE_PATTERN = /^\s*["']use client["'];?/m;
const ADMIN_IMPORT_PATTERN =
  /\b(?:import|export)\b[\s\S]*?["'](?:@\/lib\/supabase\/admin|.*\/lib\/supabase\/admin)["']/;

function listSourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    const stat = statSync(path);

    if (stat.isDirectory()) {
      return listSourceFiles(path);
    }

    return /\.(ts|tsx)$/.test(path) && !/\.test\.(ts|tsx)$/.test(path) ? [path] : [];
  });
}

describe("service-role Supabase boundary", () => {
  it("does not import createAdminClient directly from client components", () => {
    const clientViolations = listSourceFiles("src").filter((file) => {
      const source = readFileSync(file, "utf8");
      return CLIENT_DIRECTIVE_PATTERN.test(source) && ADMIN_IMPORT_PATTERN.test(source);
    });

    expect(clientViolations.map((file) => relative(process.cwd(), file))).toEqual([]);
  });

  it("marks the service-role client module as server-only", () => {
    expect(readFileSync("src/lib/supabase/admin.ts", "utf8")).toMatch(
      /^\s*import ["']server-only["'];/m,
    );
  });
});
