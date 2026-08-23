/* eslint-disable @next/next/no-img-element */
"use client";

import type { Dispatch, SetStateAction } from "react";
type ResellerStorefront = {
  name: string;
  logoUrl?: string | null;
  brandColor: string;
  accentColor: string;
};

type StorefrontAppearanceProps = {
  storefront: ResellerStorefront;
  setStorefront: Dispatch<SetStateAction<ResellerStorefront>>;
};

const presetColors = [
  "#1B4332",
  "#14532D",
  "#075985",
  "#7C2D12",
  "#6B21A8",
  "#9A3412",
];

export function StorefrontAppearance({
  storefront,
  setStorefront,
}: StorefrontAppearanceProps) {
  return (
    <section>
      <div className="mb-4">
        <h2 className="text-base font-semibold text-neutral-950 dark:text-white">
          Appearance
        </h2>

        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Give your storefront a simple identity that customers can recognize.
        </p>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950 sm:p-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Logo */}
          <div>
            <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
              Store Logo
            </p>

            <div className="mt-3 flex items-center gap-4">
              <div
                className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl text-white"
                style={{
                  backgroundColor: storefront.brandColor,
                }}
              >
                {storefront.logoUrl ? (
                  <img
                    src={storefront.logoUrl}
                    alt={`${storefront.name} logo`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-xl font-bold">
                    {storefront.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <div>
                <button
                  type="button"
                  className="rounded-lg border border-neutral-200 px-3 py-2 text-sm font-semibold text-neutral-800 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-900"
                >
                  Change Logo
                </button>

                <p className="mt-1.5 text-xs text-neutral-400">
                  PNG or JPG. Recommended square image.
                </p>
              </div>
            </div>
          </div>

          {/* Brand color */}
          <div>
            <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
              Brand Color
            </p>

            <div className="mt-3 flex flex-wrap gap-2.5">
              {presetColors.map((color) => {
                const selected =
                  storefront.brandColor.toLowerCase() ===
                  color.toLowerCase();

                return (
                  <button
                    key={color}
                    type="button"
                    aria-label={`Use ${color} as brand color`}
                    onClick={() =>
                      setStorefront((current: ResellerStorefront) => ({
                        ...current,
                        brandColor: color,
                      }))
                    }
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-transform hover:scale-105 ${
                      selected
                        ? "border-neutral-950 dark:border-white"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                  >
                    {selected && (
                      <span className="h-2.5 w-2.5 rounded-full bg-white shadow-sm" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex items-center gap-3">
              <input
                type="color"
                value={storefront.brandColor}
                onChange={(event) =>
                  setStorefront((current: ResellerStorefront) => ({
                    ...current,
                    brandColor: event.target.value,
                  }))
                }
                className="h-10 w-12 cursor-pointer rounded-lg border border-neutral-200 bg-white p-1 dark:border-neutral-800 dark:bg-neutral-900"
                aria-label="Custom brand color"
              />

              <input
                value={storefront.brandColor}
                onChange={(event) =>
                  setStorefront((current: ResellerStorefront) => ({
                    ...current,
                    brandColor: event.target.value,
                  }))
                }
                className="w-32 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm uppercase text-neutral-900 outline-none focus:border-brand-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                aria-label="Brand color hex value"
              />
            </div>
          </div>

          {/* Accent color */}
          <div className="md:col-span-2">
            <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
              Accent Color
            </p>

            <div className="mt-3 flex items-center gap-3">
              <input
                type="color"
                value={storefront.accentColor}
                onChange={(event) =>
                  setStorefront((current: ResellerStorefront) => ({
                    ...current,
                    accentColor: event.target.value,
                  }))
                }
                className="h-10 w-12 cursor-pointer rounded-lg border border-neutral-200 bg-white p-1 dark:border-neutral-800 dark:bg-neutral-900"
                aria-label="Accent color"
              />

              <input
                value={storefront.accentColor}
                onChange={(event) =>
                  setStorefront((current: ResellerStorefront) => ({
                    ...current,
                    accentColor: event.target.value,
                  }))
                }
                className="w-32 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm uppercase text-neutral-900 outline-none focus:border-brand-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                aria-label="Accent color hex value"
              />

              <span
                className="h-8 w-8 rounded-full border border-black/5"
                style={{
                  backgroundColor: storefront.accentColor,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}