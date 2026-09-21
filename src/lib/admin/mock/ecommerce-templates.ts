import type { EcommerceTemplate } from "../types/ecommerce-template";

const now = Date.now();
const day = 86_400_000;
const at = (offsetMs: number) => new Date(now + offsetMs).toISOString();

export const mockEcommerceTemplates: EcommerceTemplate[] = [
  {
    id: "tpl-general-store",
    name: "General Store",
    category: "general",
    description: "Classic ecommerce layout for general merchandise.",
    componentName: "GeneralStoreTemplate",
    allowedPlans: ["starter", "growth", "pro", "enterprise"],
    isActive: true,
    createdAt: at(-day * 220),
    updatedAt: at(-day * 30),
    updatedBy: "Efua Owusu",
  },
  {
    id: "tpl-cosmetics-luxe",
    name: "Cosmetics Luxe",
    category: "beauty",
    description: "Elegant template for cosmetics and beauty products.",
    componentName: "CosmeticsLuxeTemplate",
    allowedPlans: ["growth", "pro", "enterprise"],
    isActive: true,
    createdAt: at(-day * 180),
    updatedAt: at(-day * 45),
    updatedBy: "Yaw Mensah",
  },
  {
    id: "tpl-fashion-modern",
    name: "Fashion Modern",
    category: "fashion",
    description: "Modern layout for fashion boutiques.",
    componentName: "FashionModernTemplate",
    allowedPlans: ["pro", "enterprise"],
    isActive: true,
    createdAt: at(-day * 150),
    updatedAt: at(-day * 20),
    updatedBy: "Efua Owusu",
  },
  {
    id: "tpl-electronics-hub",
    name: "Electronics Hub",
    category: "electronics",
    description: "Structured template for electronics stores.",
    componentName: "ElectronicsHubTemplate",
    allowedPlans: ["enterprise"],
    isActive: false,
    createdAt: at(-day * 60),
    updatedAt: at(-day * 60),
    updatedBy: "Yaw Mensah",
  },
];