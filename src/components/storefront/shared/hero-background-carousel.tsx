/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import type {
  PromoBanner,
  PromoTransition,
} from "@/types/merchant-storefront";

interface HeroBackgroundCarouselProps {
  banners: PromoBanner[];
  slug: string;
  transition: PromoTransition;
  autoIntervalMs: number;
  loop: boolean;
  ariaLabel?: string;
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Aspect-based sizing. Height scales with container width, not viewport.
// Portrait on phones, wide landscape on desktop. max-h caps 4K monitors.
const SECTION_SIZING =
  "relative w-full overflow-hidden aspect-[4/5] sm:aspect-[16/11] lg:aspect-[16/9] max-h-[860px]";

export function HeroBackgroundCarousel({
  banners,
  slug,
  transition,
  autoIntervalMs,
  loop,
  ariaLabel = "Featured promotions",
}: HeroBackgroundCarouselProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
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

  const current = banners[index];
  const hasImage = Boolean(current.imageUrl);
  const hasLink = Boolean(current.linkUrl && current.linkUrl.length > 0);

  return (
    <section
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
        SECTION_SIZING,
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      )}
    >
      {hasImage ? (
        <img
          src={current.imageUrl as string}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
      ) : (
        <div
          className="absolute inset-0 h-full w-full"
          style={{ backgroundColor: current.backgroundColor ?? "#0f0f0e" }}
          aria-hidden="true"
        />
      )}

      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.78), rgba(0,0,0,0.28) 55%, rgba(0,0,0,0.05))",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex h-full items-end">
        <div className="mx-auto w-full max-w-7xl px-4 pb-8 text-white sm:px-6 sm:pb-12 lg:px-8 lg:pb-16">
          <div className="max-w-3xl">
            {current.badge && (
              <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                {current.badge}
              </span>
            )}
            {current.headline && (
              <h1 className="mt-3 text-3xl font-bold leading-[1.05] tracking-tight text-white sm:mt-4 sm:text-5xl lg:text-6xl xl:text-7xl">
                {current.headline}
              </h1>
            )}
            {current.subhead && (
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/90 sm:mt-4 sm:text-base sm:leading-7 lg:text-lg">
                {current.subhead}
              </p>
            )}
            <div className="mt-5 flex flex-wrap gap-2 sm:mt-7 sm:gap-3">
              {hasLink && (
                <Link
                  href={current.linkUrl as string}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-xs font-semibold text-neutral-900 shadow-sm transition-opacity hover:opacity-90 sm:px-7 sm:py-4 sm:text-sm"
                >
                  {current.linkLabel ?? "Shop now"}
                  <AtlasIcon
                    name="arrow-right"
                    className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                    aria-hidden="true"
                  />
                </Link>
              )}
              <Link
                href={"/ecommerce-stores/" + slug + "/products"}
                className="inline-flex items-center justify-center rounded-lg border border-white/40 bg-transparent px-5 py-3 text-xs font-semibold text-white transition-colors hover:bg-white/10 sm:px-7 sm:py-4 sm:text-sm"
              >
                Browse products
              </Link>
            </div>
          </div>
        </div>
      </div>

      {showControls && (
        <>
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            disabled={!loop && index === 0}
            aria-label="Previous promotion"
            className="absolute left-4 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-neutral-900 shadow-md transition-opacity hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 sm:flex"
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
            aria-label="Next promotion"
            className="absolute right-4 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-neutral-900 shadow-md transition-opacity hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 sm:flex"
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
            aria-label="Promotion position"
            className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 rounded-full bg-black/30 px-3 py-1.5 backdrop-blur-sm"
          >
            {banners.map((banner, i) => (
              <button
                key={banner.id}
                role="tab"
                type="button"
                aria-selected={i === index}
                aria-label={"Show promotion " + (i + 1) + " of " + count}
                onClick={() => goTo(i)}
                className={cn(
                  "h-2 w-2 rounded-full transition-all",
                  i === index
                    ? "w-6 bg-white"
                    : "bg-white/50 hover:bg-white/80"
                )}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}