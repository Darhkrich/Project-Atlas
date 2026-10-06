"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useStorefrontConfig } from "@/contexts/storefront-config-context";
import {
  updateNotificationPreferences,
  updateTheme,
} from "@/lib/merchant/preferences/mutations";
import { useMerchantPreferences } from "@/lib/merchant/preferences/use-merchant-preferences";
import { THEME_OPTIONS } from "@/lib/merchant/preferences/constants";
import {
  NOTIFICATION_LABELS,
  THEME_DESCRIPTION,
  THEME_LABELS,
} from "@/lib/merchant/preferences/labels";
import type {
  MerchantTheme,
  NotificationPreferences,
} from "@/lib/merchant/preferences/types";
import { SettingsSection } from "./settings-section";
import { SettingsToggle } from "./settings-toggle";

const NOTIFICATION_ORDER: (keyof NotificationPreferences)[] = [
  "newOrder",
  "orderStatus",
  "lowStock",
  "subscription",
];

export function SettingsPreferencesPanel() {
  const { storefrontConfig } = useStorefrontConfig();
  const storeSlug = storefrontConfig.slug || "my-store";
  const preferences = useMerchantPreferences(storeSlug);
  const [success, setSuccess] = useState<string | null>(null);

  const flash = (message: string) => {
    setSuccess(message);
    window.setTimeout(() => setSuccess(null), 3000);
  };

  const handleThemeChange = (theme: MerchantTheme) => {
    updateTheme(storeSlug, theme);
    flash("Theme updated.");
  };

  const handleNotificationToggle = (
    key: keyof NotificationPreferences,
    value: boolean
  ) => {
    updateNotificationPreferences(storeSlug, { [key]: value });
    flash("Notification preferences updated.");
  };

  return (
    <div className="space-y-6">
      <SettingsSection
        title="Appearance"
        description={THEME_DESCRIPTION}
        successMessage={success}
      >
        <div
          role="radiogroup"
          aria-label="Theme"
          className="grid gap-2 sm:grid-cols-3"
        >
          {THEME_OPTIONS.map((option) => {
            const isActive = preferences.theme === option;
            return (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => handleThemeChange(option)}
                className={cn(
                  "flex items-center justify-center rounded-lg border px-4 py-3 text-sm font-medium transition",
                  isActive
                    ? "border-brand-600 bg-brand-50 text-brand-700 dark:border-brand-500 dark:bg-brand-900/30 dark:text-brand-200"
                    : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
                )}
              >
                {THEME_LABELS[option]}
              </button>
            );
          })}
        </div>
      </SettingsSection>

      <SettingsSection
        title="Notifications"
        description="Choose which events notify you in the merchant dashboard."
      >
        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {NOTIFICATION_ORDER.map((key) => (
            <SettingsToggle
              key={key}
              label={NOTIFICATION_LABELS[key]}
              checked={preferences.notifications[key]}
              onChange={(value) => handleNotificationToggle(key, value)}
            />
          ))}
        </div>
      </SettingsSection>
    </div>
  );
}