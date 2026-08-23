export type MerchantCustomer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: string;
  lastActivity: string;
  status: "Active" | "Inactive";
};

export const mockMerchantCustomers: MerchantCustomer[] = [
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
  {
    id: "cust6",
    name: "Efua Owusua",
    email: "efua@example.com",
    phone: "026 555 9876",
    totalOrders: 7,
    totalSpent: "GH₵ 1,120.00",
    lastActivity: "Aug 20, 2025",
    status: "Active",
  },
  {
    id: "cust7",
    name: "Nana Yaa",
    email: "nana@example.com",
    phone: "054 555 4321",
    totalOrders: 1,
    totalSpent: "GH₵ 60.00",
    lastActivity: "Aug 20, 2025",
    status: "Inactive",
  },
  {
    id: "cust8",
    name: "Akosua Manu",
    email: "akosua@example.com",
    phone: "023 555 8765",
    totalOrders: 9,
    totalSpent: "GH₵ 1,800.00",
    lastActivity: "Aug 19, 2025",
    status: "Active",
  },
];