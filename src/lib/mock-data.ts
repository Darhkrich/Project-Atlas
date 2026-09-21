import type { AtlasIconName } from "@/components/atlas/icons";

/* ------------------- Transactions (Your Data) ------------------- */
export type MockTransaction = {
  id: string;
  service: string;
  category: string;
  details: string;
  amount: string;
  date: string;
  status: "Successful" | "Failed" | "Pending";
  statusVariant: "success" | "danger" | "warning";
  image?: string;
  icon?: AtlasIconName;
  iconBg?: string;
};

export const mockTransactions: MockTransaction[] = [
  {
    id: "tx1",
    service: "MTN Data 50GB",
    category: "Data",
    details: "024 123 4567",
    amount: "- GHS 25.00",
    date: "Mar 13, 09:45 AM",
    status: "Successful",
    statusVariant: "success",
    image: "/mtn1.png",
  },
  {
    id: "tx2",
    service: "Telecel Airtime",
    category: "Airtime",
    details: "024 123 4567",
    amount: "- GHS 10.00",
    date: "Mar 13, 09:30 AM",
    status: "Successful",
    statusVariant: "success",
    image: "/telecel1.jpg",
  },
  {
    id: "tx3",
    service: "ECG Token",
    category: "Electricity",
    details: "Meter: 1234567890",
    amount: "- GHS 60.00",
    date: "Mar 12, 08:15 PM",
    status: "Successful",
    statusVariant: "success",
    image: "/ecg.png",
  },
  {
    id: "tx4",
    service: "DSTV Compact",
    category: "Cable TV",
    details: "Smartcard: 1234567890",
    amount: "- GHS 120.00",
    date: "Mar 12, 05:40 PM",
    status: "Successful",
    statusVariant: "success",
    image: "/dstv1.jpg",
  },
  {
    id: "tx5",
    service: "Wallet Funding",
    category: "Wallet",
    details: "MTN Mobile Money",
    amount: "+ GHS 200.00",
    date: "Mar 12, 04:20 PM",
    status: "Successful",
    statusVariant: "success",
    icon: "wallet",
    iconBg: "bg-green-100 dark:bg-green-900/30",
  },
  {
    id: "tx6",
    service: "Telecel Airtime",
    category: "Airtime",
    details: "055 987 6543",
    amount: "- GHS 20.00",
    date: "Mar 12, 02:10 PM",
    status: "Failed",
    statusVariant: "danger",
    image: "/telecel1.jpg",
  },
  {
    id: "tx7",
    service: "Glo Data 20GB",
    category: "Data",
    details: "055 987 6543",
    amount: "- GHS 15.00",
    date: "Mar 11, 11:50 AM",
    status: "Successful",
    statusVariant: "success",
    image: "/glo.png",
  },
];

/* ------------------- Wallet Funding (Your Data) ------------------- */
export type MockFundingTransaction = {
  id: string;
  method: string;
  amount: string;
  date: string;
  status: "Successful" | "Pending" | "Failed";
  statusVariant: "success" | "warning" | "danger";
  icon: AtlasIconName;
};

export const mockFundingHistory: MockFundingTransaction[] = [
  {
    id: "fw1",
    method: "Mobile Money",
    amount: "GHS 500.00",
    date: "Today, 9:15 AM",
    status: "Successful",
    statusVariant: "success",
    icon: "mobile",
  },
  {
    id: "fw2",
    method: "Bank Transfer",
    amount: "GHS 1,000.00",
    date: "Yesterday, 4:30 PM",
    status: "Successful",
    statusVariant: "success",
    icon: "bank",
  },
  {
    id: "fw3",
    method: "Card Payment",
    amount: "GHS 200.00",
    date: "May 12, 2025",
    status: "Successful",
    statusVariant: "success",
    icon: "card",
  },
];

/* ------------------- Notifications (Your Data) ------------------- */
export type MockNotification = {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  icon: AtlasIconName;
  iconBg: string;
  actionLabel?: string;
  actionHref?: string;
};

