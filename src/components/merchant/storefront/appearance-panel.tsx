"use client";

import { AtlasField } from "@/components/atlas/field";
import { AtlasRadioGroup } from "@/components/atlas/radio-group";
import { AtlasIcon } from "@/components/atlas/icons";
import type {
  MerchantStorefrontConfig,
  MerchantStorefrontTheme,
} from "@/types/merchant-storefront";
import {
  CORNER_RADIUS_OPTIONS,
  FONT_OPTIONS,
  GRID_DENSITY_OPTIONS,
  STOREFRONT_CORNER_RADIUS_DESCRIPTION,
  STOREFRONT_CORNER_RADIUS_LABEL,
  STOREFRONT_FONT_DESCRIPTION,
  STOREFRONT_FONT_LABEL,
  STOREFRONT_GRID_DENSITY_DESCRIPTION,
  STOREFRONT_GRID_DENSITY_LABEL,
} from "@/lib/merchant/storefront/config-labels";
import {
  themeDescription,
  themeLabel,
} from "@/lib/merchant/storefront/themes";

interface AppearancePanelProps {
  draft: MerchantStorefrontConfig;
  setField: <K extends keyof MerchantStorefrontConfig>(
    key: K,
    value: MerchantStorefrontConfig[K]
  ) => void;
  availableThemes: MerchantStorefrontTheme[];
  planName: string;
  onUpgrade: () => void;
  isDefault: (key: keyof MerchantStorefrontConfig) => boolean;
  resetToDefault: (key: keyof MerchantStorefrontConfig) => void;
}

const THEME_ORDER: MerchantStorefrontTheme[] = [
  "airy",
  "editorial",
  "studio",
  "statement",
];

const inputClass =
  "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500";

