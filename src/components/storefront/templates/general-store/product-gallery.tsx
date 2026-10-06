"use client";

import { useState } from "react";
import Image from "next/image";
import type { ThemeDefinition } from "@/lib/merchant/storefront/themes";

interface GeneralStoreProductGalleryProps {
  images: string[];
  name: string;
  theme: ThemeDefinition;
}

export function GeneralStoreProductGallery({
  images,
  name,
  theme,
}: GeneralStoreProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div
        className={`relative aspect-square w-full overflow-hidden bg-neutral-100 ${theme.components.card}`}
        aria-hidden="true"
      />
    );
  }

  if (images.length === 1) {
    return (
      <div
        className={`relative aspect-square w-full overflow-hidden bg-neutral-100 ${theme.components.card}`}
      >
        <Image
          src={images[0]}
          alt={name}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
          priority
        />
      </div>
    );
  }

  const currentImage = images[selectedIndex] ?? images[0];

  return (
    <div className="flex flex-col gap-3">
      <div
        className={`relative aspect-square w-full overflow-hidden bg-neutral-100 ${theme.components.card}`}
      >
        <Image
          src={currentImage}
          alt={name}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
          priority
        />
      </div>
      <ul role="list" className="flex gap-2 overflow-x-auto pb-1">
        {images.map((src, index) => {
          const isSelected = index === selectedIndex;
          return (
            <li key={src} className="shrink-0">
              <button
                type="button"
                onClick={() => setSelectedIndex(index)}
                aria-label={`Show image ${index + 1} of ${images.length}`}
                aria-pressed={isSelected}
                className={`relative h-16 w-16 overflow-hidden border-2 transition-colors ${
                  isSelected
                    ? "border-neutral-900"
                    : "border-transparent hover:border-neutral-300"
                }`}
              >
                <Image
                  src={src}
                  alt=""
                  aria-hidden="true"
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}