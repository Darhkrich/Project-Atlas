export type StorefrontType = "reseller" | "merchant";
export type StorefrontStatus = "live" | "disabled" | "pending";

export interface UnifiedStorefront {
  id: string;
  type: StorefrontType;
  ownerId: string;
  ownerName: string;
  storeName: string;
  slug: string;
  template: string;
  status: StorefrontStatus;
  usersCount: number;
  orders30d: number;
  revenue30d: number;
  createdAt: string;
  lastActive: string;
  publicUrl: string;
  primaryColor?: string;
  accentColor?: string;
}