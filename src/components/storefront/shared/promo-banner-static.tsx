/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import type {
  MerchantStorefrontConfig,
  PromoBanner,
} from "@/types/merchant-storefront";

interface PromoBannerStaticProps {
  store: MerchantStorefrontConfig;
  banner: PromoBanner;
  className?: string;
}

function backgroundStyle(
  banner: PromoBanner,
  store: MerchantStorefrontConfig
): React.CSSProperties {
  if (banner.backgroundColor && banner.backgroundColor.length > 0) {
    return { backgroundColor: banner.backgroundColor };
  }
  return {
    background: `linear-gradient(120deg, ${store.primaryColor} 0%, color-mix(in srgb, ${store.primaryColor} 82%, black) 100%)`,
  };
}

function textAlignment(
  alignment: PromoBanner["alignment"]
): { container: string; cta: string } {
  if (alignment === "center") {
    return { container: "items-center text-center", cta: "mx-auto" };
  }
  if (alignment === "right") {
    return { container: "items-end text-right", cta: "ml-auto" };
  }
  return { container: "items-start text-left", cta: "" };
}

export function PromoBannerStatic({
  store,
  banner,
  className,
}: PromoBannerStaticProps) {
  const hasImage = Boolean(banner.imageUrl);
  const hasLink = Boolean(banner.linkUrl && banner.linkUrl.length > 0);
  const align = textAlignment(banner.alignment);

  const copy = (
    <div className={cn("flex flex-col gap-2.5", align.container)}>
      {banner.badge && (
        <span className="inline-flex w-fit items-center rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-900">
          {banner.badge}
        </span>
      )}
      {banner.headline && (
        <p className="text-xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-2xl lg:text-3xl">
          {banner.headline}
        </p>
      )}
      {banner.subhead && (
        <p className="max-w-sm text-[11px] leading-snug text-white/85 sm:text-xs">
          {banner.subhead}
        </p>
      )}
      {hasLink && (
        <span
          className={cn(
            "mt-1 inline-flex w-fit items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-white underline-offset-4 sm:text-xs",
            align.cta
          )}
        >
          {banner.linkLabel ?? "Shop now"}
          <AtlasIcon
            name="arrow-right"
            className="h-3 w-3 sm:h-3.5 sm:w-3.5"
            aria-hidden="true"
          />
        </span>
      )}
    </div>
  );

  const inner = (
    <>
      {/* Mobile: image as background, text overlaid with left scrim */}
      <div className="relative h-full w-full sm:hidden">
        {hasImage && (
          <img
            src={banner.imageUrl as string}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        )}
        {hasImage && (
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, rgba(0,0,0,0.78), rgba(0,0,0,0.15))",
            }}
            aria-hidden="true"
          />
        )}
        <div className="relative flex h-full w-full flex-col justify-center px-5 py-4">
          {copy}
        </div>
      </div>

      {/* Desktop: two-column, image flush right */}
      <div className="hidden h-full w-full grid-cols-5 sm:grid">
        <div
          className={cn(
            "col-span-3 flex flex-col justify-center",
            align.container
          )}
          style={{ padding: "clamp(20px, 2.6vw, 36px)" }}
        >
          {copy}
        </div>
        {hasImage ? (
          <div className="relative col-span-2 h-full w-full overflow-hidden">
            <img
              src={banner.imageUrl as string}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
          </div>
        ) : (
          <div className="col-span-2" aria-hidden="true" />
        )}
      </div>
    </>
  );

  const baseClass = cn(
    "block h-full w-full overflow-hidden transition-opacity",
    hasLink && "hover:opacity-95"
  );

  const style = backgroundStyle(banner, store);

  if (hasLink) {
    const href = banner.linkUrl as string;
    const external = /^https?:\/\//i.test(href);
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(baseClass, className)}
          style={style}
        >
          {inner}
        </a>
      );
    }
    return (
      <Link href={href} className={cn(baseClass, className)} style={style}>
        {inner}
      </Link>
    );
  }

  return (
    <div className={cn(baseClass, className)} style={style}>
      {inner}
    </div>
  );
}