import type { AtlasIconName } from "@/components/atlas/icons";

// Transactions
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




// Wallet funding history
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

// Notifications
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

// Beneficiaries (saved details)
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

// Favorites (quick buy + saved details) can be added similarly if needed.
// For brevity, not included here but pattern same.

export const mockQuickActions = [
  { label: "Buy Data", href: "/customer/services?service=data", icon: "globe" as AtlasIconName, bgClass: "bg-brand-100 dark:bg-brand-900/30" },
  { label: "Buy Airtime", href: "/customer/services?service=airtime", icon: "phone" as AtlasIconName, bgClass: "bg-accent-500/15" },
  { label: "Buy Electricity", href: "/customer/services?service=electricity", icon: "zap" as AtlasIconName, bgClass: "bg-yellow-100 dark:bg-yellow-900/30" },
  { label: "Pay Subscription", href: "/customer/services?service=cabletv", icon: "tv" as AtlasIconName, bgClass: "bg-blue-100 dark:bg-blue-900/30" },
];

export const mockPopularServices = [
  { label: "MTN Data", href: "/customer/services?service=data", image: "/mtn1.png" },
  { label: "Airtime", href: "/customer/services?service=airtime", image: "/airteltigo2.jpg" },
  { label: "ECG", href: "/customer/services?service=electricity", image: "/ecg.png" },
  { label: "DSTV", href: "/customer/services?service=cabletv", image: "/dstv1.jpg" },
  { label: "GoTV", href: "/customer/services?service=cabletv", image: "/gotv1.png" },
  { label: "WAEC", href: "/customer/services?service=exampins", image: "/waec3.jpg" },
];


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
  timeline: {
    title: string;
    time: string;
    done: boolean;
  }[];
};

export const mockOrders: MockOrder[] = [
  {
    id: "o1",
    orderNumber: "ATL-1001",
    service: "MTN Data 50GB",
    category: "Data",
    plan: "50GB",
    recipient: "024 123 4567",
    recipientLabel: "Phone Number",
    amount: "GHS 25.00",
    fee: "GHS 0.00",
    total: "GHS 25.00",
    date: "Mar 13, 09:45 AM",
    status: "Fulfilled",
    statusVariant: "success",
    image: "/mtn1.png",
    paymentMethod: "Wallet Balance",
    paymentIcon: "wallet",
    transactionId: "ATX-92831",
    timeline: [
      { title: "Order Placed", time: "Mar 13, 09:45 AM", done: true },
      { title: "Payment Confirmed", time: "Mar 13, 09:45 AM", done: true },
      { title: "Processing", time: "Mar 13, 09:46 AM", done: true },
      { title: "Fulfilled", time: "Mar 13, 09:47 AM", done: true },
    ],
  },
  {
    id: "o2",
    orderNumber: "ATL-1002",
    service: "Telecel Airtime",
    category: "Airtime",
    plan: "GHS 10",
    recipient: "024 123 4567",
    recipientLabel: "Phone Number",
    amount: "GHS 10.00",
    fee: "GHS 0.00",
    total: "GHS 10.00",
    date: "Mar 13, 09:30 AM",
    status: "Fulfilled",
    statusVariant: "success",
    image: "/telecel1.jpg",
    paymentMethod: "Mobile Money",
    paymentIcon: "mobile",
    transactionId: "ATX-92830",
    timeline: [
      { title: "Order Placed", time: "Mar 13, 09:30 AM", done: true },
      { title: "Payment Confirmed", time: "Mar 13, 09:30 AM", done: true },
      { title: "Processing", time: "Mar 13, 09:31 AM", done: true },
      { title: "Fulfilled", time: "Mar 13, 09:31 AM", done: true },
    ],
  },
  {
    id: "o3",
    orderNumber: "ATL-1003",
    service: "ECG Token",
    category: "Electricity",
    plan: "GHS 60",
    recipient: "Meter: 1234567890",
    recipientLabel: "Meter Number",
    amount: "GHS 60.00",
    fee: "GHS 0.00",
    total: "GHS 60.00",
    date: "Mar 12, 08:15 PM",
    status: "Processing",
    statusVariant: "warning",
    image: "/ecg.png",
    paymentMethod: "Wallet Balance",
    paymentIcon: "wallet",
    transactionId: "ATX-92829",
    timeline: [
      { title: "Order Placed", time: "Mar 12, 08:15 PM", done: true },
      { title: "Payment Confirmed", time: "Mar 12, 08:15 PM", done: true },
      { title: "Processing", time: "Mar 12, 08:16 PM", done: true },
      { title: "Fulfilled", time: "Pending", done: false },
    ],
  },
  {
    id: "o4",
    orderNumber: "ATL-1004",
    service: "DSTV Compact",
    category: "Cable TV",
    plan: "Compact",
    recipient: "Smartcard: 1234567890",
    recipientLabel: "Smartcard Number",
    amount: "GHS 120.00",
    fee: "GHS 0.00",
    total: "GHS 120.00",
    date: "Mar 12, 05:40 PM",
    status: "Pending",
    statusVariant: "neutral",
    image: "/dstv1.jpg",
    paymentMethod: "Card Payment",
    paymentIcon: "card",
    transactionId: "ATX-92828",
    timeline: [
      { title: "Order Placed", time: "Mar 12, 05:40 PM", done: true },
      { title: "Payment Confirmed", time: "Pending", done: false },
      { title: "Processing", time: "Pending", done: false },
      { title: "Fulfilled", time: "Pending", done: false },
    ],
  },
  {
    id: "o5",
    orderNumber: "ATL-1005",
    service: "Glo Data 20GB",
    category: "Data",
    plan: "20GB",
    recipient: "055 987 6543",
    recipientLabel: "Phone Number",
    amount: "GHS 15.00",
    fee: "GHS 0.00",
    total: "GHS 15.00",
    date: "Mar 11, 11:50 AM",
    status: "Failed",
    statusVariant: "danger",
    image: "/glo.png",
    paymentMethod: "Mobile Money",
    paymentIcon: "mobile",
    transactionId: "ATX-92827",
    timeline: [
      { title: "Order Placed", time: "Mar 11, 11:50 AM", done: true },
      { title: "Payment Confirmed", time: "Failed", done: false },
      { title: "Processing", time: "Failed", done: false },
      { title: "Fulfilled", time: "Failed", done: false },
    ],
  },
];

