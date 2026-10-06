import type { MerchantTheme } from "./types";

export const THEME_LABELS: Record<MerchantTheme, string> = {
  light: "Light",
  dark: "Dark",
  system: "System",
};

export const THEME_DESCRIPTION =
  "System follows your operating system setting.";

export const NOTIFICATION_LABELS = {
  newOrder: "New order received",
  orderStatus: "Order status updates",
  lowStock: "Low stock alerts",
  subscription: "Subscription renewal reminders",
} as const;

export const NOTIFICATION_DESCRIPTION =
  "Choose which events notify you in the merchant dashboard.";