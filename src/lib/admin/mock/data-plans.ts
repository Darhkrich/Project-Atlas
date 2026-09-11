/* eslint-disable @typescript-eslint/no-unused-vars */
import { servicesCategories } from "@/lib/services-page-data";
import type { DataNetwork, DataPlanCategory, DataPlan } from "../types/data-plan";

const dataService = servicesCategories.find(c => c.id === "data");

function generateMockDataNetworks(): DataNetwork[] {
  if (!dataService?.formConfig?.networkPlanCategories) return [];
  const networks: DataNetwork[] = [];

  for (const [networkName, planCategories] of Object.entries(dataService.formConfig.networkPlanCategories)) {
    const categories: DataPlanCategory[] = planCategories.map((cat, catIndex) => ({
      id: `cat-${networkName.toLowerCase()}-${catIndex}`,
      name: cat.name,
      plans: cat.plans.map(plan => ({
        id: plan.id,
        name: plan.name,
        description: plan.description || "",
        price: plan.price,
        validity: extractValidity(plan.description || ""),
        active: true,
        typeTag: cat.name,
        providerCost: plan.price * 0.8, // mock provider cost
        statusHistory: [],
      })),
    }));
    networks.push({
      id: `net-${networkName.toLowerCase()}`,
      name: networkName,
      categories,
    });
  }
  return networks;
}

function extractValidity(description: string): string {
  const match = description.match(/valid for (\d+ days?)/i);
  return match ? match[1] : "";
}

export const mockDataNetworks: DataNetwork[] = generateMockDataNetworks();