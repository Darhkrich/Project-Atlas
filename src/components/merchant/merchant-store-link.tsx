"use client";

import Link from "next/link";
import { AtlasIcon } from "@/components/atlas/icons";
import { useStorefrontConfig } from "@/contexts/storefront-config-context";
import {
  storefrontUrlFor,
  storefrontDisplayUrl,
} from "@/lib/merchant/storefront-url";

export function MerchantStoreLink() {
  const { storefrontConfig } = useStorefrontConfig();
  const url = storefrontUrlFor(storefrontConfig);
  const display = storefrontDisplayUrl(storefrontConfig);
  const isLive = storefrontConfig.status === "live";

  return (
    <Link
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 md:flex"
    >
      <span
        aria-hidden="true"
        className={
          "h-2 w-2 rounded-full " +
          (isLive ? "bg-success-500" : "bg-neutral-400")
        }
      />
      <span className="font-semibold">{storefrontConfig.storeName}</span>
      <span className="hidden text-xs text-neutral-500 lg:inline">
        {display}
      </span>
      <AtlasIcon name="external-link" className="h-4 w-4 text-neutral-400" />
    </Link>
  );
}