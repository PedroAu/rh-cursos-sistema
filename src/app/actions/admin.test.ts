import { vi } from "vitest";
import {
  archiveEntityAction,
  createAlunoAction,
  createCourseAction,
  createSystemUserAction,
  deactivateSystemUserAction,
  reactivateSystemUserAction,
  saveAdminSettingsAction,
  updateAlunoAction,
  updateLeadStatusAction,
  updateSystemUserAction,
} from "@/app/actions/admin";

const { revalidatePath, readAdminSettings, writeAdminSettings, createAdminClient } =
  vi.hoisted(() => ({
    revalidatePath: vi.fn(),
    readAdminSettings: vi.fn(),
    writeAdminSettings: vi.fn(),
    createAdminClient: vi.fn(),
  }));

vi.mock("next/cache", () => ({
  revalidatePath,
}));

vi.mock("@/lib/admin-settings", () => ({
  readAdminSettings,
  writeAdminSettings,
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient,
}));

function buildFormData(entries: Record<string, string>) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(entries)) {
    formData.set(key, value);
  }

  return formData;
}

function buildSettingsFormData(entries: Record<string, string | File>) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(entries)) {
    formData.set(key, value);
  }

  return formData;
}

function buildSystemUserAdminClient(options: {
  createUserResult?: { error: unknown; data: { user: { id: string } | null } };
  updateUserByIdResult?: { error: unknown };
  getUserByIdResult?: { data: { user: { user_metadata: Record<string, unknown> } | null } };
  upsertResult?: { error: unknown };
}) {
  const createUser = vi
    .fn()
    .mockResolvedValue(
      options.createUserResult ?? { error: null, data: { user: { id: "user-1" } } },
    );
  const updateUserById = vi
    .fn()
    .mockResolvedValue(options.updateUserByIdResult ?? { error: null });
  const getUserById = vi
    .fn()
    .mockResolvedValue(options.getUserByIdResult ?? { data: { user: { user_metadata: {} } } });
  const upsert = vi.fn().mockResolvedValue(options.upsertResult ?? { error: null });

  return {
    auth: {
      admin: {
        createUser,
        updateUserById,
        getUserById,
      },
    },
    from: vi.fn(() => ({
      upsert,
    })),
  };
}

