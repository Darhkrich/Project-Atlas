import type {
  Payment,
  PaymentReconciliation,
  PaymentFlag,
} from "@/lib/admin/types/payment";

const REFERENCE_NOW_MS = new Date("2025-01-15T10:00:00.000Z").getTime();
const HOUR = 3_600_000;
const DAY = 86_400_000;

const ago = (ms: number) => new Date(REFERENCE_NOW_MS - ms).toISOString();

interface SeedSpec {
  id: string;
  user: { id: string; name: string; type: Payment["user"]["type"] };
  amount: number;
  fee: number;
  methodId: Payment["methodId"];
  provider?: string;
  status: Payment["status"];
  source: Payment["source"];
  daysAgo: number;
  relatedOrderId?: string;
  relatedTransactionId?: string;
  relatedMerchantId?: string;
  relatedResellerId?: string;
  failureReason?: string;
  walletId?: string;
  walletStore?: Payment["walletStore"];
  walletCreditStatus?: Payment["walletCreditStatus"];
  refundStatus?: Payment["refundStatus"];
  refundAmount?: number;
  refundAdmin?: { name: string; email: string };
}

const SEEDS: SeedSpec[] = [
  {
    id: "PAY-1001",
    user: { id: "CUST-001", name: "Ama Serwaa", type: "customer" },
    amount: 20,
    fee: 0,
    methodId: "momo",
    provider: "MTN",
    status: "successful",
    source: "direct",
    daysAgo: 0,
    relatedOrderId: "ATX-983821",
    relatedTransactionId: "TXN-1001",
  },
  {
    id: "PAY-1002",
    user: { id: "CUST-002", name: "Kojo Appiah", type: "customer" },
    amount: 120,
    fee: 0,
    methodId: "wallet",
    provider: "Atlas Wallet",
    status: "failed",
    source: "direct",
    daysAgo: 0,
    relatedOrderId: "ATX-983819",
    relatedTransactionId: "TXN-1002",
    failureReason: "Insufficient wallet balance",
  },
  {
    id: "PAY-1003",
    user: { id: "CUST-003", name: "Efua Mensimah", type: "customer" },
    amount: 50,
    fee: 0,
    methodId: "momo",
    provider: "MTN",
    status: "refunded",
    source: "direct",
    daysAgo: 1,
    relatedOrderId: "ATX-983816",
    relatedTransactionId: "TXN-1003",
    refundStatus: "settled",
    refundAmount: 50,
    refundAdmin: { name: "Finance Admin", email: "finance@atlas.com" },
  },
  {
    id: "PAY-1004",
    user: { id: "MER-001", name: "TechHub Store", type: "merchant" },
    amount: 350,
    fee: 0,
    methodId: "card",
    provider: "Visa",
    status: "successful",
    source: "ecommerce",
    daysAgo: 0,
    relatedOrderId: "ORD-1001",
    relatedMerchantId: "MER-001",
    walletId: "MW-MER-001",
    walletStore: "merchant_main",
    walletCreditStatus: "credited",
  },
  {
    id: "PAY-1005",
    user: { id: "MER-002", name: "FashionPlus", type: "merchant" },
    amount: 120,
    fee: 0,
    methodId: "momo",
    provider: "MTN",
    status: "successful",
    source: "ecommerce",
    daysAgo: 0,
    relatedOrderId: "ORD-1002",
    relatedMerchantId: "MER-002",
    walletId: "MW-MER-002",
    walletStore: "merchant_main",
    walletCreditStatus: "pending",
  },
  {
    id: "PAY-1006",
    user: { id: "MER-003", name: "HomeEssentials", type: "merchant" },
    amount: 80,
    fee: 0,
    methodId: "bank",
    provider: "GCB",
    status: "failed",
    source: "ecommerce",
    daysAgo: 1,
    relatedOrderId: "ORD-1003",
    relatedMerchantId: "MER-003",
    walletId: "MW-MER-003",
    walletStore: "merchant_main",
    walletCreditStatus: "failed",
    failureReason: "Provider timeout",
  },
  {
    id: "PAY-1007",
    user: { id: "MER-004", name: "GadgetWorld", type: "merchant" },
    amount: 220,
    fee: 0,
    methodId: "card",
    provider: "Mastercard",
    status: "processing",
    source: "ecommerce",
    daysAgo: 0,
    relatedOrderId: "ORD-1004",
    relatedMerchantId: "MER-004",
  },
  {
    id: "PAY-1008",
    user: { id: "MER-001", name: "TechHub Store", type: "merchant" },
    amount: 400,
    fee: 0,
    methodId: "card",
    provider: "Visa",
    status: "successful",
    source: "ecommerce",
    daysAgo: 2,
    relatedOrderId: "ORD-1005",
    relatedMerchantId: "MER-001",
    walletId: "MW-MER-001",
    walletStore: "merchant_main",
    walletCreditStatus: "credited",
  },
  {
    id: "PAY-1009",
    user: { id: "MER-004", name: "GadgetWorld", type: "merchant" },
    amount: 220,
    fee: 0,
    methodId: "card",
    provider: "Mastercard",
    status: "refunded",
    source: "ecommerce",
    daysAgo: 3,
    relatedOrderId: "ORD-1004",
    relatedMerchantId: "MER-004",
    walletId: "MW-MER-004",
    walletStore: "merchant_main",
    walletCreditStatus: "credited",
    refundStatus: "settled",
    refundAmount: 100,
    refundAdmin: { name: "Merchant Initiated", email: "merchant@techhub.com" },
  },
  {
    id: "PAY-1010",
    user: { id: "RS-001", name: "Kwame Store", type: "reseller" },
    amount: 500,
    fee: 0,
    methodId: "bank",
    provider: "GCB",
    status: "pending",
    source: "reseller",
    daysAgo: 0,
    relatedResellerId: "RS-001",
  },
  {
    id: "PAY-1011",
    user: { id: "RS-002", name: "Adjoa Ventures", type: "reseller" },
    amount: 300,
    fee: 0,
    methodId: "momo",
    provider: "Vodafone",
    status: "successful",
    source: "reseller",
    daysAgo: 1,
    relatedResellerId: "RS-002",
    walletId: "CW-RS-002",
    walletStore: "reseller_commission",
    walletCreditStatus: "credited",
  },
  {
    id: "PAY-1012",
    user: { id: "RS-001", name: "Kwame Store", type: "reseller" },
    amount: 750,
    fee: 0,
    methodId: "momo",
    provider: "MTN",
    status: "successful",
    source: "reseller",
    daysAgo: 4,
    relatedResellerId: "RS-001",
    walletId: "CW-RS-001",
    walletStore: "reseller_commission",
    walletCreditStatus: "credited",
  },
  {
    id: "PAY-1013",
    user: { id: "CUST-004", name: "Yaw Boateng", type: "customer" },
    amount: 30,
    fee: 0,
    methodId: "atlas_points",
    provider: "Atlas Points",
    status: "successful",
    source: "direct",
    daysAgo: 2,
    relatedOrderId: "ATX-983800",
  },
  {
    id: "PAY-1014",
    user: { id: "CUST-005", name: "Akua Bediako", type: "customer" },
    amount: 15,
    fee: 0,
    methodId: "ussd",
    provider: "MTN",
    status: "successful",
    source: "direct",
    daysAgo: 3,
    relatedOrderId: "ATX-983799",
  },
  {
    id: "PAY-1015",
    user: { id: "CUST-006", name: "Nana Kofi", type: "customer" },
    amount: 200,
    fee: 0,
    methodId: "card",
    provider: "Visa",
    status: "refunded",
    source: "direct",
    daysAgo: 5,
    relatedOrderId: "ATX-983790",
    refundStatus: "settled",
    refundAmount: 200,
    refundAdmin: { name: "Finance Admin", email: "finance@atlas.com" },
  },
  {
    id: "PAY-1016",
    user: { id: "CUST-007", name: "Abena Yeboah", type: "customer" },
    amount: 45,
    fee: 0,
    methodId: "momo",
    provider: "AirtelTigo",
    status: "successful",
    source: "direct",
    daysAgo: 7,
    relatedOrderId: "ATX-983780",
  },
  {
    id: "PAY-1017",
    user: { id: "CUST-008", name: "Kwesi Antwi", type: "customer" },
    amount: 60,
    fee: 0,
    methodId: "momo",
    provider: "MTN",
    status: "refunded",
    source: "direct",
    daysAgo: 10,
    relatedOrderId: "ATX-983770",
    refundStatus: "partial",
    refundAmount: 30,
    refundAdmin: { name: "Finance Admin", email: "finance@atlas.com" },
  },
  {
    id: "PAY-1018",
    user: { id: "CUST-009", name: "Esi Danso", type: "customer" },
    amount: 25,
    fee: 0,
    methodId: "momo",
    provider: "MTN",
    status: "failed",
    source: "direct",
    daysAgo: 10,
    relatedOrderId: "ATX-983768",
    failureReason: "Provider declined",
  },
  {
    id: "PAY-1019",
    user: { id: "MER-005", name: "Beauty Corner", type: "merchant" },
    amount: 180,
    fee: 0,
    methodId: "card",
    provider: "Visa",
    status: "successful",
    source: "ecommerce",
    daysAgo: 6,
    relatedOrderId: "ORD-1010",
    relatedMerchantId: "MER-005",
    walletId: "MW-MER-005",
    walletStore: "merchant_main",
    walletCreditStatus: "credited",
  },
  {
    id: "PAY-1020",
    user: { id: "MER-006", name: "SneakerHub", type: "merchant" },
    amount: 260,
    fee: 0,
    methodId: "momo",
    provider: "Vodafone",
    status: "successful",
    source: "ecommerce",
    daysAgo: 8,
    relatedOrderId: "ORD-1011",
    relatedMerchantId: "MER-006",
    walletId: "MW-MER-006",
    walletStore: "merchant_main",
    walletCreditStatus: "credited",
  },
  {
    id: "PAY-1021",
    user: { id: "MER-008", name: "Empire Electronics", type: "merchant" },
    amount: 520,
    fee: 0,
    methodId: "card",
    provider: "Mastercard",
    status: "successful",
    source: "ecommerce",
    daysAgo: 12,
    relatedOrderId: "ORD-1012",
    relatedMerchantId: "MER-008",
    walletId: "MW-MER-008",
    walletStore: "merchant_main",
    walletCreditStatus: "credited",
  },
  {
    id: "PAY-1022",
    user: { id: "RS-004", name: "Efua Trading", type: "reseller" },
    amount: 150,
    fee: 0,
    methodId: "bank",
    provider: "Ecobank",
    status: "successful",
    source: "reseller",
    daysAgo: 14,
    relatedResellerId: "RS-004",
    walletId: "CW-RS-004",
    walletStore: "reseller_commission",
    walletCreditStatus: "credited",
  },
  {
    id: "PAY-1023",
    user: { id: "CUST-010", name: "Fiifi Amoah", type: "customer" },
    amount: 100,
    fee: 0,
    methodId: "card",
    provider: "Visa",
    status: "successful",
    source: "direct",
    daysAgo: 25,
    relatedOrderId: "ATX-983700",
  },
  {
    id: "PAY-1024",
    user: { id: "CUST-011", name: "Yaa Frimpong", type: "customer" },
    amount: 22,
    fee: 0,
    methodId: "momo",
    provider: "MTN",
    status: "successful",
    source: "direct",
    daysAgo: 30,
    relatedOrderId: "ATX-983650",
  },
  {
    id: "PAY-1025",
    user: { id: "MER-019", name: "HealthPlus Pharmacy", type: "merchant" },
    amount: 340,
    fee: 0,
    methodId: "card",
    provider: "Visa",
    status: "successful",
    source: "ecommerce",
    daysAgo: 40,
    relatedOrderId: "ORD-1020",
    relatedMerchantId: "MER-019",
    walletId: "MW-MER-019",
    walletStore: "merchant_main",
    walletCreditStatus: "credited",
  },
  {
    id: "PAY-1026",
    user: { id: "CUST-012", name: "Nana Owusu", type: "customer" },
    amount: 55,
    fee: 0,
    methodId: "momo",
    provider: "AirtelTigo",
    status: "successful",
    source: "direct",
    daysAgo: 60,
    relatedOrderId: "ATX-983500",
  },
  {
    id: "PAY-1027",
    user: { id: "MER-013", name: "Kwame Auto Parts", type: "merchant" },
    amount: 210,
    fee: 0,
    methodId: "momo",
    provider: "MTN",
    status: "successful",
    source: "ecommerce",
    daysAgo: 75,
    relatedOrderId: "ORD-1030",
    relatedMerchantId: "MER-013",
    walletId: "MW-MER-013",
    walletStore: "merchant_main",
    walletCreditStatus: "credited",
  },
  {
    id: "PAY-1028",
    user: { id: "CUST-013", name: "Grace Antwi", type: "customer" },
    amount: 18,
    fee: 0,
    methodId: "wallet",
    provider: "Atlas Wallet",
    status: "successful",
    source: "direct",
    daysAgo: 95,
    relatedOrderId: "ATX-982900",
  },
  {
    id: "PAY-1029",
    user: { id: "CUST-014", name: "Emmanuel Quaye", type: "customer" },
    amount: 75,
    fee: 0,
    methodId: "momo",
    provider: "MTN",
    status: "successful",
    source: "direct",
    daysAgo: 120,
    relatedOrderId: "ATX-982500",
  },
  {
    id: "PAY-1030",
    user: { id: "RS-007", name: "Kofi Communications", type: "reseller" },
    amount: 40,
    fee: 0,
    methodId: "momo",
    provider: "MTN",
    status: "refunded",
    source: "reseller",
    daysAgo: 15,
    relatedResellerId: "RS-007",
    refundStatus: "settled",
    refundAmount: 40,
    refundAdmin: { name: "Finance Admin", email: "finance@atlas.com" },
  },
];

