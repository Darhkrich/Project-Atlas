import { internalSetPreferences, getPreferencesForStore } from "./store";
import type {
  MerchantPreferences,
  MerchantTheme,
  NotificationPreferences,
} from "./types";

export function updateTheme(
  storeSlug: string,
  theme: MerchantTheme
): MerchantPreferences {
  const current = getPreferencesForStore(storeSlug);
  const next: MerchantPreferences = {
    ...current,
    theme,
    updatedAt: Date.now(),
  };
  internalSetPreferences(next);
  return next;
}

export function updateNotificationPreferences(
  storeSlug: string,
  notifications: Partial<NotificationPreferences>
): MerchantPreferences {
  const current = getPreferencesForStore(storeSlug);
  const next: MerchantPreferences = {
    ...current,
    notifications: { ...current.notifications, ...notifications },
    updatedAt: Date.now(),
  };
  internalSetPreferences(next);
  return next;
}