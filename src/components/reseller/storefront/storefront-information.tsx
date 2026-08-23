"use client";

import type { Dispatch, SetStateAction } from "react";
type ResellerStorefront = {
  name: string;
  slug: string;
  description: string;
};

type StorefrontInformationProps = {
  storefront: ResellerStorefront;
  setStorefront: Dispatch<SetStateAction<ResellerStorefront>>;
};

export function StorefrontInformation({
  storefront,
  setStorefront,
}: StorefrontInformationProps) {
  return (
    <section>
      <div className="mb-4">
        <h2 className="text-base font-semibold text-neutral-950 dark:text-white">
          Store Information
        </h2>

        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Tell customers what your storefront offers.
        </p>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950 sm:p-6">
        <div className="grid gap-5">
          {/* Store name */}
          <div>
            <label
              htmlFor="store-name"
              className="mb-2 block text-sm font-medium text-neutral-800 dark:text-neutral-200"
            >
              Store Name
            </label>

            <input
              id="store-name"
              value={storefront.name}
              onChange={(event) =>
                setStorefront((current: ResellerStorefront) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
              placeholder="Enter your store name"
            />
          </div>

          {/* Store URL */}
          <div>
            <label
              htmlFor="store-url"
              className="mb-2 block text-sm font-medium text-neutral-800 dark:text-neutral-200"
            >
              Store Link
            </label>

            <div className="flex overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800">
              <span className="flex items-center bg-neutral-50 px-3 text-xs text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">
                atlas.com/store/
              </span>

              <input
                id="store-url"
                value={storefront.slug}
                onChange={(event) =>
                  setStorefront((current: ResellerStorefront) => ({
                    ...current,
                    slug: event.target.value
                      .toLowerCase()
                      .replace(/\s+/g, "-"),
                  }))
                }
                className="min-w-0 flex-1 bg-white px-3 py-3 text-sm text-neutral-900 outline-none dark:bg-neutral-950 dark:text-white"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="store-description"
                className="block text-sm font-medium text-neutral-800 dark:text-neutral-200"
              >
                Store Description
              </label>

              <span className="text-xs text-neutral-400">
                {storefront.description.length}/160
              </span>
            </div>

            <textarea
              id="store-description"
              value={storefront.description}
              maxLength={160}
              rows={4}
              onChange={(event) =>
                setStorefront((current: ResellerStorefront) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              className="w-full resize-none rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm leading-relaxed text-neutral-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
              placeholder="Describe your store..."
            />
          </div>
        </div>
      </div>
    </section>
  );
}