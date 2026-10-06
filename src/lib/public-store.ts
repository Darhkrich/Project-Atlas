import type {
  MerchantStorefrontConfig,
  MerchantStorefrontProduct,
} from "@/types/merchant-storefront";

export type StoreWithProducts = {
  store: MerchantStorefrontConfig;
  products: MerchantStorefrontProduct[];
};

export const storesWithProducts: StoreWithProducts[] = [
  {
    store: {
      storeName: "Glow Beauty",
      slug: "glow-beauty",
      primaryColor: "#14532d",
      accentColor: "#c89c1e",
      tagline: "Natural beauty, radiant you.",
      description: "We offer high-quality natural beauty products that make you look and feel your best.",
      heroTitle: "Discover Your Natural Glow",
      heroDescription: "Shop our curated collection of organic skincare, cosmetics, and wellness essentials.",
      theme: "airy",
      templateId: "tpl-cosmetics-luxe",
      templateCategory: "cosmetics",
      announcement: "Free shipping on orders over GH₵ 200!",
      contactEmail: "support@glowbeauty.com",
      contactPhone: "024 123 4567",
      whatsapp: "024 123 4567",
      address: "123 Palm Street, Accra",
      socialLinks: {
        facebook: "https://facebook.com/glowbeauty",
        instagram: "https://instagram.com/glowbeauty",
        tiktok: "",
        twitter: "",
      },
      showAnnouncement: true,
      showTrustSection: true,
      showFeaturedProducts: true,
      status: "live",
      paymentMethodIds: ["momo", "card"],
      storefrontId: ""
    },
    products: [
      {
        id: "p1",
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
      },
      {
        id: "p2",
        name: "Shea Butter Body Cream",
        description: "Rich, moisturizing body cream with natural shea butter.",
        price: 85,
        images: [
          "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&h=800&fit=crop",
        ],
        categoryId: "Body",
        inStock: true,
        featured: true,
      },
      {
        id: "p3",
        name: "Aloe Vera Soothing Gel",
        description: "Cooling and hydrating gel for sun-exposed skin.",
        price: 65,
        images: [
          "https://images.unsplash.com/photo-1601049676869-702ea24cfd58?w=800&h=800&fit=crop",
        ],
        categoryId: "Skincare",
        inStock: true,
        featured: true,
      },
      {
        id: "p4",
        name: "Lip Glow Kit",
        description: "Complete lip care set with natural oils and butters.",
        price: 150,
        images: [
          "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&h=800&fit=crop",
        ],
        categoryId: "Cosmetics",
        inStock: true,
        featured: true,
      },
      {
        id: "p5",
        name: "Charcoal Detox Face Mask",
        description: "Deep cleansing mask with activated charcoal.",
        price: 95,
        images: [
          "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=800&fit=crop",
        ],
        categoryId: "Skincare",
        inStock: false,
        featured: false,
      },
      {
        id: "p6",
        name: "Coconut Oil Hair Food",
        description: "Nourishing hair treatment with coconut and castor oil.",
        price: 70,
        images: [
          "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=800&fit=crop",
        ],
        categoryId: "Hair",
        inStock: true,
        featured: false,
      },
      {
        id: "p7",
        name: "Rosewater Toner",
        description: "Gentle toner to balance and refresh skin.",
        price: 55,
        images: [
          "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&h=800&fit=crop",
        ],
        categoryId: "Skincare",
        inStock: true,
        featured: false,
      },
      {
        id: "p8",
        name: "Silk Body Scrub",
        description: "Exfoliating sugar scrub with essential oils.",
        price: 110,
        images: [
          "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&h=800&fit=crop",
        ],
        categoryId: "Body",
        inStock: true,
        featured: false,
      },
    ],
  },
  {
    store: {
      storeName: "Fashion Hub",
      slug: "fashion-hub",
      primaryColor: "#0f172a",
      accentColor: "#f59e0b",
      tagline: "Style that speaks.",
      description: "Trendy fashion for every occasion. Quality fabrics, timeless designs.",
      heroTitle: "New Season, New You",
      heroDescription: "Discover the latest styles in clothing and accessories.",
      theme: "airy",
      templateId: "tpl-fashion-modern",
      templateCategory: "clothing",
      announcement: "Free returns within 14 days",
      contactEmail: "hello@fashionhub.com",
      contactPhone: "055 987 6543",
      whatsapp: "055 987 6543",
      address: "456 Fashion Ave, Accra",
      socialLinks: {
        facebook: "https://facebook.com/fashionhub",
        instagram: "https://instagram.com/fashionhub",
        tiktok: "https://tiktok.com/@fashionhub",
        twitter: "",
      },
      showAnnouncement: true,
      showTrustSection: true,
      showFeaturedProducts: true,
      status: "live",
      paymentMethodIds: ["momo", "card"],
      storefrontId: ""
    },
    products: [
      {
        id: "f1",
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
      },
      {
        id: "f2",
        name: "Classic Denim Jacket",
        description: "Timeless denim jacket for any outfit.",
        price: 320,
        images: [
          "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=800&h=800&fit=crop",
        ],
        categoryId: "Outerwear",
        inStock: true,
        featured: true,
      },
      {
        id: "f3",
        name: "White Cotton T-Shirt",
        description: "Essential white tee made from organic cotton.",
        price: 90,
        images: [
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop",
        ],
        categoryId: "Tops",
        inStock: true,
        featured: true,
      },
      {
        id: "f4",
        name: "Slim Fit Chinos",
        description: "Versatile slim-fit chinos for work or casual.",
        price: 210,
        images: [
          "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&h=800&fit=crop",
        ],
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
        images: [
          "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=800&fit=crop",
        ],
        categoryId: "Accessories",
        inStock: true,
        featured: true,
      },
      {
        id: "f6",
        name: "Oversized Sunglasses",
        description: "Statement sunglasses with UV protection.",
        price: 180,
        images: [
          "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&h=800&fit=crop",
        ],
        categoryId: "Accessories",
        inStock: true,
        featured: false,
      },
    ],
  },
];


