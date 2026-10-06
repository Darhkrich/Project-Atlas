import type { MerchantTemplateCategory } from "@/types/merchant-storefront";

export interface CategoryBenchmark {
  averageSalePriceGHS: number;
  typicalProductCount: number;
  mostChosenPlanCode: string;
}

// Seed data. Replace with real aggregates when the backend ships.
export const CATEGORY_BENCHMARKS: Record<
  MerchantTemplateCategory,
  CategoryBenchmark
> = {
  cosmetics: {
    averageSalePriceGHS: 120,
    typicalProductCount: 40,
    mostChosenPlanCode: "growth",
  },
  clothing: {
    averageSalePriceGHS: 180,
    typicalProductCount: 60,
    mostChosenPlanCode: "growth",
  },
  garden: {
    averageSalePriceGHS: 95,
    typicalProductCount: 35,
    mostChosenPlanCode: "starter",
  },
  accessories: {
    averageSalePriceGHS: 85,
    typicalProductCount: 45,
    mostChosenPlanCode: "starter",
  },
  electronics: {
    averageSalePriceGHS: 350,
    typicalProductCount: 25,
    mostChosenPlanCode: "growth",
  },
  home: {
    averageSalePriceGHS: 220,
    typicalProductCount: 50,
    mostChosenPlanCode: "growth",
  },
  food: {
    averageSalePriceGHS: 65,
    typicalProductCount: 80,
    mostChosenPlanCode: "growth",
  },
  sports: {
    averageSalePriceGHS: 150,
    typicalProductCount: 40,
    mostChosenPlanCode: "starter",
  },
  health: {
    averageSalePriceGHS: 110,
    typicalProductCount: 55,
    mostChosenPlanCode: "growth",
  },
  general: {
    averageSalePriceGHS: 100,
    typicalProductCount: 50,
    mostChosenPlanCode: "growth",
  },
};

export function getCategoryBenchmark(
  category: MerchantTemplateCategory
): CategoryBenchmark {
  return CATEGORY_BENCHMARKS[category];
}

export function salesToCoverPlan(
  monthlyPriceGHS: number,
  category: MerchantTemplateCategory
): number {
  const benchmark = getCategoryBenchmark(category);
  if (benchmark.averageSalePriceGHS <= 0) return 0;
  return Math.ceil(monthlyPriceGHS / benchmark.averageSalePriceGHS);
}