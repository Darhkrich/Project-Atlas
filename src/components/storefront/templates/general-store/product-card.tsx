"use client";

import Link from "next/link";
import Image from "next/image";
import { AtlasIcon } from "@/components/atlas/icons";
import { useCart } from "@/contexts/cart-context";
import { generalStoreThemeStyles } from "./theme-styles";
import type { MerchantStorefrontConfig, MerchantStorefrontProduct } from "@/types/merchant-storefront";

interface GeneralStoreProductCardProps {
  product: MerchantStorefrontProduct;
  store: MerchantStorefrontConfig;
}

export function GeneralStoreProductCard({ product, store }: GeneralStoreProductCardProps) {
  const { addItem } = useCart();
  const styles = generalStoreThemeStyles[store.theme] || generalStoreThemeStyles.modern;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: product.salePrice || product.price,
      image: product.images[0],
    });
  };

  return (
    <div className={`group relative overflow-hidden bg-white transition-all hover:shadow-lg ${styles.card}`}>
      <Link href={`/ecommerce-stores/${store.slug}/products/${product.id}`} className="block">
        {/* Image area */}
        <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {product.salePrice && (
            <span
              className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold text-white"
              style={{ backgroundColor: store.accentColor }}
            >
              Sale
            </span>
          )}

          {/* Quick add overlay */}
          <div className="absolute inset-x-0 bottom-0 translate-y-full bg-black/60 p-2 text-center backdrop-blur-sm transition-transform duration-300 group-hover:translate-y-0">
            <button
              onClick={handleAddToCart}
              className="w-full rounded-md bg-white px-3 py-2 text-xs font-bold uppercase tracking-wider text-neutral-900 hover:bg-neutral-200"
            >
              Add to Cart
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="truncate text-sm font-medium text-neutral-950">{product.name}</h3>
          {/* Rating (static example) */}
          <div className="mt-1 flex items-center gap-0.5 text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <AtlasIcon key={i} name="star" className="h-3.5 w-3.5 fill-current" />
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div>
              <span className="text-base font-bold" style={{ color: store.primaryColor }}>
                GH₵ {product.salePrice || product.price}
              </span>
              {product.salePrice && (
                <span className="ml-2 text-xs text-neutral-400 line-through">
                  GH₵ {product.price}
                </span>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100"
              aria-label="Add to cart"
            >
              <AtlasIcon name="cart" className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
}