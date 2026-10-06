"use client";

import { AtlasField } from "@/components/atlas/field";
import { ToggleRow } from "./toggle-row";
import type { MerchantStorefrontConfig } from "@/types/merchant-storefront";

interface SectionsPanelProps {
  draft: MerchantStorefrontConfig;
  setField: <K extends keyof MerchantStorefrontConfig>(
    key: K,
    value: MerchantStorefrontConfig[K]
  ) => void;
  patch: (updates: Partial<MerchantStorefrontConfig>) => void;
  isDefault: (key: keyof MerchantStorefrontConfig) => boolean;
  resetToDefault: (key: keyof MerchantStorefrontConfig) => void;
}

const DEFAULT_ORDER = ["hero", "trust", "collection", "featured", "about"];

const SECTION_LABELS: Record<string, string> = {
  hero: "Hero",
  trust: "Trust strip",
  collection: "Featured collection",
  featured: "Featured products",
  about: "About",
};

const SECTION_DESCRIPTIONS: Record<string, string> = {
  hero: "Your store headline and main call to action.",
  trust: "Short commitments like fast delivery or secure payments.",
  collection: "Three featured products in a bold color band.",
  featured: "A grid of your featured products with category chips.",
  about: "Your store story, hours, and contact details.",
};

const inputClass =
  "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500";

function normalizeOrder(raw: string[] | undefined): string[] {
  const source = raw ?? DEFAULT_ORDER;
  const seen = new Set<string>();
  const result: string[] = [];
  for (const key of source) {
    if (SECTION_LABELS[key] && !seen.has(key)) {
      result.push(key);
      seen.add(key);
    }
  }
  for (const key of DEFAULT_ORDER) {
    if (!seen.has(key)) {
      result.push(key);
      seen.add(key);
    }
  }
  return result;
}

export function SectionsPanel({
  draft,
  setField,
  isDefault,
  resetToDefault,
}: SectionsPanelProps) {
  const order = normalizeOrder(draft.sectionOrder);
  const isCustom = draft.sectionOrder !== undefined;

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= order.length) return;
    const next = order.slice();
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    setField("sectionOrder", next);
  };

  const resetOrder = () => setField("sectionOrder", undefined);

  const showPromo = draft.showPromoInHero === true;
  const promoText = draft.promoText ?? "";
  const promoLink = draft.promoLink ?? "";
  const promoLinkLabel = draft.promoLinkLabel ?? "";

  const showAbout = draft.showAbout !== false;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          Sections
        </h2>
        <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
          Choose which sections appear on your storefront and in what order.
        </p>
      </div>

      <AtlasField
        label="Order"
        htmlFor="sectionOrder"
        dirty={isCustom}
        onRevertToDefault={resetOrder}
        hint="Sections render top to bottom. A section with no data is skipped."
      >
        <ul
          id="sectionOrder"
          role="list"
          className="divide-y divide-neutral-200 overflow-hidden rounded-lg border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800"
        >
          {order.map((key, index) => {
            const isFirst = index === 0;
            const isLast = index === order.length - 1;
            const label = SECTION_LABELS[key];
            const description = SECTION_DESCRIPTIONS[key];
            return (
              <li
                key={key}
                className="flex items-center justify-between gap-4 bg-white px-4 py-3 dark:bg-neutral-900"
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                    {label}
                  </p>
                  <p className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
                    {description}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={isFirst}
                    aria-label={"Move " + label + " up"}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-neutral-200 text-neutral-600 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800"
                  >
                    {"\u2191"}
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={isLast}
                    aria-label={"Move " + label + " down"}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-neutral-200 text-neutral-600 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800"
                  >
                    {"\u2193"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </AtlasField>

      <div className="space-y-3 border-t border-neutral-200 pt-6 dark:border-neutral-800">
        <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
          Promo banner
        </p>

        <ToggleRow
          label="Show promo in hero"
          description="Add a colored banner under your hero with a short message and optional link."
          checked={showPromo}
          onChange={(next) => setField("showPromoInHero", next)}
        />

        {showPromo && (
          <div className="grid gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-950">
            <AtlasField
              label="Promo text"
              htmlFor="promoText"
              dirty={!isDefault("promoText")}
              onRevertToDefault={() => resetToDefault("promoText")}
              hint={"Short. Appears in the banner, e.g. Free delivery in Accra this week."}
            >
              <input
                id="promoText"
                type="text"
                value={promoText}
                onChange={(e) => setField("promoText", e.target.value)}
                placeholder={"e.g. Free delivery in Accra this week"}
                className={inputClass}
              />
            </AtlasField>

            <AtlasField
              label="Promo link"
              htmlFor="promoLink"
              dirty={!isDefault("promoLink")}
              onRevertToDefault={() => resetToDefault("promoLink")}
              hint="Optional. Leave blank to show the text only."
            >
              <input
                id="promoLink"
                type="url"
                value={promoLink}
                onChange={(e) => setField("promoLink", e.target.value)}
                placeholder="https:// or /ecommerce-stores/your-slug/products"
                autoComplete="off"
                className={inputClass}
              />
            </AtlasField>

            <AtlasField
              label="Promo link label"
              htmlFor="promoLinkLabel"
              dirty={!isDefault("promoLinkLabel")}
              onRevertToDefault={() => resetToDefault("promoLinkLabel")}
            >
              <input
                id="promoLinkLabel"
                type="text"
                value={promoLinkLabel}
                onChange={(e) => setField("promoLinkLabel", e.target.value)}
                placeholder="Shop now"
                className={inputClass}
              />
            </AtlasField>
          </div>
        )}
      </div>

      <div className="space-y-3 border-t border-neutral-200 pt-6 dark:border-neutral-800">
        <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
          About section
        </p>

        <ToggleRow
          label="Show About section"
          description="Display your store story, opening hours, and contact details."
          checked={showAbout}
          onChange={(next) => setField("showAbout", next)}
        />

        <ToggleRow
          label="Use hero image in About"
          description="Place your hero image inside the About section."
          checked={draft.heroImageInAbout === true}
          onChange={(next) => setField("heroImageInAbout", next)}
          disabled={!showAbout}
        />
      </div>
    </div>
  );
}