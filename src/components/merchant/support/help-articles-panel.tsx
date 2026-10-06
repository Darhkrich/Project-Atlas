"use client";

import { useMemo, useState } from "react";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";

interface HelpArticle {
  id: string;
  title: string;
  content: string;
}

const HELP_ARTICLES: HelpArticle[] = [
  {
    id: "article1",
    title: "How to add a product",
    content:
      "Open Products, then Add product. Fill in the name, description, price, and upload an image. The SKU generates automatically when the product is Active. Set the stock level so low-stock alerts work.",
  },
  {
    id: "article2",
    title: "How to customize your store",
    content:
      "Open Storefront. In Branding, change your store name, tagline, logo, and hero. In Appearance, choose a theme, colours, and font. Changes autosave and show in the preview.",
  },
  {
    id: "article3",
    title: "How to process orders",
    content:
      "Open Orders. New orders sit at the top. Click one to open the details. Update the status (Processing, Shipped, Delivered), or add a tracking number when you ship. The customer sees the update.",
  },
  {
    id: "article4",
    title: "How to manage customers",
    content:
      "Open Customers. Search by name, email, phone, or order number. Click a customer to see their order history and lifetime spend. You can email or call from the detail page.",
  },
  {
    id: "article5",
    title: "How to change your subscription",
    content:
      "Open Billing. Pick a plan and cycle (monthly or annual), then Switch plan. Plan features activate as soon as payment succeeds.",
  },
  {
    id: "article6",
    title: "How to enable Cash on Delivery",
    content:
      "Open Storefront, then Settings. Turn on Cash on Delivery and set the maximum order value if you want. Save. Customers now see COD at checkout.",
  },
  {
    id: "article7",
    title: "How to add VAT to my orders",
    content:
      "Open Storefront, then Settings. Set the tax percent and choose whether prices include tax. Every new order calculates VAT at checkout.",
  },
];

export function HelpArticlesPanel() {
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (term.length === 0) return HELP_ARTICLES;
    return HELP_ARTICLES.filter(
      (a) =>
        a.title.toLowerCase().includes(term) ||
        a.content.toLowerCase().includes(term)
    );
  }, [search]);

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      aria-labelledby="help-articles-heading"
      className="rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
    >
      <div className="flex flex-col gap-3 border-b border-neutral-200 px-4 py-4 dark:border-neutral-800 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="min-w-0">
          <h2
            id="help-articles-heading"
            className="text-sm font-semibold text-neutral-900 dark:text-neutral-100"
          >
            Help articles
          </h2>
          <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
            Answers to common questions.
          </p>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <label htmlFor="help-article-search" className="sr-only">
            Search help articles
          </label>
          <AtlasIcon
            name="search"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
            aria-hidden="true"
          />
          <input
            id="help-article-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search help articles..."
            className="w-full rounded-lg border border-neutral-300 bg-white py-2 pl-9 pr-3 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder-neutral-500"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-neutral-500 dark:text-neutral-400 sm:px-6">
          No articles match your search.
        </p>
      ) : (
        <ul
          role="list"
          className="divide-y divide-neutral-100 dark:divide-neutral-800"
        >
          {filtered.map((article) => {
            const isOpen = openId === article.id;
            return (
              <li key={article.id}>
                <button
                  type="button"
                  onClick={() => toggle(article.id)}
                  aria-expanded={isOpen}
                  aria-controls={"help-article-" + article.id}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/40 sm:px-6"
                >
                  <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {article.title}
                  </span>
                  <AtlasIcon
                    name={isOpen ? "chevron-up" : "chevron-down"}
                    className={cn(
                      "h-4 w-4 shrink-0 text-neutral-400 transition-transform"
                    )}
                    aria-hidden="true"
                  />
                </button>
                {isOpen && (
                  <div
                    id={"help-article-" + article.id}
                    className="px-4 pb-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400 sm:px-6"
                  >
                    {article.content}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}