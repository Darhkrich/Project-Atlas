import type { MerchantStorefrontConfig } from "@/types/merchant-storefront";

interface CosmeticsLuxePromoBannerProps {
  store: MerchantStorefrontConfig;
}

export function CosmeticsLuxePromoBanner({ store }: CosmeticsLuxePromoBannerProps) {
  return (
    <section className="px-4 pb-12 sm:px-6 lg:px-8">
      <div
        className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] px-6 py-12 text-center sm:px-10"
        style={{
          background: `linear-gradient(135deg, ${store.primaryColor}, color-mix(in srgb, ${store.primaryColor} 80%, black))`,
        }}
      >
        <h2 className="text-2xl font-bold text-white sm:text-3xl">
          Exclusive Offer
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-white/80">
          Subscribe and get 15% off your first order plus early access to new arrivals.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full max-w-sm rounded-full border-0 bg-white px-5 py-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
          />
          <button
            className="rounded-full px-6 py-3 text-sm font-semibold text-white"
            style={{ backgroundColor: store.accentColor }}
          >
            Subscribe
          </button>
        </div>
      </div>
    </section>
  );
}