export type ServiceCategory = "data" | "airtime" | "bills" | "tv" | "exam_pins" | "other";
export type ServiceStatus = "active" | "inactive" | "maintenance";

export interface ServicePricing {
  id: string;
  serviceName: string;
  category: ServiceCategory;
  providerCost: number;
  atlasPrice: number;
  resellerPrice: number;
  commissionRate: number;
  status: ServiceStatus;
  lastUpdated: string;
  updatedBy: string;
}

export interface PriceChangeRecord {
  id: string;
  serviceId: string;
  admin: string;
  timestamp: string;
  oldValues: Partial<ServicePricing>;
  newValues: Partial<ServicePricing>;
  reason: string;
}

export interface CommissionRuleConfig {
  id: string;
  name: string;
  description: string;
  value: string;
  enabled: boolean;
}

export const SERVICE_CATEGORIES: { value: ServiceCategory; label: string }[] = [
  { value: "data", label: "Data" },
  { value: "airtime", label: "Airtime" },
  { value: "bills", label: "Bills" },
  { value: "tv", label: "TV" },
  { value: "exam_pins", label: "Exam Pins" },
  { value: "other", label: "Other" },
];

export const SERVICE_STATUS_LABELS: Record<ServiceStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  maintenance: "Maintenance",
};