function timelineFor(spec: SeedSpec): Payment["timeline"] {
  const base = ago(spec.daysAgo * DAY);
  const entries: Payment["timeline"] = [];

  entries.push({
    timestamp: base,
    label: "Payment initiated",
    status: "info",
  });

  if (spec.status === "successful" || spec.status === "refunded") {
    entries.push({
      timestamp: ago(spec.daysAgo * DAY - 60_000),
      label: "Payment successful",
      status: "success",
    });
  }
  if (spec.status === "processing") {
    entries.push({
      timestamp: ago(spec.daysAgo * DAY - 30_000),
      label: "Payment processing",
      status: "info",
    });
  }
  if (spec.status === "failed") {
    entries.push({
      timestamp: ago(spec.daysAgo * DAY - 30_000),
      label: spec.failureReason ?? "Payment failed",
      status: "danger",
    });
  }
  if (spec.status === "refunded") {
    entries.push({
      timestamp: ago(spec.daysAgo * DAY - 120_000),
      label:
        spec.refundStatus === "partial"
          ? "Partial refund settled"
          : "Refund settled",
      status: "success",
    });
  }
  return entries;
}

function auditFor(spec: SeedSpec): Payment["auditTrail"] {
  if (!spec.refundAdmin) return [];
  return [
    {
      timestamp: ago(spec.daysAgo * DAY - 120_000),
      admin: spec.refundAdmin.email,
      action:
        spec.refundStatus === "partial"
          ? "Partial refund approved"
          : "Refund approved",
      previousState: "successful",
      newState: "refunded",
    },
  ];
}

