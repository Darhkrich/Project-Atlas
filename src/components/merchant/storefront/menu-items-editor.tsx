"use client";

import { AtlasIcon } from "@/components/atlas/icons";
import {
  MAX_MENU_ITEMS,
  MENU_HREF_MAX,
  MENU_LABEL_MAX,
} from "@/lib/merchant/storefront/menu";
import type { MenuItem } from "@/types/merchant-storefront";

const inputClass =
  "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500";

interface MenuItemsEditorProps {
  value: MenuItem[] | undefined;
  slug: string;
  onChange: (next: MenuItem[] | undefined) => void;
}

function normalizeOrder(items: MenuItem[]): MenuItem[] {
  return items.map((item, index) => ({ ...item, order: index }));
}

export function MenuItemsEditor({
  value,
  slug,
  onChange,
}: MenuItemsEditorProps) {
  const items = value ?? [];
  const atMax = items.length >= MAX_MENU_ITEMS;
  const canRemove = items.length > 1;

  function updateItem(index: number, patch: Partial<MenuItem>) {
    const next = items.slice();
    next[index] = { ...next[index], ...patch };
    onChange(normalizeOrder(next));
  }

  function removeItem(index: number) {
    if (!canRemove) return;
    const next = items.filter((_, i) => i !== index);
    onChange(normalizeOrder(next));
  }

  function addItem() {
    if (atMax) return;
    const next: MenuItem[] = [
      ...items,
      {
        label: "",
        href: "",
        order: items.length,
        visible: true,
      },
    ];
    onChange(normalizeOrder(next));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = items.slice();
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    onChange(normalizeOrder(next));
  }

  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-neutral-200 px-4 py-6 text-center text-[11px] text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
          No menu items yet. Add up to {MAX_MENU_ITEMS} links to appear in
          your storefront navigation.
        </p>
      ) : (
        <ul role="list" className="space-y-2">
          {items.map((item, index) => {
            const isFirst = index === 0;
            const isLast = index === items.length - 1;
            return (
              <li
                key={index}
                className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800"
              >
                <div className="flex items-start gap-2">
                  <div className="flex shrink-0 flex-col gap-0.5 pt-1">
                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      disabled={isFirst}
                      aria-label={"Move item " + (index + 1) + " up"}
                      className="inline-flex h-6 w-6 items-center justify-center rounded text-neutral-500 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-neutral-400 dark:hover:bg-neutral-800"
                    >
                      {"\u2191"}
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={isLast}
                      aria-label={"Move item " + (index + 1) + " down"}
                      className="inline-flex h-6 w-6 items-center justify-center rounded text-neutral-500 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-neutral-400 dark:hover:bg-neutral-800"
                    >
                      {"\u2193"}
                    </button>
                  </div>

                  <div className="min-w-0 flex-1 space-y-2">
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) =>
                        updateItem(index, {
                          label: e.target.value.slice(0, MENU_LABEL_MAX),
                        })
                      }
                      placeholder="Label"
                      maxLength={MENU_LABEL_MAX}
                      aria-label={"Item " + (index + 1) + " label"}
                      className={inputClass}
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="shrink-0 font-mono text-[10px] text-neutral-500 dark:text-neutral-400">
                          /{slug}
                        </span>
                        <input
                          type="text"
                          value={item.href}
                          onChange={(e) =>
                            updateItem(index, {
                              href: e.target.value.slice(0, MENU_HREF_MAX),
                            })
                          }
                          placeholder="/products"
                          maxLength={MENU_HREF_MAX}
                          aria-label={"Item " + (index + 1) + " link"}
                          autoComplete="off"
                          spellCheck={false}
                          className={inputClass + " font-mono text-xs"}
                        />
                      </div>
                      <p className="mt-1 text-[10px] text-neutral-500 dark:text-neutral-400">
                        Start with / for pages on your store. Full https URLs
                        open in a new tab.
                      </p>
                    </div>

                    <label className="inline-flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={item.visible}
                        onChange={(e) =>
                          updateItem(index, { visible: e.target.checked })
                        }
                        className="h-3.5 w-3.5 rounded border-neutral-300 text-brand-600 focus:ring-brand-500 dark:border-neutral-600"
                      />
                      <span className="text-[11px] font-medium text-neutral-600 dark:text-neutral-300">
                        Visible in navigation
                      </span>
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    disabled={!canRemove}
                    aria-label={"Remove item " + (index + 1)}
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-neutral-200 text-neutral-500 transition-colors hover:border-danger-500 hover:text-danger-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-800 dark:text-neutral-400 dark:hover:border-danger-500 dark:hover:text-danger-400"
                  >
                    <AtlasIcon
                      name="x-circle"
                      className="h-3.5 w-3.5"
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={addItem}
          disabled={atMax}
          className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 px-3 py-2 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          {"+ Add item"}
        </button>
        <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
          {items.length} of {MAX_MENU_ITEMS}
        </span>
      </div>
    </div>
  );
}