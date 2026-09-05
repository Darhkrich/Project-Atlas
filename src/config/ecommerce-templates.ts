import type { MerchantTemplateCategory } from "@/types/merchant-storefront";

export type EcommerceTemplateMeta = {
  id: string;
  name: string;
  category: MerchantTemplateCategory;
  description: string;
  thumbnail: string;
  attributes: string[];
};

export const ecommerceTemplates: EcommerceTemplateMeta[] = [
  {
    id: "tpl-general-store",
    name: "General Store",
    category: "general",
    description: "Versatile layout for any type of online store.",
    thumbnail:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=500&fit=crop",
    attributes: ["Product grid", "Cart & checkout", "Responsive design"],
  },
  {
    id: "tpl-cosmetics-luxe",
    name: "Cosmetics Luxe",
    category: "cosmetics",
    description: "Elegant layout for beauty and skincare brands.",
    thumbnail:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=500&fit=crop",
    attributes: ["Hero banner", "Featured products", "Elegant theme"],
  },
  {
    id: "tpl-fashion-modern",
    name: "Fashion Modern",
    category: "clothing",
    description: "Clean and modern for fashion and apparel.",
    thumbnail:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=500&fit=crop",
    attributes: ["Lookbook section", "Category spotlight", "Bold hero"],
  },
];