import type {
  PromoBanner,
  PromoPlacement,
} from "@/types/merchant-storefront";

export function visibleBanners(
  banners: PromoBanner[] | undefined
): PromoBanner[] {
  if (!banners || banners.length === 0) return [];
  return banners
    .filter((b) => b.enabled !== false)
    .slice()
    .sort((a, b) => a.order - b.order);
}

export function isCarousel(placement: PromoPlacement, count: number): boolean {
  if (count < 2) return false;
  return placement !== "as_hero_background";
}

export function alignmentClass(
  alignment: PromoBanner["alignment"]
): string {
  if (alignment === "center") return "items-center text-center";
  if (alignment === "right") return "items-end text-right";
  return "items-start text-left";
}