"use client";

import Link from "next/link";
import Image from "next/image";
import { SectionSurface } from "./section-surface";
import { getThemeDefinition } from "@/lib/merchant/storefront/themes";
import {
  DAY_OF_WEEK_LABEL,
  DAY_OF_WEEK_ORDER,
} from "@/lib/merchant/storefront/config-labels";
import type { MerchantStorefrontConfig } from "@/types/merchant-storefront";

interface AboutSectionProps {
  store: MerchantStorefrontConfig;
}

export function AboutSection({ store }: AboutSectionProps) {
  const theme = getThemeDefinition(store.theme);

  const hours = store.businessHours ?? [];
  const hoursByDay = new Map(hours.map((h) => [h.day, h]));
  const showHours = hours.length > 0;

  const description = store.description.trim();
  const showImage = Boolean(store.heroImageInAbout && store.heroImage);
  const hasContact =
    store.contactEmail.trim().length > 0 ||
    store.contactPhone.trim().length > 0 ||
    store.whatsapp.trim().length > 0;

  if (!description && !showHours && !showImage && !hasContact) return null;

  return (
    <SectionSurface theme={theme} ariaLabel={`About ${store.storeName}`}>
      <div className="grid gap-12 lg:grid-cols-12 lg:items-start lg:gap-16">
        {showImage && store.heroImage && (
          <div className="lg:col-span-5">
            <div
              className="relative aspect-[4/5] w-full overflow-hidden"
              style={{ borderRadius: "var(--atlas-radius-lg)" }}
            >
              <Image
                src={store.heroImage}
                alt={store.storeName}
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
          </div>
        )}

        <div className={showImage ? "lg:col-span-7" : "lg:col-span-12"}>
          <p
            className="text-xs font-semibold uppercase tracking-[0.18em]"
            style={{ color: store.primaryColor }}
          >
            About us
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            {store.storeName}
          </h2>

          {description && (
            <p
              className={`mt-5 max-w-2xl text-base leading-8 ${theme.color.textMuted}`}
            >
              {description}
            </p>
          )}

          <div className="mt-10 grid gap-8 sm:grid-cols-2">
            {showHours && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider">
                  Opening hours
                </p>
                <dl className="mt-4 space-y-2 text-sm">
                  {DAY_OF_WEEK_ORDER.map((day) => {
                    const entry = hoursByDay.get(day);
                    if (!entry) return null;
                    return (
                      <div
                        key={day}
                        className="flex items-center justify-between gap-4"
                      >
                        <dt className={theme.color.textMuted}>
                          {DAY_OF_WEEK_LABEL[day]}
                        </dt>
                        <dd className="font-medium">
                          {entry.closed
                            ? "Closed"
                            : entry.open + " \u2013 " + entry.close}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              </div>
            )}

            {hasContact && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider">
                  Get in touch
                </p>
                <ul role="list" className="mt-4 space-y-2 text-sm">
                  {store.contactEmail && (
                    <li className={theme.color.textMuted}>
                      {store.contactEmail}
                    </li>
                  )}
                  {store.contactPhone && (
                    <li className={theme.color.textMuted}>
                      {store.contactPhone}
                    </li>
                  )}
                  {store.whatsapp && (
                    <li className={theme.color.textMuted}>
                      WhatsApp: {store.whatsapp}
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/ecommerce-stores/${store.slug}/products`}
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{
                backgroundColor: store.primaryColor,
                borderRadius: "var(--atlas-radius-lg)",
              }}
            >
              Browse products
            </Link>
            <Link
              href={`/ecommerce-stores/${store.slug}/contact`}
              className="inline-flex items-center justify-center border px-6 py-3 text-sm font-semibold transition-colors"
              style={{
                borderColor: "var(--atlas-border)",
                borderRadius: "var(--atlas-radius-lg)",
              }}
            >
              Contact us
            </Link>
          </div>
        </div>
      </div>
    </SectionSurface>
  );
}