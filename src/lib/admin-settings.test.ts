import { beforeEach, expect, it, vi } from "vitest";

import {
  readAdminSettings,
  writeAdminSettings,
} from "@/lib/admin-settings";

const { createAdminClient } = vi.hoisted(() => ({
  createAdminClient: vi.fn(),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

it("falls back to storage when admin_settings table is not available", async () => {
  const download = vi.fn().mockResolvedValue({
    error: null,
    data: new Blob([
      JSON.stringify({
        operationName: "Academia RH",
        mainLogoUrl: "https://cdn.example.com/logo.svg",
        faviconUrl: "https://cdn.example.com/favicon.png",
      }),
    ]),
  });

  createAdminClient.mockReturnValue({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValue({
            error: { message: "table not found" },
            data: null,
          }),
        })),
      })),
    })),
    storage: {
      from: vi.fn(() => ({ download })),
    },
  });

  await expect(readAdminSettings()).resolves.toEqual(
    expect.objectContaining({
      operationName: "Academia RH",
      mainLogoUrl: "https://cdn.example.com/logo.svg",
      faviconUrl: "https://cdn.example.com/favicon.png",
      commercialEmail: "atendimento@rhcursos.com.br",
    }),
  );
});

it("writes admin settings to storage when database upsert fails", async () => {
  const upload = vi.fn().mockResolvedValue({ error: null });
  const getBucket = vi.fn().mockResolvedValue({ error: null });

  createAdminClient.mockReturnValue({
    from: vi.fn(() => ({
      upsert: vi.fn().mockResolvedValue({
        error: { message: "table not found" },
      }),
    })),
    storage: {
      getBucket,
      from: vi.fn(() => ({ upload })),
    },
  });

  await writeAdminSettings({
    operationName: "Academia RH",
    commercialEmail: "contato@example.com",
    mainLogoUrl: "https://cdn.example.com/logo.svg",
    faviconUrl: "https://cdn.example.com/favicon.png",
    notifyEnrollments: true,
    notifyLeads: false,
    dataSource: "Supabase",
    priorityChannel: "WhatsApp",
  });

  expect(getBucket).toHaveBeenCalledWith("admin-config");
  expect(upload).toHaveBeenCalledWith(
    "settings/default.json",
    expect.stringContaining('"operationName": "Academia RH"'),
    expect.objectContaining({
      contentType: "application/json",
      upsert: true,
    }),
  );
});
