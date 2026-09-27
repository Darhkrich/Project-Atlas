import type {
  Order,
  OrderAudience,
  OrderFailure,
  OrderFailureReason,
  OrderStatus,
  OrderTimelineEvent,
  OrderTimelineEventStatus,
  OrderTimelineEventType,
  OrderWalletDebit,
  OrderWalletOwner,
} from "../types/orders";
import type { PaymentMethodId } from "../types/payment";
import { ORDER_TIMELINE_TYPE_LABELS } from "../orders/orders-labels";
import { defaultMaxRetryAttempts, nextRetryDelayMs } from "../orders/retry";
import { registerRetryScenario } from "./orders-retry-scenarios";

const SERVICE_CONFIG: Record<
  string,
  { providers: string[]; networks: string[]; amountMin: number; amountMax: number }
> = {
  "svc-mtn-data": {
    providers: ["prov-mtn-gh"],
    networks: ["net-mtn"],
    amountMin: 5,
    amountMax: 100,
  },
  "svc-airtime": {
    providers: ["prov-mtn-gh", "prov-telecel-gh", "prov-airteltigo-gh"],
    networks: ["net-mtn", "net-telecel", "net-airteltigo"],
    amountMin: 5,
    amountMax: 100,
  },
  "svc-ecg": {
    providers: ["prov-ecg-gh"],
    networks: [],
    amountMin: 20,
    amountMax: 500,
  },
  "svc-dstv": {
    providers: ["prov-multichoice"],
    networks: [],
    amountMin: 50,
    amountMax: 300,
  },
  "svc-gotv": {
    providers: ["prov-multichoice"],
    networks: [],
    amountMin: 30,
    amountMax: 200,
  },
  "svc-waec": {
    providers: ["prov-waec"],
    networks: [],
    amountMin: 50,
    amountMax: 200,
  },
};

const SERVICE_IDS = Object.keys(SERVICE_CONFIG);

const CUSTOMER_POOL: { id: string; name: string; phone: string }[] = [
  { id: "CUS-1001", name: "Kwame Asante", phone: "+233 24 100 1001" },
  { id: "CUS-1002", name: "Ama Serwaa", phone: "+233 20 100 1002" },
  { id: "CUS-1003", name: "Kofi Boateng", phone: "+233 27 100 1003" },
  { id: "CUS-1004", name: "Akosua Mensah", phone: "+233 55 100 1004" },
  { id: "CUS-1005", name: "Yaw Owusu", phone: "+233 26 100 1005" },
  { id: "CUS-1006", name: "Abena Osei", phone: "+233 24 100 1006" },
  { id: "CUS-1007", name: "Kwabena Frimpong", phone: "+233 20 100 1007" },
  { id: "CUS-1008", name: "Adwoa Agyeman", phone: "+233 27 100 1008" },
  { id: "CUS-1009", name: "Kojo Appiah", phone: "+233 55 100 1009" },
  { id: "CUS-1010", name: "Efua Danso", phone: "+233 26 100 1010" },
  { id: "CUS-1011", name: "Kwesi Amoah", phone: "+233 24 100 1011" },
  { id: "CUS-1012", name: "Akua Bediako", phone: "+233 20 100 1012" },
];

const RECIPIENT_POOL: { name: string; phone: string }[] = [
  { name: "John Mensah", phone: "+233 24 200 2001" },
  { name: "Grace Owusu", phone: "+233 20 200 2002" },
  { name: "Daniel Asare", phone: "+233 27 200 2003" },
  { name: "Comfort Aidoo", phone: "+233 55 200 2004" },
  { name: "Michael Tetteh", phone: "+233 26 200 2005" },
  { name: "Patience Ansah", phone: "+233 24 200 2006" },
  { name: "Emmanuel Adjei", phone: "+233 20 200 2007" },
  { name: "Mary Amoako", phone: "+233 27 200 2008" },
];

const RESELLER_POOL: { id: string; name: string; storefrontId: string }[] = [
  { id: "RS-001", name: "Kwame Store", storefrontId: "SF-RS-001" },
  { id: "RS-002", name: "Adjoa Ventures", storefrontId: "SF-RS-002" },
  { id: "RS-003", name: "Yaw Enterprises", storefrontId: "SF-RS-003" },
  { id: "RS-004", name: "Kojo & Sons", storefrontId: "SF-RS-004" },
  { id: "RS-005", name: "Akosua Digital", storefrontId: "SF-RS-005" },
];

