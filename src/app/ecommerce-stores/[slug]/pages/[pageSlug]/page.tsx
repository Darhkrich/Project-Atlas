"use client";

import { use } from "react";
import Link from "next/link";
import { StorefrontLayout } from "@/components/storefront/storefront-layout";
import { StoreNotFound } from "@/components/storefront/shared/store-not-found";
import { usePublicStore } from "@/lib/public-store-bridge";
import { usePages } from "@/lib/merchant/storefront/pages/use-pages";
import type {
  CustomPage,
  MerchantStorefrontConfig,
} from "@/types/merchant-storefront";

interface CustomPageBodyProps {
  store: MerchantStorefrontConfig;
  page: CustomPage;
}

function CustomPageBody({ store, page }: CustomPageBodyProps) {
  const paragraphs = page.body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <nav
        aria-label="Breadcrumb"
        className="text-sm text-neutral-500 dark:text-neutral-400"
      >
        <Link
          href={`/ecommerce-stores/${store.slug}`}
          className="underline-offset-4 hover:underline"
        >
          Home
        </Link>
        <span aria-hidden="true" className="mx-2">
          /
        </span>
        <span>{page.title}</span>
      </nav>

      <h1 className="mt-6 text-3xl font-bold tracking-tight text-neutral-950 dark:text-neutral-100 sm:text-4xl">
        {page.title}
      </h1>

      {paragraphs.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-neutral-300 p-8 text-center dark:border-neutral-700">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            This page has no content yet.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {paragraphs.map((paragraph, index) => (
            <p
              key={index}
              className="whitespace-pre-line text-base leading-7 text-neutral-700 dark:text-neutral-300"
            >
              {paragraph}
            </p>
          ))}
        </div>
      )}

      <Link
        href={`/ecommerce-stores/${store.slug}`}
        className="mt-10 inline-flex items-center gap-2 text-sm font-medium text-neutral-500 underline-offset-4 hover:underline dark:text-neutral-400"
      >
        <span aria-hidden="true">{"\u2190"}</span>
        Back to {store.storeName}
      </Link>
    </div>
  );
}

export default function CustomPageRoute({
  params,
}: {
  params: Promise<{ slug: string; pageSlug: string }>;
}) {
  const { slug, pageSlug } = use(params);
  const entry = usePublicStore(slug);

  // Hooks must be called unconditionally. When there is no entry, the
  // pages hook gets an empty id and returns an empty array.
  const storefrontId = entry?.store.storefrontId ?? "";
  const { pages } = usePages(storefrontId);

  if (!entry) {
    return <StoreNotFound variant="store" />;
  }

  const page = pages.find(
    (p) => p.slug === pageSlug && p.published === true
  );

  if (!page) {
    return (
      <StorefrontLayout store={entry.store}>
        <StoreNotFound variant="page" />
      </StorefrontLayout>
    );
  }

  return (
    <StorefrontLayout store={entry.store}>
      <CustomPageBody store={entry.store} page={page} />
    </StorefrontLayout>
  );
}