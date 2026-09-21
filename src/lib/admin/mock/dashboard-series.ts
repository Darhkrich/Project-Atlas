
// lib/admin/mock/dashboard-series.ts
// Full file. Supersedes previous versions.

export interface UserGrowthPoint {
  month: string;
  resellers: number;
  customers: number;
  merchants: number;
}

export const userGrowthSeries: UserGrowthPoint[] = [
  { month: "Jan", resellers: 180, customers: 8000, merchants: 0 },
  { month: "Feb", resellers: 200, customers: 8500, merchants: 0 },
  { month: "Mar", resellers: 220, customers: 9000, merchants: 0 },
  { month: "Apr", resellers: 250, customers: 9500, merchants: 0 },
  { month: "May", resellers: 270, customers: 10000, merchants: 0 },
  { month: "Jun", resellers: 285, customers: 10500, merchants: 0 },
  { month: "Jul", resellers: 300, customers: 11000, merchants: 0 },
  { month: "Aug", resellers: 310, customers: 11500, merchants: 0 },
  { month: "Sep", resellers: 320, customers: 12000, merchants: 0 },
  { month: "Oct", resellers: 330, customers: 12400, merchants: 0 },
  { month: "Nov", resellers: 335, customers: 12700, merchants: 0 },
  { month: "Dec", resellers: 342, customers: 12980, merchants: 0 },
];

export interface StoreGrowthPoint {
  month: string;
  resellerStorefronts: number;
  merchantStores: number;
}

export const storeGrowthSeries: StoreGrowthPoint[] = [
  { month: "Jan", resellerStorefronts: 140, merchantStores: 0 },
  { month: "Feb", resellerStorefronts: 152, merchantStores: 0 },
  { month: "Mar", resellerStorefronts: 161, merchantStores: 0 },
  { month: "Apr", resellerStorefronts: 172, merchantStores: 0 },
  { month: "May", resellerStorefronts: 179, merchantStores: 0 },
  { month: "Jun", resellerStorefronts: 185, merchantStores: 0 },
  { month: "Jul", resellerStorefronts: 191, merchantStores: 0 },
  { month: "Aug", resellerStorefronts: 197, merchantStores: 0 },
  { month: "Sep", resellerStorefronts: 201, merchantStores: 0 },
  { month: "Oct", resellerStorefronts: 205, merchantStores: 0 },
  { month: "Nov", resellerStorefronts: 208, merchantStores: 0 },
  { month: "Dec", resellerStorefronts: 210, merchantStores: 0 },
];

export interface RefundTrendPoint {
  month: string;
  ecommerce: number;
  reseller: number;
  digitalServices: number;
}

export const refundTrendSeries: RefundTrendPoint[] = [
  { month: "Jan", ecommerce: 2, reseller: 3, digitalServices: 1 },
  { month: "Feb", ecommerce: 3, reseller: 4, digitalServices: 1 },
  { month: "Mar", ecommerce: 2, reseller: 5, digitalServices: 2 },
  { month: "Apr", ecommerce: 4, reseller: 6, digitalServices: 2 },
  { month: "May", ecommerce: 3, reseller: 5, digitalServices: 1 },
  { month: "Jun", ecommerce: 5, reseller: 7, digitalServices: 2 },
  { month: "Jul", ecommerce: 4, reseller: 6, digitalServices: 2 },
  { month: "Aug", ecommerce: 5, reseller: 8, digitalServices: 3 },
  { month: "Sep", ecommerce: 6, reseller: 9, digitalServices: 2 },
  { month: "Oct", ecommerce: 5, reseller: 7, digitalServices: 2 },
  { month: "Nov", ecommerce: 4, reseller: 6, digitalServices: 2 },
  { month: "Dec", ecommerce: 4, reseller: 6, digitalServices: 2 },
];

export interface SupportTicketTrendPoint {
  week: string;
  open: number;
  pending: number;
  urgent: number;
}

export const supportTicketTrendSeries: SupportTicketTrendPoint[] = [
  { week: "W1", open: 14, pending: 6, urgent: 3 },
  { week: "W2", open: 16, pending: 7, urgent: 4 },
  { week: "W3", open: 15, pending: 6, urgent: 4 },
  { week: "W4", open: 17, pending: 8, urgent: 5 },
  { week: "W5", open: 19, pending: 7, urgent: 5 },
  { week: "W6", open: 18, pending: 8, urgent: 5 },
];

