/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AtlasIcon } from "@/components/atlas/icons";
import { SectionSurface } from "@/components/storefront/shared/section-surface";
import { GeneralStoreProductGallery } from "./product-gallery";
import { GeneralStoreVariantSelector } from "./product-variant-selector";
import { GeneralStoreProductCard } from "./product-card";
import { useCart } from "@/contexts/cart-context";
import { getThemeDefinition } from "@/lib/merchant/storefront/themes";
import { productIsInStock } from "@/lib/merchant/storefront/products";
import { resolveCategoryLabel } from "@/lib/merchant/storefront/category-labels";
import { usePublicCategories } from "@/lib/public-store-bridge";
import type {
  MerchantStorefrontConfig,
  MerchantStorefrontProduct,
  ProductVariant,
  ProductVariantGroup,
} from "@/types/merchant-storefront";

interface GeneralStoreProductDetailProps {
  store: MerchantStorefrontConfig;
  product: MerchantStorefrontProduct;
  products: MerchantStorefrontProduct[];
}

function resolveVariant(
  product: MerchantStorefrontProduct,
  selected: Record<string, string>
): ProductVariant | null {
  const groups = product.variantGroups ?? [];
  const variants = product.variants ?? [];
  if (groups.length === 0 || variants.length === 0) return null;
  const complete = groups.every((group) => Boolean(selected[group.name]));
  if (!complete) return null;
  return (
    variants.find((variant) =>
      groups.every(
        (group) => variant.options[group.name] === selected[group.name]
      )
    ) ?? null
  );
}

function variantStock(
  product: MerchantStorefrontProduct,
  variant: ProductVariant | null
): { inStock: boolean; level: number | undefined } {
  const groups = product.variantGroups ?? [];
  if (groups.length === 0) {
    return {
      inStock: productIsInStock(product),
      level: product.stockLevel,
    };
  }
  if (!variant) return { inStock: false, level: undefined };
  return { inStock: variant.stockLevel > 0, level: variant.stockLevel };
}

function buildVariantLabel(
  groups: ProductVariantGroup[],
  selected: Record<string, string>
): string {
  if (groups.length === 0) return "";
  const parts: string[] = [];
  for (const group of groups) {
    const value = selected[group.name];
    if (value) parts.push(value);
  }
  return parts.join(" / ");
}

