import type { Promotion } from "../types/promotion";

const now = Date.now();
const day = 86_400_000;
const hour = 3_600_000;

const at = (offsetMs: number) => new Date(now + offsetMs).toISOString();

export const mockPromotions: Promotion[] = [
  {
    id: "PRO-001",
    name: "Welcome discount for new customers",
    description:
      "First-time customers get 10% off their first Atlas purchase.",
    audience: "customer",
    surfaces: ["atlas_d2c", "customer_dashboard"],
    conditions: {
      firstOrderOnly: true,
    },
    mechanic: { kind: "auto_discount", mode: "percent", value: 10 },
    startDate: at(-day * 30),
    endDate: at(day * 60),
    createdAt: at(-day * 30),
    updatedAt: at(-day * 30),
    createdBy: "Efua Owusu",
  },
  {
    id: "PRO-002",
    name: "Holiday cashback campaign",
    description:
      "5% cashback to Atlas wallet on all data and airtime purchases through the holiday weekend.",
    audience: "customer",
    surfaces: ["atlas_d2c"],
    conditions: {
      serviceScope: ["data", "airtime"],
    },
    mechanic: { kind: "cashback", percent: 5 },
    startDate: at(-day * 5),
    endDate: at(day * 3),
    createdAt: at(-day * 10),
    updatedAt: at(-day * 10),
    createdBy: "Akosua Boateng",
  },
  {
    id: "PRO-003",
    name: "Spend GHS 500 earn bonus points",
    description:
      "Customers who spend GHS 500 or more on Atlas earn 3x points this month.",
    audience: "customer",
    surfaces: ["atlas_d2c", "customer_dashboard"],
    conditions: {
      minSpendGHS: 500,
    },
    mechanic: { kind: "atlas_points", pointsPerGHS: 3 },
    startDate: at(day * 2),
    endDate: at(day * 32),
    createdAt: at(-day * 1),
    updatedAt: at(-day * 1),
    createdBy: "Yaw Mensah",
  },
  {
    id: "PRO-004",
    name: "Reseller dashboard promotion — Q4 orders",
    description:
      "Resellers who complete 20 orders in Q4 get 2% cashback on their next payout.",
    audience: "reseller",
    surfaces: ["reseller_dashboard"],
    conditions: {
      minOrders: 20,
    },
    mechanic: { kind: "cashback", percent: 2 },
    startDate: at(-day * 10),
    endDate: at(day * 80),
    createdAt: at(-day * 12),
    updatedAt: at(-day * 12),
    createdBy: "Efua Owusu",
  },
  {
    id: "PRO-005",
    name: "Gold tier loyalty offer",
    description:
      "Gold-tier resellers get 5% off all data purchases for the rest of the quarter.",
    audience: "reseller",
    surfaces: ["reseller_dashboard"],
    conditions: {
      tierIds: ["TIER-3"],
      serviceScope: ["data"],
    },
    mechanic: { kind: "auto_discount", mode: "percent", value: 5 },
    startDate: at(-day * 45),
    endDate: at(-hour * 6),
    createdAt: at(-day * 50),
    updatedAt: at(-day * 45),
    createdBy: "Akosua Boateng",
  },
  {
    id: "PRO-006",
    name: "Merchant Q1 subscription discount",
    description:
      "25% off the first three months for merchants who upgrade to Growth or Scale plans.",
    audience: "merchant",
    surfaces: ["merchant_dashboard"],
    conditions: {
      firstOrderOnly: false,
    },
    mechanic: {
      kind: "subscription_discount",
      percent: 25,
      planIds: ["growth", "scale"],
    },
    startDate: at(day * 1),
    endDate: at(day * 90),
    createdAt: at(-day * 2),
    updatedAt: at(-day * 2),
    createdBy: "Yaw Mensah",
  },
  {
    id: "PRO-007",
    name: "Ended: Black Friday merchant boost",
    description:
      "Merchant subscription discount ran through Black Friday. Ended early when the campaign budget was reallocated.",
    audience: "merchant",
    surfaces: ["merchant_dashboard"],
    conditions: {},
    mechanic: {
      kind: "subscription_discount",
      percent: 40,
    },
    startDate: at(-day * 120),
    endDate: at(-day * 90),
    createdAt: at(-day * 130),
    updatedAt: at(-day * 95),
    createdBy: "Akosua Boateng",
    endedAt: at(-day * 95),
    endedReason: "Budget reallocated to Q1 launch.",
  },
];