import type { EcommerceTemplate } from "../types/ecommerce-template";

export const mockEcommerceTemplates: EcommerceTemplate[] = [
  {
    id: "tpl-general-store",
    name: "General Store",
    category: "General",
    description: "Classic ecommerce layout for general merchandise.",
    componentName: "GeneralStoreTemplate",
    allowedPlans: ["starter", "growth", "pro", "premium"],
    isActive: true,
    usageCount: 85,
  },
  {
    id: "tpl-cosmetics-luxe",
    name: "Cosmetics Luxe",
    category: "Beauty",
    description: "Elegant template for cosmetics and beauty products.",
    componentName: "CosmeticsLuxeTemplate",
    allowedPlans: ["growth", "pro", "premium"],
    isActive: true,
    usageCount: 34,
  },
  {
    id: "tpl-fashion-modern",
    name: "Fashion Modern",
    category: "Fashion",
    description: "Modern layout for fashion boutiques.",
    componentName: "FashionModernTemplate",
    allowedPlans: ["pro", "premium"],
    isActive: true,
    usageCount: 22,
  },
  {
    id: "tpl-electronics-hub",
    name: "Electronics Hub",
    category: "Electronics",
    description: "Structured template for electronics stores.",
    componentName: "ElectronicsHubTemplate",
    allowedPlans: ["premium"],
    isActive: false,
    usageCount: 0,
  },
];