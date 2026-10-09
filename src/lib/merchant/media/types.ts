export type MediaSource = "upload" | "curated" | "url";

export type MediaUsage =
  | "hero"
  | "hero_background"
  | "promo_before_hero"
  | "promo_after_hero"
  | "promo_inside_hero"
  | "promo_as_hero_background"
  | "product"
  | "logo"
  | "favicon"
  | "og_image"
  | "page"
  | "generic";

export interface MediaAsset {
  id: string;
  url: string;
  alt: string;
  source: MediaSource;
  category?: string;
  createdAt: number;
  uploadedBy?: string;
  byteSize?: number;
  width?: number;
  height?: number;
}

export type MediaLibrary = MediaAsset[];