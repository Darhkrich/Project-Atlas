import Link from "next/link";

interface CategoryChipsProps {
  storeSlug: string;
  categories: string[];
}

export function CategoryChips({ storeSlug, categories }: CategoryChipsProps) {
  return (
    <section className="border-b border-neutral-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold text-neutral-950">Browse:</span>
          {categories.map((cat) => (
            <Link
              key={cat}
              href={`/ecommerce-stores/${storeSlug}/products?category=${encodeURIComponent(cat)}`}
              className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-300 hover:bg-neutral-50"
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}