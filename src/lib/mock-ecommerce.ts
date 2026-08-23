import { Template, SubscriptionPlan, TemplateCategory } from "@/types/ecommerce";


export const templates: Template[] = [
  {
    id: "tpl-cosmetics-luxe",
    name: "Cosmetics Luxe",
    category: "cosmetics",
    description: "Elegant layout for beauty and skincare brands.",
    thumbnailUrl: "/templates/cosmetics-luxe.png",
    componentName: "TemplateCosmeticsLuxe",
    defaultSettings: {
      brandColor: "#4d8e44",
      accentColor: "#c89c1e",
      heroHeadline: "Beauty that shines",
      heroDescription: "Discover our premium collection of cosmetics.",
      aboutText: "We believe in natural beauty and high-quality products.",
    },
  },
  {
    id: "tpl-fashion-modern",
    name: "Fashion Modern",
    category: "clothing",
    description: "Clean and modern for fashion and apparel.",
    thumbnailUrl: "/templates/fashion-modern.png",
    componentName: "TemplateFashionModern",
    defaultSettings: {
      brandColor: "#4d8e44",
      accentColor: "#c89c1e",
      heroHeadline: "Style that speaks",
      heroDescription: "Trendy fashion for every occasion.",
      aboutText: "Quality fabrics and timeless designs.",
    },
  },
  {
    id: "tpl-garden-natural",
    name: "Garden Natural",
    category: "garden",
    description: "Fresh and organic for plants and outdoor products.",
    thumbnailUrl: "/templates/garden-natural.png",
    componentName: "TemplateGardenNatural",
    defaultSettings: {
      brandColor: "#4d8e44",
      accentColor: "#dfb429",
      heroHeadline: "Bring nature home",
      heroDescription: "Everything for your garden and outdoor living.",
      aboutText: "Sustainable products for greener living.",
    },
  },
  {
    id: "tpl-accessories-minimal",
    name: "Accessories Minimal",
    category: "accessories",
    description: "Minimalist design for jewelry and accessories.",
    thumbnailUrl: "/templates/accessories-minimal.png",
    componentName: "TemplateAccessoriesMinimal",
    defaultSettings: {
      brandColor: "#4d8e44",
      accentColor: "#c89c1e",
      heroHeadline: "Details that matter",
      heroDescription: "Handpicked accessories for every style.",
      aboutText: "Crafted with care and precision.",
    },
  },
  {
    id: "tpl-general-store",
    name: "General Store",
    category: "general",
    description: "Versatile layout for any type of online store.",
    thumbnailUrl: "/templates/general-store.png",
    componentName: "TemplateGeneralStore",
    defaultSettings: {
      brandColor: "#4d8e44",
      accentColor: "#c89c1e",
      heroHeadline: "Welcome to our store",
      heroDescription: "Discover quality products at great prices.",
      aboutText: "We’re here to serve you.",
    },
  },
];

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "starter",
    name: "Starter",
    code: "starter",
    priceMonthly: "GH₵50",
    priceAnnual: "GH₵500",
    features: [
      "1 template category",
      "Up to 20 products",
      "Basic support",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    code: "growth",
    priceMonthly: "GH₵150",
    priceAnnual: "GH₵1,500",
    features: [
      "3 template categories",
      "Up to 200 products",
      "Basic analytics",
      "Priority support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    code: "pro",
    priceMonthly: "GH₵400",
    priceAnnual: "GH₵4,000",
    features: [
      "All templates",
      "Unlimited products",
      "Advanced analytics",
      "Custom domain (future)",
      "24/7 support",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    code: "enterprise",
    priceMonthly: "Custom",
    priceAnnual: "Custom",
    features: [
      "Dedicated support",
      "API access",
      "Multi-admin",
      "Custom development",
    ],
  },
];

export const templateCategories: { value: TemplateCategory; label: string }[] = [
  { value: "cosmetics", label: "Cosmetics" },
  { value: "clothing", label: "Clothing" },
  { value: "garden", label: "Garden" },
  { value: "accessories", label: "Accessories" },
  { value: "electronics", label: "Electronics" },
  { value: "home", label: "Home & Living" },
  { value: "food", label: "Food & Beverage" },
  { value: "sports", label: "Sports & Fitness" },
  { value: "health", label: "Health & Wellness" },
  { value: "general", label: "General" },
];