// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { AtlasIconName } from "@/components/atlas/icons";

export type MerchantOrderItem = {
  name: string;
  quantity: number;
  price: number;
  image?: string;
};

export type MerchantOrderStatus =
  | "New"
  | "Paid"
  | "Pending"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Failed"
  | "Refunded";

export type MerchantOrder = {
  id: string;
  storeSlug: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  date: string;
  total: string;
  items: number;
  status: MerchantOrderStatus;
  paymentMethod: string;
  paymentStatus?: "Paid" | "Pending";
  itemsDetail?: MerchantOrderItem[];
  updatedAt?: number;
};

const baseOrders: Omit<MerchantOrder, "storeSlug" | "updatedAt">[] = [
  {
    id: "ord1",
    orderNumber: "ATL-ORD-1001",
    customerName: "Abena Owusu",
    customerEmail: "abena@example.com",
    date: "Today, 10:30 AM",
    total: "GH₵ 320.00",
    items: 2,
    status: "New",
    paymentMethod: "Mobile Money",
    paymentStatus: "Paid",
    itemsDetail: [
      { name: "Vitamin C Face Serum", quantity: 2, price: 120, image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=100&h=100&fit=crop" },
      { name: "Shea Butter Body Cream", quantity: 1, price: 80, image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=100&h=100&fit=crop" },
    ],
  },
  {
    id: "ord2",
    orderNumber: "ATL-ORD-1002",
    customerName: "Kwame Mensah",
    customerEmail: "kwame@example.com",
    date: "Today, 9:15 AM",
    total: "GH₵ 150.00",
    items: 1,
    status: "Processing",
    paymentMethod: "Card",
    paymentStatus: "Paid",
    itemsDetail: [
      { name: "Aloe Vera Soothing Gel", quantity: 1, price: 150, image: "https://images.unsplash.com/photo-1601049676869-702ea24cfd58?w=100&h=100&fit=crop" },
    ],
  },
  {
    id: "ord3",
    orderNumber: "ATL-ORD-1003",
    customerName: "Yaa Boateng",
    customerEmail: "yaa@example.com",
    date: "Yesterday, 8:40 PM",
    total: "GH₵ 95.00",
    items: 2,
    status: "Pending",
    paymentMethod: "Bank Transfer",
    paymentStatus: "Pending",
    itemsDetail: [
      { name: "Lip Glow Kit", quantity: 1, price: 65, image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=100&h=100&fit=crop" },
      { name: "Charcoal Face Mask", quantity: 1, price: 30, image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=100&h=100&fit=crop" },
    ],
  },
  {
    id: "ord4",
    orderNumber: "ATL-ORD-1004",
    customerName: "Ama Serwaa",
    customerEmail: "ama@example.com",
    date: "Yesterday, 5:20 PM",
    total: "GH₵ 210.00",
    items: 1,
    status: "Delivered",
    paymentMethod: "Mobile Money",
    paymentStatus: "Paid",
    itemsDetail: [
      { name: "Coconut Oil Hair Food", quantity: 3, price: 70, image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=100&h=100&fit=crop" },
    ],
  },
  {
    id: "ord5",
    orderNumber: "ATL-ORD-1005",
    customerName: "Kofi Adjei",
    customerEmail: "kofi@example.com",
    date: "Yesterday, 9:30 PM",
    total: "GH₵ 75.00",
    items: 1,
    status: "Failed",
    paymentMethod: "Mobile Money",
    paymentStatus: "Paid",
    itemsDetail: [
      { name: "Rosewater Toner", quantity: 1, price: 75, image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=100&h=100&fit=crop" },
    ],
  },
];

export function getMockMerchantOrders(storeSlug: string): MerchantOrder[] {
  // Assign updatedAt timestamps for sorting (newer mock orders should appear below real ones but sorted among themselves)
  return baseOrders.map((order, index) => ({
    ...order,
    storeSlug,
    updatedAt: Date.now() - (baseOrders.length - index) * 3600000, // mock orders get decreasing timestamps
  }));
}