import Image from "next/image";
import Link from "next/link";
import { AtlasContainer } from "@/components/atlas/atlas-container";

const features = [
  "No Code Required",
  "Choose a Template",
  "Customize Your Store",
  "Launch in Minutes",
];

export function EcommerceSection() {
  return (
    <section className="relative overflow-hidden bg-[#04211c] py-16 md:py-24">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.05]">
        <svg className="h-full w-full" viewBox="0 0 100 100" fill="none">
          <circle cx="10" cy="10" r="1" fill="white" />
          <circle cx="50" cy="30" r="1" fill="white" />
          <circle cx="90" cy="50" r="1" fill="white" />
          <circle cx="20" cy="80" r="1" fill="white" />
          <circle cx="70" cy="20" r="1" fill="white" />
        </svg>
      </div>

      <AtlasContainer className="relative z-10">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Left column */}
          <div>
            <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-accent-500">
              No Code Needed
            </span>
            <h2 className="mt-5 text-4xl md:text-5xl font-bold tracking-tight text-white">
              Own an E-commerce
              <span className="block text-brand-200">Website Today</span>
            </h2>
            <p className="mt-4 text-lg text-brand-100/90">
              Launch your own white-label e-commerce store without writing a
              single line of code. Pick a template, customize it, and go live
              in minutes.
            </p>

            <ul className="mt-8 space-y-3">
              {features.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-500/15">
                    <svg
                      className="h-4 w-4 text-accent-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </span>
                  <span className="text-base font-medium text-white">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/storefront/signup"
                className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3 text-sm font-semibold text-[#04211c] transition-colors hover:bg-brand-50"
              >
                Create Your Store
              </Link>
              <Link
                href="/storefront/demo"
                className="inline-flex items-center justify-center rounded-full border border-white/30 px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                View Demo
              </Link>
            </div>
          </div>

          {/* Right column: store preview */}
          <div className="relative">
            {/* Main store mockup */}
            <div className="relative rounded-2xl bg-white p-2 shadow-2xl">
              {/* Browser top bar */}
              <div className="flex items-center gap-2 rounded-t-xl bg-neutral-100 p-2.5 dark:bg-neutral-800">
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-red-400" />
                  <span className="h-3 w-3 rounded-full bg-yellow-400" />
                  <span className="h-3 w-3 rounded-full bg-green-400" />
                </div>
                <span className="ml-2 text-xs text-neutral-500 dark:text-neutral-400">
                  mystore.atlas.com
                </span>
                <span className="ml-auto rounded-md bg-brand-800 px-2.5 py-1 text-xs font-medium text-white">
                  Launch
                </span>
              </div>

              {/* Store content */}
              <div className="rounded-b-xl bg-white dark:bg-neutral-900">
                <div className="relative h-64 overflow-hidden rounded-b-xl bg-gradient-to-r from-brand-100 to-brand-50 dark:from-brand-900 dark:to-brand-950">
                  {/* Placeholder for actual store hero image */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Image
                      src="/images/ecommerce/store-hero.jpg"
                      alt="E-commerce store preview"
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <p className="text-sm font-semibold text-white">
                      Welcome to My Store
                    </p>
                    <p className="text-xs text-white/80">
                      Explore our latest products
                    </p>
                  </div>
                </div>

                {/* Product thumbnails */}
                <div className="grid grid-cols-4 gap-2 p-3">
                  {["Fashion", "Electronics", "Groceries", "Beauty"].map(
                    (category) => (
                      <div key={category} className="text-center">
                        <div className="relative h-16 w-full overflow-hidden rounded-lg">
                          <Image
                            src={`/images/ecommerce/${category.toLowerCase()}.jpg`}
                            alt={`${category} product`}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <span className="mt-1 block text-[10px] text-neutral-700 dark:text-neutral-300">
                          {category}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -right-4 -top-4 rounded-xl bg-accent-500 px-4 py-2 text-sm font-semibold text-white shadow-lg">
              Launch in Minutes
            </div>

            {/* Floating stat card */}
            <div className="absolute -left-4 bottom-6 rounded-xl bg-white p-3 shadow-lg dark:bg-neutral-900">
              <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                100+ Templates
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                Ready to customize
              </div>
            </div>
          </div>
        </div>
      </AtlasContainer>
    </section>
  );
}