// Recently used services
export type MockRecentService = {
  id: string;
  serviceId: string;
  label: string;
  icon: AtlasIconName;
  href: string;
};

export const mockRecentServices: MockRecentService[] = [
  {
    id: "rs1",
    serviceId: "data",
    label: "MTN Data 50GB",
    icon: "globe",
    href: "/customer/services?service=data",
  },
  {
    id: "rs2",
    serviceId: "airtime",
    label: "Telecel Airtime",
    icon: "phone",
    href: "/customer/services?service=airtime",
  },
  {
    id: "rs3",
    serviceId: "electricity",
    label: "ECG Token",
    icon: "zap",
    href: "/customer/services?service=electricity",
  },
];

// Transaction summary
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



export type ResellerStats = {
  totalSales: string;
  totalCommissions: string;
  totalOrders: number;
  totalCustomers: number;
};

export const mockResellerStats: ResellerStats = {
  totalSales: "GHS 8,450.00",
  totalCommissions: "GHS 422.50",
  totalOrders: 156,
  totalCustomers: 89,
};


// Reseller KPI
export type ResellerKpi = {
  label: string;
  value: string;
  change?: string;
  trend?: "up" | "down";
};

export const mockResellerKpis: ResellerKpi[] = [
  {
    label: "Today's Sales",
    value: "GH₵ 2,450.00",
    change: "+12.5%",
    trend: "up",
  },
  {
    label: "Total Orders",
    value: "42",
    change: "+20.3%",
    trend: "up",
  },
  {
    label: "Customers",
    value: "128",
    change: "+18.7%",
    trend: "up",
  },
  {
    label: "Wallet Balance",
    value: "GH₵ 850.00",
    change: "",
    trend: "up",
  },
];
// Reseller Services & Products
export type ResellerServiceProduct = {
  id: string;
  name: string;
  atlasPrice: string;
  sellingPrice: string;
  margin: string;
  enabled: boolean;
};

export type ResellerService = {
  id: string;
  name: string;
  description: string;
  icon: AtlasIconName;
  enabled: boolean;
  products: ResellerServiceProduct[];
};

