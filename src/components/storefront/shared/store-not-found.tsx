import Link from "next/link";

interface StoreNotFoundProps {
  variant?: "store" | "product";
}

export function StoreNotFound({ variant = "store" }: StoreNotFoundProps) {
  const title = variant === "store" ? "Store not found" : "Product not found";
  const body =
    variant === "store"
      ? "This storefront does not exist or is not yet live."
      : "This product is no longer available.";

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          {title}
        </h1>
        <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
          {body}
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