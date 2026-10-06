"use client";

import Link from "next/link";
import Image from "next/image";
import { AtlasIcon } from "@/components/atlas/icons";
import { useCart } from "@/contexts/cart-context";
import { getThemeDefinition } from "@/lib/merchant/storefront/themes";
import { productIsInStock } from "@/lib/merchant/storefront/products";
import type {
  MerchantStorefrontConfig,
  MerchantStorefrontProduct,
} from "@/types/merchant-storefront";

interface GeneralStoreProductCardProps {
  product: MerchantStorefrontProduct;
  store: MerchantStorefrontConfig;
}

export function GeneralStoreProductCard({
  product,
  store,
}: GeneralStoreProductCardProps) {
  const theme = getThemeDefinition(store.theme);
  const { addItem } = useCart();

  const inStock = productIsInStock(product);
  const hasVariants = (product.variantGroups?.length ?? 0) > 0;
  const canQuickAdd = inStock && !hasVariants;
  const image = product.images[0];
  const displayPrice = product.salePrice ?? product.price;

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!canQuickAdd) return;
    addItem({
      id: product.id,
      name: product.name,
      price: displayPrice,
      image: image ?? "",
    });
  }

  return (
    <article className="group relative">
      <div
        className="relative overflow-hidden"
        style={{ borderRadius: "var(--atlas-radius-lg)" }}
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-100">
          {image ? (
            <Image
              src={image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`object-cover transition-transform duration-700 ${inStock ? "group-hover:scale-105" : "opacity-60"}`}
            />
          ) : (
            <div className="h-full w-full" aria-hidden="true" />
          )}

          {product.salePrice !== undefined && inStock && (
            <span
              className="absolute left-3 top-3 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white"
              style={{
                backgroundColor: store.accentColor,
                borderRadius: "var(--atlas-radius-sm)",
              }}
            >
              Sale
            </span>
          )}

          {!inStock && (
            <span className="absolute inset-0 flex items-center justify-center bg-white/50 text-xs font-semibold uppercase tracking-wider backdrop-blur-[2px] dark:bg-neutral-950/50">
              Out of stock
            </span>
          )}

          {canQuickAdd && (
            <button
              type="button"
              onClick={handleQuickAdd}
              className="absolute bottom-3 right-3 inline-flex h-10 w-10 items-center justify-center bg-white text-neutral-900 shadow-lg transition-all hover:scale-105 dark:bg-neutral-900 dark:text-neutral-100"
              style={{ borderRadius: "var(--atlas-radius-full)" }}
              aria-label={`Add ${product.name} to cart`}
            >
              <AtlasIcon name="cart" className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-3.5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3
            className="line-clamp-2 text-sm font-medium leading-snug"
            title={product.name}
          >
            {product.name}
          </h3>
          {hasVariants && (
            <p className={`mt-1 text-xs ${theme.color.textMuted}`}>
              Multiple options
            </p>
          )}
        </div>
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-base font-bold">
          {"GH\u20B5 "}
          {displayPrice}
        </span>
        {product.salePrice !== undefined && (
          <span className={`text-xs line-through ${theme.color.textMuted}`}>
            {"GH\u20B5 "}
            {product.price}
          </span>
        )}
      </div>

      <Link
        href={`/ecommerce-stores/${store.slug}/products/${product.id}`}
        className="absolute inset-0"
        aria-label={`View ${product.name}`}
      />
    </article>
  );
}