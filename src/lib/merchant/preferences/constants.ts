import type { MerchantTheme } from "./types";

export const STORAGE_KEY = "atlas-merchant-preferences";

export const THEME_OPTIONS: MerchantTheme[] = ["light", "dark", "system"];

export const NOTIFICATION_KEYS = [
  "newOrder",
  "orderStatus",
  "lowStock",
  "subscription",
] as const;