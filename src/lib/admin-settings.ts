import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createAdminClient } from "@/lib/supabase/admin";

export type AdminSettings = {
  operationName: string;
  commercialEmail: string;
  notifyEnrollments: boolean;
  notifyLeads: boolean;
  dataSource: string;
  priorityChannel: string;
};

export const defaultAdminSettings: AdminSettings = {
  operationName: "RH Cursos",
  commercialEmail: "atendimento@rhcursos.com.br",
  notifyEnrollments: true,
  notifyLeads: true,
  dataSource: "Supabase",
  priorityChannel: "Site institucional",
};

const settingsFilePath = path.join(
  process.cwd(),
  "data",
  "admin-settings.json",
);

const SETTINGS_KEY = "default";

async function readAdminSettingsFromDatabase() {
  const supabase = createAdminClient();
  const result = await supabase
    .from("admin_settings")
    .select("value")
    .eq("key", SETTINGS_KEY)
    .maybeSingle<{ value: Partial<AdminSettings> }>();

  if (result.error || !result.data?.value) {
    return null;
  }

  return {
    ...defaultAdminSettings,
    ...result.data.value,
  };
}

export async function readAdminSettings() {
  const databaseSettings = await readAdminSettingsFromDatabase();

  if (databaseSettings) {
    return databaseSettings;
  }

  try {
    const raw = await readFile(settingsFilePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<AdminSettings>;

    return {
      ...defaultAdminSettings,
      ...parsed,
    };
  } catch {
    return defaultAdminSettings;
  }
}

export async function writeAdminSettings(settings: AdminSettings) {
  const supabase = createAdminClient();
  const databaseResult = await supabase.from("admin_settings").upsert({
    key: SETTINGS_KEY,
    value: settings,
    updated_at: new Date().toISOString(),
  });

  if (!databaseResult.error) {
    return;
  }

  await mkdir(path.dirname(settingsFilePath), { recursive: true });
  await writeFile(settingsFilePath, JSON.stringify(settings, null, 2));
}
