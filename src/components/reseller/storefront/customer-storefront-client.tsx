/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { StorefrontRenderer } from "./storefront-renderer";
import { getConfigMapFromStorage } from "@/contexts/storefront-context";
import { mockStorefronts } from "@/lib/storefront/defaults";
import type { StorefrontConfig } from "@/lib/storefront/types";

interface CustomerStorefrontClientProps {
  slug: string;
}

export function CustomerStorefrontClient({ slug }: CustomerStorefrontClientProps) {
  const [config, setConfig] = useState<StorefrontConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // First check localStorage (for dynamically saved storefronts)
    const storedMap = getConfigMapFromStorage();
    const storedConfig = storedMap[slug];
    if (storedConfig) {
      setConfig(storedConfig);
    } else {
      // Fallback to mock storefronts
      const mockConfig = mockStorefronts[slug];
      if (mockConfig) {
        setConfig(mockConfig);
      }
    }
    setLoading(false);
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading storefront...</p>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900">Storefront Not Found</h1>
          <p className="mt-2 text-neutral-600">
            This storefront does not exist or the URL is incorrect.
          </p>
        </div>
      </div>
    );
  }

  if (!config.publication.isPublished) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900">Storefront Unavailable</h1>
          <p className="mt-2 text-neutral-600">
            This storefront is currently unavailable.
          </p>
        </div>
      </div>
    );
  }

  return <StorefrontRenderer config={config} mode="public" />;
}