export const mockNotifications: MockNotification[] = [
  {
    id: "n1",
    title: "Wallet funded successfully",
    description: "Your wallet has been credited with GHS 200.00 via Mobile Money.",
    time: "Just now",
    read: false,
    icon: "wallet",
    iconBg: "bg-green-100 dark:bg-green-900/30",
    actionLabel: "View Wallet",
    actionHref: "/customer/wallet",
  },
  {
    id: "n2",
    title: "Data bundle purchased",
    description: "Your MTN Data 1GB purchase was successful.",
    time: "2 hours ago",
    read: false,
    icon: "globe",
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    actionLabel: "View Order",
    actionHref: "/customer/orders",
  },
  {
    id: "n3",
    title: "Electricity bill paid",
    description: "ECG Token purchase for meter 1234567890 was successful.",
    time: "Yesterday",
    read: true,
    icon: "zap",
    iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
    actionLabel: "View Receipt",
    actionHref: "/customer/transactions",
  },
  {
    id: "n4",
    title: "New cashback offer",
    description: "Get 5% cashback on data bundles today using code DATA5.",
    time: "2 days ago",
    read: true,
    icon: "gift",
    iconBg: "bg-accent-500/15",
    actionLabel: "Claim Offer",
    actionHref: "/customer/services?service=data",
  },
  {
    id: "n5",
    title: "DSTV subscription expired",
    description: "Your DSTV Compact subscription has expired. Renew now.",
    time: "3 days ago",
    read: true,
    icon: "tv",
    iconBg: "bg-purple-100 dark:bg-purple-900/30",
    actionLabel: "Renew",
    actionHref: "/customer/services?service=cabletv",
  },
];

/* ------------------- Beneficiaries (Your Data) ------------------- */
export type MockBeneficiary = {
  id: string;
  name: string;
  type: "phone" | "meter" | "smartcard" | "bank";
  value: string;
  service: string;
};

export const mockBeneficiaries: MockBeneficiary[] = [
  {
    id: "b1",
    name: "Emmanuel Phone",
    type: "phone",
    value: "024 123 4567",
    service: "Airtime / Data",
  },
  {
    id: "b2",
    name: "ECG Meter",
    type: "meter",
    value: "1234567890",
    service: "Electricity",
  },
  {
    id: "b3",
    name: "DSTV Decoder",
    type: "smartcard",
    value: "1234567890",
    service: "Cable TV",
  },
  {
    id: "b4",
    name: "Bank Account",
    type: "bank",
    value: "0123456789 • Bank of Ghana",
    service: "Wallet Withdrawal",
  },
];

/* ------------------- Quick Actions (Your Data) ------------------- */
export type MockQuickAction = {
  label: string;
  href: string;
  icon: AtlasIconName;
  bgClass: string;
};

export const mockQuickActions: MockQuickAction[] = [
  { label: "Buy Data", href: "/customer/services?service=data", icon: "globe", bgClass: "bg-brand-100 dark:bg-brand-900/30" },
  { label: "Buy Airtime", href: "/customer/services?service=airtime", icon: "phone", bgClass: "bg-accent-500/15" },
  { label: "Buy Electricity", href: "/customer/services?service=electricity", icon: "zap", bgClass: "bg-yellow-100 dark:bg-yellow-900/30" },
  { label: "Pay Subscription", href: "/customer/services?service=cabletv", icon: "tv", bgClass: "bg-blue-100 dark:bg-blue-900/30" },
];

export const mockPopularServices = [
  { label: "MTN Data", href: "/customer/services?service=data", image: "/mtn1.png" },
  { label: "Airtime", href: "/customer/services?service=airtime", image: "/airteltigo2.jpg" },
  { label: "ECG", href: "/customer/services?service=electricity", image: "/ecg.png" },
  { label: "DSTV", href: "/customer/services?service=cabletv", image: "/dstv1.jpg" },
  { label: "GoTV", href: "/customer/services?service=cabletv", image: "/gotv1.png" },
  { label: "WAEC", href: "/customer/services?service=exampins", image: "/waec3.jpg" },
];

