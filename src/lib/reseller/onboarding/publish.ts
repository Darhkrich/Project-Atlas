import { defaultStorefrontConfig } from "@/lib/storefront/defaults";
import type { StorefrontConfig } from "@/lib/storefront/types";
import type { ResellerStorefrontConfig } from "@/types/reseller-storefront";
import {
  CREDENTIAL_STUB_KEY_PREFIX,
  RESELLER_ACTIVITY_KEY_PREFIX,
  RESELLER_STOREFRONT_KEY_PREFIX,
  RUNTIME_STOREFRONT_STORE_KEY,
} from "./constants";
import { findTemplate } from "./templates";
import type {
  OnboardingDraft,
  PublishInput,
  PublishResult,
} from "./types";

function makeId(): string {
  const g = globalThis as {
    crypto?: { randomUUID?: () => string };
  };
  if (g.crypto && typeof g.crypto.randomUUID === "function") {
    return g.crypto.randomUUID();
  }
  return (
    "id-" +
    Date.now().toString(36) +
    "-" +
    Math.random().toString(36).slice(2, 10)
  );
}

function newStorefrontId(): string {
  return "SF-RS-" + makeId().replace(/-/g, "").slice(0, 8).toUpperCase();
}

function writeRuntimeConfig(slug: string, config: StorefrontConfig): void {
  const raw = localStorage.getItem(RUNTIME_STOREFRONT_STORE_KEY);
  let map: Record<string, StorefrontConfig> = {};
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        map = parsed as Record<string, StorefrontConfig>;
      }
    } catch {
      map = {};
    }
  }
  map[slug] = config;
  localStorage.setItem(RUNTIME_STOREFRONT_STORE_KEY, JSON.stringify(map));
}

function appendActivity(
  resellerId: string,
  entry: Record<string, unknown>,
): void {
  const key = RESELLER_ACTIVITY_KEY_PREFIX + resellerId;
  const raw = localStorage.getItem(key);
  let list: Array<Record<string, unknown>> = [];
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) list = parsed;
    } catch {
      list = [];
    }
  }
  list.unshift(entry);
  localStorage.setItem(key, JSON.stringify(list.slice(0, 200)));
}

function writeCredentialStub(draft: OnboardingDraft, nowMs: number): void {
  if (draft.mode !== "self_serve" || draft.accountKind !== "new") return;
  const email = draft.email.trim().toLowerCase();
  if (!email) return;
  // Stub. Real auth replaces this. Do not store the plaintext password.
  const stub = {
    email,
    fullName: draft.fullName.trim(),
    passwordHash: null,
    stub: true,
    createdAt: nowMs,
  };
  localStorage.setItem(
    CREDENTIAL_STUB_KEY_PREFIX + email,
    JSON.stringify(stub),
  );
}

export function publishOnboarding({
  draft,
  resellerId,
}: PublishInput): PublishResult {
  const errors: Record<string, string> = {};
  const slug = draft.slug.trim();
  const storeName = draft.storeName.trim();
  if (!slug) errors.slug = "Missing store link.";
  if (!storeName) errors.storeName = "Missing store name.";
  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      errors,
      slug: null,
      storefrontUrl: null,
    };
  }
  if (typeof window === "undefined") {
    return {
      success: false,
      errors: { form: "Storage is unavailable." },
      slug: null,
      storefrontUrl: null,
    };
  }

  const template = findTemplate(draft.templateId);
  const nowIso = new Date().toISOString();
  const nowMs = Date.now();
  const storefrontId = newStorefrontId();
  const runtimeId = makeId();

  const resellerConfig: ResellerStorefrontConfig = {
    templateId: template.id,
    storeName,
    slug,
    subdomain: "",
    logo: draft.logo || "",
    primaryColor: draft.primaryColor,
    accentColor: draft.accentColor,
    heroHeadline: template.heroHeadline,
    heroDescription: template.heroDescription,
    announcement: template.announcement,
    contactPhone: draft.phone || "",
    whatsapp: draft.phone || "",
    email: draft.email || "",
    showPoweredByAtlas: true,
    status: "live",
    services: [
      {
        id: "airtime",
        name: "Airtime",
        description: "Top up any network instantly",
        icon: "phone",
        enabled: true,
      },
      {
        id: "data",
        name: "Data bundles",
        description: "Affordable data, delivered fast",
        icon: "globe",
        enabled: true,
      },
      {
        id: "electricity",
        name: "Electricity",
        description: "Pay your power bill",
        icon: "zap",
        enabled: true,
      },
      {
        id: "tv",
        name: "Cable TV",
        description: "DSTV, GOtv, and more",
        icon: "tv",
        enabled: true,
      },
      {
        id: "results",
        name: "Results checker",
        description: "WAEC, JAMB, NECO pins",
        icon: "graduation",
        enabled: true,
      },
    ],
  };

  const runtimeConfig: StorefrontConfig = {
    ...defaultStorefrontConfig,
    ownerId: resellerId,
    id: runtimeId,
    storefrontId,
    store: {
      ...defaultStorefrontConfig.store,
      name: storeName,
      slug,
      description: storeName + " - digital services delivered fast.",
      logo: draft.logo || "",
    },
    branding: {
      primaryColor: draft.primaryColor,
      secondaryColor: draft.accentColor,
      accentColor: draft.accentColor,
      textColor: "#111827",
    },
    appearance: {
      ...defaultStorefrontConfig.appearance,
      templateId: template.runtimeTemplateId,
      themeId: template.runtimeThemeId,
    },
    hero: {
      ...defaultStorefrontConfig.hero,
      title: template.heroHeadline,
      subtitle: template.heroDescription,
      promoBadge: template.announcement || undefined,
    },
    contact: {
      phone: draft.phone || "",
      whatsapp: draft.phone || "",
      email: draft.email || "",
    },
    publication: {
      isPublished: true,
      publishedAt: nowIso,
    },
  };

  try {
    localStorage.setItem(
      RESELLER_STOREFRONT_KEY_PREFIX + resellerId,
      JSON.stringify(resellerConfig),
    );
    writeRuntimeConfig(slug, runtimeConfig);
    writeCredentialStub(draft, nowMs);
    appendActivity(resellerId, {
      id: makeId(),
      type: "reseller.storefront_created",
      at: nowMs,
      slug,
      storeName,
    });
  } catch (error) {
    return {
      success: false,
      errors: {
        form:
          error instanceof Error
            ? error.message
            : "Could not save your storefront.",
      },
      slug: null,
      storefrontUrl: null,
    };
  }

  return {
    success: true,
    errors: {},
    slug,
    storefrontUrl: "/customer-store/" + slug,
  };
}