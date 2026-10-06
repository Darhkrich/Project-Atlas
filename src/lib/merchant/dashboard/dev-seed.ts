import type { MerchantStorefrontProduct } from "@/types/merchant-storefront";
import type {
  CustomerOrder,
  OrderItem,
} from "@/contexts/orders-context";
import type {
  CustomerOrderStatus,
  CustomerOrderPaymentStatus,
  OrderEvent,
} from "@/lib/merchant/orders/types";
import type { StoreCustomer } from "@/contexts/store-customers-context";

const PRODUCTS_KEY = "atlas-store-products";
const ORDERS_KEY = "atlas-customer-orders";
const CUSTOMERS_KEY = "atlas-store-customers";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

function startOfToday(): number {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function todayAt(hours: number, minutes: number): number {
  return startOfToday() + hours * HOUR + minutes * 60 * 1000;
}

function daysAgoAt(days: number, hours: number, minutes: number): number {
  return startOfToday() - days * DAY + hours * HOUR + minutes * 60 * 1000;
}

function formatDateString(ms: number): string {
  return new Date(ms).toLocaleDateString("en-GH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

interface SeedProductSpec {
  name: string;
  description: string;
  price: number;
  stockLevel: number;
  categoryId: string;
  featured: boolean;
}

const SEED_PRODUCTS: SeedProductSpec[] = [
  {
    name: "Shea Butter Body Cream",
    description: "Rich, unrefined shea. Sourced from northern Ghana.",
    price: 80,
    stockLevel: 24,
    categoryId: "skincare",
    featured: true,
  },
  {
    name: "Vitamin C Face Serum",
    description: "Brightening serum with 15% stabilised vitamin C.",
    price: 120,
    stockLevel: 3,
    categoryId: "skincare",
    featured: true,
  },
  {
    name: "Aloe Vera Soothing Gel",
    description: "Cooling gel for sensitive skin. Fragrance free.",
    price: 150,
    stockLevel: 12,
    categoryId: "skincare",
    featured: false,
  },
  {
    name: "Coconut Oil Hair Food",
    description: "Deep conditioning hair food with cold-pressed coconut.",
    price: 70,
    stockLevel: 0,
    categoryId: "haircare",
    featured: false,
  },
  {
    name: "Rosewater Toner",
    description: "Gentle daily toner. Hydrating and alcohol free.",
    price: 75,
    stockLevel: 2,
    categoryId: "skincare",
    featured: false,
  },
  {
    name: "Charcoal Face Mask",
    description: "Detoxifying clay mask with activated charcoal.",
    price: 30,
    stockLevel: 40,
    categoryId: "skincare",
    featured: false,
  },
];

interface SeedCustomerSpec {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  region: string;
}

const SEED_CUSTOMERS: SeedCustomerSpec[] = [
  {
    name: "Abena Owusu",
    email: "abena.owusu@example.com",
    phone: "024 512 3344",
    address: "12 Ring Road East",
    city: "Accra",
    region: "Greater Accra",
  },
  {
    name: "Kwame Mensah",
    email: "kwame.mensah@example.com",
    phone: "020 411 8890",
    address: "7 Liberation Road",
    city: "Accra",
    region: "Greater Accra",
  },
  {
    name: "Yaa Boateng",
    email: "yaa.boateng@example.com",
    phone: "055 903 2211",
    address: "44 Kumasi High Street",
    city: "Kumasi",
    region: "Ashanti",
  },
  {
    name: "Ama Serwaa",
    email: "ama.serwaa@example.com",
    phone: "027 665 1100",
    address: "3 Takoradi Market Circle",
    city: "Takoradi",
    region: "Western",
  },
  {
    name: "Kofi Adjei",
    email: "kofi.adjei@example.com",
    phone: "024 998 7654",
    address: "18 Tamale Central",
    city: "Tamale",
    region: "Northern",
  },
];

interface SeedOrderItemSpec {
  productIndex: number;
  quantity: number;
}

interface SeedOrderSpec {
  customerIndex: number;
  createdAt: number;
  status: CustomerOrderStatus;
  paymentStatus: CustomerOrderPaymentStatus;
  paymentMethod: string;
  items: SeedOrderItemSpec[];
  trackingNumber?: string;
  carrier?: string;
}

const SEED_ORDERS: SeedOrderSpec[] = [
  {
    customerIndex: 0,
    createdAt: todayAt(10, 30),
    status: "new",
    paymentStatus: "paid",
    paymentMethod: "Mobile Money",
    items: [
      { productIndex: 1, quantity: 1 },
      { productIndex: 2, quantity: 1 },
    ],
  },
  {
    customerIndex: 1,
    createdAt: todayAt(9, 15),
    status: "new",
    paymentStatus: "paid",
    paymentMethod: "Card",
    items: [{ productIndex: 2, quantity: 1 }],
  },
  {
    customerIndex: 2,
    createdAt: todayAt(8, 5),
    status: "processing",
    paymentStatus: "paid",
    paymentMethod: "Mobile Money",
    items: [{ productIndex: 0, quantity: 1 }],
  },
  {
    customerIndex: 3,
    createdAt: daysAgoAt(1, 20, 40),
    status: "processing",
    paymentStatus: "pending",
    paymentMethod: "Bank Transfer",
    items: [
      { productIndex: 4, quantity: 1 },
      { productIndex: 5, quantity: 1 },
    ],
  },
  {
    customerIndex: 4,
    createdAt: daysAgoAt(1, 17, 20),
    status: "shipped",
    paymentStatus: "paid",
    paymentMethod: "Mobile Money",
    items: [{ productIndex: 3, quantity: 3 }],
    carrier: "GIG Logistics",
    trackingNumber: "GIG-7741220",
  },
  {
    customerIndex: 0,
    createdAt: daysAgoAt(2, 14, 10),
    status: "delivered",
    paymentStatus: "paid",
    paymentMethod: "Mobile Money",
    items: [{ productIndex: 0, quantity: 2 }],
    carrier: "GIG Logistics",
    trackingNumber: "GIG-7741118",
  },
  {
    customerIndex: 1,
    createdAt: daysAgoAt(3, 11, 30),
    status: "delivered",
    paymentStatus: "paid",
    paymentMethod: "Card",
    items: [{ productIndex: 1, quantity: 1 }],
    carrier: "DHL Ghana",
    trackingNumber: "DHL-2214881",
  },
  {
    customerIndex: 2,
    createdAt: daysAgoAt(4, 16, 45),
    status: "delivered",
    paymentStatus: "paid",
    paymentMethod: "Mobile Money",
    items: [
      { productIndex: 0, quantity: 1 },
      { productIndex: 5, quantity: 2 },
    ],
    carrier: "GIG Logistics",
    trackingNumber: "GIG-7741012",
  },
  {
    customerIndex: 3,
    createdAt: daysAgoAt(6, 10, 0),
    status: "shipped",
    paymentStatus: "paid",
    paymentMethod: "Bank Transfer",
    items: [{ productIndex: 2, quantity: 2 }],
    carrier: "DHL Ghana",
    trackingNumber: "DHL-2214772",
  },
  {
    customerIndex: 4,
    createdAt: daysAgoAt(8, 15, 20),
    status: "delivered",
    paymentStatus: "refunded",
    paymentMethod: "Mobile Money",
    items: [{ productIndex: 4, quantity: 1 }],
  },
  {
    customerIndex: 0,
    createdAt: daysAgoAt(10, 12, 0),
    status: "cancelled",
    paymentStatus: "refunded",
    paymentMethod: "Card",
    items: [{ productIndex: 1, quantity: 2 }],
  },
  {
    customerIndex: 1,
    createdAt: daysAgoAt(13, 18, 30),
    status: "delivered",
    paymentStatus: "paid",
    paymentMethod: "Mobile Money",
    items: [{ productIndex: 2, quantity: 1 }],
    carrier: "GIG Logistics",
    trackingNumber: "GIG-7740998",
  },
];

function buildSeedProducts(): MerchantStorefrontProduct[] {
  return SEED_PRODUCTS.map((spec) => ({
    id: crypto.randomUUID(),
    name: spec.name,
    description: spec.description,
    price: spec.price,
    images: [],
    categoryId: spec.categoryId,
    inStock: spec.stockLevel > 0,
    featured: spec.featured,
    status: "Active",
    stockLevel: spec.stockLevel,
  }));
}

function buildCustomers(storeSlug: string): StoreCustomer[] {
  const now = Date.now();
  return SEED_CUSTOMERS.map((spec, index) => ({
    id: crypto.randomUUID(),
    storeSlug,
    name: spec.name,
    email: spec.email,
    phone: spec.phone,
    address: spec.address,
    city: spec.city,
    region: spec.region,
    status: "Active",
    createdAt: now - (index + 1) * 30 * DAY,
    updatedAt: now - (index + 1) * 30 * DAY,
  }));
}

function buildOrderEvents(
  orderNumber: string,
  spec: SeedOrderSpec,
  customer: SeedCustomerSpec
): OrderEvent[] {
  const actor = {
    id: "seed-customer",
    name: customer.name,
    email: customer.email,
  };
  const events: OrderEvent[] = [
    {
      id: crypto.randomUUID(),
      type: "placed",
      description: "Order placed.",
      actor,
      createdAt: spec.createdAt,
      toStatus: "new",
    },
  ];
  if (spec.paymentStatus === "paid") {
    events.push({
      id: crypto.randomUUID(),
      type: "payment_confirmed",
      description: "Payment confirmed.",
      actor,
      createdAt: spec.createdAt + 60 * 1000,
    });
  } else if (spec.paymentStatus === "failed") {
    events.push({
      id: crypto.randomUUID(),
      type: "payment_failed",
      description: "Payment failed.",
      actor,
      createdAt: spec.createdAt + 60 * 1000,
    });
  }
  if (spec.status === "processing") {
    events.push({
      id: crypto.randomUUID(),
      type: "status_changed",
      description: "Status changed from New to Processing.",
      actor: {
        id: "seed-merchant",
        name: "Merchant",
        email: "merchant@atlas.local",
      },
      createdAt: spec.createdAt + 3 * HOUR,
      fromStatus: "new",
      toStatus: "processing",
    });
  }
  if (spec.status === "shipped" || spec.status === "delivered") {
    events.push({
      id: crypto.randomUUID(),
      type: "status_changed",
      description: "Status changed from New to Processing.",
      actor: {
        id: "seed-merchant",
        name: "Merchant",
        email: "merchant@atlas.local",
      },
      createdAt: spec.createdAt + 3 * HOUR,
      fromStatus: "new",
      toStatus: "processing",
    });
    events.push({
      id: crypto.randomUUID(),
      type: "shipped",
      description: spec.carrier
        ? "Order shipped via " +
          spec.carrier +
          ". Tracking " +
          (spec.trackingNumber ?? "") +
          "."
        : "Order shipped.",
      actor: {
        id: "seed-merchant",
        name: "Merchant",
        email: "merchant@atlas.local",
      },
      createdAt: spec.createdAt + 20 * HOUR,
      fromStatus: "processing",
      toStatus: "shipped",
      metadata: spec.carrier
        ? {
            carrier: spec.carrier,
            trackingNumber: spec.trackingNumber ?? "",
          }
        : undefined,
    });
  }
  if (spec.status === "delivered") {
    events.push({
      id: crypto.randomUUID(),
      type: "delivered",
      description: "Order delivered.",
      actor: {
        id: "seed-system",
        name: "System",
        email: "system@atlas.local",
      },
      createdAt: spec.createdAt + 2 * DAY,
      fromStatus: "shipped",
      toStatus: "delivered",
    });
  }
  if (spec.status === "cancelled") {
    events.push({
      id: crypto.randomUUID(),
      type: "cancelled",
      description: "Order cancelled. Reason: Customer requested.",
      actor: {
        id: "seed-merchant",
        name: "Merchant",
        email: "merchant@atlas.local",
      },
      createdAt: spec.createdAt + 4 * HOUR,
      fromStatus: "new",
      toStatus: "cancelled",
    });
  }
  if (spec.paymentStatus === "refunded") {
    events.push({
      id: crypto.randomUUID(),
      type: "refunded",
      description: "Refund issued.",
      actor: {
        id: "seed-merchant",
        name: "Merchant",
        email: "merchant@atlas.local",
      },
      createdAt: spec.createdAt + 3 * DAY,
    });
  }
  void orderNumber;
  return events;
}

function buildOrders(
  storeSlug: string,
  products: MerchantStorefrontProduct[]
): CustomerOrder[] {
  const result: CustomerOrder[] = [];
  for (let index = 0; index < SEED_ORDERS.length; index++) {
    const spec = SEED_ORDERS[index];
    const customer = SEED_CUSTOMERS[spec.customerIndex];
    const items: OrderItem[] = [];
    for (const it of spec.items) {
      const product = products[it.productIndex % products.length];
      items.push({
        name: product.name,
        quantity: it.quantity,
        price: product.price,
      });
    }
    if (items.length === 0) continue;
    const total = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
    const orderNumber = "ATL-ORD-" + String(2001 + index);
    const events = buildOrderEvents(orderNumber, spec, customer);
    const lastEvent = events[events.length - 1];
    result.push({
      id: crypto.randomUUID(),
      orderNumber,
      storeSlug,
      storefrontId: null,
      customerEmail: customer.email,
      customerName: customer.name,
      customerPhone: customer.phone,
      shippingAddress: {
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        region: customer.region,
      },
      date: formatDateString(spec.createdAt),
      total,
      status: spec.status,
      paymentStatus: spec.paymentStatus,
      paymentMethod: spec.paymentMethod,
      items,
      events,
      notes: [],
      cancelRecord:
        spec.status === "cancelled"
          ? {
              reason: "customer_request",
              note: undefined,
              restock: true,
              cancelledBy: {
                id: "seed-merchant",
                name: "Merchant",
                email: "merchant@atlas.local",
              },
              cancelledAt: spec.createdAt + 4 * HOUR,
            }
          : null,
      trackingNumber: spec.trackingNumber ?? null,
      carrier: spec.carrier ?? null,
      refundIds: [],
      createdAt: spec.createdAt,
      updatedAt: lastEvent ? lastEvent.createdAt : spec.createdAt,
    });
  }
  return result;
}

/**
 * The store customers key holds a slug-keyed map. The seed writes into
 * that shape directly, mirroring the current context. Legacy email-keyed
 * entries are migrated by the context on hydrate, not here.
 */
export function seedMerchantDashboard(
  email: string,
  storeSlug: string,
  existingProducts: MerchantStorefrontProduct[] = []
): boolean {
  if (typeof window === "undefined") return false;
  if (!email || !storeSlug) return false;

  let wrote = false;

  const products =
    existingProducts.length > 0 ? existingProducts : buildSeedProducts();
  const customers = buildCustomers(storeSlug);
  const orders = buildOrders(storeSlug, products);

  if (existingProducts.length === 0) {
    const productsRaw = safeParse<
      Record<string, Record<string, MerchantStorefrontProduct[]>>
    >(window.localStorage.getItem(PRODUCTS_KEY), {});
    const existing = productsRaw[email] ?? {};
    if (!existing[storeSlug] || existing[storeSlug].length === 0) {
      productsRaw[email] = { ...existing, [storeSlug]: products };
      window.localStorage.setItem(PRODUCTS_KEY, JSON.stringify(productsRaw));
      wrote = true;
    }
  }

  const customersRaw = safeParse<Record<string, StoreCustomer[]>>(
    window.localStorage.getItem(CUSTOMERS_KEY),
    {}
  );
  const existingCustomers = customersRaw[storeSlug] ?? [];
  if (existingCustomers.length === 0) {
    customersRaw[storeSlug] = customers;
    window.localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customersRaw));
    wrote = true;
  }

  const ordersRaw = safeParse<Record<string, CustomerOrder[]>>(
    window.localStorage.getItem(ORDERS_KEY),
    {}
  );
  const existingOrders = ordersRaw[email] ?? [];
  const hasOrdersForStore = existingOrders.some(
    (o) => o.storeSlug === storeSlug
  );
  if (!hasOrdersForStore) {
    const others = existingOrders.filter((o) => o.storeSlug !== storeSlug);
    ordersRaw[email] = [...others, ...orders];
    window.localStorage.setItem(ORDERS_KEY, JSON.stringify(ordersRaw));
    wrote = true;
  }

  return wrote;
}