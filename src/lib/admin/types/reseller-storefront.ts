export interface ResellerStorefront {
  id: string;
  resellerId: string;
  resellerName: string;
  storeName: string;
  slug: string;
  template: string;
  status: "live" | "disabled" | "pending";
  usersCount: number;
  orders30d: number;
  revenue30d: number;
  createdAt: string;
  lastActive: string;
}