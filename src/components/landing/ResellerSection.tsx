import Link from "next/link";
import { AtlasContainer } from "@/components/atlas/atlas-container";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";

const checklist = [
  "High Commission Rates",
  "Personalized Storefront",
  "Marketing Tools",
  "Real-time Analytics",
  "Fast Payouts",
];

const recentSales = [
  { service: "Airtime", price: "₵ 50.00", time: "2 mins ago" },
  { service: "Data 50GB", price: "₵ 250.00", time: "10 mins ago" },
  { service: "Electricity", price: "₵ 400.00", time: "25 mins ago" },
  { service: "TV Subscription", price: "₵ 120.00", time: "1 hour ago" },
];

export function ResellerSection() {
  return (
    <section className="py-12 md:py-16 bg-gradient-to-r from-[#04211c] to-[#0d5a49] dark:from-[#04211c] dark:to-[#0a3d32]">
      <AtlasContainer>
        <div className="grid gap-10 lg:grid-cols-[40%_60%] lg:items-center">
          {/* Left column */}
          <div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white">
              Become a Reseller
            </h2>
            <p className="mt-4 text-base lg:text-lg text-brand-100 dark:text-brand-200">
              Start your own digital business with Atlas. Earn commissions,
              grow your customers, and build your future.
            </p>

            {/* Checklist: 2 columns on mobile, single column on desktop */}
            <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {checklist.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15">
                    <AtlasIcon
                      name="check"
                      className="h-4 w-4 text-accent-500"
                    />
                  </span>
                  <span className="text-sm font-medium text-white">{item}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/reseller/signup"
              className="mt-8 inline-flex items-center justify-center rounded-full bg-white px-7 py-3 text-sm font-semibold text-[#0a3d32] transition-colors hover:bg-brand-50"
            >
              Start Your Reseller Business
            </Link>
          </div>

          {/* Right column: UI panels */}
          <div className="grid gap-5 md:grid-cols-3">
            {/* Stat cards - two side-by-side on mobile, stacked on md+ */}
            <div className="grid grid-cols-2 gap-4 md:flex md:flex-col md:gap-5 md:col-span-1">
              <div className="rounded-2xl bg-white p-4 shadow-lg dark:bg-neutral-900">
                <p className="text-xs md:text-sm text-neutral-500 dark:text-neutral-400">
                  Total Sales
                </p>
                <p className="mt-1 text-xl md:text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  ₵ 815,600.00
                </p>
                <div className="mt-2 h-6 md:h-8">
                  <svg className="h-full w-full" viewBox="0 0 100 30" fill="none">
                    <path
                      d="M0 25 L10 20 L20 23 L30 12 L40 15 L50 5 L60 8 L70 3 L80 6 L90 2 L100 4"
                      stroke="#0d5a49"
                      strokeWidth="2"
                      fill="none"
                    />
                  </svg>
                </div>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-lg dark:bg-neutral-900">
                <p className="text-xs md:text-sm text-neutral-500 dark:text-neutral-400">
                  Total Commissions
                </p>
                <p className="mt-1 text-xl md:text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  ₵ 215,450.00
                </p>
                <div className="mt-2 flex items-center gap-1">
                  <AtlasIcon
                    name="trending-up"
                    className="h-4 w-4 text-success-600 dark:text-success-400"
                  />
                  <span className="text-xs md:text-sm text-success-600 dark:text-success-400">
                    ↑ 7%
                  </span>
                </div>
              </div>
            </div>

            {/* Center dashboard card - hidden on mobile, visible md+ */}
            <div className="hidden md:block rounded-2xl bg-white p-4 shadow-lg dark:bg-neutral-900">
              <div className="mb-3 flex items-center gap-2 rounded-lg bg-neutral-100 p-2 dark:bg-neutral-800">
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  mystore.com/jane
                </span>
                <span className="ml-auto rounded-md bg-brand-800 px-2 py-1 text-xs font-medium text-white">
                  Store
                </span>
              </div>

              <div className="rounded-lg bg-gradient-to-r from-brand-800 to-brand-600 p-3 text-white">
                <p className="text-xs text-brand-100">Welcome to my store</p>
                <p className="mt-1 text-base font-semibold">Jane, Welcome Home!</p>
              </div>

              <div className="mt-3">
                <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                  Top Services
                </p>
                <div className="mt-2 grid grid-cols-4 gap-1.5">
                  {["Airtime", "Data", "Electricity", "TV"].map((service) => (
                    <div
                      key={service}
                      className="flex flex-col items-center gap-1 rounded-lg border border-neutral-200 p-1.5 dark:border-neutral-700"
                    >
                      <AtlasIcon
                        name={getServiceIconName(service)}
                        className="h-4 w-4 text-brand-800 dark:text-brand-300"
                      />
                      <span className="text-[10px] text-neutral-700 dark:text-neutral-300">
                        {service}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sales feed - full width on mobile, one column on md+ */}
            <div className="rounded-2xl bg-white p-4 shadow-lg dark:bg-neutral-900">
              <h3 className="text-sm md:text-base font-semibold text-neutral-900 dark:text-neutral-100">
                Recent Sales
              </h3>
              <ul className="mt-2 divide-y divide-neutral-200 dark:divide-neutral-800">
                {recentSales.map((sale) => (
                  <li key={sale.service} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-xs md:text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {sale.service}
                      </p>
                      <p className="text-[10px] md:text-xs text-neutral-500 dark:text-neutral-400">
                        {sale.time}
                      </p>
                    </div>
                    <span className="text-xs md:text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      {sale.price}
                    </span>
                  </li>
                ))}
              </ul>
              <button className="mt-2 w-full text-center text-xs md:text-sm font-medium text-brand-800 dark:text-brand-300 hover:underline">
                View All Sales
              </button>
            </div>
          </div>
        </div>
      </AtlasContainer>
    </section>
  );
}

function getServiceIconName(service: string): AtlasIconName {
  switch (service) {
    case "Airtime":
      return "phone";
    case "Data":
      return "globe";
    case "Electricity":
      return "zap";
    case "TV":
      return "tv";
    default:
      return "grid";
  }
}