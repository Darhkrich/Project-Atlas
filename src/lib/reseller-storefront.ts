/* -------------------------------------------------------------------------- */
/* Atlas Reseller Storefront Configuration                                    */
/* -------------------------------------------------------------------------- */

export type StorefrontTheme = "modern" | "classic" | "minimal";

export type StorefrontService = {
  id: string;
  name: string;
  description: string;
  icon:
    | "phone"
    | "globe"
    | "zap"
    | "tv"
    | "wifi"
    | "grid"
    | "wallet";
  enabled: boolean;
  category?: string;
  image?: string;
  price?: string;
};

export type StorefrontConfig = {
  storeName: string;
  tagline: string;

  logo: string;

  primaryColor: string;
  secondaryColor: string;

  theme: StorefrontTheme;

  heroTitle: string;
  heroDescription: string;

  customDomain: string;
  storefrontSlug: string;

  services: StorefrontService[];

  contactPhone: string;
  contactEmail: string;

  location?: string;

  showPoweredByAtlas: boolean;
};

/* -------------------------------------------------------------------------- */
/* Default Services                                                           */
/* -------------------------------------------------------------------------- */

export const defaultStorefrontServices: StorefrontService[] = [
  {
    id: "airtime",
    name: "Airtime",
    description: "Top up any network instantly",
    icon: "phone",
    enabled: true,
    category: "Airtime",
  },
  {
    id: "data",
    name: "Data Bundles",
    description: "Affordable data bundles",
    icon: "globe",
    enabled: true,
    category: "Data",
  },
  {
    id: "electricity",
    name: "Electricity",
    description: "Pay electricity bills",
    icon: "zap",
    enabled: true,
    category: "Bills",
  },
  {
    id: "cable-tv",
    name: "Cable TV",
    description: "DSTV, GOtv and more",
    icon: "tv",
    enabled: true,
    category: "TV",
  },
  {
    id: "internet",
    name: "Internet",
    description: "Internet subscriptions",
    icon: "wifi",
    enabled: true,
    category: "Internet",
  },
  {
    id: "exam-pins",
    name: "Exam Pins",
    description: "WAEC, NECO and more",
    icon: "grid",
    enabled: true,
    category: "Education",
  },
  {
    id: "vtus",
    name: "VTU Services",
    description: "More digital services",
    icon: "grid",
    enabled: false,
    category: "Other",
  },
  {
    id: "wallet",
    name: "Other Services",
    description: "Explore more services",
    icon: "wallet",
    enabled: false,
    category: "Other",
  },
];

/* -------------------------------------------------------------------------- */
/* Default Storefront                                                         */
/* -------------------------------------------------------------------------- */

export const defaultStorefront: StorefrontConfig = {
  storeName: "Atlas Store",
  tagline: "Fast. Reliable. Always Connected.",

  logo: "",

  primaryColor: "#064E3B",
  secondaryColor: "#22C55E",

  theme: "modern",

  heroTitle: "Fast. Reliable. Always Connected.",
  heroDescription:
    "Buy airtime, data, electricity, TV subscriptions and more from one trusted digital services store.",

  customDomain: "",
  storefrontSlug: "atlas-store",

  services: defaultStorefrontServices,

  contactPhone: "+233 24 000 0000",
  contactEmail: "support@example.com",

  location: "Ghana",

  showPoweredByAtlas: true,
};

/* -------------------------------------------------------------------------- */
/* Safe Helpers                                                               */
/* -------------------------------------------------------------------------- */

function safeString(
  value: unknown,
  fallback: string,
): string {
  if (typeof value !== "string") {
    return fallback;
  }

  const normalized = value.trim();

  return normalized || fallback;
}

function safeBoolean(
  value: unknown,
  fallback: boolean,
): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function safeTheme(value: unknown): StorefrontTheme {
  if (
    value === "modern" ||
    value === "classic" ||
    value === "minimal"
  ) {
    return value;
  }

  return "modern";
}

function safeServices(
  value: unknown,
): StorefrontService[] {
  if (!Array.isArray(value)) {
    return defaultStorefrontServices;
  }

  const services = value
    .filter(Boolean)
    .map((service, index) => {
      const item = service as Partial<StorefrontService>;

      return {
        id: safeString(
          item.id,
          `service-${index + 1}`,
        ),

        name: safeString(
          item.name,
          "Service",
        ),

        description: safeString(
          item.description,
          "Digital service",
        ),

        icon:
          item.icon === "phone" ||
          item.icon === "globe" ||
          item.icon === "zap" ||
          item.icon === "tv" ||
          item.icon === "wifi" ||
          item.icon === "grid" ||
          item.icon === "wallet"
            ? item.icon
            : "grid",

        enabled:
          typeof item.enabled === "boolean"
            ? item.enabled
            : true,

        category: safeString(
          item.category,
          "Services",
        ),

        image:
          typeof item.image === "string"
            ? item.image
            : "",

        price:
          typeof item.price === "string"
            ? item.price
            : "",
      };
    });

  return services.length > 0
    ? services
    : defaultStorefrontServices;
}

/* -------------------------------------------------------------------------- */
/* Normalize Storefront                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Normalizes incomplete storefront configuration before it reaches
 * any customer-facing storefront template.
 *
 * This prevents runtime errors such as:
 *   store.storeName.charAt(...)
 *
 * when the setup form has not yet populated every field.
 */
export function normalizeStorefront(
  input?: Partial<StorefrontConfig> | null,
): StorefrontConfig {
  const source = input ?? {};

  return {
    storeName: safeString(
      source.storeName,
      defaultStorefront.storeName,
    ),

    tagline: safeString(
      source.tagline,
      defaultStorefront.tagline,
    ),

    logo: safeString(
      source.logo,
      defaultStorefront.logo,
    ),

    primaryColor: safeString(
      source.primaryColor,
      defaultStorefront.primaryColor,
    ),

    secondaryColor: safeString(
      source.secondaryColor,
      defaultStorefront.secondaryColor,
    ),

    theme: safeTheme(source.theme),

    heroTitle: safeString(
      source.heroTitle,
      defaultStorefront.heroTitle,
    ),

    heroDescription: safeString(
      source.heroDescription,
      defaultStorefront.heroDescription,
    ),

    customDomain: safeString(
      source.customDomain,
      defaultStorefront.customDomain,
    ),

    storefrontSlug: safeString(
      source.storefrontSlug,
      defaultStorefront.storefrontSlug,
    ),

    services: safeServices(source.services),

    contactPhone: safeString(
      source.contactPhone,
      defaultStorefront.contactPhone,
    ),

    contactEmail: safeString(
      source.contactEmail,
      defaultStorefront.contactEmail,
    ),

    location: safeString(
      source.location,
      defaultStorefront.location ?? "Ghana",
    ),

    showPoweredByAtlas: safeBoolean(
      source.showPoweredByAtlas,
      defaultStorefront.showPoweredByAtlas,
    ),
  };
}

/* -------------------------------------------------------------------------- */
/* Storefront URL                                                             */
/* -------------------------------------------------------------------------- */

export function getStorefrontUrl(
  store: StorefrontConfig,
): string {
  const domain = store.customDomain.trim();

  if (domain) {
    if (
      domain.startsWith("http://") ||
      domain.startsWith("https://")
    ) {
      return domain;
    }

    return `https://${domain}`;
  }

  return `/store/${store.storefrontSlug}`;
}