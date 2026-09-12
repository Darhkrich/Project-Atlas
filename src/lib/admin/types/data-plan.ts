// lib/admin/types/data-plan.ts

import type { Plan } from "@/lib/services-page-data";

/**
 * DataPlan is the same entity as Plan. The two names are kept for
 * backwards compatibility with existing consumers; new code should prefer
 * `Plan` when referring to the catalog shape and `DataPlan` when referring
 * to it inside the Data Plans admin.
 */
export type DataPlan = Plan;

export interface DataPlanCategory {
  id: string;
  name: string;
  plans: DataPlan[];
}

export interface DataNetwork {
  id: string;
  name: string;
  categories: DataPlanCategory[];
}