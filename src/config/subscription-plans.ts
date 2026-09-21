export type PlanCode = "starter" | "growth" | "pro" | "enterprise";

export type StorefrontPaymentMethod = "momo" | "card" | "bank" | "wallet";
export type StorefrontTheme = "minimal" | "classic" | "modern" | "bold";
export type DomainOption = "subdomain" | "atlas-domain" | "custom-domain";

export interface SubscriptionPlan {
  code: PlanCode;
  name: string;
  monthlyPrice: string;
  annualPrice: string;
  monthlyPriceGHS: number | "custom";
  annualPriceGHS: number | "custom";
  maxProducts: number | "unlimited";
  maxMonthlyTransactions: string;
  maxMonthlyTransactionsGHS: number | "unlimited";
  themes: StorefrontTheme[];
  paymentMethods: StorefrontPaymentMethod[];
  supportLevel: string;
  /**
   * @deprecated Derive from domainOptions. Kept for backward compatibility.
   */
  customDomain: boolean;
  /**
   * @deprecated Derive from domainOptions. Kept for backward compatibility.
   */
  subdomain: boolean;
  advancedFeatures: boolean;
  aiAssistant?: boolean;
  domainOptions: DomainOption[];
}

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    code: "starter",
    name: "Starter",
    monthlyPrice: "GH₵ 50",
    annualPrice: "GH₵ 500",
    monthlyPriceGHS: 50,
    annualPriceGHS: 500,
    maxProducts: 20,
    maxMonthlyTransactions: "GH₵ 10,000",
    maxMonthlyTransactionsGHS: 10000,
    themes: ["minimal"],
    paymentMethods: ["momo"],
    supportLevel: "Basic email support",
    customDomain: false,
    subdomain: true,
    advancedFeatures: false,
    domainOptions: ["subdomain"],
  },
  {
    code: "growth",
    name: "Growth",
    monthlyPrice: "GH₵ 150",
    annualPrice: "GH₵ 1,500",
    monthlyPriceGHS: 150,
    annualPriceGHS: 1500,
    maxProducts: 200,
    maxMonthlyTransactions: "GH₵ 50,000",
    maxMonthlyTransactionsGHS: 50000,
    themes: ["minimal", "classic"],
    paymentMethods: ["momo", "card"],
    supportLevel: "Priority email support",
    customDomain: false,
    subdomain: true,
    advancedFeatures: false,
    domainOptions: ["subdomain", "atlas-domain"],
    aiAssistant: true,
  },
  {
    code: "pro",
    name: "Pro",
    monthlyPrice: "GH₵ 400",
    annualPrice: "GH₵ 4,000",
    monthlyPriceGHS: 400,
    annualPriceGHS: 4000,
    maxProducts: "unlimited",
    maxMonthlyTransactions: "GH₵ 250,000",
    maxMonthlyTransactionsGHS: 250000,
    themes: ["modern", "classic", "minimal"],
    paymentMethods: ["momo", "card", "bank"],
    supportLevel: "24/7 chat & email support",
    customDomain: true,
    subdomain: true,
    advancedFeatures: true,
    domainOptions: ["subdomain", "atlas-domain", "custom-domain"],
    aiAssistant: true,
  },
  {
    code: "enterprise",
    name: "Enterprise",
    monthlyPrice: "Custom",
    annualPrice: "Custom",
    monthlyPriceGHS: "custom",
    annualPriceGHS: "custom",
    maxProducts: "unlimited",
    maxMonthlyTransactions: "Unlimited",
    maxMonthlyTransactionsGHS: "unlimited",
    themes: ["modern", "classic", "minimal", "bold"],
    paymentMethods: ["momo", "card", "bank", "wallet"],
    supportLevel: "Dedicated account manager",
    customDomain: true,
    subdomain: true,
    advancedFeatures: true,
    domainOptions: ["subdomain", "atlas-domain", "custom-domain"],
    aiAssistant: true,
  },
];

export function getPlanByCode(code: PlanCode): SubscriptionPlan {
  const plan = subscriptionPlans.find((p) => p.code === code);
  if (!plan) {
    throw new Error("Unknown plan code: " + code);
  }
  return plan;
}