import Link from "next/link";
import { AtlasNavbar } from "@/components/landing/AtlasNavbar";
import {
  AtlasContainer,
  AtlasSection,
  AtlasGrid,
} from "@/components/atlas";
import { AtlasFooter } from "@/components/atlas/atlas-footer";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";

export const metadata = {
  title: "Help & Support — Atlas",
  description:
    "Find answers, troubleshoot issues, or contact the Atlas support team.",
};

const categories: {
  title: string;
  description: string;
  icon: AtlasIconName;
  borderClass: string;
}[] = [
  {
    title: "Account & Profile",
    description: "Manage your account, password, profile and security.",
    icon: "user",
    borderClass: "border-t-brand-600",
  },
  {
    title: "Payments & Wallet",
    description: "Wallet funding, payment methods, charges and payment issues.",
    icon: "wallet",
    borderClass: "border-t-accent-500",
  },
  {
    title: "Services & Orders",
    description: "Airtime, data, electricity, TV and other services.",
    icon: "grid",
    borderClass: "border-t-green-600",
  },
  {
    title: "Transactions",
    description: "Track purchases, transaction status and order history.",
    icon: "receipt",
    borderClass: "border-t-blue-600",
  },
  {
    title: "Reseller & Storefront",
    description: "Questions about reseller accounts, storefronts and selling services.",
    icon: "store",
    borderClass: "border-t-purple-600",
  },
  {
    title: "E-commerce & Store Owner",
    description: "Help with your white-label online store and selling online.",
    icon: "bag",
    borderClass: "border-t-orange-500",
  },
  {
    title: "Troubleshooting",
    description: "Find solutions to common service and transaction problems.",
    icon: "settings",
    borderClass: "border-t-neutral-600",
  },
];

const popularArticles = [
  "How to buy a data bundle",
  "How to fund your Atlas wallet",
  "What happens when a transaction is pending?",
  "What should I do if my service was not delivered?",
  "How to view transaction history",
  "How to update my account information",
  "How to become an Atlas reseller",
  "How to customize my reseller storefront",
  "How to set up your e-commerce store",
  "Managing products in your online store",
];

export default function SupportPage() {
  return (
    <>
      <AtlasNavbar />

      {/* Support Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-neutral-50 py-16 md:py-20 dark:from-neutral-950 dark:to-neutral-900">
        {/* Dot pattern */}
        <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.08]">
          <svg className="h-full w-full" viewBox="0 0 100 100" fill="none">
            <circle cx="10" cy="10" r="1" fill="currentColor" />
            <circle cx="50" cy="30" r="1" fill="currentColor" />
            <circle cx="90" cy="50" r="1" fill="currentColor" />
            <circle cx="20" cy="80" r="1" fill="currentColor" />
            <circle cx="70" cy="20" r="1" fill="currentColor" />
          </svg>
        </div>

        <AtlasContainer className="relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 md:text-5xl">
              How can we help?
            </h1>
            <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
              Find answers, troubleshoot an issue, or contact the Atlas support team.
            </p>

            {/* Search */}
            <div className="mx-auto mt-8 max-w-xl">
              <div className="relative">
                <AtlasIcon
                  name="search"
                  className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400"
                />
                <input
                  type="search"
                  placeholder="Search help articles..."
                  className="w-full rounded-full border border-neutral-300 bg-white py-3 pl-12 pr-4 text-base text-neutral-900 placeholder-neutral-500 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder-neutral-400"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-2 text-sm">
              <span className="text-neutral-500 dark:text-neutral-400">Popular searches:</span>
              {[
                "My payment has not reflected",
                "My data bundle has not arrived",
                "How do I fund my wallet?",
                "How do I check my transaction?",
                "I was charged but my order failed",
              ].map((search) => (
                <button
                  key={search}
                  className="rounded-full bg-neutral-100 px-3 py-1 text-neutral-600 transition-colors hover:bg-brand-100 hover:text-brand-800 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-brand-900/40 dark:hover:text-brand-300"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        </AtlasContainer>
      </section>

      {/* Quick Support Categories */}
      <AtlasSection size="lg" className="bg-white dark:bg-neutral-950">
        <AtlasContainer>
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              How can we help you?
            </h2>
          </div>
          <AtlasGrid cols={3} gap={6}>
            {categories.map((category) => (
              <Link
                key={category.title}
                href="#"
                className={`group rounded-xl border border-neutral-200 border-t-4 ${category.borderClass} bg-neutral-50 p-6 transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900`}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-300">
                  <AtlasIcon name={category.icon} className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  {category.title}
                </h3>
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                  {category.description}
                </p>
                <span className="mt-4 inline-flex items-center text-sm font-medium text-brand-800 dark:text-brand-300">
                  Explore
                  <AtlasIcon name="arrow-right" className="ml-1 h-4 w-4" />
                </span>
              </Link>
            ))}
          </AtlasGrid>
        </AtlasContainer>
      </AtlasSection>

      {/* Popular Help Articles */}
      <AtlasSection size="lg" className="bg-neutral-50 dark:bg-neutral-900">
        <AtlasContainer>
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              Popular help topics
            </h2>
          </div>
          <div className="mx-auto max-w-3xl divide-y divide-neutral-200 dark:divide-neutral-800">
            {popularArticles.map((article) => (
              <Link
                key={article}
                href="#"
                className="flex items-center justify-between py-4 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <span className="text-base font-medium text-neutral-800 dark:text-neutral-200">
                  {article}
                </span>
                <AtlasIcon name="arrow-right" className="h-4 w-4 text-neutral-400" />
              </Link>
            ))}
          </div>
        </AtlasContainer>
      </AtlasSection>

      {/* Transaction Problem CTA */}
      <AtlasSection size="lg" className="bg-white dark:bg-neutral-950">
        <AtlasContainer>
          <div className="mx-auto max-w-4xl rounded-2xl bg-brand-900 p-8 text-center dark:bg-brand-950">
            <h2 className="text-3xl font-semibold tracking-tight text-white">
              Having a problem with a transaction?
            </h2>
            <p className="mt-4 text-lg text-brand-200">
              Check your transaction status or contact support if your service has not been delivered.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/transactions"
                className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3 text-base font-semibold text-brand-900 hover:bg-brand-50"
              >
                View My Transactions
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full border border-white/30 px-7 py-3 text-base font-medium text-white hover:bg-white/10"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </AtlasContainer>
      </AtlasSection>

      {/* Final CTA */}
      <AtlasSection size="lg" className="bg-neutral-50 dark:bg-neutral-900">
        <AtlasContainer>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              Still need help?
            </h2>
            <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
              Our support team is available to help you resolve account, payment and service issues.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full bg-brand-800 px-7 py-3 text-base font-semibold text-white hover:bg-brand-900"
              >
                Contact Support
              </Link>
              <Link
                href="#"
                className="inline-flex items-center justify-center rounded-full border border-neutral-300 bg-white px-7 py-3 text-base font-medium text-neutral-900 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-transparent dark:text-neutral-100 dark:hover:bg-neutral-800"
              >
                Browse Help Articles
              </Link>
            </div>
          </div>
        </AtlasContainer>
      </AtlasSection>

      <AtlasFooter />
    </>
  );
}