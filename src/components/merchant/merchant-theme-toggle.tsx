"use client";

import { AtlasIcon } from "@/components/atlas/icons";
import type { AtlasIconName } from "@/components/atlas/icons";
import { useStorefrontConfig } from "@/contexts/storefront-config-context";
import { updateTheme } from "@/lib/merchant/preferences/mutations";
import { useMerchantPreferences } from "@/lib/merchant/preferences/use-merchant-preferences";
import { THEME_LABELS } from "@/lib/merchant/preferences/labels";
import type { MerchantTheme } from "@/lib/merchant/preferences/types";

const THEME_ICONS: Record<MerchantTheme, AtlasIconName> = {
  light: "sun",
  dark: "moon",
  system: "settings",
};

function nextTheme(current: MerchantTheme): MerchantTheme {
  if (current === "light") return "dark";
  if (current === "dark") return "system";
  return "light";
}

export function MerchantThemeToggle() {
  const { storefrontConfig } = useStorefrontConfig();
  const storeSlug = storefrontConfig.slug || "my-store";
  const preferences = useMerchantPreferences(storeSlug);

  const handleClick = () => {
    updateTheme(storeSlug, nextTheme(preferences.theme));
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={
        "Theme: " + THEME_LABELS[preferences.theme] + ". Click to change."
      }
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
    >
      <AtlasIcon
        name={THEME_ICONS[preferences.theme]}
        className="h-4 w-4"
        aria-hidden="true"
      />
    </button>
  );
}