import { GeneralStoreTemplatePages } from "./general-store";
import { CosmeticsLuxeTemplatePages } from "./cosmetics-luxe";
import { FashionModernTemplatePages } from "./fashion-modern";
import { ecommerceTemplates } from "@/config/ecommerce-templates";

export const templateRegistry = {
  "tpl-general-store": GeneralStoreTemplatePages,
  "tpl-cosmetics-luxe": CosmeticsLuxeTemplatePages,
  "tpl-fashion-modern": FashionModernTemplatePages,
};

export const templateMetadata = ecommerceTemplates;