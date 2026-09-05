/* eslint-disable @next/next/no-img-element */
import type { MerchantStorefrontConfig } from "@/types/merchant-storefront";

interface FashionModernPromoBannerProps {
  store: MerchantStorefrontConfig;
}

export function FashionModernPromoBanner({ store }: FashionModernPromoBannerProps) {
  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl overflow-hidden bg-neutral-950">
        <div className="grid md:grid-cols-2">
          <div className="p-8 sm:p-12">
            <h2 className="text-2xl font-bold uppercase tracking-wider text-white sm:text-3xl">
              Season Sale
            </h2>
            <p className="mt-3 text-sm text-white/70">
              Up to 30% off selected styles. Limited time only.
            </p>
            <button
              className="mt-6 rounded-none px-6 py-3 text-sm font-bold uppercase tracking-wider text-white"
              style={{ backgroundColor: store.accentColor }}
            >
              Shop Sale
            </button>
          </div>
          <div className="relative min-h-[200px] bg-neutral-800">
            <img
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=600&fit=crop"
              alt="Fashion sale"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}