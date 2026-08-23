"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AtlasCard } from "@/components/atlas/card";
import { AtlasBadge } from "@/components/atlas/badge";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type ServiceCategory = {
  id: string;
  name: string;
  description: string;
  icon: AtlasIconName;
  colorClass: string;
};

type StoreService = {
  id: string;
  name: string;
  category: string;
  description: string;
  price: string;
  icon: AtlasIconName;
  iconClass: string;
  popular?: boolean;
};

type Activity = {
  id: string;
  customer: string;
  action: string;
  service: string;
  amount: string;
  time: string;
  icon: AtlasIconName;
};

type FunnelItem = {
  label: string;
  value: string;
  percentage: string;
};

/* -------------------------------------------------------------------------- */
/* Mock Store Data                                                            */
/* -------------------------------------------------------------------------- */

const store = {
  name: "Phamous Connect",
  username: "phamousconnect",
  description:
    "Fast and reliable data, airtime and utility services for everyone.",
  primaryColor: "#1B4332",
  secondaryColor: "#D8F3DC",
  logoLetter: "P",
  status: "Live",
  visits: "1,248",
  orders: "186",
  revenue: "GHS 5,842.50",
  conversion: "14.9%",
};

const categories: ServiceCategory[] = [
  {
    id: "data",
    name: "Data Bundles",
    description: "Affordable internet bundles",
    icon: "globe",
    colorClass:
      "bg-brand-50 text-brand-800 dark:bg-brand-900/30 dark:text-brand-300",
  },
  {
    id: "airtime",
    name: "Airtime",
    description: "Top up any network",
    icon: "phone",
    colorClass:
      "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  },
  {
    id: "electricity",
    name: "Electricity",
    description: "Buy ECG credit",
    icon: "zap",
    colorClass:
      "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  },
  {
    id: "tv",
    name: "TV Subscriptions",
    description: "DSTV and GOtv",
    icon: "tv",
    colorClass:
      "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  },
];

const services: StoreService[] = [
  {
    id: "mtn-10gb",
    name: "MTN Data 10GB",
    category: "Data",
    description: "10GB MTN internet bundle",
    price: "GHS 35.00",
    icon: "globe",
    iconClass:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
    popular: true,
  },
  {
    id: "mtn-5gb",
    name: "MTN Data 5GB",
    category: "Data",
    description: "5GB MTN internet bundle",
    price: "GHS 20.00",
    icon: "globe",
    iconClass:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  },
  {
    id: "airtime",
    name: "Airtime Top Up",
    category: "Airtime",
    description: "Top up any supported network",
    price: "From GHS 1.00",
    icon: "phone",
    iconClass:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  },
  {
    id: "ecg",
    name: "ECG Credit",
    category: "Electricity",
    description: "Purchase prepaid electricity",
    price: "From GHS 10.00",
    icon: "zap",
    iconClass:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  },
  {
    id: "dstv",
    name: "DSTV Subscription",
    category: "TV",
    description: "Pay your DSTV subscription",
    price: "From GHS 40.00",
    icon: "tv",
    iconClass:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  },
];

const activities: Activity[] = [
  {
    id: "1",
    customer: "John Mensah",
    action: "Purchased",
    service: "MTN Data 10GB",
    amount: "GHS 35.00",
    time: "2 min ago",
    icon: "globe",
  },
  {
    id: "2",
    customer: "Ama Boateng",
    action: "Purchased",
    service: "Airtime Top Up",
    amount: "GHS 20.00",
    time: "8 min ago",
    icon: "phone",
  },
  {
    id: "3",
    customer: "Kofi Asare",
    action: "Purchased",
    service: "ECG Credit",
    amount: "GHS 100.00",
    time: "21 min ago",
    icon: "zap",
  },
  {
    id: "4",
    customer: "Akosua Owusu",
    action: "Purchased",
    service: "DSTV Subscription",
    amount: "GHS 75.00",
    time: "35 min ago",
    icon: "tv",
  },
];

const funnel: FunnelItem[] = [
  {
    label: "Store Visits",
    value: "1,248",
    percentage: "100%",
  },
  {
    label: "Service Views",
    value: "892",
    percentage: "71.5%",
  },
  {
    label: "Checkout Started",
    value: "324",
    percentage: "26.0%",
  },
  {
    label: "Successful Orders",
    value: "186",
    percentage: "14.9%",
  },
];

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function StoreLogo() {
  return (
    <div
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white shadow-sm"
      style={{ backgroundColor: store.primaryColor }}
      aria-label={`${store.name} logo`}
    >
      {store.logoLetter}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Storefront Preview                                                         */
/* -------------------------------------------------------------------------- */

function StorefrontPreview() {
  const [category, setCategory] = useState("All");

  const visibleServices = useMemo(() => {
    if (category === "All") return services;

    return services.filter((service) => service.category === category);
  }, [category]);

  const categoryButtons = ["All", "Data", "Airtime", "Electricity", "TV"];

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
      {/* Preview Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-success-500" />

          <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
            Live customer storefront
          </span>
        </div>

        <span className="text-xs text-neutral-400">Preview</span>
      </div>

      {/* Customer Store */}
      <div className="min-h-[720px] bg-neutral-50 dark:bg-neutral-950">
        {/* Store Header */}
        <header className="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
            <div className="flex items-center gap-3">
              <StoreLogo />

              <div>
                <p className="text-sm font-bold text-neutral-950 dark:text-white">
                  {store.name}
                </p>

                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  Trusted reseller
                </p>
              </div>
            </div>

            <div className="hidden items-center gap-5 sm:flex">
              <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                Home
              </span>

              <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                Services
              </span>

              <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                Help
              </span>

              <button
                type="button"
                className="rounded-lg px-3 py-2 text-xs font-semibold text-white"
                style={{ backgroundColor: store.primaryColor }}
              >
                My Orders
              </button>
            </div>

            <button
              type="button"
              className="rounded-lg border border-neutral-200 p-2 sm:hidden dark:border-neutral-800"
              aria-label="Open storefront menu"
            >
              <AtlasIcon name="grid" className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Hero */}
        <section
          className="relative overflow-hidden px-5 py-10 text-white sm:px-8"
          style={{ backgroundColor: store.primaryColor }}
        >
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10" />

          <div className="pointer-events-none absolute -bottom-20 right-20 h-48 w-48 rounded-full bg-white/5" />

          <div className="relative mx-auto max-w-6xl">
            <div className="max-w-xl">
              <AtlasBadge variant="success">
                Fast &amp; Reliable Services
              </AtlasBadge>

              <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                Everything you need,
                <br />
                in one place.
              </h2>

              <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/75">
                {store.description}
              </p>

              <button
                type="button"
                className="mt-6 rounded-lg bg-white px-4 py-2.5 text-xs font-bold shadow-sm"
                style={{ color: store.primaryColor }}
              >
                Browse Services
              </button>
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: store.primaryColor }}
              >
                Services
              </p>

              <h3 className="mt-1 text-lg font-bold text-neutral-950 dark:text-white">
                What would you like to buy?
              </h3>
            </div>

            <div className="flex gap-1 overflow-x-auto pb-1">
              {categoryButtons.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                    category === item
                      ? "text-white"
                      : "bg-neutral-100 text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400"
                  }`}
                  style={
                    category === item
                      ? { backgroundColor: store.primaryColor }
                      : undefined
                  }
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {visibleServices.slice(0, 4).map((service) => (
              <div
                key={service.id}
                className="group rounded-xl border border-neutral-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${service.iconClass}`}
                  >
                    <AtlasIcon name={service.icon} className="h-5 w-5" />
                  </div>

                  {service.popular && (
                    <span
                      className="rounded-full px-2 py-1 text-[9px] font-bold"
                      style={{
                        backgroundColor: store.secondaryColor,
                        color: store.primaryColor,
                      }}
                    >
                      Popular
                    </span>
                  )}
                </div>

                <h4 className="mt-4 text-sm font-bold text-neutral-950 dark:text-white">
                  {service.name}
                </h4>

                <p className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
                  {service.description}
                </p>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="text-xs font-bold text-neutral-950 dark:text-white">
                    {service.price}
                  </span>

                  <button
                    type="button"
                    className="rounded-lg px-3 py-2 text-[10px] font-bold text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: store.primaryColor }}
                  >
                    Buy
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Trust Strip */}
        <section className="border-t border-neutral-200 bg-white px-5 py-5 dark:border-neutral-800 dark:bg-neutral-950">
          <div className="mx-auto grid max-w-6xl gap-3 sm:grid-cols-3">
            {[
              ["check", "Instant Delivery", "Orders are processed quickly."],
              ["shield", "Secure Payments", "Your payment information is protected."],
              ["headphones", "Customer Support", "We're here when you need us."],
            ].map(([icon, title, description]) => (
              <div
                key={title}
                className="flex items-start gap-3 rounded-xl bg-neutral-50 p-3 dark:bg-neutral-900"
              >
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{
                    backgroundColor: store.secondaryColor,
                    color: store.primaryColor,
                  }}
                >
                  <AtlasIcon
                    name={icon as AtlasIconName}
                    className="h-4 w-4"
                  />
                </div>

                <div>
                  <p className="text-[11px] font-bold text-neutral-900 dark:text-white">
                    {title}
                  </p>

                  <p className="mt-0.5 text-[10px] leading-relaxed text-neutral-500 dark:text-neutral-400">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main Component                                                             */
/* -------------------------------------------------------------------------- */

export function ResellerCustomerStore() {
  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------------ */}
      {/* Page Header                                                         */}
      {/* ------------------------------------------------------------------ */}

      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-medium text-brand-700 dark:text-brand-300">
            Customer Store
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-950 dark:text-white sm:text-3xl">
            Your customer storefront
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
            See how customers experience your storefront, monitor its
            performance and manage the tools that help turn visitors into
            customers.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/reseller/storefront"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-800 shadow-sm transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            <AtlasIcon name="store" className="h-4 w-4" />
            Customize Store
          </Link>

          <a
            href={`/store/${store.username}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-900"
          >
            <AtlasIcon name="grid" className="h-4 w-4" />
            Open Store
          </a>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Store Status                                                        */}
      {/* ------------------------------------------------------------------ */}

      <AtlasCard className="border-brand-100 dark:border-brand-900/40">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <StoreLogo />

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-bold text-neutral-950 dark:text-white">
                  {store.name}
                </h2>

                <AtlasBadge variant="success">Live</AtlasBadge>
              </div>

              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                atlas.com/store/{store.username}
              </p>

              <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-500">
                Your storefront is publicly available and customers can place
                orders.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/reseller/storefront"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-200 px-4 py-2.5 text-sm font-semibold text-neutral-800 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-900"
            >
              <AtlasIcon name="settings" className="h-4 w-4" />
              Store Settings
            </Link>

            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-200 px-4 py-2.5 text-sm font-semibold text-neutral-800 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-900"
              onClick={() => {
                navigator.clipboard?.writeText(
                  `https://atlas.com/store/${store.username}`,
                );
              }}
            >
              <AtlasIcon name="link" className="h-4 w-4" />
              Copy Link
            </button>
          </div>
        </div>
      </AtlasCard>

      {/* ------------------------------------------------------------------ */}
      {/* Store Performance                                                   */}
      {/* ------------------------------------------------------------------ */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Store Visits",
            value: store.visits,
            description: "Visitors this month",
            icon: "eye" as AtlasIconName,
            className:
              "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
          },
          {
            label: "Orders",
            value: store.orders,
            description: "Successful orders",
            icon: "receipt" as AtlasIconName,
            className:
              "bg-brand-50 text-brand-800 dark:bg-brand-900/30 dark:text-brand-300",
          },
          {
            label: "Revenue",
            value: store.revenue,
            description: "Customer purchases",
            icon: "trending-up" as AtlasIconName,
            className:
              "bg-success-50 text-success-700 dark:bg-success-900/30 dark:text-success-300",
          },
          {
            label: "Conversion",
            value: store.conversion,
            description: "Visit to order rate",
            icon: "activity" as AtlasIconName,
            className:
              "bg-accent-500/10 text-accent-700 dark:text-accent-300",
          },
        ].map((stat) => (
          <AtlasCard key={stat.label}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  {stat.label}
                </p>

                <p className="mt-2 text-2xl font-bold tracking-tight text-neutral-950 dark:text-white">
                  {stat.value}
                </p>

                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-500">
                  {stat.description}
                </p>
              </div>

              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${stat.className}`}
              >
                <AtlasIcon name={stat.icon} className="h-5 w-5" />
              </div>
            </div>
          </AtlasCard>
        ))}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Main Preview + Controls                                             */}
      {/* ------------------------------------------------------------------ */}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-neutral-950 dark:text-white">
                Storefront Preview
              </h2>

              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                This is how your storefront currently appears to customers.
              </p>
            </div>

            <AtlasBadge variant="success">Live</AtlasBadge>
          </div>

          <StorefrontPreview />
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <AtlasCard>
            <div className="mb-4">
              <h2 className="text-base font-bold text-neutral-950 dark:text-white">
                Store Management
              </h2>

              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                Manage the important parts of your customer store.
              </p>
            </div>

            <div className="space-y-2">
              {[
                {
                  label: "Customize Appearance",
                  description: "Colors, logo and branding",
                  icon: "palette" as AtlasIconName,
                  href: "/reseller/storefront",
                },
                {
                  label: "Manage Services",
                  description: "Choose what customers can buy",
                  icon: "grid" as AtlasIconName,
                  href: "/reseller/services",
                },
                {
                  label: "Store Settings",
                  description: "Store information and preferences",
                  icon: "settings" as AtlasIconName,
                  href: "/reseller/settings",
                },
                {
                  label: "Share Store",
                  description: "Get your customer store link",
                  icon: "share" as AtlasIconName,
                  href: "/reseller/storefront",
                },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="group flex items-center gap-3 rounded-xl border border-neutral-200 p-3 transition-all hover:border-brand-200 hover:bg-brand-50/50 hover:shadow-sm dark:border-neutral-800 dark:hover:border-brand-800 dark:hover:bg-brand-950/20"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                    <AtlasIcon name={item.icon} className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-neutral-900 group-hover:text-brand-800 dark:text-neutral-100 dark:group-hover:text-brand-300">
                      {item.label}
                    </p>

                    <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                      {item.description}
                    </p>
                  </div>

                  <AtlasIcon
                    name="arrow-right"
                    className="h-4 w-4 text-neutral-400 transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
              ))}
            </div>
          </AtlasCard>

          <AtlasCard>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-800 dark:bg-brand-900/30 dark:text-brand-300">
                <AtlasIcon name="link" className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <h2 className="text-sm font-bold text-neutral-950 dark:text-white">
                  Your store link
                </h2>

                <p className="mt-1 break-all text-xs text-neutral-500 dark:text-neutral-400">
                  atlas.com/store/{store.username}
                </p>

                <button
                  type="button"
                  className="mt-3 text-xs font-semibold text-brand-800 hover:underline dark:text-brand-300"
                  onClick={() => {
                    navigator.clipboard?.writeText(
                      `https://atlas.com/store/${store.username}`,
                    );
                  }}
                >
                  Copy storefront link
                </button>
              </div>
            </div>
          </AtlasCard>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Customer Funnel + Categories                                        */}
      {/* ------------------------------------------------------------------ */}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Funnel */}
        <AtlasCard>
          <div className="mb-5">
            <h2 className="text-base font-bold text-neutral-950 dark:text-white">
              Customer Journey
            </h2>

            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              See how visitors move through your storefront.
            </p>
          </div>

          <div className="space-y-4">
            {funnel.map((item, index) => (
              <div key={item.label}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white"
                      style={{ backgroundColor: store.primaryColor }}
                    >
                      {index + 1}
                    </div>

                    <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                      {item.label}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-bold text-neutral-950 dark:text-white">
                      {item.value}
                    </span>

                    <span className="ml-2 text-xs text-neutral-500 dark:text-neutral-400">
                      {item.percentage}
                    </span>
                  </div>
                </div>

                <div className="ml-10 mt-2 h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: item.percentage,
                      backgroundColor: store.primaryColor,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </AtlasCard>

        {/* Categories */}
        <AtlasCard>
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-neutral-950 dark:text-white">
                Store Categories
              </h2>

              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                Services currently visible to customers.
              </p>
            </div>

            <Link
              href="/reseller/services"
              className="text-xs font-semibold text-brand-800 hover:underline dark:text-brand-300"
            >
              Manage
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className="rounded-xl border border-neutral-200 p-3 dark:border-neutral-800"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${category.colorClass}`}
                  >
                    <AtlasIcon name={category.icon} className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      {category.name}
                    </p>

                    <p className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
                      {category.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </AtlasCard>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Recent Customer Activity                                           */}
      {/* ------------------------------------------------------------------ */}

      <AtlasCard padding="none" className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4 dark:border-neutral-800 sm:px-6">
          <div>
            <h2 className="text-base font-bold text-neutral-950 dark:text-white">
              Recent Customer Activity
            </h2>

            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              Recent activity from customers using your storefront.
            </p>
          </div>

          <Link
            href="/reseller/customers"
            className="text-xs font-semibold text-brand-800 hover:underline dark:text-brand-300"
          >
            View customers
          </Link>
        </div>

        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-neutral-50 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:hover:bg-neutral-900"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-800 dark:bg-brand-900/30 dark:text-brand-300">
                  <AtlasIcon name={activity.icon} className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-neutral-950 dark:text-white">
                    {activity.customer}
                  </p>

                  <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                    {activity.action} {activity.service}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-5 sm:justify-end">
                <div className="text-right">
                  <p className="text-sm font-bold text-neutral-950 dark:text-white">
                    {activity.amount}
                  </p>

                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {activity.time}
                  </p>
                </div>

                <AtlasBadge variant="success">Successful</AtlasBadge>
              </div>
            </div>
          ))}
        </div>
      </AtlasCard>

      {/* ------------------------------------------------------------------ */}
      {/* Bottom CTA                                                          */}
      {/* ------------------------------------------------------------------ */}

      <AtlasCard className="overflow-hidden bg-brand-950 text-white dark:bg-brand-950">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
              <AtlasIcon name="store" className="h-5 w-5 text-brand-200" />
            </div>

            <div>
              <h2 className="text-base font-bold">
                Make your storefront stand out
              </h2>

              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-brand-100/75">
                Customize your colors, branding and storefront experience to
                create a store your customers will recognize and trust.
              </p>
            </div>
          </div>

          <Link
            href="/reseller/storefront"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-brand-950 transition-colors hover:bg-brand-50"
          >
            Customize Store
            <AtlasIcon name="arrow-right" className="h-4 w-4" />
          </Link>
        </div>
      </AtlasCard>
    </div>
  );
}