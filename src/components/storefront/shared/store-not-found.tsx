import Link from "next/link";

interface StoreNotFoundProps {
  variant?: "store" | "product" | "page";
}

const COPY: Record<
  NonNullable<StoreNotFoundProps["variant"]>,
  { title: string; body: string }
> = {
  store: {
    title: "Store not found",
    body: "This storefront does not exist or is not yet live.",
  },
  product: {
    title: "Product not found",
    body: "This product is no longer available.",
  },
  page: {
    title: "Page not found",
    body: "This page does not exist or is not published yet.",
  },
};

export function StoreNotFound({ variant = "store" }: StoreNotFoundProps) {
  const copy = COPY[variant];

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          {copy.title}
        </h1>
        <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
          {copy.body}
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-md border border-neutral-300 bg-white px-5 py-2.5 text-sm font-medium text-neutral-900 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
        >
          Return home
        </Link>
      </div>
    </div>
  );
}