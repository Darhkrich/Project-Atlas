export const OVERVIEW_COPY = {
  greetingMorning: "Good morning",
  greetingAfternoon: "Good afternoon",
  greetingEvening: "Good evening",
  subtitleWithWork: "Here is what needs your attention.",
  subtitleQuiet: "You are all caught up.",
  emptyTitle: "Your shop is open",
  emptyBody:
    "Your first order will appear here the moment a customer buys from your storefront.",
  emptyAction: "View your storefront",
  noValue: "\u2014",
} as const;

export const SECTION_LABELS = {
  actionQueue: "Action queue",
  wallet: "Wallet",
  storefront: "Storefront",
  recentOrders: "Recent orders",
  quickSell: "Quick sell",
  topServices: "Top services",
  tier: "Tier",
} as const;

export const WALLET_COPY = {
  availableLabel: "Available balance",
  fundAction: "Fund wallet",
  withdrawAction: "Withdraw",
  setUpAction: "Set up wallet",
  setUpBody: "You do not have a wallet yet. Set one up to start selling.",
  setUpTitle: "No wallet yet",
  revenueTodayLabel: "Revenue today",
  commissionsLabel: "Commissions this month",
  pendingLabel: "Withdrawals pending",
  ordersSuffixOne: " order",
  ordersSuffixMany: " orders",
  pendingSuffixOne: " pending",
  pendingSuffixMany: " pending",
  pendingNone: "None",
  todayHeading: "Today",
  storefrontHeading: "Storefront",
  ordersTodayLabel: "Orders today",
  ordersPlacedOne: "1 order placed",
  ordersPlacedMany: "orders placed",
  noStorefront: "No storefront yet.",
  reviewAction: "Review",
  manageAction: "Manage",
} as const;

export const TIER_BANNER_COPY = {
  sectionLabel: "Tier",
  currentLabel: "Current tier",
  commissionSuffix: "% commission",
  topTierMessage: "You are on the highest tier.",
  progressPrefix: "Earn ",
  progressMiddle: " more ",
  progressSuffix: " to reach ",
  nextTierHeading: "What you unlock",
  rateRowLabel: "Commission on airtime",
  rateRowArrow: "\u2192",
  extraCutRowLabel: "Atlas cut",
  perksRowLabel: "Perks",
} as const;

export const ACTION_QUEUE_COPY: Record<
  | "verification"
  | "failed_orders"
  | "pending_withdrawals"
  | "unpublished_storefront"
  | "no_services",
  { headline: string; body: string }
> = {
  verification: {
    headline: "Finish your verification",
    body: "Verify your account to unlock full selling.",
  },
  failed_orders: {
    headline: "Some orders did not go through",
    body: "Review the failed orders from the last 24 hours.",
  },
  pending_withdrawals: {
    headline: "Withdrawals awaiting approval",
    body: "You have withdrawals that are still being processed.",
  },
  unpublished_storefront: {
    headline: "Your storefront is not live yet",
    body: "Publish your storefront so customers can buy from you.",
  },
  no_services: {
    headline: "No services are enabled",
    body: "Enable at least one service so customers have something to buy.",
  },
} as const;