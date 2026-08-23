import type { AtlasIconName } from "@/components/atlas/icons";

export type PaymentMethod = {
  id: string;
  name: string;
  description: string;
  icon: AtlasIconName;
  bgClass: string;
  fields: {
    name: string;
    label: string;
    type?: "text" | "tel" | "number";
    placeholder?: string;
    required?: boolean;
  }[];
};

export const allPaymentMethods: PaymentMethod[] = [
  {
    id: "wallet",
    name: "Wallet Balance",
    description: "Use your Atlas wallet balance",
    icon: "wallet",
    bgClass: "bg-brand-100 dark:bg-brand-900/30",
    fields: [],
  },
  {
    id: "momo",
    name: "Mobile Money",
    description: "MTN, Telecel, AirtelTigo",
    icon: "mobile",
    bgClass: "bg-yellow-100 dark:bg-yellow-900/30",
    fields: [
      { name: "phoneNumber", label: "Mobile Money Number", type: "tel", placeholder: "024 XXX XXXX", required: true },
    ],
  },
  {
    id: "card",
    name: "Card Payment",
    description: "Debit or credit card",
    icon: "card",
    bgClass: "bg-blue-100 dark:bg-blue-900/30",
    fields: [
      { name: "cardNumber", label: "Card Number", type: "text", placeholder: "1234 5678 9012 3456", required: true },
      { name: "expiry", label: "Expiry Date", type: "text", placeholder: "MM/YY", required: true },
      { name: "cvv", label: "CVV", type: "text", placeholder: "123", required: true },
    ],
  },
  {
    id: "bank",
    name: "Bank Transfer",
    description: "Direct bank deposit",
    icon: "bank",
    bgClass: "bg-green-100 dark:bg-green-900/30",
    fields: [
      { name: "accountName", label: "Account Name", type: "text", placeholder: "John Doe", required: true },
      { name: "accountNumber", label: "Account Number", type: "text", placeholder: "0123456789", required: true },
      { name: "bankName", label: "Bank Name", type: "text", placeholder: "Bank of Ghana", required: true },
    ],
  },
  {
    id: "ussd",
    name: "USSD",
    description: "Dial a short code",
    icon: "phone",
    bgClass: "bg-purple-100 dark:bg-purple-900/30",
    fields: [
      { name: "phoneNumber", label: "Phone Number", type: "tel", placeholder: "024 XXX XXXX", required: true },
    ],
  },
  {
    id: "atlas_points",
    name: "Atlas Points",
    description: "Use your Atlas Points to pay",
    icon: "star",
    bgClass: "bg-accent-500/15",
    fields: [],
  },
];

export const fundMethods = allPaymentMethods.filter(
  (m) => m.id !== "wallet" && m.id !== "atlas_points",
);

export const withdrawMethods = [
  allPaymentMethods.find((m) => m.id === "bank")!,
  allPaymentMethods.find((m) => m.id === "momo")!,
];

export const POINTS_CONVERSION_RATE = 0.05; // GHS per point
export const MOCK_ATLAS_POINTS_BALANCE = 75;