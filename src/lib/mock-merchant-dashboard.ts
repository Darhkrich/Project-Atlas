import type { AtlasIconName } from "@/components/atlas/icons";

export type MerchantMetric = {
  label: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: AtlasIconName;
};

export type MerchantRecentOrder = {
  id: string;
  customer: string;
  product: string;
  amount: string;
  date: string;
  status: "Paid" | "Pending" | "Failed";
  statusVariant: "success" | "warning" | "danger";
};

export type LowStockProduct = {
  id: string;
  name: string;
  stock: number;
};

export const merchantOverview = {
  metrics: [
    {
      label: "Today's Sales",
      value: "GH₵ 2,450.00",
      change: "+12.5%",
      trend: "up",
      icon: "sales",
    },
    {
      label: "Total Orders",
      value: "42",
      change: "+20.3%",
      trend: "up",
      icon: "orders",
    },
    {
      label: "Customers",
      value: "128",
      change: "+18.7%",
      trend: "up",
      icon: "users",
    },
    {
      label: "Products",
      value: "86",
      change: "",
      trend: "neutral",
      icon: "package",
    },
  ] as MerchantMetric[],
  quickActions: [
    { label: "Add Product", href: "/merchant/products/new", icon: "add" as AtlasIconName },
    { label: "View Orders", href: "/merchant/orders", icon: "orders" as AtlasIconName },
    { label: "Customize Store", href: "/merchant/storefront", icon: "store" as AtlasIconName },
    { label: "View Store", href: "/merchant/storefront", icon: "eye" as AtlasIconName },
  ],
};

export const recentMerchantOrders: MerchantRecentOrder[] = [
  {
    id: "mo1",
    customer: "Abena Owusu",
    product: "Vitamin C Face Serum",
    amount: "GH₵ 120.00",
    date: "Today, 10:30 AM",
    status: "Paid",
    statusVariant: "success",
  },
  {
    id: "mo2",
    customer: "Kwame Mensah",
    product: "Shea Butter Body Cream",
    amount: "GH₵ 85.00",
    date: "Today, 9:15 AM",
    status: "Paid",
    statusVariant: "success",
  },
  {
    id: "mo3",
    customer: "Yaa Boateng",
    product: "Aloe Vera Gel",
    amount: "GH₵ 65.00",
    date: "Yesterday, 8:40 PM",
    status: "Pending",
    statusVariant: "warning",
  },
  {
    id: "mo4",
    customer: "Ama Serwaa",
    product: "Lip Glow Kit",
    amount: "GH₵ 150.00",
    date: "Yesterday, 5:20 PM",
    status: "Paid",
    statusVariant: "success",
  },
  {
    id: "mo5",
    customer: "Kofi Adjei",
    product: "Charcoal Face Mask",
    amount: "GH₵ 95.00",
    date: "Yesterday, 9:30 PM",
    status: "Failed",
    statusVariant: "danger",
  },
];

export const lowStockProducts: LowStockProduct[] = [
  { id: "p1", name: "Rosewater Toner", stock: 3 },
  { id: "p2", name: "Coconut Oil Hair Food", stock: 5 },
  { id: "p3", name: "Vitamin C Brightening Scrub", stock: 2 },
];