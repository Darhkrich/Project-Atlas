import type { AtlasIconName } from "@/components/atlas/icons";

export type MerchantNotification = {
  id: string;
  storeSlug: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  icon: AtlasIconName;
  actionHref?: string;
  actionLabel?: string;
};

export const mockMerchantNotifications: MerchantNotification[] = [
  {
    id: "n1",
    storeSlug: "my-store",
    title: "New order received",
    description: "Order ATL-1001 for GH₵ 320.00 was placed.",
    time: "2 minutes ago",
    read: false,
    icon: "cart",
    actionHref: "/merchant/orders",
    actionLabel: "View Order",
  },
  {
    id: "n2",
    storeSlug: "my-store",
    title: "Low stock alert",
    description: "Vitamin C Face Serum has only 3 units left.",
    time: "1 hour ago",
    read: false,
    icon: "alert",
    actionHref: "/merchant/products",
    actionLabel: "View Products",
  },
  {
    id: "n3",
    storeSlug: "my-store",
    title: "Payment received",
    description: "Your wallet was credited with GH₵ 200.00.",
    time: "3 hours ago",
    read: true,
    icon: "wallet",
    actionHref: "/merchant/wallet",
    actionLabel: "View Wallet",
  },
  {
    id: "n4",
    storeSlug: "my-store",
    title: "New customer registered",
    description: "A new customer created an account.",
    time: "Yesterday",
    read: true,
    icon: "user",
    actionHref: "/merchant/customers",
    actionLabel: "View Customers",
  },
];