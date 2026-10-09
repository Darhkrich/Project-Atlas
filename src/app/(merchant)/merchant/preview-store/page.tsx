/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import { CartProvider } from "@/contexts/cart-context";
import { CustomerAuthProvider } from "@/contexts/customer-auth-context";
import { templateRegistry } from "@/components/storefront/templates";
import { StorefrontLayout } from "@/components/storefront/storefront-layout";
import { StorefrontAboutPage } from "@/components/storefront/storefront-about-page";
import { StorefrontContactPage } from "@/components/storefront/storefront-contact-page";
import { StorefrontCartPage } from "@/components/storefront/storefront-cart-page";
import { StorefrontCheckoutPage } from "@/components/storefront/storefront-checkout-page";
import { CustomerLoginPage } from "@/components/storefront/customer-login-page";
import { StoreNotFound } from "@/components/storefront/shared/store-not-found";
import { getStarterCatalog as getStaticProducts } from "@/lib/merchant/products/starter-catalog";
import { usePages } from "@/lib/merchant/storefront/pages/use-pages";
import { DEFAULT_TEMPLATE_ID } from "@/lib/merchant/onboarding/templates";
import type {
  CustomPage,
  MerchantStorefrontConfig,
  MerchantStorefrontProduct,
} from "@/types/merchant-storefront";
import type { PreviewPage } from "@/lib/merchant/storefront/preview-pages";

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

const CONFIG_KEY = "atlas-merchant-storefronts";
const PRODUCTS_KEY = "atlas-store-products";
const AUTH_KEY = "atlas-unified-auth";

interface PreviewPayload {
  store: MerchantStorefrontConfig;
  products?: MerchantStorefrontProduct[];
  page?: PreviewPage;
  customPageSlug?: string;
}

// Standalone mode: read the merchant's own config and products from the
// same localStorage the dashboard writes to. Used when the preview opens
// in a new tab, where there is no parent iframe to post config over.
function readMerchantFromStorage(): {
  config: MerchantStorefrontConfig;
  products: MerchantStorefrontProduct[];
} | null {
  if (typeof window === "undefined") return null;

  let email: string | null = null;
  try {
    const raw = window.localStorage.getItem(AUTH_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { email?: string };
      if (typeof parsed.email === "string" && parsed.email.length > 0) {
        email = parsed.email;
      }
    }
  } catch {
    // Ignore. Fall through to first-config lookup.
  }

  let configMap: Record<string, MerchantStorefrontConfig> | null = null;
  try {
    const raw = window.localStorage.getItem(CONFIG_KEY);
    if (raw) {
      configMap = JSON.parse(raw) as Record<string, MerchantStorefrontConfig>;
    }
  } catch {
    configMap = null;
  }

  if (!configMap || typeof configMap !== "object") return null;

  const config =
    (email && configMap[email]) || Object.values(configMap)[0] || null;
  if (!config) return null;

  let products: MerchantStorefrontProduct[] = [];
  try {
    const raw = window.localStorage.getItem(PRODUCTS_KEY);
    if (raw) {
      const all = JSON.parse(raw) as Record<
        string,
        Record<string, MerchantStorefrontProduct[]>
      >;
      if (email && all[email]?.[config.slug]) {
        products = all[email][config.slug];
      } else {
        for (const bucket of Object.values(all)) {
          if (bucket[config.slug]) {
            products = bucket[config.slug];
            break;
          }
        }
      }
    }
  } catch {
    products = [];
  }

  const filtered = Array.isArray(products)
    ? products.filter(
        (p): p is MerchantStorefrontProduct =>
          !!p && typeof p === "object" && typeof p.id === "string"
      )
    : [];

  return { config, products: filtered };
}

function EmptyProductsState({ store }: { store: MerchantStorefrontConfig }) {
  return (
    <StorefrontLayout store={store}>
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-neutral-950 dark:text-neutral-100">
          No products yet
        </h1>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          Add a product to preview its detail page.
        </p>
      </div>
    </StorefrontLayout>
  );
}

