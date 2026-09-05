/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import Link from "next/link";
import Image from "next/image";
import { AtlasIcon } from "@/components/atlas/icons";
import { Button } from "@/components/atlas/button";
import { useCart } from "@/contexts/cart-context";
import type { MerchantStorefrontConfig } from "@/types/merchant-storefront";

interface StorefrontCartPageProps {
  store: MerchantStorefrontConfig;
}

export function StorefrontCartPage({ store }: StorefrontCartPageProps) {
  const { items, updateQuantity, removeItem, subtotal, totalItems } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
          <AtlasIcon name="cart" className="h-8 w-8 text-neutral-400" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-neutral-950">Your cart is empty</h1>
        <p className="mt-2 text-neutral-600">Browse our products and add something you love.</p>
        <Link
          href={`/ecommerce-stores/${store.slug}/products`}
          className="mt-6 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white"
          style={{ backgroundColor: store.primaryColor }}
        >
          Continue Shopping
          <AtlasIcon name="arrow-right" className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-neutral-950">Your Cart</h1>
      <p className="mt-2 text-sm text-neutral-600">
        {totalItems} item{totalItems !== 1 ? "s" : ""} in your cart
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Cart items */}
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5"
            >
              <div className="flex items-start gap-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-neutral-950 sm:text-base">
                    {item.name}
                  </p>
                  <p className="mt-1 text-sm font-bold" style={{ color: store.primaryColor }}>
                    GH₵ {item.price.toFixed(2)}
                  </p>
                  {/* Quantity & remove on mobile */}
                  <div className="mt-2 flex items-center justify-between sm:hidden">
                    <div className="flex items-center rounded-lg border border-neutral-300">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-3 py-1.5 text-neutral-600 hover:bg-neutral-100"
                      >
                        -
                      </button>
                      <span className="px-3 py-1.5 text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-3 py-1.5 text-neutral-600 hover:bg-neutral-100"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-xs font-medium text-danger-600 hover:text-danger-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>

              {/* Quantity & remove on desktop */}
              <div className="hidden sm:flex sm:items-center sm:gap-4 sm:ml-auto">
                <div className="flex items-center rounded-lg border border-neutral-300">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="px-3 py-2 text-neutral-600 hover:bg-neutral-100"
                  >
                    -
                  </button>
                  <span className="px-3 py-2 text-sm font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="px-3 py-2 text-neutral-600 hover:bg-neutral-100"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-danger-600"
                  aria-label="Remove item"
                >
                  <AtlasIcon name="trash" className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="h-fit rounded-2xl border border-neutral-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-neutral-950">Order Summary</h2>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600">Subtotal</span>
              <span className="font-medium text-neutral-950">GH₵ {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600">Shipping</span>
              <span className="font-medium text-neutral-950">Calculated at checkout</span>
            </div>
            <div className="border-t border-neutral-200 pt-2 flex justify-between text-base">
              <span className="font-semibold text-neutral-950">Total</span>
              <span className="font-bold text-neutral-950">GH₵ {subtotal.toFixed(2)}</span>
            </div>
          </div>

          <Link
            href={`/ecommerce-stores/${store.slug}/checkout`}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white"
            style={{ backgroundColor: store.primaryColor }}
          >
            Proceed to Checkout
            <AtlasIcon name="arrow-right" className="h-4 w-4" />
          </Link>

          <Link
            href={`/ecommerce-stores/${store.slug}/products`}
            className="mt-3 block text-center text-sm font-medium text-neutral-600 hover:text-neutral-900"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}