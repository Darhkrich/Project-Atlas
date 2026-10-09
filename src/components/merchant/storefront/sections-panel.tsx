"use client";

import { AtlasField } from "@/components/atlas/field";
import { ToggleRow } from "./toggle-row";
import { TrustItemsEditor } from "./trust-items-editor";
import { MenuItemsEditor } from "./menu-items-editor";
import { menuForEditor } from "@/lib/merchant/storefront/menu";
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

  const showAbout = draft.showAbout !== false;
  const showTrust = draft.showTrustSection !== false;

  const hasCustomMenu = draft.menuItems !== undefined;
  const editorMenu = menuForEditor(draft.menuItems);

  function handleMenuChange(next: typeof draft.menuItems) {
    setField("menuItems", next);
  }

  function resetMenu() {
    setField("menuItems", undefined);
  }

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
                className="flex items-center justify-between gap-3 bg-white px-3 py-3 dark:bg-neutral-900 sm:gap-4 sm:px-4"
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                    {label}
                  </p>
                  <p className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
                    {description}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5 sm:gap-1">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={isFirst}
                    aria-label={"Move " + label + " up"}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-neutral-200 text-neutral-600 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800 sm:h-8 sm:w-8"
                  >
                    {"\u2191"}
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={isLast}
                    aria-label={"Move " + label + " down"}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-neutral-200 text-neutral-600 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800 sm:h-8 sm:w-8"
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
          Trust strip
        </p>

        <ToggleRow
          label="Show trust section"
          description="Display short commitments like secure payments, fast delivery, or support."
          checked={showTrust}
          onChange={(next) => setField("showTrustSection", next)}
        />

        {showTrust && (
          <AtlasField
            label="Trust items"
            htmlFor="trustItems"
            dirty={!isDefault("trustItems")}
            onRevertToDefault={() => resetToDefault("trustItems")}
            hint="Each item has an icon and a short label. Up to 6."
          >
            <div id="trustItems">
              <TrustItemsEditor
                value={draft.trustItems}
                onChange={(next) => setField("trustItems", next)}
              />
            </div>
          </AtlasField>
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

      <div className="space-y-3 border-t border-neutral-200 pt-6 dark:border-neutral-800">
        <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
          Navigation menu
        </p>
        <p className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
          Links that appear in your storefront header. Defaults to Home,
          Products, About, Contact.
        </p>

        <AtlasField
          label="Menu items"
          htmlFor="menuItems"
          dirty={hasCustomMenu}
          onRevertToDefault={resetMenu}
          hint="Up to 6 items. Use the arrows to reorder."
        >
          <div id="menuItems">
            <MenuItemsEditor
              value={editorMenu}
              slug={draft.slug}
              onChange={handleMenuChange}
            />
          </div>
        </AtlasField>
      </div>
    </div>
  );
}