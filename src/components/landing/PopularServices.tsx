/* eslint-disable @next/next/no-html-link-for-pages */
import { AtlasContainer } from "@/components/atlas/atlas-container";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";

const services: {
  name: string;
  description: string;
  icon: AtlasIconName;
  bg: string;
  text: string;
}[] = [
  {
    name: "Airtime",
    description: "Top up all networks instantly.",
    icon: "phone",
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
    text: "text-yellow-600 dark:text-yellow-400",
  },
  {
    name: "Mobile Data",
    description: "Buy data bundles at the best rates.",
    icon: "globe",
    bg: "bg-green-50 dark:bg-green-900/20",
    text: "text-green-600 dark:text-green-400",
  },
  {
    name: "ECG / Electricity",
    description: "Pay your electricity bills with ease.",
    icon: "zap",
    bg: "bg-orange-50 dark:bg-orange-900/20",
    text: "text-orange-600 dark:text-orange-400",
  },
  {
    name: "Results Checker",
    description: "Check exam results quickly and easily.",
    icon: "graduation",
    bg: "bg-purple-50 dark:bg-purple-900/20",
    text: "text-purple-600 dark:text-purple-400",
  },
  {
    name: "TV Subscriptions",
    description: "DSTV, GOtv and more coming soon.",
    icon: "tv",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    text: "text-blue-600 dark:text-blue-400",
  },
  {
    name: "More Services",
    description: "More digital services coming your way.",
    icon: "grid",
    bg: "bg-neutral-100 dark:bg-neutral-800",
    text: "text-neutral-600 dark:text-neutral-400",
  },
];

export function PopularServices() {
  return (
    <section className="py-16 md:py-20 dark:bg-neutral-950">
      <AtlasContainer>
        <div className="rounded-xl border border-neutral-200 bg-white p-6 md:p-10 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="text-center">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#003D2E] dark:text-brand-300">
              Popular Services
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Everything you need, in one place
            </h2>
            <p className="mt-3 text-neutral-600 dark:text-neutral-400">
              Fast, secure and reliable digital services
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {services.map((service) => (
              <div
                key={service.name}
                className="flex flex-col items-center rounded-lg border border-neutral-100 bg-white p-4 text-center transition-transform hover:-translate-y-1 hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-950"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${service.bg} ${service.text}`}
                >
                  <AtlasIcon name={service.icon} className="h-5 w-5" />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  {service.name}
                </h3>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  {service.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <a
              href="/services"
              className="inline-flex items-center justify-center rounded-lg border border-neutral-300 px-5 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              View all services
            </a>
          </div>
        </div>
      </AtlasContainer>
    </section>
  );
}