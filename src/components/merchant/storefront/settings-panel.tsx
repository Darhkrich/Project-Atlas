"use client";

import { AtlasField } from "@/components/atlas/field";
import { BusinessHoursEditor } from "./business-hours-editor";
import { ToggleRow } from "./toggle-row";
import {
  PAYMENT_METHODS,
  type StorefrontPaymentMethod,
} from "@/lib/merchant/storefront/payment-methods";
import type {
  BusinessHours,
  MerchantStorefrontConfig,
} from "@/types/merchant-storefront";

interface SettingsPanelProps {
  draft: MerchantStorefrontConfig;
  setField: <K extends keyof MerchantStorefrontConfig>(
    key: K,
    value: MerchantStorefrontConfig[K]
  ) => void;
  patch: (updates: Partial<MerchantStorefrontConfig>) => void;
  isDefault: (key: keyof MerchantStorefrontConfig) => boolean;
  resetToDefault: (key: keyof MerchantStorefrontConfig) => void;
  planPaymentMethods: StorefrontPaymentMethod[];
}

const inputClass =
  "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500";

const SOCIAL_KEYS: (keyof MerchantStorefrontConfig["socialLinks"])[] = [
  "facebook",
  "instagram",
  "tiktok",
  "twitter",
];

const SOCIAL_LABELS: Record<
  keyof MerchantStorefrontConfig["socialLinks"],
  string
> = {
  facebook: "Facebook",
  instagram: "Instagram",
  tiktok: "TikTok",
  twitter: "Twitter",
};

