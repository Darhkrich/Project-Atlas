export type PlanCode = "starter" | "growth" | "pro" | "enterprise";

export interface SubscriptionPlan {
  code: PlanCode;
  name: string;
  monthlyPrice: string;
  annualPrice: string;
  maxProducts: number;
  maxMonthlyTransactions: string;
  themes: string[];
  paymentMethods: string[];
  supportLevel: string;
  customDomain: boolean;
  subdomain: boolean;
  advancedFeatures: boolean;
  aiAssistant?: boolean;
  allowedTemplates: string[];
  domainOptions: string[];
}

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    code: "starter",
    name: "Starter",
    monthlyPrice: "GH₵ 50",
    annualPrice: "GH₵ 500",
    maxProducts: 20,
    maxMonthlyTransactions: "GH₵ 10,000",
    themes: ["minimal"],
    paymentMethods: ["momo"],
    supportLevel: "Basic email support",
    customDomain: false,
    subdomain: true,
    advancedFeatures: false,
    allowedTemplates: ["tpl-general-store"],
    domainOptions: ["subdomain"],
  },
  {
    code: "growth",
    name: "Growth",
    monthlyPrice: "GH₵ 150",
    annualPrice: "GH₵ 1,500",
    maxProducts: 200,
    maxMonthlyTransactions: "GH₵ 50,000",
    themes: ["minimal", "classic"],
    paymentMethods: ["momo", "card"],
    supportLevel: "Priority email support",
    customDomain: false,
    subdomain: true,
    advancedFeatures: false,
    allowedTemplates: ["tpl-general-store", "tpl-cosmetics-luxe"],
    domainOptions: ["subdomain", "atlas-domain"],
    aiAssistant: true,
  },
  {
    code: "pro",
    name: "Pro",
    monthlyPrice: "GH₵ 400",
    annualPrice: "GH₵ 4,000",
    maxProducts: Infinity,
    maxMonthlyTransactions: "GH₵ 250,000",
    themes: ["modern", "classic", "minimal"],
    paymentMethods: ["momo", "card", "bank"],
    supportLevel: "24/7 chat & email support",
    customDomain: true,
    subdomain: true,
    advancedFeatures: true,
    allowedTemplates: [
      "tpl-general-store",
      "tpl-cosmetics-luxe",
      "tpl-fashion-modern",
    ],
    domainOptions: ["subdomain", "atlas-domain", "custom-domain"],
    aiAssistant: true,
  },
  {
    code: "enterprise",
    name: "Enterprise",
    monthlyPrice: "Custom",
    annualPrice: "Custom",
    maxProducts: Infinity,
    maxMonthlyTransactions: "Unlimited",
    themes: ["modern", "classic", "minimal", "bold"],
    paymentMethods: ["momo", "card", "bank", "wallet"],
    supportLevel: "Dedicated account manager",
    customDomain: true,
    subdomain: true,
    advancedFeatures: true,
    allowedTemplates: [
      "tpl-general-store",
      "tpl-cosmetics-luxe",
      "tpl-fashion-modern",
    ],
    domainOptions: ["subdomain", "atlas-domain", "custom-domain"],
    aiAssistant: true,
  },
];

export function getPlanByCode(code: PlanCode): SubscriptionPlan {
  return subscriptionPlans.find((plan) => plan.code === code) || subscriptionPlans[0];
}