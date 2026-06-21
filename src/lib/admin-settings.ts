import { createAdminClient } from "@/lib/supabase/admin";

export type AdminSettings = {
  operationName: string;
  commercialEmail: string;
  mainLogoUrl: string;
  faviconUrl: string;
  notifyEnrollments: boolean;
  notifyLeads: boolean;
  dataSource: string;
  priorityChannel: string;
};

export const defaultAdminSettings: AdminSettings = {
  operationName: "RH Cursos",
  commercialEmail: "atendimento@rhcursos.com.br",
  mainLogoUrl: "",
  faviconUrl: "/favicon.ico",
  notifyEnrollments: true,
  notifyLeads: true,
  dataSource: "Supabase",
  priorityChannel: "Site institucional",
};

const SETTINGS_KEY = "default";
const CONFIG_BUCKET = "admin-config";
const CONFIG_FILE = "settings/default.json";

async function readAdminSettingsFromDatabase() {
  let result;

  try {
    const supabase = createAdminClient();
    result = await supabase
      .from("admin_settings")
      .select("value")
      .eq("key", SETTINGS_KEY)
      .maybeSingle<{ value: Partial<AdminSettings> }>();
  } catch {
    return null;
  }

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

  const storageSettings = await readAdminSettingsFromStorage();

  if (storageSettings) {
    return storageSettings;
  }

  return defaultAdminSettings;
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

  await writeAdminSettingsToStorage(settings);
}

async function readAdminSettingsFromStorage() {
  try {
    const supabase = createAdminClient();
    const result = await supabase.storage.from(CONFIG_BUCKET).download(CONFIG_FILE);

    if (result.error || !result.data) {
      return null;
    }

    const value = JSON.parse(await result.data.text()) as Partial<AdminSettings>;

    return {
      ...defaultAdminSettings,
      ...value,
    };
  } catch {
    return null;
  }
}

async function writeAdminSettingsToStorage(settings: AdminSettings) {
  const supabase = createAdminClient();

  await ensureConfigBucket();

  const result = await supabase.storage.from(CONFIG_BUCKET).upload(
    CONFIG_FILE,
    JSON.stringify(settings, null, 2),
    {
      cacheControl: "0",
      contentType: "application/json",
      upsert: true,
    },
  );

  if (result.error) {
    throw new Error(`Unable to save admin settings: ${result.error.message}`);
  }
}

async function ensureConfigBucket() {
  const supabase = createAdminClient();
  const bucket = await supabase.storage.getBucket(CONFIG_BUCKET);

  if (!bucket.error) {
    return;
  }

  const created = await supabase.storage.createBucket(CONFIG_BUCKET, {
    public: false,
    allowedMimeTypes: ["application/json"],
    fileSizeLimit: 64 * 1024,
  });

  if (created.error && !created.error.message.toLowerCase().includes("already exists")) {
    throw new Error(`Unable to prepare admin settings storage: ${created.error.message}`);
  }
}