export const mockResellerServices: ResellerService[] = [
  {
    id: "airtime",
    name: "Airtime",
    description: "Top up any mobile network",
    icon: "phone",
    enabled: true,
    products: [
      {
        id: "airtime-mtn-5",
        name: "MTN GHS 5",
        atlasPrice: "GHS 5.00",
        sellingPrice: "GHS 5.50",
        margin: "GHS 0.50",
        enabled: true,
      },
      {
        id: "airtime-mtn-10",
        name: "MTN GHS 10",
        atlasPrice: "GHS 10.00",
        sellingPrice: "GHS 10.50",
        margin: "GHS 0.50",
        enabled: true,
      },
      {
        id: "airtime-telecel-10",
        name: "Telecel GHS 10",
        atlasPrice: "GHS 10.00",
        sellingPrice: "GHS 10.50",
        margin: "GHS 0.50",
        enabled: true,
      },
    ],
  },
  {
    id: "data",
    name: "Data",
    description: "Sell mobile data bundles",
    icon: "globe",
    enabled: true,
    products: [
      {
        id: "data-mtn-1gb",
        name: "MTN 1GB",
        atlasPrice: "GHS 6.00",
        sellingPrice: "GHS 7.00",
        margin: "GHS 1.00",
        enabled: true,
      },
      {
        id: "data-mtn-5gb",
        name: "MTN 5GB",
        atlasPrice: "GHS 25.00",
        sellingPrice: "GHS 27.00",
        margin: "GHS 2.00",
        enabled: true,
      },
      {
        id: "data-telecel-2gb",
        name: "Telecel 2GB",
        atlasPrice: "GHS 10.00",
        sellingPrice: "GHS 11.00",
        margin: "GHS 1.00",
        enabled: true,
      },
    ],
  },
  {
    id: "electricity",
    name: "Electricity",
    description: "ECG prepaid and postpaid",
    icon: "zap",
    enabled: true,
    products: [
      {
        id: "ecg-50",
        name: "ECG GHS 50",
        atlasPrice: "GHS 50.00",
        sellingPrice: "GHS 52.00",
        margin: "GHS 2.00",
        enabled: true,
      },
      {
        id: "ecg-100",
        name: "ECG GHS 100",
        atlasPrice: "GHS 100.00",
        sellingPrice: "GHS 104.00",
        margin: "GHS 4.00",
        enabled: true,
      },
    ],
  },
  {
    id: "tv",
    name: "TV Subscriptions",
    description: "DSTV, GOtv, StarTimes",
    icon: "tv",
    enabled: true,
    products: [
      {
        id: "dstv-compact",
        name: "DSTV Compact",
        atlasPrice: "GHS 120.00",
        sellingPrice: "GHS 125.00",
        margin: "GHS 5.00",
        enabled: true,
      },
      {
        id: "gotv-max",
        name: "GOtv Max",
        atlasPrice: "GHS 80.00",
        sellingPrice: "GHS 84.00",
        margin: "GHS 4.00",
        enabled: true,
      },
    ],
  },
  {
    id: "results",
    name: "Results Checker",
    description: "WAEC, JAMB, NECO",
    icon: "graduation",
    enabled: false,
    products: [
      {
        id: "waec-2025",
        name: "WAEC 2025",
        atlasPrice: "GHS 20.00",
        sellingPrice: "GHS 22.00",
        margin: "GHS 2.00",
        enabled: true,
      },
    ],
  },
];


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
    id: "ro1",
    orderNumber: "R-1001",
    service: "MTN Data 50GB",
    category: "Data",
    customer: "Abena Owusu",
    amount: "GHS 45.00",
    commission: "GHS 4.50",
    date: "Today, 10:30 AM",
    status: "Successful",
    statusVariant: "success",
    image: "/mtn1.png",
  },
  {
    id: "ro2",
    orderNumber: "R-1002",
    service: "Telecel Airtime",
    category: "Airtime",
    customer: "Kwame Mensah",
    amount: "GHS 20.00",
    commission: "GHS 1.20",
    date: "Today, 9:15 AM",
    status: "Successful",
    statusVariant: "success",
    image: "/telecel1.jpg",
  },
  {
    id: "ro3",
    orderNumber: "R-1003",
    service: "ECG Token",
    category: "Electricity",
    customer: "Yaw Boateng",
    amount: "GHS 60.00",
    commission: "GHS 3.00",
    date: "Yesterday, 8:40 PM",
    status: "Pending",
    statusVariant: "warning",
    image: "/ecg.png",
  },
  {
    id: "ro4",
    orderNumber: "R-1004",
    service: "DSTV Compact",
    category: "Cable TV",
    customer: "Ama Serwaa",
    amount: "GHS 120.00",
    commission: "GHS 6.00",
    date: "Yesterday, 5:20 PM",
    status: "Successful",
    statusVariant: "success",
    image: "/dstv1.jpg",
  },
  {
    id: "ro5",
    orderNumber: "R-1005",
    service: "Glo Data 100GB",
    category: "Data",
    customer: "Kofi Mensah",
    amount: "GHS 45.00",
    commission: "GHS 4.50",
    date: "Yesterday, 9:30 PM",
    status: "Successful",
    statusVariant: "success",
    image: "/glo.png",
  },
];



// Reseller Withdrawal
export type MockWithdrawalTransaction = {
  id: string;
  method: string;
  amount: string;
  date: string;
  status: "Successful" | "Pending" | "Failed";
  statusVariant: "success" | "warning" | "danger";
  icon: AtlasIconName;
};

export const mockWithdrawalHistory: MockWithdrawalTransaction[] = [
  {
    id: "wd1",
    method: "Bank Transfer",
    amount: "GHS 500.00",
    date: "Aug 18, 2025",
    status: "Successful",
    statusVariant: "success",
    icon: "bank",
  },
  {
    id: "wd2",
    method: "Mobile Money",
    amount: "GHS 200.00",
    date: "Aug 15, 2025",
    status: "Successful",
    statusVariant: "success",
    icon: "mobile",
  },
  {
    id: "wd3",
    method: "Bank Transfer",
    amount: "GHS 300.00",
    date: "Aug 10, 2025",
    status: "Pending",
    statusVariant: "warning",
    icon: "bank",
  },
];