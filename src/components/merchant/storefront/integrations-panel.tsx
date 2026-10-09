"use client";

import { AtlasField } from "@/components/atlas/field";
import { AtlasIcon } from "@/components/atlas/icons";
import type { AnalyticsProviders, MerchantStorefrontConfig } from "@/types/merchant-storefront";

interface IntegrationsPanelProps {
  draft: MerchantStorefrontConfig;
  patch: (updates: Partial<MerchantStorefrontConfig>) => void;
  isDefault: (key: keyof MerchantStorefrontConfig) => boolean;
  resetToDefault: (key: keyof MerchantStorefrontConfig) => void;
}

const inputClass =
  "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500";

const TRACKER_KEYS: (keyof AnalyticsProviders)[] = [
  "ga",
  "metaPixel",
  "tiktokPixel",
];

const TRACKER_META: Record<
  keyof AnalyticsProviders,
  { label: string; description: string; placeholder: string }
> = {
  ga: {
    label: "Google Analytics",
    description: "Measurement ID from your Google Analytics property.",
    placeholder: "G-XXXXXXXXXX",
  },
  metaPixel: {
    label: "Meta Pixel",
    description: "Pixel ID from Meta Events Manager. Tracks Facebook and Instagram ad performance.",
    placeholder: "1234567890123456",
  },
  tiktokPixel: {
    label: "TikTok Pixel",
    description: "Pixel ID from TikTok Events Manager. Tracks TikTok ad performance.",
    placeholder: "CXXXXXXXXXXXXXXXXXXX",
  },
};

export function IntegrationsPanel({
  draft,
  patch,
  isDefault,
  resetToDefault,
}: IntegrationsPanelProps) {
  const providers: AnalyticsProviders = draft.analyticsProviders ?? {};

  const updateTracker = (
    key: keyof AnalyticsProviders,
    value: string
  ) => {
    const trimmed = value.trim();
    const next: AnalyticsProviders = { ...providers };
    if (trimmed.length === 0) {
      delete next[key];
    } else {
      next[key] = trimmed;
    }
    const hasAny = TRACKER_KEYS.some((k) => next[k]);
    patch({ analyticsProviders: hasAny ? next : undefined });
  };

  const activeCount = TRACKER_KEYS.filter((k) => Boolean(providers[k])).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          Integrations
        </h2>
        <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
          Connect analytics and advertising tools to measure your store.
        </p>
      </div>

      <div
        className={
          activeCount > 0
            ? "flex items-start gap-2 rounded-lg border border-success-200 bg-success-50 p-3 dark:border-success-800 dark:bg-success-900/20"
            : "flex items-start gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-950"
        }
      >
        <AtlasIcon
          name={activeCount > 0 ? "check-circle" : "info"}
          className={
            activeCount > 0
              ? "mt-0.5 h-4 w-4 shrink-0 text-success-600 dark:text-success-400"
              : "mt-0.5 h-4 w-4 shrink-0 text-neutral-500 dark:text-neutral-400"
          }
          aria-hidden="true"
        />
        <p className="text-[11px] leading-relaxed text-neutral-700 dark:text-neutral-300">
          {activeCount > 0
            ? activeCount +
              " of 3 trackers connected. Scripts load on every storefront page."
            : "No trackers connected. Add at least one ID to start measuring."}
        </p>
      </div>

      {TRACKER_KEYS.map((key) => {
        const meta = TRACKER_META[key];
        const value = providers[key] ?? "";
        return (
          <AtlasField
            key={key}
            label={meta.label}
            htmlFor={"tracker-" + key}
            dirty={!isDefault("analyticsProviders")}
            onRevertToDefault={() => resetToDefault("analyticsProviders")}
            hint={meta.description}
          >
            <input
              id={"tracker-" + key}
              type="text"
              value={value}
              onChange={(e) => updateTracker(key, e.target.value)}
              placeholder={meta.placeholder}
              autoComplete="off"
              spellCheck={false}
              className={inputClass + " font-mono text-xs"}
            />
          </AtlasField>
        );
      })}

      <div className="border-t border-neutral-200 pt-6 dark:border-neutral-800">
        <p className="text-[11px] leading-relaxed text-neutral-500 dark:text-neutral-400">
          IDs are stored on your storefront config and loaded as scripts when
          a customer visits your store. Atlas does not pass order or customer
          data to these services.
        </p>
      </div>
    </div>
  );
}