import { describe, expect, it } from "vitest";

import { getDefaultDashboardPath, isRolePathAllowed } from "@/lib/session-routing";

describe("getDefaultDashboardPath (REC-305)", () => {
  it("mapeia cada papel server-side para o dashboard correto", () => {
    expect(getDefaultDashboardPath("student")).toBe("/aluno");
    expect(getDefaultDashboardPath("instructor")).toBe("/instrutor");
    expect(getDefaultDashboardPath("admin")).toBe("/admin");
  });
});

describe("isRolePathAllowed (REC-305)", () => {
  it("nega quando nao ha destino explicito", () => {
    expect(isRolePathAllowed("admin", null)).toBe(false);
    expect(isRolePathAllowed("student", undefined)).toBe(false);
    expect(isRolePathAllowed("instructor", "")).toBe(false);
  });

  it("permite ao admin apenas o namespace /admin", () => {
    expect(isRolePathAllowed("admin", "/admin")).toBe(true);
    expect(isRolePathAllowed("admin", "/admin/leads")).toBe(true);
    expect(isRolePathAllowed("admin", "/aluno")).toBe(false);
    expect(isRolePathAllowed("admin", "/instrutor")).toBe(false);
  });

  it("permite ao aluno apenas o namespace /aluno", () => {
    expect(isRolePathAllowed("student", "/aluno")).toBe(true);
    expect(isRolePathAllowed("student", "/aluno/certificados")).toBe(true);
    expect(isRolePathAllowed("student", "/admin")).toBe(false);
    expect(isRolePathAllowed("student", "/instrutor")).toBe(false);
  });

  it("permite ao instrutor apenas o namespace /instrutor", () => {
    expect(isRolePathAllowed("instructor", "/instrutor")).toBe(true);
    expect(isRolePathAllowed("instructor", "/instrutor/turmas")).toBe(true);
    expect(isRolePathAllowed("instructor", "/admin")).toBe(false);
    expect(isRolePathAllowed("instructor", "/aluno")).toBe(false);
  });

  it("nao permite escalada de privilegio via prefixo semelhante", () => {
    // "/admin-x" nao pode passar como se fosse namespace /admin.
    expect(isRolePathAllowed("admin", "/admin-danger")).toBe(false);
    expect(isRolePathAllowed("student", "/alunox")).toBe(false);
  });
});
