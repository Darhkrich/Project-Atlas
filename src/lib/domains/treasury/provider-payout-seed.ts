import type { ProviderPayoutBatch } from "./provider-payout-types";

const SYSTEM_ACTOR = {
  id: "system",
  name: "System",
  email: "system@atlas.com",
};

const PERIOD_ID = "2026-06";

export function seedProviderPayoutBatches(): ProviderPayoutBatch[] {
  return [
    {
      id: "PPB-" + PERIOD_ID + "-PRV-001",
      periodId: PERIOD_ID,
      providerId: "PRV-001",
      providerName: "PayConnect",
      status: "pending_approval",
      lines: [
        {
          id: "PRV-001:data:mtn-1gb-7d",
          planId: "data:mtn-1gb-7d",
          planName: "Data 1GB",
          orderCount: 42,
          amount: 218.4,
          excludedOrderCount: 0,
        },
        {
          id: "PRV-001:data:mtn-2gb-7d",
          planId: "data:mtn-2gb-7d",
          planName: "Data 2GB",
          orderCount: 28,
          amount: 261.8,
          excludedOrderCount: 0,
        },
      ],
      totalAmount: 480.2,
      orderCount: 70,
      excludedOrderCount: 0,
      createdBy: SYSTEM_ACTOR,
      createdAt: "2026-07-01T08:00:00.000Z",
      submittedBy: SYSTEM_ACTOR,
      submittedAt: "2026-07-01T08:05:00.000Z",
    },
    {
      id: "PPB-" + PERIOD_ID + "-PRV-002",
      periodId: PERIOD_ID,
      providerId: "PRV-002",
      providerName: "Hubtel",
      status: "pending_approval",
      lines: [
        {
          id: "PRV-002:airtime:50",
          planId: "airtime:50",
          planName: "Airtime GHS 50",
          orderCount: 156,
          amount: 397.8,
          excludedOrderCount: 0,
        },
      ],
      totalAmount: 397.8,
      orderCount: 156,
      excludedOrderCount: 12,
      createdBy: SYSTEM_ACTOR,
      createdAt: "2026-07-01T09:30:00.000Z",
      submittedBy: SYSTEM_ACTOR,
      submittedAt: "2026-07-01T09:35:00.000Z",
    },
    {
      id: "PPB-" + PERIOD_ID + "-PRV-003",
      periodId: PERIOD_ID,
      providerId: "PRV-003",
      providerName: "MTN MoMo",
      status: "pending_approval",
      lines: [
        {
          id: "PRV-003:exampins:waec-2025",
          planId: "exampins:waec-2025",
          planName: "Exam Pins WAEC 2025",
          orderCount: 88,
          amount: 149.6,
          excludedOrderCount: 0,
        },
      ],
      totalAmount: 149.6,
      orderCount: 88,
      excludedOrderCount: 0,
      createdBy: SYSTEM_ACTOR,
      createdAt: "2026-07-02T11:15:00.000Z",
      submittedBy: SYSTEM_ACTOR,
      submittedAt: "2026-07-02T11:20:00.000Z",
    },
  ];
}