const SYSTEM_FAILURES: OrderFailureReason[] = [
  "provider_timeout",
  "provider_error",
  "provider_unavailable",
  "atlas_internal_error",
];

const CUSTOMER_FAILURES: OrderFailureReason[] = [
  "insufficient_balance",
  "invalid_recipient",
  "duplicate_detected",
  "limit_exceeded",
];

const RESELLER_COMMISSION_RATE = 0.08;

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const ANCHOR_MS = Date.now();

function makeRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function randInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function randAmount(rng: () => number, min: number, max: number): number {
  const step = 5;
  const raw = min + rng() * (max - min);
  return Math.max(min, Math.round(raw / step) * step);
}

function isoAt(msAgo: number): string {
  return new Date(ANCHOR_MS - msAgo).toISOString();
}

function event(
  type: OrderTimelineEventType,
  status: OrderTimelineEventStatus,
  msAgo: number,
  attempt?: number,
  description?: string
): OrderTimelineEvent {
  const baseLabel = ORDER_TIMELINE_TYPE_LABELS[type];
  const label =
    attempt !== undefined &&
    (type === "dispatch_attempt" || type === "provider_response")
      ? baseLabel + " #" + attempt
      : baseLabel;
  return {
    type,
    status,
    timestamp: isoAt(msAgo),
    attempt,
    label,
    description,
  };
}

function classForReason(reason: OrderFailureReason): "system" | "customer" {
  return SYSTEM_FAILURES.includes(reason) ? "system" : "customer";
}

function pickAudience(rng: () => number): OrderAudience {
  const roll = rng();
  if (roll < 0.45) return "direct";
  if (roll < 0.85) return "storefront_user";
  return "reseller";
}

function pickPaymentMethod(
  rng: () => number,
  audience: OrderAudience
): PaymentMethodId {
  const roll = rng();
  if (audience === "direct") {
    if (roll < 0.4) return "wallet";
    if (roll < 0.65) return "momo";
    if (roll < 0.85) return "card";
    if (roll < 0.95) return "bank";
    return "atlas_points";
  }
  if (audience === "storefront_user") {
    if (roll < 0.55) return "wallet";
    if (roll < 0.9) return "momo";
    return "card";
  }
  // reseller
  if (roll < 0.5) return "wallet";
  if (roll < 0.7) return "momo";
  if (roll < 0.9) return "card";
  return "bank";
}
function walletIdFor(owner: OrderWalletOwner, rng: () => number): string {
  if (owner === "customer") return "W-" + randInt(rng, 10000, 99999);
  if (owner === "reseller") return "RW-" + randInt(rng, 10000, 99999);
  return "SFW-" + randInt(rng, 10000, 99999);
}

function buildWalletDebit(
  status: OrderStatus,
  owner: OrderWalletOwner,
  amount: number,
  createdAtMsAgo: number,
  walletId: string,
  failureReason?: OrderFailureReason
): OrderWalletDebit {
  const heldAt = isoAt(createdAtMsAgo - 1000);
  if (status === "successful") {
    return {
      walletId,
      walletOwner: owner,
      amount,
      status: "captured",
      heldAt,
      capturedAt: isoAt(createdAtMsAgo - 5000),
    };
  }
  if (status === "cancelled" || status === "failed") {
    return {
      walletId,
      walletOwner: owner,
      amount,
      status: "released",
      heldAt,
      releasedAt: isoAt(createdAtMsAgo - 8000),
      releaseReason: failureReason,
    };
  }
  return {
    walletId,
    walletOwner: owner,
    amount,
    status: "held",
    heldAt,
  };
}

