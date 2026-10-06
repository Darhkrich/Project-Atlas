"use client";

import { useEffect, useState } from "react";
import { CartProvider } from "@/contexts/cart-context";
import { CustomerAuthProvider } from "@/contexts/customer-auth-context";
import { templateRegistry } from "@/components/storefront/templates";
import { getStarterCatalog as getStaticProducts } from "@/lib/merchant/products/starter-catalog";
import { DEFAULT_TEMPLATE_ID } from "@/lib/merchant/onboarding/templates";
import type {
  MerchantStorefrontConfig,
  MerchantStorefrontProduct,
} from "@/types/merchant-storefront";

const FALLBACK_CONFIG: MerchantStorefrontConfig = {
  storefrontId: "preview",
  storeName: "Your store",
  slug: "your-store",
  primaryColor: "#4d8e44",
  accentColor: "#c89c1e",
  tagline: "Quality products, great prices.",
  description: "Discover quality products at great prices.",
  heroTitle: "Welcome to your store",
  heroDescription: "Browse our collection and find something you love.",
  theme: "airy",
  templateId: DEFAULT_TEMPLATE_ID,
  templateCategory: "general",
  announcement: "",
  contactEmail: "",
  contactPhone: "",
  whatsapp: "",
  address: "",
  socialLinks: {
    facebook: "",
    instagram: "",
    tiktok: "",
    twitter: "",
  },
  showAnnouncement: false,
  showTrustSection: true,
  showFeaturedProducts: true,
  status: "live",
  paymentMethodIds: ["momo"],
  codEnabled: false,
};

interface PreviewPayload {
  store: MerchantStorefrontConfig;
  products?: MerchantStorefrontProduct[];
}

export default function PreviewStorePage() {
  const [config, setConfig] = useState<MerchantStorefrontConfig | null>(null);
  const [overrideProducts, setOverrideProducts] = useState<
    MerchantStorefrontProduct[] | null
  >(null);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data as { type?: string; payload?: PreviewPayload };
      if (data?.type !== "atlas:storefront-preview") return;
      if (!data.payload?.store) return;
      setConfig(data.payload.store);
      setOverrideProducts(data.payload.products ?? null);
    };
    window.addEventListener("message", handler);

    const signalReady = () => {
      if (typeof window === "undefined") return;
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(
          { type: "atlas:storefront-preview-ready" },
          window.location.origin
        );
      }
    };

    signalReady();
    const retry = window.setTimeout(signalReady, 200);

    return () => {
      window.removeEventListener("message", handler);
      window.clearTimeout(retry);
    };
  }, []);

  const store = config ?? FALLBACK_CONFIG;

  const products =
    overrideProducts && overrideProducts.length > 0
      ? overrideProducts
      : getStaticProducts(store.templateCategory);

  const template =
    templateRegistry[store.templateId as keyof typeof templateRegistry] ??
    templateRegistry["tpl-general-store"];
  const TemplateHome = template.Home;

  return (
    <CartProvider>
      <CustomerAuthProvider>
        <div className="min-h-screen bg-white">
          <TemplateHome store={store} products={products} />
        </div>
      </CustomerAuthProvider>
    </CartProvider>
  );
}