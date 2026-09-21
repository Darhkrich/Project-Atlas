"use client";

import { useMemo } from "react";
import { notFound } from "next/navigation";
import { AccountPageContent } from "./account-page-content";
import { StorefrontHeader } from "@/components/reseller/storefront/storefront-header";
import { StorefrontFooter } from "@/components/reseller/storefront/storefront-footer";
import { getConfigMapFromStorage } from "@/contexts/storefront-context";
import { mockStorefronts } from "@/lib/storefront/defaults";
import type { StorefrontConfig } from "@/lib/storefront/types";

interface Props {
  slug: string;
}

function resolveConfig(slug: string): StorefrontConfig | null {
  const storedMap = getConfigMapFromStorage();
  const stored = storedMap[slug];
  if (stored) return stored;
  const mockConfig = mockStorefronts[slug];
  if (mockConfig) return mockConfig;
  return null;
}

export function CustomerAccountClient({ slug }: Props) {
  const config = useMemo(() => resolveConfig(slug), [slug]);

  if (!config) {
    notFound();
  }

  if (!config.publication.isPublished) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900">
            Storefront Unavailable
          </h1>
          <p className="mt-2 text-neutral-600">
            This storefront is currently unavailable.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <StorefrontHeader config={config} mode="public" />
      <div
        className="h-1 w-full"
        style={{ backgroundColor: "var(--primary)" }}
      />
      <AccountPageContent config={config} />
      <StorefrontFooter config={config} mode="public" />
    </div>
  );
}