function buildTimeline(
  status: OrderStatus,
  createdAtMsAgo: number,
  attempts: number,
  failure: OrderFailure | undefined,
  cancelledByAdmin: boolean,
  walletFunded: boolean
): OrderTimelineEvent[] {
  const events: OrderTimelineEvent[] = [];
  let cursor = createdAtMsAgo;
  events.push(event("order_created", "info", cursor));
  if (walletFunded) {
    cursor -= 1000;
    events.push(event("payment_held", "info", cursor));
  }

  if (status === "pending") {
    return events;
  }

  if (status === "cancelled") {
    cursor -= 2000;
    events.push(
      event(
        "cancelled",
        "warning",
        cursor,
        undefined,
        cancelledByAdmin ? "Cancelled by admin" : "Cancelled by customer"
      )
    );
    if (walletFunded) {
      cursor -= 1000;
      events.push(event("released", "info", cursor));
    }
    return events;
  }

  const dispatchCount =
    status === "processing"
      ? 1
      : status === "retrying"
      ? Math.max(1, attempts)
      : status === "failed" && failure?.class === "system"
      ? attempts
      : 1;

  for (let i = 1; i <= dispatchCount; i++) {
    cursor -= 2000;
    events.push(event("dispatch_attempt", "info", cursor, i));
    cursor -= 1500;
    if (i < dispatchCount || status === "successful" || status === "failed") {
      const dangerStatus: OrderTimelineEventStatus =
        i === dispatchCount && status !== "successful" ? "danger" : "info";
      events.push(
        event(
          "provider_response",
          dangerStatus,
          cursor,
          i,
          i === dispatchCount && status !== "successful"
            ? failure?.providerMessage
            : undefined
        )
      );
    }
    if (i < dispatchCount) {
      cursor -= 1000;
      events.push(event("retry_scheduled", "warning", cursor, i));
    }
  }

  if (status === "processing" || status === "retrying") {
    if (status === "retrying") {
      cursor -= 500;
      events.push(event("retry_scheduled", "warning", cursor, dispatchCount));
    }
    return events;
  }

  if (status === "successful") {
    cursor -= 2000;
    events.push(event("delivered", "success", cursor));
    if (walletFunded) {
      cursor -= 1000;
      events.push(event("settled", "success", cursor));
    }
    return events;
  }

  if (status === "failed" && walletFunded) {
    cursor -= 1500;
    events.push(event("released", "warning", cursor));
    return events;
  }

  return events;
}

interface MakeOrderContext {
  rng: () => number;
  seq: number;
}