export function SettingsPanel({
  draft,
  setField,
  patch,
  isDefault,
  resetToDefault,
  planPaymentMethods,
}: SettingsPanelProps) {
  const updateSocial = (
    key: keyof MerchantStorefrontConfig["socialLinks"],
    value: string
  ) => {
    patch({
      socialLinks: { ...draft.socialLinks, [key]: value },
    });
  };

  const togglePaymentMethod = (
    id: StorefrontPaymentMethod,
    enabled: boolean
  ) => {
    const set = new Set(draft.paymentMethodIds);
    if (enabled) set.add(id);
    else set.delete(id);
    patch({ paymentMethodIds: Array.from(set) });
  };

  const availableMethods = PAYMENT_METHODS.filter((m) =>
    planPaymentMethods.includes(m.id)
  );
  const lockedMethods = PAYMENT_METHODS.filter(
    (m) => !planPaymentMethods.includes(m.id)
  );

  const codEnabled = Boolean(draft.codEnabled);
  const codMaxValue =
    typeof draft.codMaxOrderValue === "number"
      ? String(draft.codMaxOrderValue)
      : "";
  const codFeeValue =
    typeof draft.codFee === "number" ? String(draft.codFee) : "";

  const commitCodMax = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) {
      setField("codMaxOrderValue", undefined);
      return;
    }
    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed) || parsed < 0) return;
    setField("codMaxOrderValue", parsed);
  };

  const commitCodFee = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) {
      setField("codFee", undefined);
      return;
    }
    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed) || parsed < 0) return;
    setField("codFee", parsed);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          Settings
        </h2>
        <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
          Contact details, payment methods, hours, and policies.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <AtlasField
          label="Contact email"
          htmlFor="contactEmail"
          dirty={!isDefault("contactEmail")}
          onRevertToDefault={() => resetToDefault("contactEmail")}
        >
          <input
            id="contactEmail"
            type="email"
            value={draft.contactEmail}
            onChange={(e) => setField("contactEmail", e.target.value)}
            placeholder="hello@yourstore.com"
            autoComplete="email"
            className={inputClass}
          />
        </AtlasField>

        <AtlasField
          label="Contact phone"
          htmlFor="contactPhone"
          dirty={!isDefault("contactPhone")}
          onRevertToDefault={() => resetToDefault("contactPhone")}
        >
          <input
            id="contactPhone"
            type="tel"
            value={draft.contactPhone}
            onChange={(e) => setField("contactPhone", e.target.value)}
            placeholder="024 123 4567"
            autoComplete="tel"
            className={inputClass}
          />
        </AtlasField>

        <AtlasField
          label="WhatsApp number"
          htmlFor="whatsapp"
          dirty={!isDefault("whatsapp")}
          onRevertToDefault={() => resetToDefault("whatsapp")}
          hint="Customers can chat directly from your storefront."
        >
          <input
            id="whatsapp"
            type="tel"
            value={draft.whatsapp}
            onChange={(e) => setField("whatsapp", e.target.value)}
            placeholder="024 123 4567"
            autoComplete="tel"
            className={inputClass}
          />
        </AtlasField>

        <AtlasField
          label="Business address"
          htmlFor="address"
          dirty={!isDefault("address")}
          onRevertToDefault={() => resetToDefault("address")}
        >
          <input
            id="address"
            type="text"
            value={draft.address}
            onChange={(e) => setField("address", e.target.value)}
            placeholder="e.g., Osu, Accra"
            autoComplete="street-address"
            className={inputClass}
          />
        </AtlasField>
      </div>

      <div className="border-t border-neutral-200 pt-6 dark:border-neutral-800">
        <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
          Payment methods
        </p>
        <p className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
          Enable the ways customers can pay at your checkout.
        </p>
        <ul role="list" className="mt-3 space-y-2">
          {availableMethods.map((method) => {
            const enabled = draft.paymentMethodIds.includes(method.id);
            return (
              <li key={method.id}>
                <ToggleRow
                  label={method.label}
                  description={method.description}
                  checked={enabled}
                  onChange={(next) => togglePaymentMethod(method.id, next)}
                />
              </li>
            );
          })}
          {lockedMethods.map((method) => (
            <li key={method.id}>
              <div className="flex items-start justify-between gap-4 rounded-lg border border-neutral-200 bg-neutral-50 p-3 opacity-70 dark:border-neutral-800 dark:bg-neutral-950">
                <span className="min-w-0">
                  <span className="flex items-center gap-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    {method.label}
                    <span className="rounded-full bg-neutral-200 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                      Locked
                    </span>
                  </span>
                  <span className="mt-0.5 block text-[11px] text-neutral-500 dark:text-neutral-400">
                    Upgrade your plan to enable {method.label}.
                  </span>
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-3 border-t border-neutral-200 pt-6 dark:border-neutral-800">
        <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
          Cash on delivery
        </p>

        <ToggleRow
          label="Accept cash on delivery"
          description="Let customers pay when their order arrives."
          checked={codEnabled}
          onChange={(next) => setField("codEnabled", next)}
        />

        {codEnabled && (
          <div className="grid gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-950 sm:grid-cols-2">
            <div>
              <label
                htmlFor="codMax"
                className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
              >
                Max order value (GH{"\u20B5"})
              </label>
              <input
                id="codMax"
                type="number"
                min={0}
                step={1}
                defaultValue={codMaxValue}
                onBlur={(e) => commitCodMax(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.currentTarget.blur();
                }}
                placeholder="No limit"
                className={inputClass}
              />
              <p className="mt-1 text-[10px] text-neutral-500 dark:text-neutral-400">
                Orders above this value will not offer COD.
              </p>
            </div>
            <div>
              <label
                htmlFor="codFee"
                className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
              >
                COD fee (GH{"\u20B5"})
              </label>
              <input
                id="codFee"
                type="number"
                min={0}
                step={1}
                defaultValue={codFeeValue}
                onBlur={(e) => commitCodFee(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.currentTarget.blur();
                }}
                placeholder="No fee"
                className={inputClass}
              />
              <p className="mt-1 text-[10px] text-neutral-500 dark:text-neutral-400">
                Added to COD orders at checkout.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-neutral-200 pt-6 dark:border-neutral-800">
        <BusinessHoursEditor
          value={draft.businessHours}
          onChange={(next: BusinessHours) => setField("businessHours", next)}
        />
      </div>

      <div className="border-t border-neutral-200 pt-6 dark:border-neutral-800">
        <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
          Social links
        </p>
        <p className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
          Optional. Shown at the bottom of your storefront.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {SOCIAL_KEYS.map((key) => (
            <AtlasField
              key={key}
              label={SOCIAL_LABELS[key]}
              htmlFor={"social-" + key}
            >
              <input
                id={"social-" + key}
                type="url"
                value={draft.socialLinks[key]}
                onChange={(e) => updateSocial(key, e.target.value)}
                placeholder="https://"
                autoComplete="off"
                className={inputClass}
              />
            </AtlasField>
          ))}
        </div>
      </div>

      <div className="space-y-3 border-t border-neutral-200 pt-6 dark:border-neutral-800">
        <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
          Storefront toggles
        </p>

        <ToggleRow
          label="Show trust section"
          description="Display secure payments, fast delivery, and support on your storefront."
          checked={draft.showTrustSection}
          onChange={(next) => setField("showTrustSection", next)}
        />

        <ToggleRow
          label="Show featured products"
          description="Display a handpicked product row on your storefront."
          checked={draft.showFeaturedProducts}
          onChange={(next) => setField("showFeaturedProducts", next)}
        />

        <ToggleRow
          label="Show announcement bar"
          description="Display a small bar at the top with your announcement."
          checked={draft.showAnnouncement}
          onChange={(next) => setField("showAnnouncement", next)}
        />
      </div>

      {draft.showAnnouncement && (
        <AtlasField
          label="Announcement"
          htmlFor="announcement"
          dirty={!isDefault("announcement")}
          onRevertToDefault={() => resetToDefault("announcement")}
          hint="Keep it short. It appears at the top of every page."
        >
          <input
            id="announcement"
            type="text"
            value={draft.announcement}
            onChange={(e) => setField("announcement", e.target.value)}
            placeholder={"e.g., Free delivery on orders over GH\u20B5 200"}
            className={inputClass}
          />
        </AtlasField>
      )}

      <div className="border-t border-neutral-200 pt-6 dark:border-neutral-800">
        <AtlasField
          label="Returns policy"
          htmlFor="returnsPolicy"
          dirty={!isDefault("returnsPolicy")}
          onRevertToDefault={() => resetToDefault("returnsPolicy")}
          hint="Shown on your storefront and on the returns page."
        >
          <textarea
            id="returnsPolicy"
            value={draft.returnsPolicy ?? ""}
            onChange={(e) => setField("returnsPolicy", e.target.value)}
            rows={5}
            placeholder="Describe when and how customers can return an item."
            className={inputClass + " resize-none"}
          />
        </AtlasField>
      </div>
    </div>
  );
}