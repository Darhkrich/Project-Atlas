/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { PromoBannerStatic } from "./promo-banner-static";
import type {
  MerchantStorefrontConfig,
  PromoBanner,
  PromoPlacement,
  PromoTransition,
} from "@/types/merchant-storefront";

interface PromoCarouselProps {
  store: MerchantStorefrontConfig;
  banners: PromoBanner[];
  placement: PromoPlacement;
  transition: PromoTransition;
  autoIntervalMs: number;
  loop: boolean;
  aspectClass: string;
  maxHeightPx?: number;
  className?: string;
  ariaLabel?: string;
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function PromoCarousel({
  store,
  banners,
  placement,
  transition,
  autoIntervalMs,
  loop,
  aspectClass,
  maxHeightPx,
  className,
  ariaLabel = "Promotions",
}: PromoCarouselProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const touchStartXRef = useRef<number | null>(null);

  const count = banners.length;
  const isSingle = count === 1;
  const showControls =
    count > 1 && (transition === "manual" || transition === "both");
  const autoRotate =
    count > 1 && (transition === "auto" || transition === "both");

  const goTo = useCallback(
    (next: number) => {
      if (count === 0) return;
      if (next < 0) {
        setIndex(loop ? count - 1 : 0);
        return;
      }
      if (next >= count) {
        setIndex(loop ? 0 : count - 1);
        return;
      }
      setIndex(next);
    },
    [count, loop]
  );

  useEffect(() => {
    if (!autoRotate) return;
    if (paused) return;
    if (isSingle) return;
    if (prefersReducedMotion()) return;

    const timer = window.setInterval(() => {
      setIndex((prev) => {
        const next = prev + 1;
        if (next >= count) {
          if (loop) return 0;
          return prev;
        }
        return next;
      });
    }, Math.max(2000, autoIntervalMs));

    return () => window.clearInterval(timer);
  }, [autoRotate, paused, isSingle, count, loop, autoIntervalMs]);

  useEffect(() => {
    if (index >= count) setIndex(0);
  }, [count, index]);

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!showControls) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(index - 1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(index + 1);
    }
  }

  function handleTouchStart(event: React.TouchEvent<HTMLDivElement>) {
    if (!showControls) return;
    touchStartXRef.current = event.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event: React.TouchEvent<HTMLDivElement>) {
    if (!showControls) return;
    const startX = touchStartXRef.current;
    if (startX === null) return;
    const endX = event.changedTouches[0]?.clientX ?? startX;
    const delta = endX - startX;
    if (Math.abs(delta) < 40) return;
    if (delta < 0) goTo(index + 1);
    else goTo(index - 1);
    touchStartXRef.current = null;
  }

  if (count === 0) return null;

  const containerStyle = maxHeightPx
    ? { maxHeight: String(maxHeightPx) + "px" }
    : undefined;

  const current = banners[index];

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label={ariaLabel}
      tabIndex={showControls ? 0 : -1}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={cn(
        "relative w-full overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
        className
      )}
    >
      <div className={cn("w-full", aspectClass)} style={containerStyle}>
        <PromoBannerStatic
          store={store}
          banner={current}
          className="h-full w-full"
        />
      </div>

      {showControls && (
        <>
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            disabled={!loop && index === 0}
            aria-label="Previous banner"
            className="absolute left-2 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-neutral-900 shadow-md transition-opacity hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 sm:flex"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="h-4 w-4"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            disabled={!loop && index === count - 1}
            aria-label="Next banner"
            className="absolute right-2 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-neutral-900 shadow-md transition-opacity hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 sm:flex"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="h-4 w-4"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          <div
            role="tablist"
            aria-label="Banner position"
            className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-neutral-900/40 px-2 py-1 backdrop-blur-sm"
          >
            {banners.map((banner, i) => (
              <button
                key={banner.id}
                role="tab"
                type="button"
                aria-selected={i === index}
                aria-label={"Show banner " + (i + 1) + " of " + count}
                onClick={() => goTo(i)}
                className={cn(
                  "h-1.5 w-1.5 rounded-full transition-all",
                  i === index ? "w-4 bg-white" : "bg-white/60 hover:bg-white/80"
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}