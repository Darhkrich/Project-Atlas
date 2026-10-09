import type { ResellerStorefrontTemplateId } from "@/types/reseller-storefront";
import type {
  StorefrontTemplateId,
  StorefrontThemeId,
} from "@/lib/storefront/types";

export interface TemplateOption {
  id: ResellerStorefrontTemplateId;
  label: string;
  description: string;
  runtimeTemplateId: StorefrontTemplateId;
  runtimeThemeId: StorefrontThemeId;
  heroHeadline: string;
  heroDescription: string;
  announcement: string;
}

export const TEMPLATE_OPTIONS: TemplateOption[] = [
  {
    id: "classic",
    label: "Classic",
    description: "A steady, professional shop. Good for services you sell every day.",
    runtimeTemplateId: "template1",
    runtimeThemeId: "classic",
    heroHeadline: "Everything you need, in one place.",
    heroDescription: "Buy data, airtime, bills, and digital services quickly.",
    announcement: "",
  },
  {
    id: "modern",
    label: "Modern",
    description: "Bold and roomy. A banner up top for what you push this week.",
    runtimeTemplateId: "template2",
    runtimeThemeId: "modern",
    heroHeadline: "Fast, friendly, always open.",
    heroDescription: "Data, airtime, bills, and results, all in one shop.",
    announcement: "Free delivery on every exam pin this week.",
  },
  {
    id: "minimal",
    label: "Minimal",
    description: "Quiet and clean. Nothing between the customer and the buy button.",
    runtimeTemplateId: "template3",
    runtimeThemeId: "minimal",
    heroHeadline: "Digital services, without the noise.",
    heroDescription: "Pick a service. Pay. Done.",
    announcement: "",
  },
];

export function findTemplate(
  id: ResellerStorefrontTemplateId,
): TemplateOption {
  return TEMPLATE_OPTIONS.find((t) => t.id === id) ?? TEMPLATE_OPTIONS[1];
}