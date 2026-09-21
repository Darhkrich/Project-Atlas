import type { PlanCode } from "@/config/subscription-plans";

export type TemplateCategory =
  | "general"
  | "beauty"
  | "fashion"
  | "electronics"
  | "home"
  | "food"
  | "sports"
  | "health"
  | "garden"
  | "accessories"
  | "other";

export interface EcommerceTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  thumbnail?: string;
  componentName: string;
  allowedPlans: PlanCode[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}

export type TemplateAuditAction =
  | "Created"
  | "Updated"
  | "Activated"
  | "Deactivated"
  | "Duplicated"
  | "Deleted";

export interface TemplateAuditEntry {
  id: string;
  templateId: string;
  templateName: string;
  action: TemplateAuditAction;
  admin: string;
  adminEmail: string;
  timestamp: string;
  changes?: { field: string; from: string; to: string }[];
  reason?: string;
}