describe("admin actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns validation error when createCourseAction receives incomplete data", async () => {
    const result = await createCourseAction(
      { error: null, success: null },
      buildFormData({ titulo: "", categoria: "Lideranca", modalidade: "Online" }),
    );

    expect(result).toEqual({
      error: "Preencha titulo, slug, modalidade e listas obrigatorias.",
      success: null,
    });
    expect(createAdminClient).not.toHaveBeenCalled();
  });

  it("creates a course, normalizes invalid carga horaria and revalidates admin pages", async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    createAdminClient.mockReturnValue({
      from: vi.fn(() => ({
        insert,
      })),
    });

    const result = await createCourseAction(
      { error: null, success: null },
      buildFormData({
        titulo: "Gestao Publica Avancada",
        slug: "gestao-publica-avancada",
        categoria: "Gestao",
        modalidade: "Online",
        nivel: "Basico",
        status: "Rascunho",
        ementa: "Modulo 1",
        objetivos: "Objetivo 1",
        beneficios: "Beneficio 1",
        publico_alvo: "Gestores",
        carga_horaria: "abc",
      }),
    );

    expect(result).toEqual({
      error: null,
      success: "Curso criado com sucesso.",
    });
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        titulo: "Gestao Publica Avancada",
        slug: "gestao-publica-avancada",
        categoria: "Gestao",
        modalidade: "Online",
        carga_horaria: 0,
        status: "Rascunho",
      }),
    );
    expect(revalidatePath).toHaveBeenCalledWith("/admin/cursos");
    expect(revalidatePath).toHaveBeenCalledWith("/admin");
  });

  it("updates lead status and ignores invalid archive table names", async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    const update = vi.fn(() => ({ eq }));
    createAdminClient.mockReturnValue({
      from: vi.fn(() => ({
        update,
      })),
    });

    await updateLeadStatusAction(
      buildFormData({
        lead_id: "lead-1",
        status_crm: "Qualificado",
      }),
    );

    await archiveEntityAction(
      buildFormData({
        table: "profiles",
        id: "user-1",
      }),
    );

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        status_crm: "Qualificado",
      }),
    );
    expect(eq).toHaveBeenCalledWith("id", "lead-1");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/leads");
    expect(revalidatePath).toHaveBeenCalledTimes(2);
  });

  it("creates aluno without generated columns and revalidates admin pages", async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    createAdminClient.mockReturnValue({
      from: vi.fn(() => ({
        insert,
      })),
    });

    const result = await createAlunoAction(
      { error: null, success: null },
      buildFormData({
        nome_completo: "Maria Silva",
        email: "MARIA@example.com",
        cpf: "123.456.789-00",
        telefone: "(11) 98888-7777",
        cargo: "Analista",
        orgao: "RH Cursos",
        tipo_aluno: "PF",
        user_id: "",
      }),
    );

    expect(result).toEqual({
      error: null,
      success: "Aluno criado com sucesso.",
    });
    expect(insert).toHaveBeenCalledWith({
      nome_completo: "Maria Silva",
      email: "maria@example.com",
      cpf: "12345678900",
      telefone: "11988887777",
      cargo: "Analista",
      orgao: "RH Cursos",
      tipo_aluno: "PF",
      user_id: null,
    });
    expect(insert.mock.calls[0][0]).not.toHaveProperty("id");
    expect(insert.mock.calls[0][0]).not.toHaveProperty("created_at");
    expect(insert.mock.calls[0][0]).not.toHaveProperty("deleted_at");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/alunos");
  });

  it("validates aluno personal fields before writing", async () => {
    const result = await createAlunoAction(
      { error: null, success: null },
      buildFormData({
        nome_completo: "Maria Silva",
        email: "maria@example.com",
        cpf: "123",
        telefone: "(11) 98888-7777",
        tipo_aluno: "PF",
      }),
    );

    expect(result).toEqual({
      error: "Informe um CPF com 11 digitos ou deixe em branco.",
      success: null,
    });
    expect(createAdminClient).not.toHaveBeenCalled();
  });

  it("updates aluno with updated_at and supports aluno soft-delete", async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    const update = vi.fn(() => ({ eq }));
    createAdminClient.mockReturnValue({
      from: vi.fn(() => ({
        update,
      })),
    });

    const result = await updateAlunoAction(
      { error: null, success: null },
      buildFormData({
        id: "aluno-1",
        nome_completo: "Maria Silva",
        email: "maria@example.com",
        cpf: "",
        telefone: "",
        tipo_aluno: "PJ",
      }),
    );

    await archiveEntityAction(
      buildFormData({
        table: "aluno",
        id: "aluno-1",
      }),
    );

    expect(result).toEqual({
      error: null,
      success: "Aluno atualizado com sucesso.",
    });
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        nome_completo: "Maria Silva",
        email: "maria@example.com",
        tipo_aluno: "PJ",
        updated_at: expect.any(String),
      }),
    );
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        deleted_at: expect.any(String),
      }),
    );
    expect(eq).toHaveBeenCalledWith("id", "aluno-1");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/alunos");
  });

  it("persists local admin settings with checkbox flags", async () => {
    readAdminSettings.mockResolvedValue({
      operationName: "Operacao anterior",
      commercialEmail: "old@example.com",
      mainLogoUrl: "",
      faviconUrl: "/favicon.ico",
      notifyEnrollments: false,
      notifyLeads: false,
      dataSource: "crm",
      priorityChannel: "email",
    });

    const result = await saveAdminSettingsAction(
      { error: null, success: null },
      buildFormData({
        operationName: "RH Cursos",
        commercialEmail: "comercial@rhcursos.com",
        mainLogoUrl: "/uploads/logo-rh.svg",
        faviconUrl: "/uploads/favicon.png",
        dataSource: "supabase",
        priorityChannel: "whatsapp",
        notifyEnrollments: "on",
      }),
    );

    expect(result).toEqual({
      error: null,
      success: "Configurações salvas com sucesso.",
    });
    expect(writeAdminSettings).toHaveBeenCalledWith({
      operationName: "RH Cursos",
      commercialEmail: "comercial@rhcursos.com",
      mainLogoUrl: "/uploads/logo-rh.svg",
      faviconUrl: "/uploads/favicon.png",
      notifyEnrollments: true,
      notifyLeads: false,
      dataSource: "supabase",
      priorityChannel: "whatsapp",
    });
    expect(revalidatePath).toHaveBeenCalledWith("/admin/configuracoes");
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
  });

  it("uploads selected logo and favicon files before saving admin settings", async () => {
    readAdminSettings.mockResolvedValue({
      operationName: "Operacao anterior",
      commercialEmail: "old@example.com",
      mainLogoUrl: "",
      faviconUrl: "/favicon.ico",
      notifyEnrollments: false,
      notifyLeads: false,
      dataSource: "crm",
      priorityChannel: "email",
    });

    const getBucket = vi.fn().mockResolvedValue({ data: { name: "admin-assets" }, error: null });
    const upload = vi
      .fn()
      .mockResolvedValueOnce({ data: { path: "logo/generated.svg" }, error: null })
      .mockResolvedValueOnce({ data: { path: "favicon/generated.png" }, error: null });
    const getPublicUrl = vi
      .fn()
      .mockReturnValueOnce({
        data: { publicUrl: "https://cdn.example.com/logo/generated.svg" },
      })
      .mockReturnValueOnce({
        data: { publicUrl: "https://cdn.example.com/favicon/generated.png" },
      });
    const fromStorage = vi.fn(() => ({
      upload,
      getPublicUrl,
    }));
    createAdminClient.mockReturnValue({
      storage: {
        getBucket,
        createBucket: vi.fn(),
        from: fromStorage,
      },
    });

    const result = await saveAdminSettingsAction(
      { error: null, success: null },
      buildSettingsFormData({
        operationName: "RH Cursos",
        commercialEmail: "comercial@rhcursos.com",
        mainLogoUrl: "",
        faviconUrl: "/favicon.ico",
        mainLogoFile: new File(["<svg />"], "logo-rh.svg", {
          type: "image/svg+xml",
        }),
        faviconFile: new File(["icon"], "favicon.png", {
          type: "image/png",
        }),
        dataSource: "supabase",
        priorityChannel: "whatsapp",
      }),
    );

    expect(result).toEqual({
      error: null,
      success: "Configurações salvas com sucesso.",
    });
    expect(fromStorage).toHaveBeenCalledWith("admin-assets");
    expect(upload).toHaveBeenCalledTimes(2);
    expect(writeAdminSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        mainLogoUrl: "https://cdn.example.com/logo/generated.svg",
        faviconUrl: "https://cdn.example.com/favicon/generated.png",
      }),
    );
  });

  it("rejects invalid admin logo and favicon URLs", async () => {
    const invalidLogoResult = await saveAdminSettingsAction(
      { error: null, success: null },
      buildFormData({
        operationName: "RH Cursos",
        commercialEmail: "comercial@rhcursos.com",
        mainLogoUrl: "javascript:alert(1)",
        faviconUrl: "/uploads/favicon.ico",
        dataSource: "supabase",
        priorityChannel: "whatsapp",
      }),
    );

    const invalidFaviconResult = await saveAdminSettingsAction(
      { error: null, success: null },
      buildFormData({
        operationName: "RH Cursos",
        commercialEmail: "comercial@rhcursos.com",
        mainLogoUrl: "/uploads/logo.webp",
        faviconUrl: "/uploads/favicon.gif",
        dataSource: "supabase",
        priorityChannel: "whatsapp",
      }),
    );

    expect(invalidLogoResult).toEqual({
      error: "Informe uma URL válida para o logo principal em SVG, PNG, JPG ou WebP.",
      success: null,
    });
    expect(invalidFaviconResult).toEqual({
      error: "Informe uma URL válida para o favicon em ICO, PNG ou SVG.",
      success: null,
    });
    expect(writeAdminSettings).not.toHaveBeenCalled();
  });

  describe("createSystemUserAction", () => {
    it("returns validation error when password is shorter than 8 characters and does not call supabase", async () => {
      const result = await createSystemUserAction(
        { error: null, success: null },
        buildFormData({
          nome: "Joao Silva",
          email: "joao@example.com",
          password: "short",
          role: "admin",
          status: "ativo",
        }),
      );

      expect(result).toEqual({
        error: "Informe nome, e-mail e senha provisória com pelo menos 8 caracteres.",
        success: null,
      });
      expect(createAdminClient).not.toHaveBeenCalled();
    });

    it("creates an admin user, activates it, syncs profile role and revalidates admin pages", async () => {
      const client = buildSystemUserAdminClient({});
      createAdminClient.mockReturnValue(client);

      const result = await createSystemUserAction(
        { error: null, success: null },
        buildFormData({
          nome: "Joao Silva",
          email: "joao@example.com",
          password: "supersecret",
          role: "admin",
          status: "ativo",
        }),
      );

      expect(result).toEqual({ error: null, success: "Usuário criado com sucesso." });
      expect(client.auth.admin.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "joao@example.com",
          password: "supersecret",
          email_confirm: true,
          user_metadata: expect.objectContaining({
            name: "Joao Silva",
            nome: "Joao Silva",
            role: "admin",
            status: "ativo",
          }),
          app_metadata: { role: "admin" },
        }),
      );
      expect(client.from).toHaveBeenCalledWith("profiles");
      expect(client.auth.admin.updateUserById).not.toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith("/admin/configuracoes");
      expect(revalidatePath).toHaveBeenCalledWith("/admin/usuarios");
      expect(revalidatePath).toHaveBeenCalledWith("/admin");
    });

    it("bans the created user when status is inativo", async () => {
      const client = buildSystemUserAdminClient({});
      createAdminClient.mockReturnValue(client);

      const result = await createSystemUserAction(
        { error: null, success: null },
        buildFormData({
          nome: "Maria Souza",
          email: "maria@example.com",
          password: "supersecret",
          role: "aluno",
          status: "inativo",
        }),
      );

      expect(result).toEqual({ error: null, success: "Usuário criado com sucesso." });
      expect(client.auth.admin.updateUserById).toHaveBeenCalledWith("user-1", {
        ban_duration: "876000h",
      });
    });

    it("returns failure message when createUser returns an error", async () => {
      const client = buildSystemUserAdminClient({
        createUserResult: { error: { message: "boom" }, data: { user: null } },
      });
      createAdminClient.mockReturnValue(client);

      const result = await createSystemUserAction(
        { error: null, success: null },
        buildFormData({
          nome: "Joao Silva",
          email: "joao@example.com",
          password: "supersecret",
          role: "admin",
          status: "ativo",
        }),
      );

      expect(result).toEqual({ error: "Não foi possível criar o usuário.", success: null });
      expect(revalidatePath).not.toHaveBeenCalled();
    });
  });

  describe("updateSystemUserAction", () => {
    it("returns validation error when id is missing and does not call supabase", async () => {
      const result = await updateSystemUserAction(
        { error: null, success: null },
        buildFormData({ nome: "Joao Silva", email: "joao@example.com" }),
      );

      expect(result).toEqual({
        error: "Dados insuficientes para atualizar o usuario.",
        success: null,
      });
      expect(createAdminClient).not.toHaveBeenCalled();
    });

    it("updates an active user with ban_duration none and syncs profile role", async () => {
      const client = buildSystemUserAdminClient({});
      createAdminClient.mockReturnValue(client);

      const result = await updateSystemUserAction(
        { error: null, success: null },
        buildFormData({
          id: "user-1",
          nome: "Joao Silva",
          email: "joao@example.com",
          role: "admin",
          status: "ativo",
        }),
      );

      expect(result).toEqual({ error: null, success: "Usuário atualizado com sucesso." });
      expect(client.auth.admin.updateUserById).toHaveBeenCalledWith(
        "user-1",
        expect.objectContaining({
          email: "joao@example.com",
          ban_duration: "none",
          email_confirm: true,
          app_metadata: { role: "admin" },
        }),
      );
      expect(client.from).toHaveBeenCalledWith("profiles");
    });

    it("updates an inactive user with ban_duration 876000h", async () => {
      const client = buildSystemUserAdminClient({});
      createAdminClient.mockReturnValue(client);

      const result = await updateSystemUserAction(
        { error: null, success: null },
        buildFormData({
          id: "user-1",
          nome: "Joao Silva",
          email: "joao@example.com",
          role: "professor",
          status: "inativo",
        }),
      );

      expect(result).toEqual({ error: null, success: "Usuário atualizado com sucesso." });
      expect(client.auth.admin.updateUserById).toHaveBeenCalledWith(
        "user-1",
        expect.objectContaining({
          ban_duration: "876000h",
          email_confirm: false,
          app_metadata: { role: "professor" },
        }),
      );
    });

    it("returns failure message when updateUserById returns an error", async () => {
      const client = buildSystemUserAdminClient({
        updateUserByIdResult: { error: { message: "boom" } },
      });
      createAdminClient.mockReturnValue(client);

      const result = await updateSystemUserAction(
        { error: null, success: null },
        buildFormData({
          id: "user-1",
          nome: "Joao Silva",
          email: "joao@example.com",
          role: "admin",
          status: "ativo",
        }),
      );

      expect(result).toEqual({
        error: "Não foi possível atualizar o usuário.",
        success: null,
      });
      expect(revalidatePath).not.toHaveBeenCalled();
    });
  });

  describe("deactivateSystemUserAction", () => {
    it("returns validation error when id is missing", async () => {
      const result = await deactivateSystemUserAction(
        { error: null, success: null },
        buildFormData({}),
      );

      expect(result).toEqual({ error: "Usuário inválido.", success: null });
      expect(createAdminClient).not.toHaveBeenCalled();
    });

    it("bans the user and marks status inativo in metadata", async () => {
      const client = buildSystemUserAdminClient({
        getUserByIdResult: { data: { user: { user_metadata: { name: "Joao" } } } },
      });
      createAdminClient.mockReturnValue(client);

      const result = await deactivateSystemUserAction(
        { error: null, success: null },
        buildFormData({ id: "user-1" }),
      );

      expect(result).toEqual({ error: null, success: "Usuário desativado com sucesso." });
      expect(client.auth.admin.updateUserById).toHaveBeenCalledWith("user-1", {
        ban_duration: "876000h",
        user_metadata: { name: "Joao", status: "inativo" },
      });
      expect(revalidatePath).toHaveBeenCalledWith("/admin/usuarios");
    });

    it("returns failure message when updateUserById returns an error", async () => {
      const client = buildSystemUserAdminClient({
        updateUserByIdResult: { error: { message: "boom" } },
      });
      createAdminClient.mockReturnValue(client);

      const result = await deactivateSystemUserAction(
        { error: null, success: null },
        buildFormData({ id: "user-1" }),
      );

      expect(result).toEqual({
        error: "Não foi possível desativar o usuário.",
        success: null,
      });
      expect(revalidatePath).not.toHaveBeenCalled();
    });
  });

  describe("reactivateSystemUserAction", () => {
    it("unbans the user, confirms email and marks status ativo in metadata", async () => {
      const client = buildSystemUserAdminClient({
        getUserByIdResult: { data: { user: { user_metadata: { name: "Joao" } } } },
      });
      createAdminClient.mockReturnValue(client);

      const result = await reactivateSystemUserAction(
        { error: null, success: null },
        buildFormData({ id: "user-1" }),
      );

      expect(result).toEqual({ error: null, success: "Usuário reativado com sucesso." });
      expect(client.auth.admin.updateUserById).toHaveBeenCalledWith("user-1", {
        ban_duration: "none",
        email_confirm: true,
        user_metadata: { name: "Joao", status: "ativo" },
      });
      expect(revalidatePath).toHaveBeenCalledWith("/admin/usuarios");
    });

    it("returns failure message when updateUserById returns an error", async () => {
      const client = buildSystemUserAdminClient({
        updateUserByIdResult: { error: { message: "boom" } },
      });
      createAdminClient.mockReturnValue(client);

      const result = await reactivateSystemUserAction(
        { error: null, success: null },
        buildFormData({ id: "user-1" }),
      );

      expect(result).toEqual({
        error: "Não foi possível reativar o usuário.",
        success: null,
      });
      expect(revalidatePath).not.toHaveBeenCalled();
    });
  });
});
