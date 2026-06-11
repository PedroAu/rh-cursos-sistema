import { company } from "@/lib/company";

export type AdminUser = {
  name: string;
  email: string;
  role: string;
  active: boolean;
};

export type AdminSettings = {
  identity: {
    siteName: string;
    tagline: string;
    contactEmail: string;
    logo: string | null;
    favicon: string | null;
  };
  notifications: {
    newEnrollments: boolean;
    confirmedPayments: boolean;
    monthlyReports: boolean;
  };
  admins: AdminUser[];
};

const STORAGE_KEY = "rhc:admin-settings";

export function getDefaultAdminSettings(): AdminSettings {
  return {
    identity: {
      siteName: company.brandName,
      tagline: "Soluções em treinamento para o setor público e privado.",
      contactEmail: company.email,
      logo: company.logo.src,
      favicon: null,
    },
    notifications: {
      newEnrollments: true,
      confirmedPayments: true,
      monthlyReports: false,
    },
    admins: [
      { name: "Ricardo Oliveira", email: "ricardo.adm@rhcursos.com.br", role: "Super Admin", active: true },
      { name: "Fernanda Souza", email: "fernanda.vendas@rhcursos.com.br", role: "Vendas/Editor", active: true },
      { name: "Lucas Mendes", email: "lucas.suporte@rhcursos.com.br", role: "Suporte", active: false },
    ],
  };
}

/**
 * Lê as configurações persistidas no localStorage, mesclando com os defaults
 * para tolerar versões antigas/parciais. Seguro para SSR (retorna defaults).
 */
export function loadAdminSettings(): AdminSettings {
  const defaults = getDefaultAdminSettings();
  if (typeof window === "undefined") return defaults;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<AdminSettings>;
    return {
      identity: { ...defaults.identity, ...parsed.identity },
      notifications: { ...defaults.notifications, ...parsed.notifications },
      admins: Array.isArray(parsed.admins) && parsed.admins.length > 0 ? parsed.admins : defaults.admins,
    };
  } catch {
    return defaults;
  }
}

export function saveAdminSettings(settings: AdminSettings): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Ignora cota cheia / modo privado — persistência é best-effort no mock atual.
  }
}