export interface PaymentMethodPoint {
  month: string;
  mobileMoney: number;
  wallet: number;
  card: number;
  bank: number;
}

export const paymentMethodSeries: PaymentMethodPoint[] = [
  { month: "Jan", mobileMoney: 40, wallet: 25, card: 20, bank: 15 },
  { month: "Feb", mobileMoney: 41, wallet: 26, card: 19, bank: 14 },
  { month: "Mar", mobileMoney: 42, wallet: 27, card: 18, bank: 13 },
  { month: "Apr", mobileMoney: 43, wallet: 28, card: 17, bank: 12 },
  { month: "May", mobileMoney: 44, wallet: 29, card: 16, bank: 11 },
  { month: "Jun", mobileMoney: 45, wallet: 30, card: 15, bank: 10 },
];

export interface TopPerformerTrendPoint {
  month: string;
  value: number;
}

export const topPerformerTrendSeries: Record<string, TopPerformerTrendPoint[]> = {
  "Kwame Store": [
    { month: "Jan", value: 32000 },
    { month: "Feb", value: 35000 },
    { month: "Mar", value: 38000 },
    { month: "Apr", value: 40000 },
    { month: "May", value: 43000 },
    { month: "Jun", value: 45000 },
  ],
  "Adjoa Ventures": [
    { month: "Jan", value: 30000 },
    { month: "Feb", value: 32000 },
    { month: "Mar", value: 34000 },
    { month: "Apr", value: 35000 },
    { month: "May", value: 36000 },
    { month: "Jun", value: 38000 },
  ],
  "Yaw Enterprises": [
    { month: "Jan", value: 36000 },
    { month: "Feb", value: 35000 },
    { month: "Mar", value: 34000 },
    { month: "Apr", value: 33000 },
    { month: "May", value: 32000 },
    { month: "Jun", value: 32000 },
  ],
  "Efua Trading": [
    { month: "Jan", value: 22000 },
    { month: "Feb", value: 24000 },
    { month: "Mar", value: 25000 },
    { month: "Apr", value: 26000 },
    { month: "May", value: 27000 },
    { month: "Jun", value: 28000 },
  ],
  "Kojo & Sons": [
    { month: "Jan", value: 18000 },
    { month: "Feb", value: 20000 },
    { month: "Mar", value: 21000 },
    { month: "Apr", value: 22000 },
    { month: "May", value: 24000 },
    { month: "Jun", value: 25000 },
  ],
  TechHub: [
    { month: "Jan", value: 15000 },
    { month: "Feb", value: 17000 },
    { month: "Mar", value: 19000 },
    { month: "Apr", value: 20000 },
    { month: "May", value: 21000 },
    { month: "Jun", value: 22000 },
  ],
  FashionPlus: [
    { month: "Jan", value: 21000 },
    { month: "Feb", value: 20000 },
    { month: "Mar", value: 20000 },
    { month: "Apr", value: 19000 },
    { month: "May", value: 19000 },
    { month: "Jun", value: 19000 },
  ],
  HomeEssentials: [
    { month: "Jan", value: 14000 },
    { month: "Feb", value: 14500 },
    { month: "Mar", value: 15000 },
    { month: "Apr", value: 15500 },
    { month: "May", value: 15800 },
    { month: "Jun", value: 16000 },
  ],
  GadgetWorld: [
    { month: "Jan", value: 12000 },
    { month: "Feb", value: 12500 },
    { month: "Mar", value: 13000 },
    { month: "Apr", value: 13200 },
    { month: "May", value: 13500 },
    { month: "Jun", value: 14000 },
  ],
  BeautyCorner: [
    { month: "Jan", value: 9000 },
    { month: "Feb", value: 10000 },
    { month: "Mar", value: 10500 },
    { month: "Apr", value: 11000 },
    { month: "May", value: 11500 },
    { month: "Jun", value: 12000 },
  ],
};

export interface OrderStatusDistributionEntry {
  name: string;
  value: number;
  colorName: "success" | "warning" | "danger" | "neutral";
}

export const orderStatusDistribution: OrderStatusDistributionEntry[] = [
  { name: "Successful", value: 8200, colorName: "success" },
  { name: "Pending", value: 120, colorName: "warning" },
  { name: "Failed", value: 80, colorName: "danger" },
  { name: "Cancelled", value: 20, colorName: "neutral" },
];