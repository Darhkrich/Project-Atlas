"use client";

import { CartProvider } from "@/contexts/cart-context";
import { CustomerAuthProvider } from "@/contexts/customer-auth-context";
import { templateRegistry } from "@/components/storefront/templates";
import { useStoreProducts } from "@/contexts/store-products-context";
import { getProductsForStore as getStaticProducts } from "@/lib/store-products";
import type { MerchantStorefrontConfig } from "@/types/merchant-storefront";

interface MerchantStorefrontPreviewProps {
  store: MerchantStorefrontConfig;
  mode?: "desktop" | "mobile";
}

export function MerchantStorefrontPreview({
  store,
  mode = "desktop",
}: MerchantStorefrontPreviewProps) {
  const { getProductsForStore } = useStoreProducts();

  // Get products from context, fallback to static if none
  let products = getProductsForStore(store.slug);
  if (products.length === 0) {
    products = getStaticProducts(store.templateCategory);
  }

  const template = templateRegistry[store.templateId as keyof typeof templateRegistry]
    ?? templateRegistry["tpl-general-store"];

  const TemplateHome = template.Home;

  return (
    <CartProvider>
      <CustomerAuthProvider>
        {mode === "desktop" ? (
          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl">
            {/* Browser chrome */}
            <div className="flex h-8 items-center gap-2 border-b border-neutral-200 bg-neutral-50 px-4">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
              <div className="ml-3 flex-1 rounded-md bg-white px-3 py-0.5 text-[10px] text-neutral-400">
                {store.slug}.atlas.com
              </div>
            </div>
            <div className="pointer-events-none">
              <TemplateHome store={store} products={products} />
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-4">
            {/* Phone frame */}
            <div className="w-[375px] max-w-full overflow-hidden rounded-[2.5rem] border-[6px] border-neutral-800 bg-white shadow-2xl">
              <div className="mx-auto mt-2 h-5 w-24 rounded-full bg-neutral-800" />
              <div className="h-[600px] overflow-y-auto overscroll-contain overflow-x-hidden pointer-events-none">
                <TemplateHome store={store} products={products} />
              </div>
              <div className="mx-auto mb-2 h-1 w-16 rounded-full bg-neutral-300" />
            </div>
          </div>
        )}
      </CustomerAuthProvider>
    </CartProvider>
  );
}