function CustomPagePreview({
  store,
  page,
}: {
  store: MerchantStorefrontConfig;
  page: CustomPage;
}) {
  const paragraphs = page.body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  return (
    <StorefrontLayout store={store}>
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-950 dark:text-neutral-100 sm:text-4xl">
          {page.title}
        </h1>
        {paragraphs.length === 0 ? (
          <p className="mt-6 text-sm text-neutral-500 dark:text-neutral-400">
            This page has no content yet.
          </p>
        ) : (
          <div className="mt-6 space-y-4">
            {paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className="whitespace-pre-line text-base leading-7 text-neutral-700 dark:text-neutral-300"
              >
                {paragraph}
              </p>
            ))}
          </div>
        )}
      </div>
    </StorefrontLayout>
  );
}

export default function PreviewStorePage() {
  const [config, setConfig] = useState<MerchantStorefrontConfig | null>(null);
  const [overrideProducts, setOverrideProducts] = useState<
    MerchantStorefrontProduct[] | null
  >(null);
  const [page, setPage] = useState<PreviewPage>("home");
  const [customPageSlug, setCustomPageSlug] = useState<string | undefined>();

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data as { type?: string; payload?: PreviewPayload };
      if (data?.type !== "atlas:storefront-preview") return;
      if (!data.payload?.store) return;
      setConfig(data.payload.store);
      setOverrideProducts(data.payload.products ?? null);
      setPage(data.payload.page ?? "home");
      setCustomPageSlug(data.payload.customPageSlug);
    };
    window.addEventListener("message", handler);

    const hasParent =
      typeof window !== "undefined" && window.parent !== window;

    if (!hasParent) {
      // Standalone mode. Read the merchant's config directly.
      const stored = readMerchantFromStorage();
      if (stored) {
        setConfig(stored.config);
        setOverrideProducts(stored.products);
      }
      return () => {
        window.removeEventListener("message", handler);
      };
    }

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

  const products = useMemo(
    () =>
      overrideProducts && overrideProducts.length > 0
        ? overrideProducts
        : getStaticProducts(store.templateCategory),
    [overrideProducts, store.templateCategory]
  );

  const { pages } = usePages(store.storefrontId);

  const template =
    templateRegistry[store.templateId as keyof typeof templateRegistry] ??
    templateRegistry["tpl-general-store"];

  const renderPage = () => {
    if (page === "home") {
      const TemplateHome = template.Home;
      return <TemplateHome store={store} products={products} />;
    }
    if (page === "products") {
      const TemplateProducts = template.Products;
      return <TemplateProducts store={store} products={products} />;
    }
    if (page === "product_detail") {
      const featured = products.find((p) => p.featured);
      const chosen = featured ?? products[0];
      if (!chosen) return <EmptyProductsState store={store} />;
      const TemplateProductDetail = template.ProductDetail;
      return (
        <TemplateProductDetail
          store={store}
          product={chosen}
          products={products}
        />
      );
    }
    if (page === "about") {
      return (
        <StorefrontLayout store={store}>
          <StorefrontAboutPage store={store} />
        </StorefrontLayout>
      );
    }
    if (page === "contact") {
      return (
        <StorefrontLayout store={store}>
          <StorefrontContactPage store={store} />
        </StorefrontLayout>
      );
    }
    if (page === "cart") {
      return (
        <StorefrontLayout store={store}>
          <StorefrontCartPage store={store} />
        </StorefrontLayout>
      );
    }
    if (page === "checkout") {
      return (
        <StorefrontLayout store={store}>
          <StorefrontCheckoutPage store={store} />
        </StorefrontLayout>
      );
    }
    if (page === "login") {
      return (
        <StorefrontLayout store={store}>
          <CustomerLoginPage store={store} />
        </StorefrontLayout>
      );
    }
    if (page === "custom_page") {
      const found = pages.find((p) => p.slug === customPageSlug);
      if (!found) {
        return (
          <StorefrontLayout store={store}>
            <StoreNotFound variant="page" />
          </StorefrontLayout>
        );
      }
      return <CustomPagePreview store={store} page={found} />;
    }
    const TemplateHome = template.Home;
    return <TemplateHome store={store} products={products} />;
  };

  return (
    <CartProvider>
      <CustomerAuthProvider>
        <div className="min-h-screen bg-white">{renderPage()}</div>
      </CustomerAuthProvider>
    </CartProvider>
  );
}