"use client";

import { useMemo, useState } from "react";
import {
  AtlasCard,
} from "@/components/atlas/card";
import {
  AtlasIcon,
  AtlasIconName,
} from "@/components/atlas/icons";
import {
  StorefrontPreview,
} from "@/components/reseller/storefront/storefront-preview";
import {
  defaultStorefront,
  normalizeStorefront,
  type StorefrontConfig,
  type StorefrontTheme,
} from "@/lib/reseller-storefront";

/* -------------------------------------------------------------------------- */
/* Props                                                                      */
/* -------------------------------------------------------------------------- */

type ResellerStorefrontProps = {
  initialStore?: Partial<StorefrontConfig> | null;
};

/* -------------------------------------------------------------------------- */
/* Theme Options                                                              */
/* -------------------------------------------------------------------------- */

const themes: {
  id: StorefrontTheme;
  label: string;
  description: string;
}[] = [
  {
    id: "modern",
    label: "Modern",
    description:
      "Bold, polished and conversion-focused.",
  },
  {
    id: "classic",
    label: "Classic",
    description:
      "Professional and business-focused.",
  },
  {
    id: "minimal",
    label: "Minimal",
    description:
      "Simple, clean and product-focused.",
  },
];

/* -------------------------------------------------------------------------- */
/* Main Component                                                             */
/* -------------------------------------------------------------------------- */

