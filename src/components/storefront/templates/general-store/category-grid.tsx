import Link from "next/link";
import Image from "next/image";
import type { MerchantStorefrontConfig } from "@/types/merchant-storefront";

interface CategoryGridProps {
  store: MerchantStorefrontConfig;
  categories: { name: string; image: string }[];
}

export function CategoryGrid({ store, categories }: CategoryGridProps) {
  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl">Shop by Category</h2>
          <p className="mt-2 text-sm text-neutral-500">Explore our curated collections</p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={`/ecommerce-stores/${store.slug}/products?category=${encodeURIComponent(cat.name)}`}
              className="group relative overflow-hidden rounded-2xl"
            >
              <div className="aspect-square bg-neutral-200">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-black/30 flex items-end p-4">
                <span className="text-white font-semibold text-lg">{cat.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}