export function AppearancePanel({
  draft,
  setField,
  availableThemes,
  planName,
  onUpgrade,
  isDefault,
  resetToDefault,
}: AppearancePanelProps) {
  const themeOptions = THEME_ORDER.map((value) => {
    const allowed = availableThemes.includes(value);
    return {
      value,
      label: themeLabel(value),
      description: themeDescription(value),
      disabled: !allowed,
      badge: allowed ? undefined : "Upgrade",
    };
  });

  const lockedCount = themeOptions.filter((o) => o.disabled).length;

  const fontOptions = FONT_OPTIONS.map((value) => ({
    value,
    label: STOREFRONT_FONT_LABEL[value],
    description: STOREFRONT_FONT_DESCRIPTION[value],
  }));

  const radiusOptions = CORNER_RADIUS_OPTIONS.map((value) => ({
    value,
    label: STOREFRONT_CORNER_RADIUS_LABEL[value],
    description: STOREFRONT_CORNER_RADIUS_DESCRIPTION[value],
  }));

  const gridOptions = GRID_DENSITY_OPTIONS.map((value) => ({
    value: String(value),
    label: STOREFRONT_GRID_DENSITY_LABEL[value],
    description: STOREFRONT_GRID_DENSITY_DESCRIPTION[value],
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          Appearance
        </h2>
        <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
          Control the look of your storefront.
        </p>
      </div>

      <AtlasField
        label="Theme"
        htmlFor="theme"
        dirty={!isDefault("theme")}
        onRevertToDefault={() => resetToDefault("theme")}
        hint={
          lockedCount > 0
            ? "Your " +
              planName +
              " plan includes " +
              availableThemes.length +
              " of " +
              THEME_ORDER.length +
              " themes."
            : undefined
        }
        trailing={
          lockedCount > 0 ? (
            <button
              type="button"
              onClick={onUpgrade}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-700 hover:underline dark:text-brand-300"
            >
              <AtlasIcon name="rocket" aria-hidden="true" className="h-3 w-3" />
              Upgrade plan
            </button>
          ) : undefined
        }
      >
        <div id="theme">
          <AtlasRadioGroup
            options={themeOptions}
            value={draft.theme}
            onChange={(value) => setField("theme", value)}
            ariaLabel="Storefront theme"
            columns={2}
          />
        </div>
      </AtlasField>

      <div className="grid gap-4 sm:grid-cols-2">
        <AtlasField
          label="Primary color"
          htmlFor="primaryColor"
          dirty={!isDefault("primaryColor")}
          onRevertToDefault={() => resetToDefault("primaryColor")}
          hint="Used for buttons and links."
        >
          <div className="flex gap-2">
            <input
              type="color"
              value={draft.primaryColor}
              onChange={(e) => setField("primaryColor", e.target.value)}
              aria-label="Primary color picker"
              className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-neutral-200 bg-white p-1 dark:border-neutral-800 dark:bg-neutral-900"
            />
            <input
              id="primaryColor"
              type="text"
              value={draft.primaryColor}
              onChange={(e) => setField("primaryColor", e.target.value)}
              className={inputClass + " min-w-0 flex-1 uppercase"}
            />
          </div>
        </AtlasField>

        <AtlasField
          label="Accent color"
          htmlFor="accentColor"
          dirty={!isDefault("accentColor")}
          onRevertToDefault={() => resetToDefault("accentColor")}
          hint="Used for highlights and badges."
        >
          <div className="flex gap-2">
            <input
              type="color"
              value={draft.accentColor}
              onChange={(e) => setField("accentColor", e.target.value)}
              aria-label="Accent color picker"
              className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-neutral-200 bg-white p-1 dark:border-neutral-800 dark:bg-neutral-900"
            />
            <input
              id="accentColor"
              type="text"
              value={draft.accentColor}
              onChange={(e) => setField("accentColor", e.target.value)}
              className={inputClass + " min-w-0 flex-1 uppercase"}
            />
          </div>
        </AtlasField>
      </div>

      <div className="border-t border-neutral-200 pt-6 dark:border-neutral-800">
        <AtlasField
          label="Font"
          htmlFor="font"
          dirty={!isDefault("font")}
          onRevertToDefault={() => resetToDefault("font")}
          hint="Applies across the whole storefront."
        >
          <div id="font">
            <AtlasRadioGroup
              options={fontOptions}
              value={draft.font ?? "atlas"}
              onChange={(value) => setField("font", value)}
              ariaLabel="Storefront font"
              columns={2}
            />
          </div>
        </AtlasField>
      </div>

      <div className="border-t border-neutral-200 pt-6 dark:border-neutral-800">
        <AtlasField
          label="Corner style"
          htmlFor="cornerRadius"
          dirty={!isDefault("cornerRadius")}
          onRevertToDefault={() => resetToDefault("cornerRadius")}
          hint="Applies to cards, buttons, and inputs."
        >
          <div id="cornerRadius">
            <AtlasRadioGroup
              options={radiusOptions}
              value={draft.cornerRadius ?? "soft"}
              onChange={(value) => setField("cornerRadius", value)}
              ariaLabel="Corner style"
              columns={3}
            />
          </div>
        </AtlasField>
      </div>

      <div className="border-t border-neutral-200 pt-6 dark:border-neutral-800">
        <AtlasField
          label="Product grid density"
          htmlFor="gridDensity"
          dirty={!isDefault("gridDensity")}
          onRevertToDefault={() => resetToDefault("gridDensity")}
          hint="How many products fit per row on desktop."
        >
          <div id="gridDensity">
            <AtlasRadioGroup
              options={gridOptions}
              value={String(draft.gridDensity ?? 3)}
              onChange={(value) =>
                setField("gridDensity", Number(value) as 2 | 3 | 4)
              }
              ariaLabel="Product grid density"
              columns={3}
            />
          </div>
        </AtlasField>
      </div>

      <div className="border-t border-neutral-200 pt-6 dark:border-neutral-800">
        <label className="flex items-start justify-between gap-4 rounded-lg border border-neutral-200 p-3 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900/50">
          <span className="min-w-0">
            <span className="flex items-center gap-2 text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              Dark storefront
              <span className="rounded-full bg-neutral-200 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                Beta
              </span>
            </span>
            <span className="mt-0.5 block text-[11px] text-neutral-500 dark:text-neutral-400">
              Show your storefront with a dark background. Independent of
              your merchant dashboard theme.
            </span>
          </span>
          <span className="relative mt-0.5 inline-flex h-5 w-9 shrink-0 cursor-pointer items-center">
            <input
              type="checkbox"
              checked={Boolean(draft.darkStorefront)}
              onChange={(e) => setField("darkStorefront", e.target.checked)}
              className="peer sr-only"
              aria-label="Dark storefront"
            />
            <span className="absolute inset-0 rounded-full bg-neutral-300 transition-colors peer-checked:bg-brand-600 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500 dark:bg-neutral-700" />
            <span className="absolute left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
          </span>
        </label>
      </div>
    </div>
  );
}