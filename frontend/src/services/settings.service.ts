import { api } from "@/lib/api";

export type FrontSettings = {
  autoConfirm: boolean;
  allowSignups: boolean;
  maintenance: boolean;
  twoFactor: boolean;
};

const toBool = (raw: string | undefined, def: boolean): boolean => {
  if (raw === undefined || raw === null) return def;
  const v = raw.toLowerCase();
  if (v === "true" || v === "1" || v === "yes" || v === "on") return true;
  if (v === "false" || v === "0" || v === "no" || v === "off") return false;
  return def;
};

const DEFAULTS: FrontSettings = {
  autoConfirm: false,
  allowSignups: true,
  maintenance: false,
  twoFactor: true,
};

export async function getSettings(): Promise<FrontSettings> {
  try {
    const { data } = await api.get<Record<string, string>>("/admin/settings");
    return {
      autoConfirm: toBool(data.autoConfirm, DEFAULTS.autoConfirm),
      allowSignups: toBool(data.allowSignups, DEFAULTS.allowSignups),
      maintenance: toBool(data.maintenance, DEFAULTS.maintenance),
      twoFactor: toBool(data.twoFactor, DEFAULTS.twoFactor),
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export async function saveSettings(settings: FrontSettings): Promise<FrontSettings> {
  const values: Record<string, string> = {
    autoConfirm: String(settings.autoConfirm),
    allowSignups: String(settings.allowSignups),
    maintenance: String(settings.maintenance),
    twoFactor: String(settings.twoFactor),
  };
  const { data } = await api.put<Record<string, string>>("/admin/settings", { values });
  return {
    autoConfirm: toBool(data.autoConfirm, DEFAULTS.autoConfirm),
    allowSignups: toBool(data.allowSignups, DEFAULTS.allowSignups),
    maintenance: toBool(data.maintenance, DEFAULTS.maintenance),
    twoFactor: toBool(data.twoFactor, DEFAULTS.twoFactor),
  };
}
