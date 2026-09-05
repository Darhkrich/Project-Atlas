import type { MerchantStorefrontProduct } from "@/types/merchant-storefront";

const cosmeticsProducts: MerchantStorefrontProduct[] = [
  {
    id: "p1",
    name: "Vitamin C Face Serum",
    description: "Brightening serum with vitamin C and hyaluronic acid.",
    price: 120,
    salePrice: 99,
    images: ["https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&h=800&fit=crop"],
    categoryId: "Skincare",
    inStock: true,
    featured: true,
  },
  {
    id: "p2",
    name: "Shea Butter Body Cream",
    description: "Rich, moisturizing body cream with natural shea butter.",
    price: 85,
    images: ["https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&h=800&fit=crop"],
    categoryId: "Body",
    inStock: true,
    featured: true,
  },
  {
    id: "p3",
    name: "Aloe Vera Soothing Gel",
    description: "Cooling and hydrating gel for sun-exposed skin.",
    price: 65,
    images: ["https://images.unsplash.com/photo-1601049676869-702ea24cfd58?w=800&h=800&fit=crop"],
    categoryId: "Skincare",
    inStock: true,
    featured: true,
  },
  {
    id: "p4",
    name: "Lip Glow Kit",
    description: "Complete lip care set with natural oils and butters.",
    price: 150,
    images: ["https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&h=800&fit=crop"],
    categoryId: "Cosmetics",
    inStock: true,
    featured: true,
  },
  {
    id: "p5",
    name: "Charcoal Detox Face Mask",
    description: "Deep cleansing mask with activated charcoal.",
    price: 95,
    images: ["https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=800&fit=crop"],
    categoryId: "Skincare",
    inStock: false,
    featured: false,
  },
  {
    id: "p6",
    name: "Coconut Oil Hair Food",
    description: "Nourishing hair treatment with coconut and castor oil.",
    price: 70,
    images: ["https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=800&fit=crop"],
    categoryId: "Hair",
    inStock: true,
    featured: false,
  },
];

const fashionProducts: MerchantStorefrontProduct[] = [
  {
    id: "f1",
    name: "Summer Floral Dress",
    description: "Lightweight floral dress for warm days.",
    price: 250,
    salePrice: 199,
    images: ["https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=800&fit=crop"],
    categoryId: "Dresses",
    inStock: true,
    featured: true,
  },
  {
    id: "f2",
    name: "Classic Denim Jacket",
    description: "Timeless denim jacket for any outfit.",
    price: 320,
    images: ["https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=800&h=800&fit=crop"],
    categoryId: "Outerwear",
    inStock: true,
    featured: true,
  },
  {
    id: "f3",
    name: "White Cotton T-Shirt",
    description: "Essential white tee made from organic cotton.",
    price: 90,
    images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop"],
    categoryId: "Tops",
    inStock: true,
    featured: true,
  },
  {
    id: "f4",
    name: "Slim Fit Chinos",
    description: "Versatile slim-fit chinos for work or casual.",
    price: 210,
    images: ["https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&h=800&fit=crop"],
    categoryId: "Bottoms",
    inStock: true,
    featured: true,
  },
  {
    id: "f5",
    name: "Leather Crossbody Bag",
    description: "Genuine leather crossbody bag with adjustable strap.",
    price: 450,
    salePrice: 399,
    images: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=800&fit=crop"],
    categoryId: "Accessories",
    inStock: true,
    featured: true,
  },
  {
    id: "f6",
    name: "Oversized Sunglasses",
    description: "Statement sunglasses with UV protection.",
    price: 180,
    images: ["https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&h=800&fit=crop"],
    categoryId: "Accessories",
    inStock: true,
    featured: false,
  },
];

const generalProducts: MerchantStorefrontProduct[] = [
  {
    id: "g1",
    name: "Wireless Headphones",
    description: "High-quality wireless headphones with noise cancellation.",
    price: 350,
    salePrice: 299,
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop"],
    categoryId: "Electronics",
    inStock: true,
    featured: true,
  },
  {
    id: "g2",
    name: "Smart Watch",
    description: "Fitness and health tracking smartwatch.",
    price: 500,
    images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop"],
    categoryId: "Electronics",
    inStock: true,
    featured: true,
  },
  {
    id: "g3",
    name: "Ceramic Coffee Mug",
    description: "Elegant ceramic mug for your daily coffee.",
    price: 40,
    images: ["https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&h=800&fit=crop"],
    categoryId: "Home",
    inStock: true,
    featured: true,
  },
  {
    id: "g4",
    name: "Desk Lamp",
    description: "Modern LED desk lamp with adjustable brightness.",
    price: 120,
    images: ["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&h=800&fit=crop"],
    categoryId: "Home",
    inStock: true,
    featured: true,
  },
];

export function getProductsForStore(category: string): MerchantStorefrontProduct[] {
  switch (category) {
    case "cosmetics":
      return cosmeticsProducts;
    case "clothing":
      return fashionProducts;
    default:
      return generalProducts;
  }
}