/* ------------------- Profile & Orders (Your Data) ------------------- */
export type MockProfile = {
  fullName: string;
  email: string;
  phone: string;
  avatarUrl: string | null;
};

export const mockProfile: MockProfile = {
  fullName: "Emmanuel",
  email: "emmanuel@example.com",
  phone: "024 123 4567",
  avatarUrl: null,
};

export type MockOrder = {
  id: string;
  orderNumber: string;
  service: string;
  category: string;
  plan: string;
  recipient: string;
  recipientLabel: string;
  amount: string;
  fee: string;
  total: string;
  date: string;
  status: "Fulfilled" | "Processing" | "Pending" | "Failed";
  statusVariant: "success" | "warning" | "danger" | "neutral";
  image?: string;
  icon?: AtlasIconName;
  iconBg?: string;
  paymentMethod: string;
  paymentIcon: AtlasIconName;
  transactionId: string;
  timeline: { title: string; time: string; done: boolean; }[];
};

export const mockOrders: MockOrder[] = [
  {
    id: "o1", orderNumber: "ATL-1001", service: "MTN Data 50GB", category: "Data", plan: "50GB", recipient: "024 123 4567", recipientLabel: "Phone Number", amount: "GHS 25.00", fee: "GHS 0.00", total: "GHS 25.00", date: "Mar 13, 09:45 AM", status: "Fulfilled", statusVariant: "success", image: "/mtn1.png", paymentMethod: "Wallet Balance", paymentIcon: "wallet", transactionId: "ATX-92831",
    timeline: [
      { title: "Order Placed", time: "Mar 13, 09:45 AM", done: true },
      { title: "Payment Confirmed", time: "Mar 13, 09:45 AM", done: true },
      { title: "Processing", time: "Mar 13, 09:46 AM", done: true },
      { title: "Fulfilled", time: "Mar 13, 09:47 AM", done: true },
    ],
  },
  {
    id: "o2", orderNumber: "ATL-1002", service: "Telecel Airtime", category: "Airtime", plan: "GHS 10", recipient: "024 123 4567", recipientLabel: "Phone Number", amount: "GHS 10.00", fee: "GHS 0.00", total: "GHS 10.00", date: "Mar 13, 09:30 AM", status: "Fulfilled", statusVariant: "success", image: "/telecel1.jpg", paymentMethod: "Mobile Money", paymentIcon: "mobile", transactionId: "ATX-92830",
    timeline: [
      { title: "Order Placed", time: "Mar 13, 09:30 AM", done: true },
      { title: "Payment Confirmed", time: "Mar 13, 09:30 AM", done: true },
      { title: "Processing", time: "Mar 13, 09:31 AM", done: true },
      { title: "Fulfilled", time: "Mar 13, 09:31 AM", done: true },
    ],
  },
  {
    id: "o3", orderNumber: "ATL-1003", service: "ECG Token", category: "Electricity", plan: "GHS 60", recipient: "Meter: 1234567890", recipientLabel: "Meter Number", amount: "GHS 60.00", fee: "GHS 0.00", total: "GHS 60.00", date: "Mar 12, 08:15 PM", status: "Processing", statusVariant: "warning", image: "/ecg.png", paymentMethod: "Wallet Balance", paymentIcon: "wallet", transactionId: "ATX-92829",
    timeline: [
      { title: "Order Placed", time: "Mar 12, 08:15 PM", done: true },
      { title: "Payment Confirmed", time: "Mar 12, 08:15 PM", done: true },
      { title: "Processing", time: "Mar 12, 08:16 PM", done: true },
      { title: "Fulfilled", time: "Pending", done: false },
    ],
  },
  {
    id: "o4", orderNumber: "ATL-1004", service: "DSTV Compact", category: "Cable TV", plan: "Compact", recipient: "Smartcard: 1234567890", recipientLabel: "Smartcard Number", amount: "GHS 120.00", fee: "GHS 0.00", total: "GHS 120.00", date: "Mar 12, 05:40 PM", status: "Pending", statusVariant: "neutral", image: "/dstv1.jpg", paymentMethod: "Card Payment", paymentIcon: "card", transactionId: "ATX-92828",
    timeline: [
      { title: "Order Placed", time: "Mar 12, 05:40 PM", done: true },
      { title: "Payment Confirmed", time: "Pending", done: false },
      { title: "Processing", time: "Pending", done: false },
      { title: "Fulfilled", time: "Pending", done: false },
    ],
  },
  {
    id: "o5", orderNumber: "ATL-1005", service: "Glo Data 20GB", category: "Data", plan: "20GB", recipient: "055 987 6543", recipientLabel: "Phone Number", amount: "GHS 15.00", fee: "GHS 0.00", total: "GHS 15.00", date: "Mar 11, 11:50 AM", status: "Failed", statusVariant: "danger", image: "/glo.png", paymentMethod: "Mobile Money", paymentIcon: "mobile", transactionId: "ATX-92827",
    timeline: [
      { title: "Order Placed", time: "Mar 11, 11:50 AM", done: true },
      { title: "Payment Confirmed", time: "Failed", done: false },
      { title: "Processing", time: "Failed", done: false },
      { title: "Fulfilled", time: "Failed", done: false },
    ],
  },
];

