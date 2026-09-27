export type FormFieldConfig = {
  name: string;
  label: string;
  type: "text" | "tel" | "select" | "number";
  placeholder?: string;
  required?: boolean;
  options?: string[];
};

export type PlanStatusHistoryEntry = {
  timestamp: string;
  admin: string;
  status: "active" | "inactive";
};

export type Plan = {
  id: string;
  name: string;
  description?: string;
  price: number;
  providerCost?: number;
  providerCostInferred?: boolean;
  validity?: string;
  active?: boolean;
  typeTag?: string;
  providerId?: string;
  statusHistory?: PlanStatusHistoryEntry[];
};

export type PlanCategory = {
  name: string;
  plans: Plan[];
};

export type ServiceSection = "digital_services" | "resellers" | "ecommerce";

export type FilterGroup = "all" | "airtime" | "data" | "tv" | "bills" | "more";

export type CategoryStatus = "available" | "coming_soon" | "inactive";

export type PlanStatus = "active" | "inactive";

export type CustomAmountConfig = {
  label: string;
  min?: number;
  max?: number;
};

export type FormConfig = {
  fields: FormFieldConfig[];
  plans?: Plan[];
  planCategories?: PlanCategory[];
  networkPlanCategories?: Record<string, PlanCategory[]>;
  customAmount?: CustomAmountConfig;
  selectionType?: "plans" | "amounts";
};

export type ServiceCategory = {
  id: string;
  name: string;
  description: string;
  icon: string;
  available: boolean;
  comingSoon?: boolean;
  comingSoonReason?: string;
  disabledReason?: string;
  filterGroup: FilterGroup;
  sections?: ServiceSection[];
  availableToResellers?: boolean;
  providerIds?: string[];
  displayOrder: number;
  networkOptions?: string[];
  formConfig?: FormConfig;
};

export type CatalogSnapshot = {
  categories: ServiceCategory[];
  version: number;
};

export type CatalogActor = {
  id: string;
  name: string;
  email: string;
};

export type PlanPricingRow = {
  planId: string;
  categoryId: string;
  categoryName: string;
  planName: string;
  network?: string;
  validity?: string;
  typeTag?: string;
  providerCost: number;
  providerCostInferred: boolean;
  atlasPrice: number;
  resellerPrice: number;
  commissionRatePercent: number;
  margin: number;
  marginPercent: number;
  status: PlanStatus;
  active: boolean;
};

export type CategoryRollupRow = {
  categoryId: string;
  categoryName: string;
  planCount: number;
  activePlanCount: number;
  averageMarginPercent: number;
  totalProviderCost: number;
  totalAtlasPrice: number;
};