export function GeneralStoreProductDetail({
  store,
  product,
  products,
}: GeneralStoreProductDetailProps) {
  const theme = getThemeDefinition(store.theme);
  const { addItem } = useCart();
  const categoryLookup = usePublicCategories(store.slug);

  const groups: ProductVariantGroup[] = product.variantGroups ?? [];
  const variants: ProductVariant[] = product.variants ?? [];
  const requiresVariants = groups.length > 0;

  const [selected, setSelected] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);

  const variant = useMemo(() => {
    return resolveVariant(product, selected);
  }, [product, selected]);

  const stock = useMemo(() => {
    return variantStock(product, variant);
  }, [product, variant]);

  useEffect(() => {
    setQuantity((q) => {
      if (stock.level === undefined) return q;
      if (stock.level <= 0) return 1;
      if (q > stock.level) return stock.level;
      return q;  
    });
  }, [stock.level]);

  const basePrice = product.salePrice ?? product.price;
  const displayPrice = variant?.priceOverride ?? basePrice;
  const showStrikethrough =
    !variant?.priceOverride && product.salePrice !== undefined;

  const canAddToCart =
    stock.inStock && (!requiresVariants || variant !== null);

  const sameCategory = products.filter(
    (p) => p.id !== product.id && p.categoryId === product.categoryId
  );
  const others = products.filter((p) => p.id !== product.id);
  const relatedSource = sameCategory.length > 0 ? sameCategory : others;
  const related = relatedSource.slice(0, 6);
  const categoryLabel = resolveCategoryLabel(
    product.categoryId,
    categoryLookup
  );
  const relatedHeading =
    sameCategory.length > 0
      ? "More in " + categoryLabel
      : "More products";

  const primaryImage = product.images[0] ?? "";
  const variantLabel = variant?.name ?? buildVariantLabel(groups, selected);

  function handleQuantityChange(next: number) {
    if (next < 1) return;
    if (stock.level !== undefined && next > stock.level) return;
    setQuantity(next);
  }

  function handleAddToCart() {
    if (!canAddToCart) return;
    const lineId = variant ? product.id + ":" + variant.id : product.id;
    addItem({
      id: lineId,
      productId: product.id,
      variantId: variant?.id,
      variantLabel: variantLabel.length > 0 ? variantLabel : undefined,
      name: product.name,
      price: displayPrice,
      image: primaryImage,
      quantity,
    });
  }

  return (
    <SectionSurface theme={theme} ariaLabel={product.name}>
      <nav
        aria-label="Breadcrumb"
        className={"flex items-center gap-2 text-sm " + theme.color.textMuted}
      >
        <Link
          href={"/ecommerce-stores/" + store.slug}
          className="underline-offset-4 hover:underline"
        >
          Home
        </Link>
        <span aria-hidden="true">{"/"}</span>
        <Link
          href={"/ecommerce-stores/" + store.slug + "/products"}
          className="underline-offset-4 hover:underline"
        >
          Products
        </Link>
        <span aria-hidden="true">{"/"}</span>
        <span className="truncate">{product.name}</span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-14">
        <GeneralStoreProductGallery
          images={product.images}
          name={product.name}
          theme={theme}
        />

        <div>
          <h1 className={theme.typography.sectionTitle}>{product.name}</h1>

          {product.sku && (
            <p className={"mt-2 text-xs " + theme.color.textMuted}>
              {"SKU: " + product.sku}
            </p>
          )}

          <div className="mt-5 flex items-baseline gap-3">
            <span className={theme.typography.price}>
              {"GH\u20B5 "}
              {displayPrice}
            </span>
            {showStrikethrough && (
              <span
                className={"text-sm line-through " + theme.color.textMuted}
              >
                {"GH\u20B5 "}
                {product.price}
              </span>
            )}
          </div>

          <StockLine
            inStock={stock.inStock}
            level={stock.level}
            requiresVariants={requiresVariants}
            hasVariant={variant !== null}
            theme={theme}
          />

          {product.description && (
            <p
              className={
                "mt-6 " + theme.typography.body + " " + theme.color.textMuted
              }
            >
              {product.description}
            </p>
          )}

          {requiresVariants && (
            <div className="mt-8">
              <GeneralStoreVariantSelector
                groups={groups}
                variants={variants}
                selected={selected}
                onChange={setSelected}
              />
              {!variant && (
                <p className={"mt-3 text-xs " + theme.color.textMuted}>
                  Select an option to see availability.
                </p>
              )}
            </div>
          )}

          {canAddToCart && (
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="inline-flex items-center border border-neutral-300">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  className="px-4 py-3 text-neutral-600 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Decrease quantity"
                  disabled={quantity <= 1}
                >
                  {"\u2212"}
                </button>
                <span className="px-4 py-3 text-sm font-medium">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  className="px-4 py-3 text-neutral-600 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Increase quantity"
                  disabled={
                    stock.level !== undefined && quantity >= stock.level
                  }
                >
                  {"+"}
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className={
                  "inline-flex items-center justify-center gap-2 " +
                  theme.components.buttonPrimary
                }
                style={{ backgroundColor: store.primaryColor }}
              >
                <AtlasIcon
                  name="cart"
                  className="h-4 w-4"
                  aria-hidden="true"
                />
                {"Add to cart"}
              </button>
            </div>
          )}

          {!canAddToCart && stock.inStock === false && (
            <div className="mt-8">
              <p
                className={"text-sm font-medium " + theme.color.textMuted}
              >
                {"Currently unavailable."}
              </p>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section
          role="region"
          aria-label="Related products"
          className="mt-20"
        >
          <h2 className={theme.typography.sectionTitle}>{relatedHeading}</h2>
          <div className={"atlas-product-grid mt-8 " + theme.layout.gridGap}>
            {related.map((item) => (
              <GeneralStoreProductCard
                key={item.id}
                product={item}
                store={store}
              />
            ))}
          </div>
        </section>
      )}
    </SectionSurface>
  );
}

interface StockLineProps {
  inStock: boolean;
  level: number | undefined;
  requiresVariants: boolean;
  hasVariant: boolean;
  theme: ReturnType<typeof getThemeDefinition>;
}

function StockLine({
  inStock,
  level,
  requiresVariants,
  hasVariant,
  theme,
}: StockLineProps) {
  if (requiresVariants && !hasVariant) return null;
  if (!inStock) {
    return (
      <p className={"mt-3 text-sm font-medium " + theme.color.textMuted}>
        {"Out of stock"}
      </p>
    );
  }
  if (level !== undefined && level > 0 && level <= 5) {
    return (
      <p className={"mt-3 text-sm font-medium " + theme.color.textMuted}>
        {"Only " + level + " left"}
      </p>
    );
  }
  if (level !== undefined && level > 5) {
    return (
      <p className={"mt-3 text-sm font-medium " + theme.color.textMuted}>
        {"In stock"}
      </p>
    );
  }
  return null;
}