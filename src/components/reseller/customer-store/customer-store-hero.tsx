"use client";

import { AtlasIcon } from "@/components/atlas/icons";
type Props = {
  store: {
    primaryColor: string;
    heroTitle?: string | null;
    storeName: string;
    heroDescription?: string | null;
    whatsapp?: string | null;
  };
  totalServices: number;
};

export function CustomerStoreHero({ store, totalServices }: Props) {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        backgroundColor: store.primaryColor,
      }}
    >
      {/* Decorative shapes */}
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-10"
        style={{ backgroundColor: "#ffffff" }}
      />

      <div
        className="pointer-events-none absolute -bottom-32 left-1/3 h-80 w-80 rounded-full opacity-10"
        style={{ backgroundColor: "#ffffff" }}
      />

      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-green-300" />
            Store is online
          </div>

          <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {store.heroTitle || `Welcome to ${store.storeName}`}
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/80 sm:text-base">
            {store.heroDescription ||
              "Get the digital services you need quickly and conveniently."}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="#services"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold shadow-sm transition-colors hover:bg-neutral-100"
              style={{ color: store.primaryColor }}
            >
              Browse Services
              <AtlasIcon name="arrow-right" className="h-4 w-4" />
            </a>

            {store.whatsapp && (
              <a
                href={`https://wa.me/${store.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/15"
              >
                <AtlasIcon name="phone" className="h-4 w-4" />
                Need Help?
              </a>
            )}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-5 text-xs text-white/70">
            <div className="flex items-center gap-2">
              <AtlasIcon name="check" className="h-4 w-4 text-green-300" />
              Simple checkout
            </div>

            <div className="flex items-center gap-2">
              <AtlasIcon name="check" className="h-4 w-4 text-green-300" />
              {totalServices} service categories
            </div>

            <div className="flex items-center gap-2">
              <AtlasIcon name="check" className="h-4 w-4 text-green-300" />
              Secure transactions
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}