function refundHistoryFor(spec: SeedSpec): Payment["refundHistory"] {
  if (!spec.refundAdmin || !spec.refundAmount) return [];
  return [
    {
      timestamp: ago(spec.daysAgo * DAY - 120_000),
      amount: spec.refundAmount,
      status: "successful",
      admin: spec.refundAdmin,
    },
  ];
}

export const seededPayments: Payment[] = SEEDS.map((spec) => {
  const netAmount =
    spec.fee === 0 ? spec.amount : Math.round((spec.amount - spec.fee) * 100) / 100;
  return {
    id: spec.id,
    reference: "REF-" + spec.id.replace("PAY-", ""),
    user: spec.user,
    amount: spec.amount,
    fee: spec.fee,
    netAmount,
    currency: "GHS",
    methodId: spec.methodId,
    provider: spec.provider,
    status: spec.status,
    source: spec.source,
    relatedOrderId: spec.relatedOrderId,
    relatedTransactionId: spec.relatedTransactionId,
    relatedMerchantId: spec.relatedMerchantId,
    relatedResellerId: spec.relatedResellerId,
    createdAt: ago(spec.daysAgo * DAY),
    updatedAt: ago(spec.daysAgo * DAY - 120_000),
    failureReason: spec.failureReason,
    walletId: spec.walletId,
    walletStore: spec.walletStore,
    walletCreditedAt:
      spec.walletCreditStatus === "credited"
        ? ago(spec.daysAgo * DAY - 90_000)
        : undefined,
    walletCreditStatus: spec.walletCreditStatus,
    timeline: timelineFor(spec),
    refundStatus: spec.refundStatus ?? "none",
    refundHistory: refundHistoryFor(spec),
    auditTrail: auditFor(spec),
  };
});

