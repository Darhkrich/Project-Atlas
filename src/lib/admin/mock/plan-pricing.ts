import { servicesCategories } from "@/lib/services-page-data";
import type { PlanPricing } from "../types/plan-pricing";

// Helper to generate mock pricing for each plan
function generateMockPlanPricing(): PlanPricing[] {
  const pricing: PlanPricing[] = [];
  const updatedAt = new Date().toISOString();
  const admin = "admin@atlas.com";

  for (const category of servicesCategories) {
    if (!category.formConfig) continue;

    if (category.formConfig.plans) {
      // For categories with a flat plan list (e.g., airtime, TV, electricity)
      for (const plan of category.formConfig.plans) {
        const providerCost = plan.price * 0.8;
        const atlasPrice = plan.price;
        const resellerPrice = plan.price;
        pricing.push({
          id: `${category.id}-${plan.id}`, // unique prefix
          planName: plan.name,
          serviceCategory: category.id,
          providerCost,
          atlasPrice,
          resellerPrice,
          commissionRate: 5,
          status: "active",
          lastUpdated: updatedAt,
          updatedBy: admin,
        });
      }
    } else if (category.formConfig.networkPlanCategories) {
      // For data categories with network-specific plan lists
      for (const [network, planCategories] of Object.entries(category.formConfig.networkPlanCategories)) {
        for (const planCategory of planCategories) {
          for (const plan of planCategory.plans) {
            const providerCost = plan.price * 0.8;
            const atlasPrice = plan.price;
            const resellerPrice = plan.price;
            pricing.push({
              id: `${category.id}-${network}-${plan.id}`, // unique prefix
              planName: plan.name,
              serviceCategory: category.id,
              network,
              providerCost,
              atlasPrice,
              resellerPrice,
              commissionRate: 5,
              status: "active",
              lastUpdated: updatedAt,
              updatedBy: admin,
            });
          }
        }
      }
    }
  }

  return pricing;
}

export const mockPlanPricing: PlanPricing[] = generateMockPlanPricing();