export function ResellerStorefront({
  initialStore,
}: ResellerStorefrontProps) {
  const [store, setStore] =
    useState<StorefrontConfig>(() =>
      normalizeStorefront(
        initialStore || defaultStorefront,
      ),
    );

  const [previewMode, setPreviewMode] =
    useState<"desktop" | "mobile">(
      "desktop",
    );

  const [activeTab, setActiveTab] =
    useState<
      "branding" | "appearance" | "services"
    >("branding");

  const [saved, setSaved] =
    useState(false);

  const updateStore = (
    updates: Partial<StorefrontConfig>,
  ) => {
    setSaved(false);

    setStore((current) =>
      normalizeStorefront({
        ...current,
        ...updates,
      }),
    );
  };

  const updateTheme = (
    theme: StorefrontTheme,
  ) => {
    updateStore({
      theme,
    });
  };

  const enabledServiceCount =
    store.services.filter(
      (service) => service.enabled,
    ).length;

  const previewStore = useMemo(
    () => normalizeStorefront(store),
    [store],
  );

  const handleSave = () => {
    /*
     * Temporary local save.
     *
     * Replace this with the real API request when
     * the storefront backend endpoint is connected.
     */
    setStore(
      normalizeStorefront(store),
    );

    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------------ */}
      {/* Page Header                                                        */}
      {/* ------------------------------------------------------------------ */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-brand-700 dark:text-brand-300">
            My Storefront
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-950 dark:text-white sm:text-3xl">
            Build your storefront
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
            Customize your brand, appearance and services, then preview exactly
            how your customers will experience your store.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <AtlasIcon
              name="check"
              className="h-4 w-4"
            />

            {saved
              ? "Saved"
              : "Save Changes"}
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Store Status                                                        */}
      {/* ------------------------------------------------------------------ */}

      <AtlasCard className="overflow-hidden border-brand-100 dark:border-brand-900/40">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-800 dark:bg-brand-900/30 dark:text-brand-300">
              <AtlasIcon
                name="store"
                className="h-5 w-5"
              />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-neutral-950 dark:text-white">
                  {store.storeName}
                </p>

                <span className="rounded-full bg-success-50 px-2 py-0.5 text-[11px] font-semibold text-success-700 dark:bg-success-900/30 dark:text-success-300">
                  Ready
                </span>
              </div>

              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                {store.customDomain ||
                  `atlas.store/${store.storefrontSlug}`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
            <span>
              {enabledServiceCount} services enabled
            </span>

            <span className="hidden h-1 w-1 rounded-full bg-neutral-300 sm:block" />

            <span>
              Theme:{" "}
              <span className="font-semibold capitalize text-neutral-800 dark:text-neutral-200">
                {store.theme}
              </span>
            </span>
          </div>
        </div>
      </AtlasCard>

      {/* ------------------------------------------------------------------ */}
      {/* Editor + Preview                                                    */}
      {/* ------------------------------------------------------------------ */}

      <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        {/* ---------------------------------------------------------------- */}
        {/* Configuration Panel                                              */}
        {/* ---------------------------------------------------------------- */}

        <AtlasCard
          padding="none"
          className="overflow-hidden"
        >
          {/* Tabs */}
          <div className="grid grid-cols-3 border-b border-neutral-200 dark:border-neutral-800">
            {[
              {
                id: "branding" as const,
                label: "Branding",
              },
              {
                id: "appearance" as const,
                label: "Appearance",
              },
              {
                id: "services" as const,
                label: "Services",
              },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() =>
                  setActiveTab(tab.id)
                }
                className={`border-b-2 px-3 py-3 text-xs font-semibold transition-colors ${
                  activeTab === tab.id
                    ? "border-brand-700 text-brand-800 dark:border-brand-400 dark:text-brand-300"
                    : "border-transparent text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-5">
            {/* ------------------------------------------------------------ */}
            {/* Branding                                                       */}
            {/* ------------------------------------------------------------ */}

            {activeTab === "branding" && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-sm font-semibold text-neutral-950 dark:text-white">
                    Brand identity
                  </h2>

                  <p className="mt-1 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                    These details appear throughout your customer-facing
                    storefront.
                  </p>
                </div>

                {/* Store Name */}
                <label className="block">
                  <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Store Name
                  </span>

                  <input
                    value={store.storeName}
                    onChange={(event) =>
                      updateStore({
                        storeName:
                          event.target.value,
                      })
                    }
                    placeholder="Your store name"
                    className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                  />
                </label>

                {/* Tagline */}
                <label className="block">
                  <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Tagline
                  </span>

                  <input
                    value={store.tagline}
                    onChange={(event) =>
                      updateStore({
                        tagline:
                          event.target.value,
                      })
                    }
                    placeholder="Fast. Reliable. Always Connected."
                    className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                  />
                </label>

                {/* Logo */}
                <label className="block">
                  <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Logo URL
                  </span>

                  <input
                    value={store.logo}
                    onChange={(event) =>
                      updateStore({
                        logo:
                          event.target.value,
                      })
                    }
                    placeholder="https://..."
                    className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                  />

                  <p className="mt-1.5 text-[11px] leading-relaxed text-neutral-500 dark:text-neutral-400">
                    Leave empty to automatically generate a logo from your
                    store name.
                  </p>
                </label>

                {/* Hero title */}
                <label className="block">
                  <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Hero Title
                  </span>

                  <textarea
                    value={store.heroTitle}
                    onChange={(event) =>
                      updateStore({
                        heroTitle:
                          event.target.value,
                      })
                    }
                    rows={3}
                    className="mt-1.5 w-full resize-none rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                  />
                </label>

                {/* Hero description */}
                <label className="block">
                  <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Hero Description
                  </span>

                  <textarea
                    value={store.heroDescription}
                    onChange={(event) =>
                      updateStore({
                        heroDescription:
                          event.target.value,
                      })
                    }
                    rows={4}
                    className="mt-1.5 w-full resize-none rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                  />
                </label>
              </div>
            )}

            {/* ------------------------------------------------------------ */}
            {/* Appearance                                                     */}
            {/* ------------------------------------------------------------ */}

            {activeTab === "appearance" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-sm font-semibold text-neutral-950 dark:text-white">
                    Store appearance
                  </h2>

                  <p className="mt-1 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                    Choose a storefront style and customize your brand colors.
                  </p>
                </div>

                {/* Themes */}
                <div>
                  <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Theme
                  </p>

                  <div className="mt-3 space-y-2">
                    {themes.map((item) => {
                      const selected =
                        store.theme ===
                        item.id;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() =>
                            updateTheme(
                              item.id,
                            )
                          }
                          className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition ${
                            selected
                              ? "border-brand-600 bg-brand-50/50 dark:border-brand-500 dark:bg-brand-950/20"
                              : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-800 dark:hover:border-neutral-700"
                          }`}
                        >
                          <div
                            className={`mt-0.5 flex h-4 w-4 items-center justify-center rounded-full border ${
                              selected
                                ? "border-brand-700"
                                : "border-neutral-300 dark:border-neutral-700"
                            }`}
                          >
                            {selected && (
                              <span className="h-2 w-2 rounded-full bg-brand-700" />
                            )}
                          </div>

                          <div>
                            <p className="text-xs font-semibold text-neutral-900 dark:text-white">
                              {item.label}
                            </p>

                            <p className="mt-0.5 text-[10px] leading-relaxed text-neutral-500 dark:text-neutral-400">
                              {item.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Primary Color */}
                <label className="block">
                  <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Primary Color
                  </span>

                  <div className="mt-2 flex gap-2">
                    <input
                      type="color"
                      value={
                        store.primaryColor
                      }
                      onChange={(event) =>
                        updateStore({
                          primaryColor:
                            event.target
                              .value,
                        })
                      }
                      className="h-10 w-12 cursor-pointer rounded-lg border border-neutral-200 bg-white p-1 dark:border-neutral-800 dark:bg-neutral-900"
                    />

                    <input
                      value={
                        store.primaryColor
                      }
                      onChange={(event) =>
                        updateStore({
                          primaryColor:
                            event.target
                              .value,
                        })
                      }
                      className="min-w-0 flex-1 rounded-lg border border-neutral-200 bg-white px-3 text-sm uppercase text-neutral-900 outline-none focus:border-brand-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                    />
                  </div>
                </label>

                {/* Secondary Color */}
                <label className="block">
                  <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Secondary Color
                  </span>

                  <div className="mt-2 flex gap-2">
                    <input
                      type="color"
                      value={
                        store.secondaryColor
                      }
                      onChange={(event) =>
                        updateStore({
                          secondaryColor:
                            event.target
                              .value,
                        })
                      }
                      className="h-10 w-12 cursor-pointer rounded-lg border border-neutral-200 bg-white p-1 dark:border-neutral-800 dark:bg-neutral-900"
                    />

                    <input
                      value={
                        store.secondaryColor
                      }
                      onChange={(event) =>
                        updateStore({
                          secondaryColor:
                            event.target
                              .value,
                        })
                      }
                      className="min-w-0 flex-1 rounded-lg border border-neutral-200 bg-white px-3 text-sm uppercase text-neutral-900 outline-none focus:border-brand-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                    />
                  </div>
                </label>

                {/* Domain */}
                <label className="block">
                  <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Custom Domain
                  </span>

                  <input
                    value={
                      store.customDomain
                    }
                    onChange={(event) =>
                      updateStore({
                        customDomain:
                          event.target
                            .value,
                      })
                    }
                    placeholder="www.yourstore.com"
                    className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                  />
                </label>
              </div>
            )}

            {/* ------------------------------------------------------------ */}
            {/* Services                                                       */}
            {/* ------------------------------------------------------------ */}

            {activeTab === "services" && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-sm font-semibold text-neutral-950 dark:text-white">
                    Store services
                  </h2>

                  <p className="mt-1 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                    Choose which services customers can purchase from your
                    storefront.
                  </p>
                </div>

                <div className="space-y-2">
                  {store.services.map(
                    (service) => (
                      <label
                        key={service.id}
                        className="flex cursor-pointer items-center justify-between rounded-xl border border-neutral-200 p-3 transition hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                            <AtlasIcon
                              name={
                                service.icon as AtlasIconName
                              }
                              className="h-4 w-4 text-neutral-700 dark:text-neutral-300"
                            />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-neutral-900 dark:text-white">
                              {service.name}
                            </p>

                            <p className="truncate text-[10px] text-neutral-500 dark:text-neutral-400">
                              {service.description}
                            </p>
                          </div>
                        </div>

                        <input
                          type="checkbox"
                          checked={
                            service.enabled
                          }
                          onChange={(event) => {
                            const enabled =
                              event.target
                                .checked;

                            updateStore({
                              services:
                                store.services.map(
                                  (
                                    item,
                                  ) =>
                                    item.id ===
                                    service.id
                                      ? {
                                          ...item,
                                          enabled,
                                        }
                                      : item,
                                ),
                            });
                          }}
                          className="h-4 w-4 rounded border-neutral-300 text-brand-700 focus:ring-brand-500"
                        />
                      </label>
                    ),
                  )}
                </div>
              </div>
            )}
          </div>
        </AtlasCard>

        {/* ---------------------------------------------------------------- */}
        {/* Preview                                                           */}
        {/* ---------------------------------------------------------------- */}

        <AtlasCard
          padding="none"
          className="overflow-hidden"
        >
          <div className="flex flex-col gap-3 border-b border-neutral-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-neutral-800">
            <div>
              <h2 className="text-sm font-semibold text-neutral-950 dark:text-white">
                Storefront Preview
              </h2>

              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                This is how your storefront will appear to customers.
              </p>
            </div>

            <div className="flex rounded-lg bg-neutral-100 p-1 dark:bg-neutral-900">
              <button
                type="button"
                onClick={() =>
                  setPreviewMode(
                    "desktop",
                  )
                }
                className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                  previewMode ===
                  "desktop"
                    ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-800 dark:text-white"
                    : "text-neutral-500"
                }`}
              >
                Desktop
              </button>

              <button
                type="button"
                onClick={() =>
                  setPreviewMode(
                    "mobile",
                  )
                }
                className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                  previewMode ===
                  "mobile"
                    ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-800 dark:text-white"
                    : "text-neutral-500"
                }`}
              >
                Mobile
              </button>
            </div>
          </div>

          <div className="min-h-[700px] bg-neutral-100 p-4 dark:bg-neutral-950 sm:p-6">
            <StorefrontPreview
              store={previewStore}
              mode={previewMode}
              theme={previewStore.theme}
            />
          </div>
        </AtlasCard>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Storefront Information                                              */}
      {/* ------------------------------------------------------------------ */}

      <AtlasCard>
        <div className="grid gap-5 lg:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Storefront link
            </p>

            <p className="mt-2 break-all text-sm font-semibold text-neutral-900 dark:text-white">
              {store.customDomain ||
                `atlas.store/store/${store.storefrontSlug}`}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Active services
            </p>

            <p className="mt-2 text-sm font-semibold text-neutral-900 dark:text-white">
              {enabledServiceCount} services
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Store theme
            </p>

            <p className="mt-2 text-sm font-semibold capitalize text-neutral-900 dark:text-white">
              {store.theme}
            </p>
          </div>
        </div>
      </AtlasCard>
    </div>
  );
}