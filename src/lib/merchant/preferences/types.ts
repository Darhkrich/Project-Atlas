export type MerchantTheme = "light" | "dark" | "system";

export interface NotificationPreferences {
  newOrder: boolean;
  orderStatus: boolean;
  lowStock: boolean;
  subscription: boolean;
}

export interface MerchantPreferences {
  storeSlug: string;
  theme: MerchantTheme;
  notifications: NotificationPreferences;
  updatedAt: number;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  newOrder: true,
  orderStatus: true,
  lowStock: true,
  subscription: false,
};

export const DEFAULT_THEME: MerchantTheme = "system";