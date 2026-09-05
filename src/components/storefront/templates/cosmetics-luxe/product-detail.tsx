"use client";

import { useState } from "react";
import Image from "next/image";
import { AtlasIcon } from "@/components/atlas/icons";
import { Button } from "@/components/atlas/button";
import { useCart } from "@/contexts/cart-context";

import type {
  MerchantStorefrontConfig,
  MerchantStorefrontProduct,
} from "@/types/merchant-storefront";
import { CosmeticsLuxeProductCard } from "./product-card";

interface CosmeticsLuxeProductDetailProps {
  store: MerchantStorefrontConfig;
  product: MerchantStorefrontProduct;
  products: MerchantStorefrontProduct[];
}

export function CosmeticsLuxeProductDetail({
  store,
  product,
  products,
}: CosmeticsLuxeProductDetailProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  const relatedProducts = products
    .filter((p) => p.id !== product.id && p.categoryId === product.categoryId)
    .slice(0, 4);

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.salePrice || product.price,
      image: product.images[0],
    });
  };

  return (
    <div className="bg-[#faf8f5] py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-neutral-500">
          <a href={`/ecommerce-stores/${store.slug}`} className="hover:text-neutral-900">
            Home
          </a>
          <span>/</span>
          <a
            href={`/ecommerce-stores/${store.slug}/products`}
            className="hover:text-neutral-900"
          >
            Products
          </a>
          <span>/</span>
          <span className="text-neutral-900">{product.name}</span>
        </nav>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          {/* Product image */}
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-white shadow-sm">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            {product.salePrice && (
              <span
                className="absolute left-4 top-4 rounded-full px-3 py-1 text-sm font-semibold text-white"
                style={{ backgroundColor: store.accentColor }}
              >
                Sale
              </span>
            )}
          </div>

          {/* Product info */}
          <div className="flex flex-col justify-center">
            <h1 className="text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">
              {product.name}
            </h1>
            <p className="mt-2 text-sm text-neutral-500">
              SKU: {product.id.toUpperCase()}
            </p>

            <div className="mt-5 flex items-center gap-4">
              <span className="text-3xl font-bold" style={{ color: store.primaryColor }}>
                GH₵ {product.salePrice || product.price}
              </span>
              {product.salePrice && (
                <span className="text-xl text-neutral-400 line-through">
                  GH₵ {product.price}
                </span>
              )}
            </div>

            <p className="mt-6 text-base leading-7 text-neutral-600">
              {product.description}
            </p>

            {/* Availability */}
            <div className="mt-6 flex items-center gap-2">
              <AtlasIcon
                name={product.inStock ? "check" : "x-circle"}
                className={`h-5 w-5 ${
                  product.inStock ? "text-success-600" : "text-danger-600"
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  product.inStock ? "text-success-700" : "text-danger-700"
                }`}
              >
                {product.inStock ? "In Stock" : "Out of Stock"}
              </span>
            </div>

            {product.inStock && (
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex items-center rounded-lg border border-neutral-300 bg-white">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-4 py-3 text-neutral-600 hover:bg-neutral-100"
                  >
                    -
                  </button>
                  <span className="px-4 py-3 text-sm font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-4 py-3 text-neutral-600 hover:bg-neutral-100"
                  >
                    +
                  </button>
                </div>

                <Button
                  onClick={handleAddToCart}
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white"
                  style={{ backgroundColor: store.primaryColor }}
                >
                  <AtlasIcon name="cart" className="h-5 w-5" />
                  Add to Cart
                </Button>
              </div>
            )}

            {/* Trust badges */}
            <div className="mt-8 flex flex-wrap gap-4 text-xs text-neutral-500">
              <span className="flex items-center gap-2">
                <AtlasIcon name="shield" className="h-4 w-4 text-success-600" />
                Secure payment
              </span>
              <span className="flex items-center gap-2">
                <AtlasIcon name="zap" className="h-4 w-4 text-success-600" />
                Fast delivery
              </span>
              <span className="flex items-center gap-2">
                <AtlasIcon name="headphones" className="h-4 w-4 text-success-600" />
                24/7 support
              </span>
            </div>
          </div>
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-neutral-950">
              You may also like
            </h2>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {relatedProducts.map((related) => (
                <CosmeticsLuxeProductCard
                  key={related.id}
                  product={related}
                  store={store}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}