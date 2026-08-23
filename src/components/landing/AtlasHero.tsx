/* eslint-disable @next/next/no-html-link-for-pages */
import { AtlasContainer } from "@/components/atlas/atlas-container";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { HeroPhone } from "./HeroPhone";
import { HeroDashboardCard } from "./HeroDashboardCard";
import { HeroResellerCard } from "./HeroResellerCard";
import { HeroApiCard } from "./HeroApiCard";

const trustFeatures: {
  icon: AtlasIconName;
  title: string;
  subtitle: string;
}[] = [
  { icon: "shield", title: "Secure", subtitle: "& Reliable" },
  { icon: "zap", title: "Instant", subtitle: "Delivery" },
  { icon: "headphones", title: "24/7", subtitle: "Support" },
  { icon: "tag", title: "Best", subtitle: "Rates" },
];

export function AtlasHero() {
  return (
    <section className="relative overflow-hidden bg-[#FCFCFB] py-20 md:py-24 lg:py-28 dark:bg-neutral-950">
      {/* Subtle world map pattern */}
      <div
        className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23003D2E' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <AtlasContainer className="relative z-10">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Left */}
          <div className="max-w-[540px]">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-1.5 text-sm text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
              <span className="h-2 w-2 rounded-full bg-[#003D2E] dark:bg-brand-300" />
              Your all-in-one digital services platform
            </div>

            <h1 className="text-[44px] leading-[1.05] tracking-[-0.04em] font-bold text-neutral-900 md:text-[52px] lg:text-[56px] dark:text-neutral-100">
              One Platform.
              <span className="block text-[#003D2E] dark:text-brand-300">
                Every Service.
              </span>
              Endless Possibilities.
            </h1>

            <p className="mt-6 max-w-[480px] text-base leading-relaxed text-neutral-600 md:text-lg dark:text-neutral-400">
              Atlas makes it simple to buy digital services, run your business,
              and grow your income — all in one secure platform.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="/sign-up"
                className="inline-flex items-center justify-center rounded-lg bg-[#003D2E] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#004B3B] dark:bg-brand-800 dark:hover:bg-brand-700"
              >
                Get started
                <AtlasIcon name="arrow-right" className="ml-2 h-4 w-4" />
              </a>
              <a
                href="/services"
                className="inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white px-6 py-3 text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
              >
                Explore services
              </a>
            </div>

            {/* Trust features */}
            <div className="mt-10 grid grid-cols-4 gap-x-8 gap-y-6 sm:grid-cols-4">
              {trustFeatures.map((item) => (
                <div key={item.icon} className="flex flex-col items-start">
                  <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#EAF3EF] text-[#003D2E] dark:bg-brand-900/40 dark:text-brand-300">
                    <AtlasIcon name={item.icon} className="h-4 w-4" />
                  </div>
                  <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    {item.title}
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">
                    {item.subtitle}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right visual cluster */}
          <div className="relative mx-auto h-[500px] w-full max-w-[500px] lg:h-[550px] lg:max-w-none">
            <HeroPhone />
            <HeroDashboardCard />
            <HeroResellerCard />
            <HeroApiCard />
          </div>
        </div>
      </AtlasContainer>

      {/* Bottom curves */}
      <div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden">
        <svg
          className="w-full"
          viewBox="0 0 1440 100"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M0,100 L0,80 Q360,0 720,60 T1440,60 L1440,100 Z"
            fill="#FCFCFB"
            opacity="0.5"
            className="dark:fill-neutral-950"
          />
        </svg>
      </div>
    </section>
  );
}