/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
  CustomerRefundHistoryItem,
  Refund,
  RefundActor,
  RefundSettlement,
} from "../types/refund";
import { splitFor } from "../refunds/refunds-helpers";

const ANCHOR_MS = new Date("2025-01-15T10:00:00.000Z").getTime();
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function ago(ms: number): string {
  return new Date(ANCHOR_MS - ms).toISOString();
}

function actor(id: string, name: string, email: string): RefundActor {
  return { id, name, email };
}

const SYSTEM_ACTOR = actor("system", "System", "system@atlas.com");
const SUPPORT_ACTOR = actor("ADM-002", "Support Admin", "support@atlas.com");
const FINANCE_ACTOR = actor("ADM-003", "Finance Admin", "finance@atlas.com");

function settlement(
  id: string,
  amount: number,
  msAgo: number,
  destination: "wallet" | "original_rail",
  destinationDetail: string,
  walletId?: string
): RefundSettlement {
  return {
    id,
    amount,
    settledAt: ago(msAgo),
    destination,
    destinationDetail,
    walletId,
    actor: FINANCE_ACTOR,
    railReversalPending: destination === "original_rail" ? true : undefined,
  };
}

function history(
  entries: Array<{
    id: string;
    orderId: string;
    amount: number;
    status: "completed" | "rejected" | "pending_admin";
    daysAgo: number;
  }>
): CustomerRefundHistoryItem[] {
  return entries.map((e) => ({
    id: e.id,
    orderId: e.orderId,
    amount: e.amount,
    status: e.status,
    date: ago(e.daysAgo * DAY),
  }));
}

