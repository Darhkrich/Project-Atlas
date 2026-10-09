import type { MerchantStorefrontProduct } from "@/types/merchant-storefront";

const cosmeticsProducts: MerchantStorefrontProduct[] = [
  {
    id: "starter-p1",
    name: "Vitamin C Face Serum",
    description: "Brightening serum with vitamin C and hyaluronic acid.",
    price: 120,
    salePrice: 99,
    images: [
      "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&h=800&fit=crop",
    ],
    categoryId: "Skincare",
    inStock: true,
    featured: true,
    stockLevel: 12,
    status: "Active",
    sku: "ATL-STARTER-COS-001",
  },
  {
    id: "starter-p2",
    name: "Shea Butter Body Cream",
    description: "Rich, moisturizing body cream with natural shea butter.",
    price: 85,
    images: [
      "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&h=800&fit=crop",
    ],
    categoryId: "Body Care",
    inStock: true,
    featured: true,
    stockLevel: 20,
    status: "Active",
    sku: "ATL-STARTER-COS-002",
  },
  {
    id: "starter-p3",
    name: "Aloe Vera Soothing Gel",
    description: "Cooling and hydrating gel for sun-exposed skin.",
    price: 65,
    images: [
      "https://images.unsplash.com/photo-1601049676869-702ea24cfd58?w=800&h=800&fit=crop",
    ],
    categoryId: "Skincare",
    inStock: true,
    featured: true,
    stockLevel: 15,
    status: "Active",
    sku: "ATL-STARTER-COS-003",
  },
  {
    id: "starter-p4",
    name: "Lip Glow Kit",
    description: "Complete lip care set with natural oils and butters.",
    price: 150,
    images: [
      "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&h=800&fit=crop",
    ],
    categoryId: "Makeup",
    inStock: true,
    featured: true,
    stockLevel: 8,
    status: "Active",
    sku: "ATL-STARTER-COS-004",
  },
  {
    id: "starter-p5",
    name: "Charcoal Detox Face Mask",
    description: "Deep cleansing mask with activated charcoal.",
    price: 95,
    images: [
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=800&fit=crop",
    ],
    categoryId: "Skincare",
    inStock: false,
    featured: false,
    stockLevel: 0,
    status: "Active",
    sku: "ATL-STARTER-COS-005",
  },
  {
    id: "starter-p6",
    name: "Coconut Oil Hair Food",
    description: "Nourishing hair treatment with coconut and castor oil.",
    price: 70,
    images: [
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&h=800&fit=crop",
    ],
    categoryId: "Hair Care",
    inStock: true,
    featured: false,
    stockLevel: 24,
    status: "Active",
    sku: "ATL-STARTER-COS-006",
  },
];

const clothingProducts: MerchantStorefrontProduct[] = [
  {
    id: "starter-f1",
    name: "Summer Floral Dress",
    description: "Lightweight floral dress for warm days.",
    price: 250,
    salePrice: 199,
    images: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=800&fit=crop",
    ],
    categoryId: "Dresses",
    inStock: true,
    featured: true,
    stockLevel: 6,
    status: "Active",
    sku: "ATL-STARTER-CLO-001",
  },
  {
    id: "starter-f2",
    name: "Classic Denim Jacket",
    description: "Timeless denim jacket for any outfit.",
    price: 320,
    images: [
      "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=800&h=800&fit=crop",
    ],
    categoryId: "Outerwear",
    inStock: true,
    featured: true,
    stockLevel: 4,
    status: "Active",
    sku: "ATL-STARTER-CLO-002",
  },
  {
    id: "starter-f3",
    name: "White Cotton T-Shirt",
    description: "Essential white tee made from organic cotton.",
    price: 90,
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop",
    ],
    categoryId: "Tops",
    inStock: true,
    featured: true,
    stockLevel: 30,
    status: "Active",
    sku: "ATL-STARTER-CLO-003",
  },
  {
    id: "starter-f4",
    name: "Slim Fit Chinos",
    description: "Versatile slim-fit chinos for work or casual.",
    price: 210,
    images: [
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&h=800&fit=crop",
    ],
    categoryId: "Bottoms",
    inStock: true,
    featured: true,
    stockLevel: 10,
    status: "Active",
    sku: "ATL-STARTER-CLO-004",
  },
  {
    id: "starter-f5",
    name: "Leather Crossbody Bag",
    description: "Genuine leather crossbody bag with adjustable strap.",
    price: 450,
    salePrice: 399,
    images: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=800&fit=crop",
    ],
    categoryId: "Accessories",
    inStock: true,
    featured: true,
    stockLevel: 3,
    status: "Active",
    sku: "ATL-STARTER-CLO-005",
  },
  {
    id: "starter-f6",
    name: "Oversized Sunglasses",
    description: "Statement sunglasses with UV protection.",
    price: 180,
    images: [
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&h=800&fit=crop",
    ],
    categoryId: "Accessories",
    inStock: true,
    featured: false,
    stockLevel: 12,
    status: "Active",
    sku: "ATL-STARTER-CLO-006",
  },
];

const generalProducts: MerchantStorefrontProduct[] = [
  {
    id: "starter-g1",
    name: "Wireless Headphones",
    description: "High-quality wireless headphones with noise cancellation.",
    price: 350,
    salePrice: 299,
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop",
    ],
    categoryId: "Electronics",
    inStock: true,
    featured: true,
    stockLevel: 10,
    status: "Active",
    sku: "ATL-STARTER-GEN-001",
  },
  {
    id: "starter-g2",
    name: "Smart Watch",
    description: "Fitness and health tracking smartwatch.",
    price: 500,
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop",
    ],
    categoryId: "Electronics",
    inStock: true,
    featured: true,
    stockLevel: 5,
    status: "Active",
    sku: "ATL-STARTER-GEN-002",
  },
  {
    id: "starter-g3",
    name: "Ceramic Coffee Mug",
    description: "Elegant ceramic mug for your daily coffee.",
    price: 40,
    images: [
      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&h=800&fit=crop",
    ],
    categoryId: "Home",
    inStock: true,
    featured: true,
    stockLevel: 40,
    status: "Active",
    sku: "ATL-STARTER-GEN-003",
  },
  {
    id: "starter-g4",
    name: "Desk Lamp",
    description: "Modern LED desk lamp with adjustable brightness.",
    price: 120,
    images: [
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&h=800&fit=crop",
    ],
    categoryId: "Home",
    inStock: true,
    featured: true,
    stockLevel: 8,
    status: "Active",
    sku: "ATL-STARTER-GEN-004",
  },
];

export function getStarterCatalog(
  category: string
): MerchantStorefrontProduct[] {
  switch (category) {
    case "cosmetics":
      return cosmeticsProducts;
    case "clothing":
      return clothingProducts;
    default:
      return generalProducts;
  }
}