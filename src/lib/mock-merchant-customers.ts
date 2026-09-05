export type MerchantCustomer = {
  id: string;
  storeSlug: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: string;
  lastActivity: string;
  status: "Active" | "Inactive";
};

const baseCustomers: Omit<MerchantCustomer, "storeSlug">[] = [
  {
    id: "cust1",
    name: "Abena Owusu",
    email: "abena@example.com",
    phone: "024 123 4567",
    totalOrders: 12,
    totalSpent: "GH₵ 1,450.00",
    lastActivity: "Today, 10:30 AM",
    status: "Active",
  },
  {
    id: "cust2",
    name: "Kwame Mensah",
    email: "kwame@example.com",
    phone: "055 987 6543",
    totalOrders: 8,
    totalSpent: "GH₵ 980.00",
    lastActivity: "Today, 9:15 AM",
    status: "Active",
  },
  {
    id: "cust3",
    name: "Yaa Boateng",
    email: "yaa@example.com",
    phone: "020 123 4567",
    totalOrders: 5,
    totalSpent: "GH₵ 620.00",
    lastActivity: "Yesterday, 8:40 PM",
    status: "Active",
  },
  {
    id: "cust4",
    name: "Ama Serwaa",
    email: "ama@example.com",
    phone: "027 123 4567",
    totalOrders: 3,
    totalSpent: "GH₵ 340.00",
    lastActivity: "Yesterday, 5:20 PM",
    status: "Active",
  },
  {
    id: "cust5",
    name: "Kofi Adjei",
    email: "kofi@example.com",
    phone: "024 555 1234",
    totalOrders: 0,
    totalSpent: "GH₵ 0.00",
    lastActivity: "2 weeks ago",
    status: "Inactive",
  },
];

export function getMockMerchantCustomers(storeSlug: string): MerchantCustomer[] {
  return baseCustomers.map((customer) => ({ ...customer, storeSlug }));
}