export function mockRefundsSeed(): Refund[] {
  return [
    {
      id: "REF-2001",
      type: "requested",
      audience: "direct",
      status: "completed",
      order: {
        orderId: "ATX-983795",
        serviceId: "svc-mtn-data",
        providerId: "prov-mtn-gh",
        paymentMethodId: "momo",
        amount: 120,
        createdAt: ago(12 * DAY),
      },
      customer: { id: "CUS-1002", name: "Ama Serwaa" },
      reseller: null,
      amount: 120,
      settlements: [
        settlement(
          "RFST-2001-1",
          120,
          12 * DAY - 4 * HOUR,
          "original_rail",
          "Mobile money reversal"
        ),
      ],
      atlasShareAmount: 120,
      resellerShareAmount: 0,
      reason: "provider_failure",
      reasonNote: "Data bundle did not arrive.",
      supportTicketId: "TKT-4011",
      atlasTreasuryDebitId: "AT-0013",
      customerHistory: history([
        { id: "REF-1900", orderId: "ATX-983500", amount: 80, status: "completed", daysAgo: 34 },
      ]),
      requestedAt: ago(12 * DAY + 6 * HOUR),
      approvedAt: ago(12 * DAY + 5 * HOUR),
      completedAt: ago(12 * DAY - 4 * HOUR),
      createdBy: SUPPORT_ACTOR,
      approvedBy: FINANCE_ACTOR,
      timeline: [
        { type: "created", status: "info", timestamp: ago(12 * DAY + 6 * HOUR), label: "Refund created", actor: SUPPORT_ACTOR },
        { type: "approved", status: "success", timestamp: ago(12 * DAY + 5 * HOUR), label: "Approved", actor: FINANCE_ACTOR },
        { type: "settled", status: "success", timestamp: ago(12 * DAY - 4 * HOUR), label: "Settled", actor: FINANCE_ACTOR },
      ],
    },
    {
      id: "REF-2002",
      type: "requested",
      audience: "storefront_user",
      status: "completed",
      order: {
        orderId: "ATX-983790",
        serviceId: "svc-airtime",
        providerId: "prov-mtn-gh",
        paymentMethodId: "wallet",
        amount: 250,
        createdAt: ago(8 * DAY),
      },
      customer: { id: "SFU-3721", name: "Guest Kwame" },
      reseller: { id: "RS-001", name: "Kwame Store" },
      amount: 250,
      settlements: [
        settlement(
          "RFST-2002-1",
          250,
          8 * DAY - 6 * HOUR,
          "wallet",
          "Storefront user wallet",
          "SFW-37210"
        ),
      ],
      atlasShareAmount: 125,
      resellerShareAmount: 125,
      resellerRecovery: {
        resellerId: "RS-001",
        walletId: "RW-001",
        amount: 125,
        recoveredAmount: 0,
        recoveryStartedAt: ago(8 * DAY - 6 * HOUR),
      },
      reason: "service_not_delivered",
      reasonNote: "Airtime never credited.",
      supportTicketId: "TKT-4014",
      atlasTreasuryDebitId: "AT-0014",
      customerHistory: history([]),
      requestedAt: ago(8 * DAY + 3 * HOUR),
      approvedAt: ago(8 * DAY + 1 * HOUR),
      completedAt: ago(8 * DAY - 6 * HOUR),
      createdBy: SUPPORT_ACTOR,
      approvedBy: FINANCE_ACTOR,
      timeline: [
        { type: "created", status: "info", timestamp: ago(8 * DAY + 3 * HOUR), label: "Refund created", actor: SUPPORT_ACTOR },
        { type: "approved", status: "success", timestamp: ago(8 * DAY + 1 * HOUR), label: "Approved", actor: FINANCE_ACTOR },
        { type: "settled", status: "success", timestamp: ago(8 * DAY - 6 * HOUR), label: "Settled", actor: FINANCE_ACTOR },
      ],
    },
    {
      id: "REF-2003",
      type: "requested",
      audience: "direct",
      status: "pending_admin",
      order: {
        orderId: "ATX-983770",
        serviceId: "svc-ecg",
        providerId: "prov-ecg-gh",
        paymentMethodId: "card",
        amount: 50,
        createdAt: ago(3 * DAY),
      },
      customer: { id: "CUS-1005", name: "Yaw Owusu" },
      reseller: null,
      amount: 50,
      settlements: [],
      atlasShareAmount: 50,
      resellerShareAmount: 0,
      reason: "customer_request",
      reasonNote: "Customer changed mind after payment.",
      supportTicketId: "TKT-4032",
      customerHistory: history([]),
      requestedAt: ago(2 * DAY),
      createdBy: SUPPORT_ACTOR,
      timeline: [
        { type: "created", status: "info", timestamp: ago(2 * DAY), label: "Refund created", actor: SUPPORT_ACTOR },
      ],
    },
    {
      id: "REF-2004",
      type: "requested",
      audience: "storefront_user",
      status: "pending_admin",
      order: {
        orderId: "ATX-983755",
        serviceId: "svc-dstv",
        providerId: "prov-multichoice",
        paymentMethodId: "wallet",
        amount: 200,
        createdAt: ago(1 * DAY + 4 * HOUR),
      },
      customer: { id: "SFU-4882", name: "Guest Abena" },
      reseller: { id: "RS-002", name: "Adjoa Ventures" },
      amount: 200,
      settlements: [],
      atlasShareAmount: 100,
      resellerShareAmount: 100,
      reason: "duplicate_charge",
      reasonNote: "Customer was charged twice for the same subscription.",
      supportTicketId: "TKT-4038",
      customerHistory: history([
        { id: "REF-1950", orderId: "ATX-983400", amount: 90, status: "rejected", daysAgo: 22 },
      ]),
      requestedAt: ago(20 * HOUR),
      createdBy: SUPPORT_ACTOR,
      timeline: [
        { type: "created", status: "info", timestamp: ago(20 * HOUR), label: "Refund created", actor: SUPPORT_ACTOR },
      ],
    },
    {
      id: "REF-2005",
      type: "requested",
      audience: "reseller",
      status: "pending_admin",
      order: {
        orderId: "ATX-983740",
        serviceId: "svc-waec",
        providerId: "prov-waec",
        paymentMethodId: "momo",
        amount: 80,
        createdAt: ago(1 * DAY + 10 * HOUR),
      },
      customer: { id: "RS-003", name: "Yaw Enterprises" },
      reseller: null,
      amount: 80,
      settlements: [],
      atlasShareAmount: 0,
      resellerShareAmount: 80,
      reason: "service_not_delivered",
      reasonNote: "Results check PIN did not work.",
      supportTicketId: "TKT-4041",
      customerHistory: history([]),
      requestedAt: ago(14 * HOUR),
      createdBy: SUPPORT_ACTOR,
      timeline: [
        { type: "created", status: "info", timestamp: ago(14 * HOUR), label: "Refund created", actor: SUPPORT_ACTOR },
      ],
    },
    {
      id: "REF-2006",
      type: "requested",
      audience: "direct",
      status: "approved",
      order: {
        orderId: "ATX-983720",
        serviceId: "svc-airtime",
        providerId: "prov-telecel-gh",
        paymentMethodId: "atlas_points",
        amount: 100,
        createdAt: ago(2 * DAY + 8 * HOUR),
      },
      customer: { id: "CUS-1008", name: "Adwoa Agyeman" },
      reseller: null,
      amount: 100,
      settlements: [],
      atlasShareAmount: 100,
      resellerShareAmount: 0,
      reason: "duplicate_charge",
      reasonNote: "Points debited twice.",
      supportTicketId: "TKT-4027",
      customerHistory: history([]),
      requestedAt: ago(2 * DAY),
      approvedAt: ago(1 * DAY + 4 * HOUR),
      createdBy: SUPPORT_ACTOR,
      approvedBy: FINANCE_ACTOR,
      timeline: [
        { type: "created", status: "info", timestamp: ago(2 * DAY), label: "Refund created", actor: SUPPORT_ACTOR },
        { type: "approved", status: "success", timestamp: ago(1 * DAY + 4 * HOUR), label: "Approved", actor: FINANCE_ACTOR },
      ],
    },
    {
      id: "REF-2007",
      type: "automatic",
      audience: "direct",
      status: "completed",
      order: {
        orderId: "ATX-983700",
        serviceId: "svc-mtn-data",
        providerId: "prov-mtn-gh",
        paymentMethodId: "wallet",
        amount: 75,
        createdAt: ago(2 * DAY),
      },
      customer: { id: "CUS-1010", name: "Efua Danso" },
      reseller: null,
      amount: 75,
      settlements: [
        settlement(
          "RFST-2007-1",
          75,
          2 * DAY - 30 * MINUTE,
          "wallet",
          "Atlas customer wallet",
          "W-10100"
        ),
      ],
      atlasShareAmount: 75,
      resellerShareAmount: 0,
      reason: "provider_failure",
      reasonNote: "Automatic refund after three failed retry attempts.",
      customerHistory: history([]),
      requestedAt: ago(2 * DAY - 30 * MINUTE),
      completedAt: ago(2 * DAY - 30 * MINUTE),
      timeline: [
        { type: "automatic", status: "success", timestamp: ago(2 * DAY - 30 * MINUTE), label: "Automatic refund issued", actor: SYSTEM_ACTOR },
        { type: "settled", status: "success", timestamp: ago(2 * DAY - 30 * MINUTE), label: "Settled", actor: SYSTEM_ACTOR },
      ],
    },
    {
      id: "REF-2008",
      type: "automatic",
      audience: "storefront_user",
      status: "completed",
      order: {
        orderId: "ATX-983680",
        serviceId: "svc-airtime",
        providerId: "prov-mtn-gh",
        paymentMethodId: "wallet",
        amount: 45,
        createdAt: ago(3 * DAY + 2 * HOUR),
      },
      customer: { id: "SFU-5103", name: "Guest Kofi" },
      reseller: { id: "RS-002", name: "Adjoa Ventures" },
      amount: 45,
      settlements: [
        settlement(
          "RFST-2008-1",
          45,
          3 * DAY + 1 * HOUR,
          "wallet",
          "Storefront user wallet",
          "SFW-51030"
        ),
      ],
      atlasShareAmount: 22.5,
      resellerShareAmount: 22.5,
      resellerRecovery: {
        resellerId: "RS-002",
        walletId: "RW-002",
        amount: 22.5,
        recoveredAmount: 0,
        recoveryStartedAt: ago(3 * DAY + 1 * HOUR),
      },
      reason: "provider_failure",
      reasonNote: "Automatic refund after three failed retry attempts.",
      customerHistory: history([]),
      requestedAt: ago(3 * DAY + 1 * HOUR),
      completedAt: ago(3 * DAY + 1 * HOUR),
      timeline: [
        { type: "automatic", status: "success", timestamp: ago(3 * DAY + 1 * HOUR), label: "Automatic refund issued", actor: SYSTEM_ACTOR },
        { type: "settled", status: "success", timestamp: ago(3 * DAY + 1 * HOUR), label: "Settled", actor: SYSTEM_ACTOR },
      ],
    },
    {
      id: "REF-2009",
      type: "requested",
      audience: "direct",
      status: "rejected",
      order: {
        orderId: "ATX-983660",
        serviceId: "svc-gotv",
        providerId: "prov-multichoice",
        paymentMethodId: "bank",
        amount: 500,
        createdAt: ago(6 * DAY),
      },
      customer: { id: "CUS-1012", name: "Akua Bediako" },
      reseller: null,
      amount: 500,
      settlements: [],
      atlasShareAmount: 500,
      resellerShareAmount: 0,
      reason: "fraud_suspected",
      reasonNote: "Customer claims no delivery. Provider logs show subscription active.",
      supportTicketId: "TKT-4019",
      customerHistory: history([
        { id: "REF-1880", orderId: "ATX-983100", amount: 300, status: "completed", daysAgo: 40 },
        { id: "REF-1870", orderId: "ATX-982900", amount: 200, status: "rejected", daysAgo: 55 },
        { id: "REF-1860", orderId: "ATX-982700", amount: 150, status: "rejected", daysAgo: 68 },
      ]),
      requestedAt: ago(5 * DAY),
      rejectedAt: ago(4 * DAY + 6 * HOUR),
      rejectedBy: FINANCE_ACTOR,
      rejectionReason: "Provider logs confirm service was delivered.",
      createdBy: SUPPORT_ACTOR,
      timeline: [
        { type: "created", status: "info", timestamp: ago(5 * DAY), label: "Refund created", actor: SUPPORT_ACTOR },
        { type: "rejected", status: "danger", timestamp: ago(4 * DAY + 6 * HOUR), label: "Rejected", actor: FINANCE_ACTOR },
      ],
    },
    {
      id: "REF-2010",
      type: "requested",
      audience: "storefront_user",
      status: "failed",
      order: {
        orderId: "ATX-983630",
        serviceId: "svc-dstv",
        providerId: "prov-multichoice",
        paymentMethodId: "card",
        amount: 60,
        createdAt: ago(9 * DAY),
      },
      customer: { id: "SFU-6219", name: "Guest Yaw" },
      reseller: { id: "RS-004", name: "Kojo & Sons" },
      amount: 60,
      settlements: [],
      atlasShareAmount: 30,
      resellerShareAmount: 30,
      reason: "provider_failure",
      reasonNote: "Card reversal rail declined the payout.",
      supportTicketId: "TKT-3998",
      customerHistory: history([]),
      requestedAt: ago(8 * DAY),
      approvedAt: ago(7 * DAY),
      createdBy: SUPPORT_ACTOR,
      approvedBy: FINANCE_ACTOR,
      timeline: [
        { type: "created", status: "info", timestamp: ago(8 * DAY), label: "Refund created", actor: SUPPORT_ACTOR },
        { type: "approved", status: "success", timestamp: ago(7 * DAY), label: "Approved", actor: FINANCE_ACTOR },
        { type: "failed", status: "danger", timestamp: ago(6 * DAY), label: "Payout failed" },
      ],
    },
  ];
}