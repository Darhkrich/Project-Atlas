import type {
  CustomerMessage,
  CustomerMessageThread,
  MerchantTicket,
  MerchantTicketMessage,
} from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

interface SeedTicketSpec {
  subject: string;
  category: MerchantTicket["category"];
  status: MerchantTicket["status"];
  createdDaysAgo: number;
  messages: Array<{
    author: MerchantTicketMessage["author"];
    authorName: string;
    body: string;
    hoursAfterCreate: number;
  }>;
}

const TICKET_SPECS: SeedTicketSpec[] = [
  {
    subject: "VAT rate on my storefront orders",
    category: "billing",
    status: "open",
    createdDaysAgo: 2,
    messages: [
      {
        author: "merchant",
        authorName: "You",
        body:
          "Hi Atlas, I need to add VAT to my storefront orders. What rate should I set for Ghana? I want to make sure I configure it correctly before I go live.",
        hoursAfterCreate: 0,
      },
    ],
  },
  {
    subject: "Payout not reflecting in my main wallet",
    category: "payments",
    status: "waiting_on_atlas",
    createdDaysAgo: 5,
    messages: [
      {
        author: "merchant",
        authorName: "You",
        body:
          "Two orders from yesterday show as delivered but my main wallet balance has not updated. Order numbers ATL-ORD-1002 and ATL-ORD-1004.",
        hoursAfterCreate: 0,
      },
      {
        author: "atlas",
        authorName: "Atlas Support",
        body:
          "Thanks for the details. We are checking with the payment provider. Can you confirm the payment method used for both orders?",
        hoursAfterCreate: 3,
      },
      {
        author: "merchant",
        authorName: "You",
        body:
          "Both were Mobile Money (MTN). I also have the transaction refs on my side if needed.",
        hoursAfterCreate: 4,
      },
    ],
  },
  {
    subject: "Storefront images not loading",
    category: "storefront",
    status: "resolved",
    createdDaysAgo: 12,
    messages: [
      {
        author: "merchant",
        authorName: "You",
        body:
          "Some product images on my storefront home page show a broken icon on mobile. Desktop is fine.",
        hoursAfterCreate: 0,
      },
      {
        author: "atlas",
        authorName: "Atlas Support",
        body:
          "This was a caching issue on our side. It is fixed now. Please refresh and let us know if you still see broken images.",
        hoursAfterCreate: 5,
      },
      {
        author: "merchant",
        authorName: "You",
        body: "All good now. Thanks.",
        hoursAfterCreate: 8,
      },
    ],
  },
];

export function buildSeedTickets(storeSlug: string): MerchantTicket[] {
  const now = Date.now();
  return TICKET_SPECS.map((spec, index) => {
    const createdAt = now - spec.createdDaysAgo * DAY_MS;
    const messages: MerchantTicketMessage[] = spec.messages.map((m, i) => ({
      id: "seed-tkt-msg-" + String(index + 1) + "-" + String(i + 1),
      author: m.author,
      authorName: m.authorName,
      body: m.body,
      createdAt: createdAt + m.hoursAfterCreate * HOUR_MS,
      readByMerchant: true,
    }));
    const lastMessage = messages[messages.length - 1];
    const updatedAt = lastMessage ? lastMessage.createdAt : createdAt;
    return {
      id: "seed-tkt-" + String(index + 1),
      storeSlug,
      subject: spec.subject,
      category: spec.category,
      status: spec.status,
      messages,
      createdAt,
      updatedAt,
      resolvedAt: spec.status === "resolved" ? updatedAt : undefined,
    };
  });
}

interface SeedThreadSpec {
  customerEmail: string;
  customerName: string;
  customerId: string | null;
  status: CustomerMessageThread["status"];
  createdDaysAgo: number;
  messages: Array<{
    author: CustomerMessage["author"];
    authorName: string;
    body: string;
    hoursAfterCreate: number;
    readByMerchant: boolean;
  }>;
}

const THREAD_SPECS: SeedThreadSpec[] = [
  {
    customerEmail: "abena.owusu@example.com",
    customerName: "Abena Owusu",
    customerId: null,
    status: "new",
    createdDaysAgo: 0,
    messages: [
      {
        author: "customer",
        authorName: "Abena Owusu",
        body:
          "Hello, is the Vitamin C serum back in stock? I wanted to order two.",
        hoursAfterCreate: 0,
        readByMerchant: false,
      },
    ],
  },
  {
    customerEmail: "kwame.mensah@example.com",
    customerName: "Kwame Mensah",
    customerId: null,
    status: "replied",
    createdDaysAgo: 1,
    messages: [
      {
        author: "customer",
        authorName: "Kwame Mensah",
        body:
          "I placed order ATL-ORD-1002 yesterday. Can you confirm when it will ship?",
        hoursAfterCreate: 0,
        readByMerchant: true,
      },
      {
        author: "merchant",
        authorName: "You",
        body:
          "Hi Kwame, thanks for the order. It ships tomorrow morning via GIG Logistics. You will get a tracking number once it is out.",
        hoursAfterCreate: 2,
        readByMerchant: true,
      },
    ],
  },
  {
    customerEmail: "yaa.boateng@example.com",
    customerName: "Yaa Boateng",
    customerId: null,
    status: "resolved",
    createdDaysAgo: 6,
    messages: [
      {
        author: "customer",
        authorName: "Yaa Boateng",
        body: "Do you deliver to Kumasi? I live near the central market.",
        hoursAfterCreate: 0,
        readByMerchant: true,
      },
      {
        author: "merchant",
        authorName: "You",
        body:
          "Yes we do. Delivery to Kumasi central takes 2 to 3 days and is free for orders above GH\u20B5 200.",
        hoursAfterCreate: 1,
        readByMerchant: true,
      },
      {
        author: "customer",
        authorName: "Yaa Boateng",
        body: "Perfect, thank you.",
        hoursAfterCreate: 3,
        readByMerchant: true,
      },
    ],
  },
];

export function buildSeedThreads(storeSlug: string): CustomerMessageThread[] {
  const now = Date.now();
  return THREAD_SPECS.map((spec, index) => {
    const createdAt = now - spec.createdDaysAgo * DAY_MS;
    const messages: CustomerMessage[] = spec.messages.map((m, i) => ({
      id: "seed-thr-msg-" + String(index + 1) + "-" + String(i + 1),
      author: m.author,
      authorName: m.authorName,
      body: m.body,
      createdAt: createdAt + m.hoursAfterCreate * HOUR_MS,
      readByMerchant: m.readByMerchant,
    }));
    const lastMessage = messages[messages.length - 1];
    const updatedAt = lastMessage ? lastMessage.createdAt : createdAt;
    return {
      id: "seed-thr-" + String(index + 1),
      storeSlug,
      customerId: spec.customerId,
      customerEmail: spec.customerEmail,
      customerName: spec.customerName,
      status: spec.status,
      messages,
      createdAt,
      updatedAt,
      resolvedAt: spec.status === "resolved" ? updatedAt : undefined,
    };
  });
}