function makeOrder({ rng, seq }: MakeOrderContext): Order {
  const id = "ATX-" + seq;
  const audience = pickAudience(rng);

  const ageRoll = rng();
  let createdAtMsAgo: number;
  if (ageRoll < 0.25) {
    createdAtMsAgo = randInt(rng, 30, 720) * MINUTE;
  } else if (ageRoll < 0.85) {
    createdAtMsAgo = randInt(rng, 12 * 60, (7 * DAY) / MINUTE) * MINUTE;
  } else {
    createdAtMsAgo = randInt(rng, (7 * DAY) / MINUTE, (30 * DAY) / MINUTE) * MINUTE;
  }

  let status: OrderStatus;
  if (createdAtMsAgo > 7 * DAY) {
    status = rng() < 0.94 ? "successful" : "failed";
  } else if (createdAtMsAgo > 12 * HOUR) {
    const r = rng();
    if (r < 0.9) status = "successful";
    else if (r < 0.96) status = "failed";
    else status = "cancelled";
  } else {
    const r = rng();
    if (r < 0.7) status = "successful";
    else if (r < 0.82) status = "failed";
    else if (r < 0.9) status = "pending";
    else if (r < 0.95) status = "processing";
    else status = "retrying";
  }

  const serviceId = pick(rng, SERVICE_IDS);
  const serviceCfg = SERVICE_CONFIG[serviceId];
  const providerId = pick(rng, serviceCfg.providers);
  const networkId =
    serviceCfg.networks.length > 0 ? pick(rng, serviceCfg.networks) : undefined;

  const amount = randAmount(rng, serviceCfg.amountMin, serviceCfg.amountMax);
  const commission =
    audience !== "direct"
      ? Math.round(amount * RESELLER_COMMISSION_RATE * 100) / 100
      : 0;

  const paymentMethodId = pickPaymentMethod(rng, audience);
  const walletFunded = paymentMethodId === "wallet";

  let failure: OrderFailure | undefined;
  let retryAttempts = 0;
  let nextRetryAt: string | undefined;
  let lastRetriedAt: string | undefined;
  let cancelledByAdmin = false;

  if (status === "failed" || status === "retrying") {
    const sysRoll = rng();
    const reason: OrderFailureReason =
      sysRoll < 0.7 ? pick(rng, SYSTEM_FAILURES) : pick(rng, CUSTOMER_FAILURES);
    const cls = classForReason(reason);

    if (status === "retrying" && cls !== "system") {
      status = "failed";
    }

    if (cls === "system") {
      retryAttempts = status === "retrying" ? 1 : defaultMaxRetryAttempts();
    }

    failure = {
      class: cls,
      reason,
      occurredAt: isoAt(createdAtMsAgo - 3000),
      providerMessage:
        cls === "system"
          ? reason === "provider_timeout"
            ? "Timed out after 30s"
            : reason === "provider_error"
            ? "HTTP 502 from provider"
            : reason === "provider_unavailable"
            ? "Connection refused"
            : "Internal dispatcher exception"
          : undefined,
    };
  }

  if (status === "cancelled") {
    cancelledByAdmin = rng() < 0.5;
  }

  const maxRetryAttempts = defaultMaxRetryAttempts();

  if (status === "retrying") {
    const fromNow = randInt(rng, 5, 45) * 1000;
    nextRetryAt = new Date(Date.now() + fromNow).toISOString();
    lastRetriedAt = isoAt(createdAtMsAgo - 3000);

    const outcomeRoll = rng();
    const outcome =
      outcomeRoll < 0.6
        ? "success_at_attempt_2"
        : outcomeRoll < 0.85
        ? "success_at_attempt_3"
        : "exhaust";
    registerRetryScenario(id, {
      outcome,
      providerLatencyMs: randInt(rng, 800, 2500),
    });
  }

  // Identity and audience-specific snapshots.
  const customerPoolEntry = pick(rng, CUSTOMER_POOL);
  const recipientPoolEntry = pick(rng, RECIPIENT_POOL);
  const resellerPoolEntry =
    audience !== "direct" ? pick(rng, RESELLER_POOL) : null;

  let customerSnapshot: { name: string; phone: string };
  let customerId: string | undefined;
  let storefrontUserId: string | undefined;
  let storefrontId: string | undefined;
  let resellerId: string | undefined;

  if (audience === "direct") {
    customerSnapshot = {
      name: customerPoolEntry.name,
      phone: customerPoolEntry.phone,
    };
    customerId = customerPoolEntry.id;
  } else if (audience === "storefront_user") {
    customerSnapshot = {
      name: "Guest " + recipientPoolEntry.name.split(" ")[0],
      phone: recipientPoolEntry.phone,
    };
    storefrontUserId = "SFU-" + randInt(rng, 1000, 9999);
    storefrontId = resellerPoolEntry?.storefrontId;
    resellerId = resellerPoolEntry?.id;
  } else {
    // Reseller buying through the dashboard services page, for themselves
    // or on behalf of a third party. Recipient is the customer snapshot.
    customerSnapshot = {
      name: recipientPoolEntry.name,
      phone: recipientPoolEntry.phone,
    };
    resellerId = resellerPoolEntry?.id;
  }

  const walletOwner: OrderWalletOwner =
    audience === "direct"
      ? "customer"
      : audience === "storefront_user"
      ? "storefront_user"
      : "reseller";

  const walletDebit: OrderWalletDebit | undefined = walletFunded
    ? buildWalletDebit(
        status,
        walletOwner,
        amount,
        createdAtMsAgo,
        walletIdFor(walletOwner, rng),
        failure?.reason
      )
    : undefined;

  const timeline = buildTimeline(
    status,
    createdAtMsAgo,
    retryAttempts,
    failure,
    cancelledByAdmin,
    walletFunded
  );

  return {
    id,
    audience,
    status,
    customer: customerSnapshot,
    reseller: resellerPoolEntry
      ? { id: resellerPoolEntry.id, name: resellerPoolEntry.name }
      : null,
    customerId,
    storefrontUserId,
    storefrontId,
    resellerId,
    serviceId,
    providerId,
    networkId,
    paymentMethodId,
    paymentId: undefined,
    amount,
    commission,
    failure,
    retryAttempts,
    maxRetryAttempts,
    nextRetryAt,
    lastRetriedAt,
    idempotencyKey: "idem-" + id,
    walletDebit,
    createdAt: isoAt(createdAtMsAgo),
    timeline,
  };
}

export function mockOrdersSeed(): Order[] {
  const rng = makeRng(0x1a7a5);
  const orders: Order[] = [];
  let seq = 983_821;
  for (let i = 0; i < 240; i++) {
    orders.push(makeOrder({ rng, seq: seq-- }));
  }
  return orders.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}