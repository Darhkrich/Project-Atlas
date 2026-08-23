/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useMemo } from "react";
import {
  defaultStorefront,
  normalizeStorefront,
  type StorefrontConfig,
  type StorefrontService,
  type StorefrontTheme,
} from "@/lib/reseller-storefront";
import {
  AtlasIcon,
  type AtlasIconName,
} from "@/components/atlas/icons";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type PreviewMode = "desktop" | "mobile";

type StorefrontPreviewProps = {
  store?: Partial<StorefrontConfig> | null;
  mode?: PreviewMode;
  theme?: StorefrontTheme;
};

/* -------------------------------------------------------------------------- */
/* Utility Helpers                                                            */
/* -------------------------------------------------------------------------- */

function getInitials(
  storeName: string,
): string {
  const safeName = storeName.trim();

  if (!safeName) {
    return "A";
  }

  const words = safeName
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }

  return (
    words[0].charAt(0) +
    words[1].charAt(0)
  ).toUpperCase();
}

function hexToRgba(
  hex: string,
  alpha: number,
): string {
  const normalized = hex.replace("#", "");

  if (normalized.length !== 6) {
    return `rgba(6, 78, 59, ${alpha})`;
  }

  const r = parseInt(
    normalized.slice(0, 2),
    16,
  );

  const g = parseInt(
    normalized.slice(2, 4),
    16,
  );

  const b = parseInt(
    normalized.slice(4, 6),
    16,
  );

  if (
    Number.isNaN(r) ||
    Number.isNaN(g) ||
    Number.isNaN(b)
  ) {
    return `rgba(6, 78, 59, ${alpha})`;
  }

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/* -------------------------------------------------------------------------- */
/* Logo                                                                       */
/* -------------------------------------------------------------------------- */

function Logo({
  store,
  compact = false,
}: {
  store: StorefrontConfig;
  compact?: boolean;
}) {
  const storeName =
    store.storeName?.trim() || "Atlas Store";

  const logo =
    store.logo?.trim() || "";

  const initials =
    getInitials(storeName);

  if (logo) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white ${
          compact
            ? "h-8 w-8"
            : "h-10 w-10"
        }`}
      >
        <img
          src={logo}
          alt={`${storeName} logo`}
          className="h-full w-full object-contain"
        />
      </div>
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-xl font-bold text-white ${
        compact
          ? "h-8 w-8 text-xs"
          : "h-10 w-10 text-sm"
      }`}
      style={{
        backgroundColor:
          store.primaryColor ||
          defaultStorefront.primaryColor,
      }}
      aria-label={`${storeName} logo`}
    >
      {initials}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Service Icon                                                               */
/* -------------------------------------------------------------------------- */

function ServiceIcon({
  service,
  primaryColor,
}: {
  service: StorefrontService;
  primaryColor: string;
}) {
  const icon =
    service.icon || "grid";

  return (
    <div
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
      style={{
        backgroundColor:
          hexToRgba(primaryColor, 0.09),
        color: primaryColor,
      }}
    >
      <AtlasIcon
        name={icon as AtlasIconName}
        className="h-5 w-5"
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Browser Shell                                                              */
/* -------------------------------------------------------------------------- */

function BrowserShell({
  children,
  store,
}: {
  children: React.ReactNode;
  store: StorefrontConfig;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-950">
      <div className="flex h-10 items-center gap-2 border-b border-neutral-200 bg-neutral-50 px-4 dark:border-neutral-800 dark:bg-neutral-900">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-500" />

        <div className="ml-4 flex h-6 min-w-0 flex-1 items-center justify-center rounded-md bg-white px-3 text-[10px] text-neutral-500 shadow-sm dark:bg-neutral-950 dark:text-neutral-400">
          <span className="truncate">
            {store.customDomain ||
              `atlas.store/${store.storefrontSlug}`}
          </span>
        </div>
      </div>

      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Store Header                                                               */
/* -------------------------------------------------------------------------- */

function StoreHeader({
  store,
  theme,
  mobile = false,
}: {
  store: StorefrontConfig;
  theme: StorefrontTheme;
  mobile?: boolean;
}) {
  const primary =
    store.primaryColor ||
    defaultStorefront.primaryColor;

  const isClassic =
    theme === "classic";

  const isMinimal =
    theme === "minimal";

  return (
    <header
      className={`relative z-20 border-b ${
        isClassic
          ? "border-neutral-200"
          : "border-neutral-100/80"
      }`}
      style={{
        backgroundColor:
          isClassic
            ? "#ffffff"
            : isMinimal
              ? "#ffffff"
              : primary,
      }}
    >
      <div
        className={`mx-auto flex max-w-6xl items-center justify-between ${
          mobile
            ? "px-4 py-3"
            : "px-6 py-4"
        }`}
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <Logo
            store={store}
            compact={mobile}
          />

          <div className="min-w-0">
            <p
              className={`truncate font-bold ${
                mobile
                  ? "text-xs"
                  : "text-sm"
              } ${
                isClassic ||
                isMinimal
                  ? "text-neutral-950"
                  : "text-white"
              }`}
            >
              {store.storeName}
            </p>

            {!mobile && (
              <p
                className={`truncate text-[10px] ${
                  isClassic ||
                  isMinimal
                    ? "text-neutral-500"
                    : "text-white/70"
                }`}
              >
                {store.tagline}
              </p>
            )}
          </div>
        </div>

        {mobile ? (
          <button
            type="button"
            className={`flex h-8 w-8 items-center justify-center rounded-lg ${
              isClassic ||
              isMinimal
                ? "bg-neutral-100 text-neutral-700"
                : "bg-white/10 text-white"
            }`}
            aria-label="Open menu"
          >
            <AtlasIcon
              name="grid"
              className="h-4 w-4"
            />
          </button>
        ) : (
          <nav className="flex items-center gap-6">
            {[
              "Home",
              "Services",
              "About",
              "Contact",
            ].map((item) => (
              <button
                key={item}
                type="button"
                className={`text-xs font-medium transition-opacity hover:opacity-70 ${
                  isClassic ||
                  isMinimal
                    ? "text-neutral-700"
                    : "text-white/90"
                }`}
              >
                {item}
              </button>
            ))}

            <button
              type="button"
              className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                isClassic ||
                isMinimal
                  ? "text-white"
                  : "bg-white text-neutral-900"
              }`}
              style={{
                backgroundColor:
                  isClassic ||
                  isMinimal
                    ? primary
                    : undefined,
              }}
            >
              Login
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/* Hero                                                                       */
/* -------------------------------------------------------------------------- */

function Hero({
  store,
  theme,
  mobile = false,
}: {
  store: StorefrontConfig;
  theme: StorefrontTheme;
  mobile?: boolean;
}) {
  const primary =
    store.primaryColor ||
    defaultStorefront.primaryColor;

  const secondary =
    store.secondaryColor ||
    defaultStorefront.secondaryColor;

  const isClassic =
    theme === "classic";

  const isMinimal =
    theme === "minimal";

  if (mobile) {
    return (
      <section
        className="px-4 py-8"
        style={{
          background:
            isMinimal
              ? "#fafafa"
              : isClassic
                ? `linear-gradient(180deg, ${hexToRgba(
                    primary,
                    0.08,
                  )}, #ffffff)`
                : `linear-gradient(160deg, ${primary}, ${secondary})`,
        }}
      >
        <div
          className={`overflow-hidden rounded-2xl ${
            isMinimal
              ? ""
              : "border border-white/10 shadow-sm"
          }`}
        >
          <div
            className={`${
              isMinimal
                ? ""
                : "rounded-2xl p-5"
            }`}
          >
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${
                isMinimal ||
                isClassic
                  ? "bg-white text-neutral-600 shadow-sm"
                  : "bg-white/10 text-white"
              }`}
            >
              Digital Services
            </span>

            <h1
              className={`mt-4 text-2xl font-bold leading-tight ${
                isMinimal ||
                isClassic
                  ? "text-neutral-950"
                  : "text-white"
              }`}
            >
              {store.heroTitle}
            </h1>

            <p
              className={`mt-3 text-xs leading-relaxed ${
                isMinimal ||
                isClassic
                  ? "text-neutral-600"
                  : "text-white/75"
              }`}
            >
              {store.heroDescription}
            </p>

            <button
              type="button"
              className="mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white"
              style={{
                backgroundColor: primary,
              }}
            >
              Shop Now
              <AtlasIcon
                name="arrow-right"
                className="h-3.5 w-3.5"
              />
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`relative overflow-hidden ${
        isMinimal
          ? "bg-white"
          : ""
      }`}
      style={{
        background:
          isMinimal
            ? "#ffffff"
            : isClassic
              ? `linear-gradient(135deg, ${hexToRgba(
                  primary,
                  0.08,
                )}, #ffffff)`
              : `linear-gradient(120deg, ${primary}, ${secondary})`,
      }}
    >
      {!isMinimal && (
        <>
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-20 blur-3xl"
            style={{
              backgroundColor: "#ffffff",
            }}
          />

          <div
            className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full opacity-10 blur-3xl"
            style={{
              backgroundColor: "#ffffff",
            }}
          />
        </>
      )}

      <div className="relative mx-auto grid max-w-6xl grid-cols-2 items-center gap-8 px-8 py-14">
        <div className="max-w-xl">
          <span
            className={`inline-flex rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest ${
              isMinimal ||
              isClassic
                ? "bg-white text-neutral-600 shadow-sm"
                : "bg-white/10 text-white"
            }`}
          >
            Digital Services Store
          </span>

          <h1
            className={`mt-5 text-4xl font-bold leading-[1.08] tracking-tight ${
              isMinimal ||
              isClassic
                ? "text-neutral-950"
                : "text-white"
            }`}
          >
            {store.heroTitle}
          </h1>

          <p
            className={`mt-5 max-w-lg text-sm leading-7 ${
              isMinimal ||
              isClassic
                ? "text-neutral-600"
                : "text-white/75"
            }`}
          >
            {store.heroDescription}
          </p>

          <div className="mt-7 flex items-center gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-xs font-bold text-white shadow-lg"
              style={{
                backgroundColor: primary,
              }}
            >
              Shop Now
              <AtlasIcon
                name="arrow-right"
                className="h-4 w-4"
              />
            </button>

            <button
              type="button"
              className={`rounded-xl border px-5 py-3 text-xs font-semibold ${
                isMinimal ||
                isClassic
                  ? "border-neutral-200 bg-white text-neutral-700"
                  : "border-white/20 bg-white/10 text-white"
              }`}
            >
              View Services
            </button>
          </div>

          <div className="mt-7 flex flex-wrap gap-4">
            {[
              "Instant Delivery",
              "Secure Payments",
              "Multiple Services",
            ].map((item) => (
              <div
                key={item}
                className={`flex items-center gap-2 text-[10px] ${
                  isMinimal ||
                  isClassic
                    ? "text-neutral-500"
                    : "text-white/70"
                }`}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    backgroundColor:
                      isMinimal ||
                      isClassic
                        ? primary
                        : "#ffffff",
                  }}
                />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Hero Visual */}
        <div className="relative flex min-h-[310px] items-center justify-center">
          <div
            className={`relative w-full max-w-md overflow-hidden rounded-3xl border p-4 shadow-2xl ${
              isMinimal ||
              isClassic
                ? "border-neutral-200 bg-white"
                : "border-white/10 bg-white/10 backdrop-blur"
            }`}
          >
            <div
              className={`rounded-2xl p-5 ${
                isMinimal ||
                isClassic
                  ? "bg-neutral-50"
                  : "bg-white/10"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Logo
                    store={store}
                    compact
                  />

                  <div>
                    <p
                      className={`text-[10px] font-bold ${
                        isMinimal ||
                        isClassic
                          ? "text-neutral-900"
                          : "text-white"
                      }`}
                    >
                      {store.storeName}
                    </p>

                    <p
                      className={`text-[8px] ${
                        isMinimal ||
                        isClassic
                          ? "text-neutral-500"
                          : "text-white/60"
                      }`}
                    >
                      {store.tagline}
                    </p>
                  </div>
                </div>

                <div
                  className={`h-6 w-6 rounded-full ${
                    isMinimal ||
                    isClassic
                      ? "bg-neutral-200"
                      : "bg-white/10"
                  }`}
                />
              </div>

              <div
                className="mt-5 rounded-2xl p-5"
                style={{
                  backgroundColor:
                    primary,
                }}
              >
                <p className="text-[9px] font-semibold uppercase tracking-wider text-white/60">
                  Welcome
                </p>

                <p className="mt-2 max-w-xs text-lg font-bold leading-tight text-white">
                  Your digital services, all in one place.
                </p>

                <div className="mt-4 inline-flex rounded-lg bg-white px-3 py-2 text-[9px] font-bold text-neutral-900">
                  Start Shopping
                </div>
              </div>

              <div className="mt-4 grid grid-cols-4 gap-2">
                {store.services
                  .filter(
                    (service) =>
                      service.enabled,
                  )
                  .slice(0, 4)
                  .map((service) => (
                    <div
                      key={service.id}
                      className={`flex flex-col items-center gap-1 rounded-xl p-2 ${
                        isMinimal ||
                        isClassic
                          ? "bg-white"
                          : "bg-white/10"
                      }`}
                    >
                      <ServiceIcon
                        service={service}
                        primaryColor={
                          isMinimal ||
                          isClassic
                            ? primary
                            : "#ffffff"
                        }
                      />

                      <span
                        className={`text-center text-[7px] font-medium ${
                          isMinimal ||
                          isClassic
                            ? "text-neutral-700"
                            : "text-white/80"
                        }`}
                      >
                        {service.name}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Services                                                                    */
/* -------------------------------------------------------------------------- */

function ServicesSection({
  store,
  theme,
  mobile = false,
}: {
  store: StorefrontConfig;
  theme: StorefrontTheme;
  mobile?: boolean;
}) {
  const primary =
    store.primaryColor ||
    defaultStorefront.primaryColor;

  const enabledServices =
    store.services.filter(
      (service) => service.enabled,
    );

  const services =
    enabledServices.length > 0
      ? enabledServices
      : defaultStorefrontServicesFallback();

  if (mobile) {
    return (
      <section className="bg-white px-4 py-7">
        <div className="flex items-end justify-between">
          <div>
            <p
              className="text-[9px] font-bold uppercase tracking-wider"
              style={{
                color: primary,
              }}
            >
              Explore
            </p>

            <h2 className="mt-1 text-base font-bold text-neutral-950">
              Popular Services
            </h2>
          </div>

          <button
            type="button"
            className="text-[9px] font-semibold"
            style={{
              color: primary,
            }}
          >
            View all
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {services
            .slice(0, 6)
            .map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                primaryColor={primary}
                theme={theme}
                mobile
              />
            ))}
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white px-8 py-14">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-end justify-between">
          <div>
            <p
              className="text-[10px] font-bold uppercase tracking-[0.18em]"
              style={{
                color: primary,
              }}
            >
              Our Services
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight text-neutral-950">
              Everything you need
            </h2>

            <p className="mt-2 max-w-xl text-xs leading-6 text-neutral-500">
              Access the digital services your customers use every day.
            </p>
          </div>

          <button
            type="button"
            className="text-xs font-semibold"
            style={{
              color: primary,
            }}
          >
            View all services →
          </button>
        </div>

        <div className="mt-7 grid grid-cols-4 gap-4">
          {services
            .slice(0, 8)
            .map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                primaryColor={primary}
                theme={theme}
              />
            ))}
        </div>
      </div>
    </section>
  );
}

function defaultStorefrontServicesFallback(): StorefrontService[] {
  return [
    {
      id: "airtime",
      name: "Airtime",
      description: "Top up airtime instantly",
      icon: "phone",
      enabled: true,
    },
    {
      id: "data",
      name: "Data Bundles",
      description: "Affordable data bundles",
      icon: "globe",
      enabled: true,
    },
    {
      id: "electricity",
      name: "Electricity",
      description: "Pay electricity bills",
      icon: "zap",
      enabled: true,
    },
    {
      id: "tv",
      name: "Cable TV",
      description: "DSTV, GOtv and more",
      icon: "tv",
      enabled: true,
    },
  ];
}

/* -------------------------------------------------------------------------- */
/* Service Card                                                               */
/* -------------------------------------------------------------------------- */

function ServiceCard({
  service,
  primaryColor,
  theme,
  mobile = false,
}: {
  service: StorefrontService;
  primaryColor: string;
  theme: StorefrontTheme;
  mobile?: boolean;
}) {
  const isMinimal =
    theme === "minimal";

  const isClassic =
    theme === "classic";

  return (
    <button
      type="button"
      className={`group text-left transition-all ${
        mobile
          ? "rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm"
          : `rounded-2xl border p-5 hover:-translate-y-0.5 hover:shadow-lg ${
              isClassic
                ? "border-neutral-200 bg-white"
                : isMinimal
                  ? "border-neutral-200 bg-white"
                  : "border-neutral-100 bg-white"
            }`
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <ServiceIcon
          service={service}
          primaryColor={primaryColor}
        />

        <AtlasIcon
          name="arrow-right"
          className="h-4 w-4 text-neutral-300 transition-transform group-hover:translate-x-0.5"
        />
      </div>

      <h3
        className={`mt-4 font-bold text-neutral-950 ${
          mobile
            ? "text-xs"
            : "text-sm"
        }`}
      >
        {service.name}
      </h3>

      <p
        className={`mt-1 leading-5 text-neutral-500 ${
          mobile
            ? "text-[9px]"
            : "text-[10px]"
        }`}
      >
        {service.description}
      </p>

      {service.price && (
        <p
          className="mt-3 text-xs font-bold"
          style={{
            color: primaryColor,
          }}
        >
          From {service.price}
        </p>
      )}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Trust / Benefits                                                            */
/* -------------------------------------------------------------------------- */

function TrustSection({
  store,
  theme,
  mobile = false,
}: {
  store: StorefrontConfig;
  theme: StorefrontTheme;
  mobile?: boolean;
}) {
  const primary =
    store.primaryColor ||
    defaultStorefront.primaryColor;

  const items = [
    {
      icon: "check" as AtlasIconName,
      title: "Instant Delivery",
      description: "Fast service delivery",
    },
    {
      icon: "shield" as AtlasIconName,
      title: "Secure Payments",
      description: "Safe and trusted",
    },
    {
      icon: "store" as AtlasIconName,
      title: "Trusted Store",
      description: "Powered by Atlas",
    },
  ];

  return (
    <section
      className={`border-t border-neutral-100 ${
        mobile
          ? "px-4 py-6"
          : "px-8 py-10"
      }`}
    >
      <div
        className={`mx-auto grid max-w-6xl ${
          mobile
            ? "grid-cols-1 gap-3"
            : "grid-cols-3 gap-4"
        }`}
      >
        {items.map((item) => (
          <div
            key={item.title}
            className={`flex items-center gap-3 rounded-xl ${
              mobile
                ? "bg-neutral-50 p-3"
                : "border border-neutral-100 bg-white p-4"
            }`}
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
              style={{
                backgroundColor:
                  hexToRgba(primary, 0.08),
                color: primary,
              }}
            >
              <AtlasIcon
                name={item.icon}
                className="h-4 w-4"
              />
            </div>

            <div>
              <p className="text-xs font-bold text-neutral-900">
                {item.title}
              </p>

              <p className="mt-0.5 text-[9px] text-neutral-500">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Footer                                                                     */
/* -------------------------------------------------------------------------- */

function StoreFooter({
  store,
  mobile = false,
}: {
  store: StorefrontConfig;
  mobile?: boolean;
}) {
  const primary =
    store.primaryColor ||
    defaultStorefront.primaryColor;

  return (
    <footer
      className={`border-t border-neutral-800 bg-neutral-950 text-white ${
        mobile
          ? "px-4 py-6"
          : "px-8 py-8"
      }`}
    >
      <div
        className={`mx-auto flex max-w-6xl ${
          mobile
            ? "flex-col gap-4"
            : "items-center justify-between"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <Logo
            store={store}
            compact
          />

          <div>
            <p className="text-xs font-bold">
              {store.storeName}
            </p>

            <p className="text-[9px] text-neutral-500">
              {store.tagline}
            </p>
          </div>
        </div>

        <div
          className={`${
            mobile
              ? "space-y-1"
              : "text-right"
          }`}
        >
          <p className="text-[9px] text-neutral-400">
            {store.contactPhone}
          </p>

          <p className="text-[9px] text-neutral-400">
            {store.contactEmail}
          </p>
        </div>
      </div>

      {store.showPoweredByAtlas && (
        <div className="mx-auto mt-6 max-w-6xl border-t border-white/10 pt-4">
          <p className="text-center text-[8px] text-neutral-600">
            Powered by{" "}
            <span
              className="font-semibold"
              style={{
                color: primary,
              }}
            >
              Atlas
            </span>
          </p>
        </div>
      )}
    </footer>
  );
}

/* -------------------------------------------------------------------------- */
/* Modern Storefront                                                          */
/* -------------------------------------------------------------------------- */

function ModernStorefront({
  store,
  mobile,
}: {
  store: StorefrontConfig;
  mobile?: boolean;
}) {
  return (
    <div className="overflow-hidden bg-white font-sans">
      <StoreHeader
        store={store}
        theme="modern"
        mobile={mobile}
      />

      <Hero
        store={store}
        theme="modern"
        mobile={mobile}
      />

      <ServicesSection
        store={store}
        theme="modern"
        mobile={mobile}
      />

      <TrustSection
        store={store}
        theme="modern"
        mobile={mobile}
      />

      <StoreFooter
        store={store}
        mobile={mobile}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Classic Storefront                                                         */
/* -------------------------------------------------------------------------- */

function ClassicStorefront({
  store,
  mobile,
}: {
  store: StorefrontConfig;
  mobile?: boolean;
}) {
  return (
    <div className="overflow-hidden bg-white font-sans">
      <StoreHeader
        store={store}
        theme="classic"
        mobile={mobile}
      />

      <Hero
        store={store}
        theme="classic"
        mobile={mobile}
      />

      <div
        className={
          mobile
            ? "px-4"
            : "px-8"
        }
      >
        <div className="mx-auto max-w-6xl border-t border-neutral-200" />
      </div>

      <ServicesSection
        store={store}
        theme="classic"
        mobile={mobile}
      />

      <TrustSection
        store={store}
        theme="classic"
        mobile={mobile}
      />

      <StoreFooter
        store={store}
        mobile={mobile}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Minimal Storefront                                                         */
/* -------------------------------------------------------------------------- */

function MinimalStorefront({
  store,
  mobile,
}: {
  store: StorefrontConfig;
  mobile?: boolean;
}) {
  return (
    <div className="overflow-hidden bg-white font-sans">
      <StoreHeader
        store={store}
        theme="minimal"
        mobile={mobile}
      />

      <Hero
        store={store}
        theme="minimal"
        mobile={mobile}
      />

      <ServicesSection
        store={store}
        theme="minimal"
        mobile={mobile}
      />

      <TrustSection
        store={store}
        theme="minimal"
        mobile={mobile}
      />

      <StoreFooter
        store={store}
        mobile={mobile}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Preview Frame                                                              */
/* -------------------------------------------------------------------------- */

function PreviewFrame({
  children,
  mode,
}: {
  children: React.ReactNode;
  mode: PreviewMode;
}) {
  if (mode === "mobile") {
    return (
      <div className="flex justify-center bg-neutral-100 p-6 dark:bg-neutral-950">
        <div className="w-full max-w-[390px] overflow-hidden rounded-[2rem] border-[6px] border-neutral-900 bg-white shadow-2xl">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main Preview                                                               */
/* -------------------------------------------------------------------------- */

export function StorefrontPreview({
  store,
  mode = "desktop",
  theme,
}: StorefrontPreviewProps) {
  const normalizedStore =
    useMemo(
      () => normalizeStorefront(store),
      [store],
    );

  const activeTheme =
    theme ||
    normalizedStore.theme ||
    "modern";

  const content = (() => {
    switch (activeTheme) {
      case "classic":
        return (
          <ClassicStorefront
            store={normalizedStore}
            mobile={mode === "mobile"}
          />
        );

      case "minimal":
        return (
          <MinimalStorefront
            store={normalizedStore}
            mobile={mode === "mobile"}
          />
        );

      case "modern":
      default:
        return (
          <ModernStorefront
            store={normalizedStore}
            mobile={mode === "mobile"}
          />
        );
    }
  })();

  return (
    <PreviewFrame mode={mode}>
      {mode === "desktop" ? (
        <BrowserShell store={normalizedStore}>
          {content}
        </BrowserShell>
      ) : (
        content
      )}
    </PreviewFrame>
  );
}