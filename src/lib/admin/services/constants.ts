import type {
  FilterGroup,
  ServiceSection,
} from "@/lib/domains/catalog";

export type { FilterGroup, ServiceSection };

type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "brand";

export const FILTER_GROUP_LABEL: Record<FilterGroup, string> = {
  all: "All",
  airtime: "Airtime",
  data: "Data",
  tv: "TV",
  bills: "Bills",
  more: "More",
};

export const ALL_FILTER_GROUPS: FilterGroup[] = [
  "airtime",
  "data",
  "tv",
  "bills",
  "more",
];

export type ServiceStatus = "available" | "coming_soon" | "inactive";

export const STATUS_LABEL: Record<ServiceStatus, string> = {
  available: "Available",
  coming_soon: "Coming soon",
  inactive: "Inactive",
};

export const STATUS_VARIANT: Record<ServiceStatus, BadgeVariant> = {
  available: "success",
  coming_soon: "warning",
  inactive: "neutral",
};

export const SECTION_LABEL: Record<ServiceSection, string> = {
  digital_services: "Digital services",
  resellers: "Resellers",
  ecommerce: "Ecommerce",
};

export const ALL_SECTIONS: ServiceSection[] = [
  "digital_services",
  "resellers",
  "ecommerce",
];

export type SortKey = "displayOrder" | "name" | "status" | "plans";

export const SORT_LABEL: Record<SortKey, string> = {
  displayOrder: "Custom order",
  name: "Name",
  status: "Status",
  plans: "Most plans",
};

export const ALL_SORT_KEYS: SortKey[] = [
  "displayOrder",
  "name",
  "status",
  "plans",
];

export const PAGE_SIZE = 12;

export const SERVICE_RETENTION_DAYS = 90;