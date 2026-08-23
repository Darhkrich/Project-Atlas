export type MerchantProduct = {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: string;
  stock: number;
  status: "Active" | "Draft" | "Archived";
  image: string; // placeholder color or emoji
};

export const mockMerchantProducts: MerchantProduct[] = [
  {
    id: "mp1",
    name: "Vitamin C Face Serum",
    sku: "VCS-001",
    category: "Skincare",
    price: "GH₵ 120.00",
    stock: 45,
    status: "Active",
    image: "🧴",
  },
  {
    id: "mp2",
    name: "Shea Butter Body Cream",
    sku: "SBC-002",
    category: "Body Care",
    price: "GH₵ 85.00",
    stock: 32,
    status: "Active",
    image: "🧴",
  },
  {
    id: "mp3",
    name: "Aloe Vera Gel",
    sku: "AVG-003",
    category: "Skincare",
    price: "GH₵ 65.00",
    stock: 18,
    status: "Active",
    image: "🌿",
  },
  {
    id: "mp4",
    name: "Lip Glow Kit",
    sku: "LGK-004",
    category: "Makeup",
    price: "GH₵ 150.00",
    stock: 8,
    status: "Active",
    image: "💄",
  },
  {
    id: "mp5",
    name: "Charcoal Face Mask",
    sku: "CFM-005",
    category: "Skincare",
    price: "GH₵ 95.00",
    stock: 0,
    status: "Draft",
    image: "🖤",
  },
  {
    id: "mp6",
    name: "Coconut Oil Hair Food",
    sku: "COH-006",
    category: "Hair Care",
    price: "GH₵ 70.00",
    stock: 5,
    status: "Active",
    image: "🥥",
  },
  {
    id: "mp7",
    name: "Rosewater Toner",
    sku: "RWT-007",
    category: "Skincare",
    price: "GH₵ 55.00",
    stock: 12,
    status: "Archived",
    image: "🌹",
  },
];