import Link from "next/link";
import type { MerchantStorefrontConfig } from "@/types/merchant-storefront";

interface StorefrontPolicyPageProps {
  store: MerchantStorefrontConfig;
  title: string;
  body: string;
}

export function StorefrontPolicyPage({
  store,
  title,
  body,
}: StorefrontPolicyPageProps) {
  const hasBody = body.trim().length > 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <nav
        aria-label="Breadcrumb"
        className="text-sm text-neutral-500"
      >
        <Link
          href={`/ecommerce-stores/${store.slug}`}
          className="hover:text-neutral-900"
        >
          Home
        </Link>
        <span aria-hidden="true" className="mx-2">
          /
        </span>
        <span className="text-neutral-900">{title}</span>
      </nav>

      <h1 className="mt-6 text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">
        {title}
      </h1>

      {hasBody ? (
        <div className="mt-6 whitespace-pre-line text-base leading-7 text-neutral-700">
          {body}
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center">
          <p className="text-sm text-neutral-600">
            This store has not published a {title.toLowerCase()} yet.
          </p>
        </div>
      )}

      <Link
        href={`/ecommerce-stores/${store.slug}`}
        className="mt-10 inline-flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-neutral-900"
      >
        <span aria-hidden="true">{"\u2190"}</span>
        Back to {store.storeName}
      </Link>
    </div>
  );
}