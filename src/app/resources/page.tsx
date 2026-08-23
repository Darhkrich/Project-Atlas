"use client";

import { useState } from "react";
import Link from "next/link";
import { AtlasNavbar } from "@/components/landing/AtlasNavbar";
import { AtlasContainer, AtlasSection } from "@/components/atlas";
import { AtlasFooter } from "@/components/atlas/atlas-footer";
import { ResourceSearch, type ResourceItem } from "@/components/resources/ResourceSearch";
import { ResourceModal } from "@/components/resources/ResourceModal";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";

const categories: ResourceItem[] = [
  {
    id: "customer-help",
    title: "Customer Help",
    category: "Category",
    icon: "headphones",
    content:
      "Get help with buying airtime, data, electricity, and more. Learn how to manage your wallet, track transactions, and resolve common issues.",
  },
  {
    id: "reseller-resources",
    title: "Reseller Resources",
    category: "Category",
    icon: "store",
    content:
      "Resources to help you grow your reseller business: setting up your storefront, earning commissions, and managing customers.",
  },
  {
    id: "store-owner",
    title: "Store Owner Guides",
    category: "Category",
    icon: "bag",
    content:
      "Learn how to set up and customize your white-label e-commerce store, add products, and start selling.",
  },
  {
    id: "developer",
    title: "Developer Docs",
    category: "Category",
    icon: "code",
    content:
      "API documentation, SDKs, and integration guides to build Atlas services into your own applications.",
  },
];

const articles: ResourceItem[] = [
  {
    id: "buy-airtime",
    title: "How to buy airtime on Atlas",
    category: "Customer Help",
    icon: "phone",
    content:
      "1. Open the Services page and select Airtime. 2. Choose a network and amount. 3. Enter the recipient phone number. 4. Review and confirm your purchase.",
  },
  {
    id: "fund-wallet",
    title: "How to fund your Atlas wallet",
    category: "Customer Help",
    icon: "wallet",
    content:
      "You can add money to your Atlas wallet using mobile money, bank card, or bank transfer. Go to Wallet > Fund Wallet and follow the steps.",
  },
  {
    id: "transaction-statuses",
    title: "Understanding transaction statuses",
    category: "Customer Help",
    icon: "clock",
    content:
      "Transactions can have different statuses: Processing, Successful, Pending, Failed, or Cancelled. Each status tells you what is happening with your order.",
  },
  {
    id: "become-reseller",
    title: "How to become a reseller",
    category: "Reseller Resources",
    icon: "store",
    content:
      "Sign up as a reseller, customize your storefront, choose services to sell, and share your unique store link with customers to start earning.",
  },
  {
    id: "setup-store",
    title: "Setting up your e-commerce store",
    category: "Store Owner",
    icon: "bag",
    content:
      "Pick a template, customize your branding, add products, and publish your store. No coding needed.",
  },
  {
    id: "api-getting-started",
    title: "Getting started with the Atlas API",
    category: "Developer",
    icon: "code",
    content:
      "Use the Atlas REST API to create transactions, check balances, and manage services. Check the API documentation for endpoints and authentication.",
  },
];

const learningItems: ResourceItem[] = [
  {
    id: "blog",
    title: "Atlas Blog",
    category: "Resource",
    icon: "file-text",
    content: "Product updates, tips, and industry news.",
  },
  {
    id: "faq",
    title: "FAQ",
    category: "Resource",
    icon: "help-circle",
    content: "Answers to common questions.",
  },
  {
    id: "community",
    title: "Community",
    category: "Resource",
    icon: "users",
    content: "Connect with other Atlas users.",
  },
];

