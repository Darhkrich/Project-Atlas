"use client";

import { use } from "react";
import { StorefrontLayout } from "@/components/storefront/storefront-layout";
import { StorefrontPolicyPage } from "@/components/storefront/storefront-policy-page";
import { StoreNotFound } from "@/components/storefront/shared/store-not-found";
import { usePublicStore } from "@/lib/public-store-bridge";

export default function PrivacyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const entry = usePublicStore(slug);

  if (!entry) {
    return <StoreNotFound variant="store" />;
  }

  return (
    <StorefrontLayout store={entry.store}>
      <StorefrontPolicyPage
        store={entry.store}
        title="Privacy Policy"
        body={entry.store.privacyPolicy ?? ""}
      />
    </StorefrontLayout>
  );
}