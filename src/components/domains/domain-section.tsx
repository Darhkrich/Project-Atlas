"use client";

import { useState } from "react";
import { AtlasCard } from "@/components/atlas/card";
import { useMyDomain } from "@/lib/domains/hooks/use-my-domain";
import {
  resolvePrimaryAddress,
  subdomainFor,
} from "@/lib/domains/projection";
import { SubdomainEditor } from "./subdomain-editor";
import { CustomDomainEmpty } from "./custom-domain-empty";
import { CustomDomainPending } from "./custom-domain-pending";
import { CustomDomainVerified } from "./custom-domain-verified";
import { DomainSetupGuide } from "./domain-setup-guide";
import { MIDDOT } from "@/lib/merchant/onboarding/constants";

interface DomainSectionProps {
  storefrontId: string;
  storefrontName: string;
  variant: "reseller" | "merchant";
  ownerName?: string;
  ownerEmail?: string;
  planOptions?: {
    customDomain: boolean;
  };
  framed?: boolean;
}

export function DomainSection(props: DomainSectionProps) {
  const { framed = true } = props;
  const inner = <DomainSectionInner {...props} />;
  if (!framed) {
    return <div className="space-y-6">{inner}</div>;
  }
  return <AtlasCard>{inner}</AtlasCard>;
}

function DomainSectionInner({
  storefrontId,
  storefrontName,
  variant,
  ownerName = "Store owner",
  ownerEmail = "owner@atlasgh.com",
  planOptions,
}: DomainSectionProps) {
  const {
    domain,
    missing,
    changeSlug,
    addCustomDomain,
    removeCustomDomain,
    setMethod,
    verify,
    setPrimary,
  } = useMyDomain({
    storefrontId,
    ownerName,
    ownerEmail,
    storefrontName,
  });

  const [announcement, setAnnouncement] = useState("");

  if (missing || !domain) {
    return (
      <div className="p-5 text-sm text-neutral-500 dark:text-neutral-400">
        Domain settings are not available for this storefront yet.
      </div>
    );
  }

  const customDomainEnabled = planOptions?.customDomain !== false;
  const cd = domain.customDomain;
  const primary = resolvePrimaryAddress(domain);
  const subdomainDisplay = subdomainFor(domain);

  const summaryText = (() => {
    if (primary === "custom" && cd) {
      return "Your storefront is served from " + cd.hostname + ".";
    }
    return (
      "Your storefront is served from " +
      subdomainDisplay +
      ". No custom domain is active."
    );
  })();

  const showEmptyGuide = customDomainEnabled && !cd;
  const showPendingGuide =
    customDomainEnabled && cd && cd.verificationStatus !== "verified";

  return (
    <div className="space-y-6 p-5">
      <div role="status" aria-live="polite" className="sr-only">
        {announcement}
      </div>

      <div>
        <h2 className="text-sm font-semibold text-neutral-950 dark:text-white">
          Storefront address
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
          {summaryText}
        </p>
      </div>

      <SubdomainEditor
        currentSlug={domain.subdomain.slug}
        root={domain.subdomain.root}
        isCustomSlug={domain.subdomain.isCustomSlug}
        storeName={storefrontName}
        onChange={changeSlug}
      />

      <div className="border-t border-neutral-200 pt-6 dark:border-neutral-800">
        {!customDomainEnabled ? (
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <p className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
              Custom domains are available on higher plans. Upgrade your
              subscription to connect your own domain.
            </p>
          </div>
        ) : !cd ? (
          <CustomDomainEmpty
            subdomainDisplay={subdomainDisplay}
            onAdd={addCustomDomain}
          />
        ) : cd.verificationStatus === "verified" ? (
          <CustomDomainVerified
            domain={domain}
            onSetPrimary={setPrimary}
            onRemove={removeCustomDomain}
          />
        ) : (
          <CustomDomainPending
            domain={domain}
            onSetMethod={setMethod}
            onVerify={verify}
            onRemove={removeCustomDomain}
            onAnnounce={setAnnouncement}
          />
        )}
      </div>

      {showEmptyGuide && <DomainSetupGuide variant="empty" />}
      {showPendingGuide && <DomainSetupGuide variant="pending" />}

      <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
        Storefront: {storefrontName} {MIDDOT}{" "}
        {variant === "merchant" ? "Merchant" : "Reseller"}
      </p>
    </div>
  );
}