export default function ResourcesPage() {
  const [selectedItem, setSelectedItem] = useState<ResourceItem | null>(null);

  return (
    <>
      <AtlasNavbar />

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-neutral-50 py-20 md:py-24 dark:from-neutral-950 dark:to-neutral-900">
        <div className="absolute inset-0 opacity-[0.04]">
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
            <span className="inline-flex items-center rounded-full bg-brand-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-800 dark:bg-brand-900 dark:text-brand-300">
              Help & Resources
            </span>
            <h1 className="mt-5 text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              How can we help you?
            </h1>
            <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
              Find guides, articles, and documentation to get the most from
              Atlas — whether you&apos;re a customer, reseller, or developer.
            </p>
          </div>
          <div className="mt-10">
            <ResourceSearch items={articles} onSelect={setSelectedItem} />
          </div>
        </AtlasContainer>
      </section>

      {/* CATEGORIES */}
      <AtlasSection size="lg" className="bg-white dark:bg-neutral-950">
        <AtlasContainer>
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              Browse by category
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedItem(category)}
                className="group rounded-xl border border-neutral-200 border-t-4 border-t-brand-600 bg-white p-6 text-left transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-950"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-900/30">
                  <AtlasIcon
                    name={category.icon as AtlasIconName}
                    className="h-6 w-6 text-brand-800 dark:text-brand-300"
                  />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  {category.title}
                </h3>
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                  {category.content}
                </p>
              </button>
            ))}
          </div>
        </AtlasContainer>
      </AtlasSection>

      {/* POPULAR ARTICLES */}
      <AtlasSection size="lg" className="bg-neutral-50 dark:bg-neutral-900">
        <AtlasContainer>
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              Popular articles
            </h2>
            <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
              Quick answers to common questions.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <button
                key={article.id}
                onClick={() => setSelectedItem(article)}
                className="group rounded-xl border border-neutral-200 bg-white p-6 text-left transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-950"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-900/40">
                  <AtlasIcon
                    name={article.icon as AtlasIconName}
                    className="h-5 w-5 text-brand-800 dark:text-brand-300"
                  />
                </div>
                <span className="inline-block rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                  {article.category}
                </span>
                <h3 className="mt-3 text-lg font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-brand-800 dark:group-hover:text-brand-300">
                  {article.title}
                </h3>
              </button>
            ))}
          </div>
        </AtlasContainer>
      </AtlasSection>

      {/* DEVELOPER API SECTION */}
      <AtlasSection size="lg" className="bg-white dark:bg-neutral-950">
        <AtlasContainer>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                Build with the Atlas API
              </h2>
              <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
                Integrate Atlas services into your own applications with our
                powerful REST API. Get started in minutes.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Simple REST endpoints",
                  "Webhook support",
                  "Real-time transaction status",
                  "Comprehensive documentation",
                ].map((point) => (
                  <li key={point} className="flex items-center gap-3">
                    <AtlasIcon
                      name="check"
                      className="h-5 w-5 text-success-600 dark:text-success-400"
                    />
                    <span className="text-neutral-700 dark:text-neutral-300">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap gap-4">
                <button
                  onClick={() =>
                    setSelectedItem({
                      id: "api-docs",
                      title: "API Documentation",
                      category: "Developer",
                      icon: "code",
                      content:
                        "Full API reference and integration guides will appear here.",
                    })
                  }
                  className="inline-flex items-center justify-center rounded-full bg-brand-800 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-900"
                >
                  View API Documentation
                </button>
                <button
                  onClick={() =>
                    setSelectedItem({
                      id: "quickstart",
                      title: "Quickstart Guide",
                      category: "Developer",
                      icon: "zap",
                      content:
                        "Follow the quickstart guide to make your first API call.",
                    })
                  }
                  className="inline-flex items-center justify-center rounded-full border border-neutral-300 bg-white px-6 py-3 text-sm font-medium text-neutral-900 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-transparent dark:text-neutral-100 dark:hover:bg-neutral-800"
                >
                  Quickstart Guide
                </button>
              </div>
            </div>
            {/* Code snippet */}
            <div className="rounded-xl bg-neutral-900 p-4 font-mono text-sm text-neutral-100 shadow-lg">
              <div className="flex items-center gap-2 border-b border-neutral-700 pb-2 mb-2">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-yellow-400" />
                <span className="h-3 w-3 rounded-full bg-green-400" />
                <span className="ml-2 text-xs text-neutral-400">
                  api.atlas.com
                </span>
              </div>
              <pre className="overflow-x-auto">
                <code>{`POST /v1/transactions
Content-Type: application/json

{
  "service": "airtime",
  "network": "MTN",
  "phone": "0241234567",
  "amount": 20.00
}

→ 201 Created
{
  "id": "tx_123456",
  "status": "processing"
}`}</code>
              </pre>
            </div>
          </div>
        </AtlasContainer>
      </AtlasSection>

      {/* MORE WAYS TO LEARN */}
      <AtlasSection size="lg" className="bg-neutral-50 dark:bg-neutral-900">
        <AtlasContainer>
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              More ways to learn
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {learningItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="rounded-xl border border-neutral-200 bg-white p-6 text-center transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-950"
              >
                <div className="mb-4 flex justify-center">
                  <AtlasIcon
                    name={item.icon as AtlasIconName}
                    className="h-8 w-8 text-brand-800 dark:text-brand-300"
                  />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                  {item.content}
                </p>
              </button>
            ))}
          </div>
        </AtlasContainer>
      </AtlasSection>

      {/* SUPPORT CTA */}
      <AtlasSection size="lg" className="bg-white dark:bg-neutral-950">
        <AtlasContainer>
          <div className="mx-auto max-w-4xl rounded-2xl border border-neutral-200 bg-neutral-50 p-8 text-center dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              Still need help?
            </h2>
            <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
              Our support team is available to assist you with any questions.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/support"
                className="inline-flex items-center justify-center rounded-full bg-brand-800 px-7 py-3 text-base font-semibold text-white hover:bg-brand-900"
              >
                Contact Support
              </Link>
              <Link
                href="/contact-sales"
                className="inline-flex items-center justify-center rounded-full border border-neutral-300 bg-white px-7 py-3 text-base font-medium text-neutral-900 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-transparent dark:text-neutral-100 dark:hover:bg-neutral-800"
              >
                Talk to Sales
              </Link>
            </div>
          </div>
        </AtlasContainer>
      </AtlasSection>

      <AtlasFooter />

      {/* MODAL */}
      <ResourceModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </>
  );
}