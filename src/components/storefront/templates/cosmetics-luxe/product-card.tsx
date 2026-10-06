"use client";

import Link from "next/link";
import Image from "next/image";
import { AtlasIcon } from "@/components/atlas/icons";
import { useCart } from "@/contexts/cart-context";
import { cosmeticsLuxeThemeStyles } from "./theme-styles";
import type {
  MerchantStorefrontConfig,
  MerchantStorefrontProduct,
} from "@/types/merchant-storefront";

interface CosmeticsLuxeProductCardProps {
  product: MerchantStorefrontProduct;
  store: MerchantStorefrontConfig;
}

export function CosmeticsLuxeProductCard({
  product,
  store,
}: CosmeticsLuxeProductCardProps) {
  const { addItem } = useCart();
  const styles =
    cosmeticsLuxeThemeStyles[store.theme] ||
    cosmeticsLuxeThemeStyles.airy;

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
    <div
      className={`group relative overflow-hidden bg-white transition-all hover:shadow-xl ${styles.card}`}
    >
      <Link
        href={`/ecommerce-stores/${store.slug}/products/${product.id}`}
        className="block"
      >
        <div className="relative aspect-square overflow-hidden bg-neutral-50">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {product.salePrice && (
            <span
              className="absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-semibold text-white"
              style={{ backgroundColor: store.accentColor }}
            >
              Sale
            </span>
          )}
          <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
        </div>
        <div className="p-5">
          <h3 className="text-sm font-medium tracking-wide text-neutral-950">
            {product.name}
          </h3>
          <div className="mt-2 flex items-center justify-between">
            <div>
              <span
                className="text-base font-semibold"
                style={{ color: store.primaryColor }}
              >
                {"GH\u20B5 "}
                {product.salePrice || product.price}
              </span>
              {product.salePrice && (
                <span className="ml-2 text-xs text-neutral-400 line-through">
                  {"GH\u20B5 "}
                  {product.price}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleAddToCart}
              className={`rounded-full p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900 ${styles.button}`}
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