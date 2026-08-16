/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";
import { AtlasContainer, AtlasSection, AtlasGrid, AtlasCard } from "@/components/atlas";

const categories = [
  {
    title: "Customer Help",
    description: "Guides for buying airtime, data, electricity, and more.",
    icon: "📘",
    href: "/resources/customer-help",
  },
  {
    title: "Reseller Resources",
    description: "Learn how to grow your reseller business.",
    icon: "📈",
    href: "/resources/reseller",
  },
  {
    title: "Developer Docs",
    description: "API documentation and integration guides.",
    icon: "💻",
    href: "/resources/developer",
  },
  {
    title: "Support Centre",
    description: "Contact support and find answers to common questions.",
    icon: "🎧",
    href: "/support",
  },
];

const popularArticles = [
  "How to buy airtime on Atlas",
  "How to fund your Atlas wallet",
  "Understanding transaction statuses",
  "How to become a reseller",
  "Setting up your e-commerce store",
];

export default function ResourcesPage() {
  return (
    <>
      {/* Hero */}
      <AtlasSection size="lg" className="bg-white dark:bg-neutral-950">
        <AtlasContainer>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl dark:text-neutral-100">
              Guides and resources to help you get the most from Atlas.
            </h1>
            <p className="mt-6 text-lg text-neutral-600 dark:text-neutral-400">
              Whether you're a customer, reseller, or developer, find the help
              you need here.
            </p>
          </div>
        </AtlasContainer>
      </AtlasSection>

      {/* Categories */}
      <AtlasSection size="lg" className="bg-neutral-50 dark:bg-neutral-900">
        <AtlasContainer>
          <AtlasGrid cols={4} gap={6}>
            {categories.map((category) => (
              <Link
                key={category.title}
                href={category.href}
                className="group block rounded-lg border border-neutral-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-950"
              >
                <div className="mb-4 text-4xl">{category.icon}</div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  {category.title}
                </h3>
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                  {category.description}
                </p>
              </Link>
            ))}
          </AtlasGrid>
        </AtlasContainer>
      </AtlasSection>

      {/* Popular articles */}
      <AtlasSection size="lg" className="bg-white dark:bg-neutral-950">
        <AtlasContainer>
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              Popular articles
            </h2>
          </div>
          <div className="mx-auto max-w-3xl space-y-3">
            {popularArticles.map((article) => (
              <Link
                key={article}
                href="#"
                className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 p-4 transition-colors hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800"
              >
                <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                  {article}
                </span>
                <svg className="h-4 w-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </AtlasContainer>
      </AtlasSection>

      {/* Final CTA */}
      <AtlasSection size="lg" className="bg-brand-900 dark:bg-brand-950">
        <AtlasContainer>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-white">
              Need more help?
            </h2>
            <p className="mt-4 text-lg text-brand-200">
              Our support team is ready to assist you.
            </p>
            <div className="mt-8">
              <Link
                href="/support"
                className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3 text-base font-medium text-brand-900 transition-colors hover:bg-brand-50"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </AtlasContainer>
      </AtlasSection>
    </>
  );
}