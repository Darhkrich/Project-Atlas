"use client";

import Link from "next/link";
import Image from "next/image";
import { AtlasIcon } from "@/components/atlas/icons";
import { useCart } from "@/contexts/cart-context";
import { fashionModernThemeStyles } from "./theme-styles";
import type {
  MerchantStorefrontConfig,
  MerchantStorefrontProduct,
} from "@/types/merchant-storefront";

interface FashionModernProductCardProps {
  product: MerchantStorefrontProduct;
  store: MerchantStorefrontConfig;
}

export function FashionModernProductCard({
  product,
  store,
}: FashionModernProductCardProps) {
  const { addItem } = useCart();
  const styles =
    fashionModernThemeStyles[store.theme] ||
    fashionModernThemeStyles.airy;

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
        <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          {product.salePrice && (
            <span
              className="absolute left-3 top-3 px-2 py-1 text-xs font-bold text-white"
              style={{ backgroundColor: store.accentColor }}
            >
              SALE
            </span>
          )}
          <div className="absolute inset-x-0 bottom-0 translate-y-full bg-black/70 p-3 text-center transition-transform duration-300 group-hover:translate-y-0">
            <button
              type="button"
              onClick={handleAddToCart}
              className="w-full bg-white px-3 py-2 text-xs font-bold uppercase tracking-wider text-neutral-900 hover:bg-neutral-200"
            >
              Add to Cart
            </button>
          </div>
        </div>
        <div className="p-4">
          <h3 className="truncate text-sm font-bold uppercase tracking-wide text-neutral-950">
            {product.name}
          </h3>
          <div className="mt-1 flex items-center justify-between">
            <div>
              <span
                className="text-base font-bold"
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
              className={`p-2 text-neutral-500 hover:bg-neutral-100 ${styles.button}`}
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