import { getAllFromStore, putToStore, storeNames } from "./db";

export type AppSettings = {
  shareGuardEnabled: boolean;
  defaultShareMode: string;
  preferOriginalImage: boolean;
  fallbackBadgeEnabled: boolean;
};

export const defaultSettings: AppSettings = {
  shareGuardEnabled: true,
  defaultShareMode: "原图",
  preferOriginalImage: true,
  fallbackBadgeEnabled: false,
};

type StoredSettings = AppSettings & { id: "app-settings" };

export async function loadSettings(): Promise<AppSettings> {
  const records = await getAllFromStore<StoredSettings>(storeNames.settings);
  const stored = records.find((item) => item.id === "app-settings");
  if (!stored) {
    return defaultSettings;
  }

  return {
    ...defaultSettings,
    ...stored,
  };
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await putToStore<StoredSettings>(storeNames.settings, {
    id: "app-settings",
    ...settings,
  });
}
