"use client";

import Link from "next/link";
import Image from "next/image";
import { AtlasIcon } from "@/components/atlas/icons";
import { useCart } from "@/contexts/cart-context";
import type { MerchantStorefrontConfig, MerchantStorefrontProduct } from "@/types/merchant-storefront";

interface ProductCardProps {
  product: MerchantStorefrontProduct;
  store: MerchantStorefrontConfig;
}

export function ProductCard({ product, store }: ProductCardProps) {
  const { addItem } = useCart();

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
    <div className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-all hover:shadow-lg">
      <Link href={`/ecommerce-stores/${store.slug}/products/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-neutral-100">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {product.salePrice && (
            <span
              className="absolute left-3 top-3 rounded-full px-2 py-1 text-xs font-semibold text-white"
              style={{ backgroundColor: store.accentColor }}
            >
              Sale
            </span>
          )}
        </div>
        <div className="p-4">
          <h3 className="truncate text-sm font-semibold text-neutral-950">
            {product.name}
          </h3>
          <div className="mt-1 flex items-center justify-between">
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
              className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100"
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