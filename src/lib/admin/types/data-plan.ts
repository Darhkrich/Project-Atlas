export interface DataPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  validity: string; // e.g., "1 day", "7 days"
  active: boolean;
  typeTag?: string; // e.g., "Unlimited", "Non-Expiry", "Special"
  providerCost?: number; // mock read-only margin info
  statusHistory?: { timestamp: string; admin: string; status: "active" | "inactive" }[];
}

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