/* ------------------- Transaction Summary (Your Data) ------------------- */
export type MockTransactionSummary = {
  totalSpent: string;
  totalReceived: string;
  pendingCount: number;
  successfulCount: number;
};

export const mockTransactionSummary: MockTransactionSummary = {
  totalSpent: "GHS 1,249.25",
  totalReceived: "GHS 500.00",
  pendingCount: 1,
  successfulCount: 32,
};

/* ------------------- Reseller Specific Data -------------------
 *
 * Only the order type and seed survive here. They are consumed by
 * contexts/reseller-data-context.tsx and components/reseller/reseller-orders-list.tsx.
 * Both are repointed in Batch B, at which point these two exports move into
 * lib/domains/orders/ and this file stops carrying any reseller data.
 */

export type ResellerOrder = {
  id: string;
  orderNumber: string;
  service: string;
  category: string;
  customer: string;
  amount: string;
  commission: string;
  date: string;
  status: "Successful" | "Pending" | "Failed";
  statusVariant: "success" | "warning" | "danger";
  image?: string;
  icon?: AtlasIconName;
  iconBg?: string;
};

export const mockResellerOrders: ResellerOrder[] = [
  {
    id: "ro1", orderNumber: "R-1001", service: "MTN Data 50GB", category: "Data", customer: "024 123 4567", amount: "GHS 45.00", commission: "GHS 4.50", date: "10:24 AM", status: "Successful", statusVariant: "success", image: "/mtn1.png",
  },
  {
    id: "ro2", orderNumber: "R-1002", service: "Airtime Top Up", category: "Airtime", customer: "055 987 6543", amount: "GHS 20.00", commission: "GHS 1.20", date: "09:58 AM", status: "Successful", statusVariant: "success", image: "/telecel1.jpg",
  },
  {
    id: "ro3", orderNumber: "R-1003", service: "DSTV Subscription", category: "Cable TV", customer: "020 111 2222", amount: "GHS 120.00", commission: "GHS 6.00", date: "09:32 AM", status: "Successful", statusVariant: "success", image: "/dstv1.jpg",
  },
  {
    id: "ro4", orderNumber: "R-1004", service: "Electricity Bill", category: "Electricity", customer: "ECG - 1234567890", amount: "GHS 80.00", commission: "GHS 4.00", date: "08:45 AM", status: "Successful", statusVariant: "success", image: "/ecg.png",
  },
  {
    id: "ro5", orderNumber: "R-1005", service: "Internet Bundle", category: "Internet", customer: "024 567 8901", amount: "GHS 50.00", commission: "GHS 2.50", date: "08:12 AM", status: "Pending", statusVariant: "warning", image: "/glo.png",
  },
];