export const seededReconciliations: PaymentReconciliation[] = [
  {
    id: "REC-0001",
    paymentId: "PAY-1006",
    providerReference: "GCB-TXN-992811",
    note: "Provider confirmed charge but Atlas did not receive callback. Manual match.",
    admin: { name: "Finance Admin", email: "finance@atlas.com" },
    createdAt: ago(DAY * 1),
  },
];

export const seededFlags: PaymentFlag[] = [
  {
    id: "FLG-0001",
    paymentId: "PAY-1005",
    reason: "missing_wallet_credit",
    note: "Payment succeeded but merchant main wallet credit still pending after 8 hours.",
    admin: { name: "Operations Admin", email: "ops@atlas.com" },
    createdAt: ago(HOUR * 6),
  },
  {
    id: "FLG-0002",
    paymentId: "PAY-1011",
    reason: "customer_complaint",
    note: "Reseller reports double charge on the same momo number.",
    admin: { name: "Support Admin", email: "support@atlas.com" },
    createdAt: ago(DAY * 1),
    resolvedAt: ago(HOUR * 12),
    resolvedBy: { name: "Finance Admin", email: "finance@atlas.com" },
    resolutionNote: "Only one charge. The duplicate was a provider retry that did not settle.",
  },
];

export { REFERENCE_NOW_MS };