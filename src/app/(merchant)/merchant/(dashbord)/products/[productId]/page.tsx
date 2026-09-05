/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { AtlasIcon } from "@/components/atlas/icons";
import { Button } from "@/components/atlas/button";
import { useStorefrontConfig } from "@/contexts/storefront-config-context";
import { useStoreProducts } from "@/contexts/store-products-context";
import { cn } from "@/lib/utils";

const categories = [
  "Skincare",
  "Body Care",
  "Makeup",
  "Hair Care",
  "Fragrance",
  "Other",
];

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.productId as string;
  const { storefrontConfig } = useStorefrontConfig();
  const { getProductsForStore, updateProduct } = useStoreProducts();
  const storeSlug = storefrontConfig.slug || "my-store";
  const product = getProductsForStore(storeSlug).find((p) => p.id === productId);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    salePrice: "",
    sku: "",
    stock: "",
    status: "Active",
    image: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        category: product.categoryId,
        price: product.price.toString(),
        salePrice: product.salePrice?.toString() || "",
        sku: product.sku || "",
        stock: product.inStock ? "1" : "0",
        status: product.status || "Active",
        image: product.images?.[0] || "",
      });
    }
  }, [product]);

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h1 className="text-xl font-semibold text-neutral-900">Product not found</h1>
        <Link href="/merchant/products" className="mt-4 text-brand-600">
          Back to Products
        </Link>
      </div>
    );
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.price.trim()) newErrors.price = "Price is required";
    if (!formData.stock.trim()) newErrors.stock = "Stock quantity is required";
    if (!formData.category) newErrors.category = "Category is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    updateProduct(storeSlug, productId, {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      salePrice: formData.salePrice ? parseFloat(formData.salePrice) : undefined,
      images: formData.image ? [formData.image] : ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop"],
      categoryId: formData.category,
      inStock: parseInt(formData.stock) > 0,
      status: formData.status as "Active" | "Draft" | "Archived",
      sku: formData.sku,
    });
    setIsSubmitting(false);
    router.push("/merchant/products");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
            Edit Product
          </h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Update product details.
          </p>
        </div>
        <Link
          href="/merchant/products"
          className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
        >
          <AtlasIcon name="arrow-left" className="h-5 w-5" />
          Back to Products
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Basic Information
              </h2>
              <div className="mt-4 space-y-5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Product name <span className="text-danger-500">*</span>
                  </label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Vitamin C Face Serum"
                    className={cn(
                      "w-full rounded-lg border bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:ring-2 dark:bg-neutral-950 dark:text-neutral-100",
                      errors.name ? "border-danger-500" : "border-neutral-300"
                    )}
                  />
                  {errors.name && <p className="mt-1 text-xs text-danger-600">{errors.name}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Describe the product..."
                    className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Product Image
                  </label>
                  <div className="mt-1 flex items-center gap-3">
                    {formData.image && (
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="h-20 w-20 rounded-lg object-cover"
                      />
                    )}
                    <label className="cursor-pointer rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800">
                      Upload Image
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                    {formData.image && (
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, image: "" }))}
                        className="text-xs text-danger-600 hover:text-danger-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Pricing & Inventory
              </h2>
              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Price (GH₵) <span className="text-danger-500">*</span>
                  </label>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    className={cn(
                      "w-full rounded-lg border bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:ring-2 dark:bg-neutral-950 dark:text-neutral-100",
                      errors.price ? "border-danger-500" : "border-neutral-300"
                    )}
                  />
                  {errors.price && <p className="mt-1 text-xs text-danger-600">{errors.price}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Sale Price (optional)
                  </label>
                  <input
                    name="salePrice"
                    type="number"
                    step="0.01"
                    value={formData.salePrice}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    SKU
                  </label>
                  <input
                    name="sku"
                    value={formData.sku}
                    readOnly
                    className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Stock Quantity <span className="text-danger-500">*</span>
                  </label>
                  <input
                    name="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={handleChange}
                    placeholder="0"
                    className={cn(
                      "w-full rounded-lg border bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:ring-2 dark:bg-neutral-950 dark:text-neutral-100",
                      errors.stock ? "border-danger-500" : "border-neutral-300"
                    )}
                  />
                  {errors.stock && <p className="mt-1 text-xs text-danger-600">{errors.stock}</p>}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Category
              </h2>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={cn(
                  "mt-3 w-full rounded-lg border bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:ring-2 dark:bg-neutral-950 dark:text-neutral-100",
                  errors.category ? "border-danger-500" : "border-neutral-300"
                )}
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && <p className="mt-1 text-xs text-danger-600">{errors.category}</p>}
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Status
              </h2>
              <div className="mt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, status: "Active" }))}
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition",
                    formData.status === "Active"
                      ? "border-brand-600 bg-brand-50 text-brand-700 dark:border-brand-500 dark:bg-brand-900/30 dark:text-brand-200"
                      : "border-neutral-300 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                  )}
                >
                  Active
                </button>
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, status: "Draft" }))}
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition",
                    formData.status === "Draft"
                      ? "border-warning-600 bg-warning-50 text-warning-700 dark:border-warning-500 dark:bg-warning-900/30 dark:text-warning-200"
                      : "border-neutral-300 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                  )}
                >
                  Draft
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 mt-6 rounded-xl border border-neutral-200 bg-white p-4 shadow-md dark:border-neutral-800 dark:bg-neutral-900 lg:static lg:shadow-none lg:border-0 lg:bg-transparent lg:p-0 lg:mt-8 flex items-center justify-end gap-3">
          <Link
            href="/merchant/products"
            className="rounded-lg border border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}