import type { AtlasIconName } from "@/components/atlas/icons";

export type ResellerStorefrontTemplateId =
  | "modern"
  | "classic"
  | "minimal";

export type ResellerStorefrontService = {
  id: string;
  name: string;
  description: string;
  icon: AtlasIconName;
  enabled: boolean;
};

export type ResellerStorefrontConfig = {
  templateId: ResellerStorefrontTemplateId;
  storeName: string;
  slug: string;
  subdomain?: string;
  logo?: string;
  primaryColor: string;
  accentColor: string;
  heroHeadline: string;
  heroDescription: string;
  announcement: string;
  contactPhone: string;
  whatsapp: string;
  email: string;
  showPoweredByAtlas: boolean;
  services: ResellerStorefrontService[];
  status?: "draft" | "live";
};

export const defaultResellerStorefrontConfig: ResellerStorefrontConfig = {
  templateId: "modern",
  storeName: "Atlas Store",
  slug: "atlas-store",
  subdomain: "",
  logo: "",
  primaryColor: "#064E3B",
  accentColor: "#22C55E",
  heroHeadline: "Everything you need, in one place.",
  heroDescription:
    "Buy data, airtime, bills and digital services quickly and securely.",
  announcement: "",
  contactPhone: "",
  whatsapp: "",
  email: "",
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
      name: "Data Bundles",
      description: "Affordable data bundles",
      icon: "globe",
      enabled: true,
    },
    {
      id: "electricity",
      name: "Electricity",
      description: "Pay electricity bills",
      icon: "zap",
      enabled: true,
    },
    {
      id: "tv",
      name: "Cable TV",
      description: "DSTV, GOtv and more",
      icon: "tv",
      enabled: true,
    },
    {
      id: "results",
      name: "Results Checker",
      description: "WAEC, JAMB, NECO",
      icon: "graduation",
      enabled: true,
    },
  ],
};