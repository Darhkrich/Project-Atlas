import type { ResellerPromotion } from "../types/reseller-promotion";

const now = Date.now();
const day = 86_400_000;
const hour = 3_600_000;

const at = (offsetMs: number) => new Date(now + offsetMs).toISOString();

export const mockResellerPromotions: ResellerPromotion[] = [
  {
    id: "PROMO-001",
    name: "Data Boost — All Tiers",
    description:
      "Adds 0.4 percentage points to every data commission rate for the rest of September.",
    scope: "service",
    serviceCategories: ["data"],
    boostPercentPoints: 0.4,
    startDate: at(-day * 2),
    endDate: at(day * 12),
    createdAt: at(-day * 3),
    updatedAt: at(-day * 2),
    createdBy: "Efua Owusu",
  },
  {
    id: "PROMO-002",
    name: "Gold Retention Push",
    description:
      "Gold tier gets +1.0 percentage point on all services for one week to reduce churn.",
    scope: "tier",
    tierId: "TIER-3",
    boostPercentPoints: 1.0,
    startDate: at(day * 3),
    endDate: at(day * 10),
    createdAt: at(-day * 1),
    updatedAt: at(-day * 1),
    createdBy: "Yaw Mensah",
  },
  {
    id: "PROMO-003",
    name: "Top Resellers Q3 Bonus",
    description:
      "Hand-picked top performers get +1.5pp on all services through the end of the quarter.",
    scope: "resellers",
    resellerIds: ["RS-001", "RS-011", "RS-017"],
    boostPercentPoints: 1.5,
    startDate: at(-day * 20),
    endDate: at(-hour * 4),
    createdAt: at(-day * 25),
    updatedAt: at(-day * 20),
    createdBy: "Akosua Boateng",
  },
];