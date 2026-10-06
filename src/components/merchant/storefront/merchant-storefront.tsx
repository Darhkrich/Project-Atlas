/* eslint-disable react-hooks/purity */
"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AtlasIcon } from "@/components/atlas/icons";
import { AtlasTabs, type AtlasTab } from "@/components/atlas/tabs";
import { useStorefrontConfig } from "@/contexts/storefront-config-context";
import { useSubscription } from "@/contexts/subscription-context";
import { useMyDomain } from "@/lib/domains/hooks/use-my-domain";
import { useCurrentMerchant } from "@/lib/merchant/hooks/use-current-merchant";
import { useNow } from "@/lib/shared/hooks/use-now";
import { getOnboardingPlanByCode } from "@/lib/merchant/onboarding/plans";
import {
  storefrontUrlFor,
  storefrontDisplayUrl,
  storefrontDisplayUrlFromDomain,
  storefrontUrlFromDomain,
} from "@/lib/merchant/storefront-url";
import { useStorefrontDraft } from "@/lib/merchant/storefront/use-storefront-draft";
import { useAutosave } from "@/lib/merchant/storefront/use-autosave";
import { useTemplateSwitch } from "@/lib/merchant/storefront/use-template-switch";
import { appendPublishLog } from "@/lib/merchant/storefront/publish-log-store";
import {
  filterStorefrontMethods,
  type StorefrontPaymentMethod,
} from "@/lib/merchant/storefront/payment-methods";
import type {
  StorefrontStatus,
  StorefrontTabKey,
} from "@/lib/merchant/storefront/types";
import { StorefrontIdentityCard } from "./storefront-identity-card";
import { SaveIndicator } from "./save-indicator";
import { BrandingPanel } from "./branding-panel";
import { TemplatePanel } from "./template-panel";
import { TemplateSwitchModal } from "./template-switch-modal";
import { SectionsPanel } from "./sections-panel";
import { AppearancePanel } from "./appearance-panel";
import { ShippingPanel } from "./shipping-panel";
import { SeoPanel } from "./seo-panel";
import { SettingsPanel } from "./settings-panel";
import { PublishHistory } from "./publish-history";
import { PublishModal } from "./publish-modal";
import { PreviewToolbar } from "./preview-toolbar";
import { PreviewFullscreen } from "./preview-fullscreen";
import { MerchantStorefrontPreview } from "./merchant-storefront-preview";
import { DomainSection } from "@/components/domains/domain-section";
import type { MerchantStorefrontConfig, MerchantStorefrontTheme } from "@/types/merchant-storefront";
import type { MerchantTemplateCategory } from "@/types/merchant-storefront";

type PreviewMode = "desktop" | "mobile";

const TABS: AtlasTab<StorefrontTabKey>[] = [
  { key: "branding", label: "Branding" },
  { key: "template", label: "Template" },
  { key: "sections", label: "Sections" },
  { key: "appearance", label: "Appearance" },
  { key: "shipping", label: "Shipping" },
  { key: "seo", label: "SEO" },
  { key: "domain", label: "Domain" },
  { key: "settings", label: "Settings" },
];

export function MerchantStorefrontManagement() {
  const router = useRouter();
  const { storefrontConfig, updateStorefrontConfig } = useStorefrontConfig();
  const { currentPlan } = useSubscription();
  const merchant = useCurrentMerchant();
  const nowMs = useNow();
  const now = nowMs ?? Date.now();

  const { domain } = useMyDomain({
    storefrontId: storefrontConfig.storefrontId,
    storefrontName: storefrontConfig.storeName,
    ownerName: merchant?.name ?? "Store owner",
    ownerEmail: merchant?.email ?? storefrontConfig.contactEmail,
  });

  const draft = useStorefrontDraft(storefrontConfig);
  const templateSwitch = useTemplateSwitch();

  const autosave = useAutosave({
    value: draft.draft,
    delay: 500,
    onSave: useCallback(
      (value: MerchantStorefrontConfig) => {
        if (!merchant) return;
        updateStorefrontConfig(value, merchant.email);
        draft.markCommitted();
      },
      [merchant, updateStorefrontConfig, draft]
    ),
  });

  const [tab, setTab] = useState<StorefrontTabKey>("branding");
  const [previewMode, setPreviewMode] = useState<PreviewMode>("desktop");
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);

  const [switchRequest, setSwitchRequest] = useState<{
    toTemplateId: string;
    toCategory: MerchantTemplateCategory;
  } | null>(null);

  const plan = getOnboardingPlanByCode(currentPlan);
  const availableThemes: MerchantStorefrontTheme[] = useMemo(() => {
    if (!plan) return ["airy", "editorial", "studio"];
    return plan.themes as MerchantStorefrontTheme[];
  }, [plan]);

  const planPaymentMethods: StorefrontPaymentMethod[] = useMemo(
    () => filterStorefrontMethods(plan?.paymentMethods ?? []),
    [plan]
  );

  const storeUrl = domain
    ? storefrontUrlFromDomain(domain)
    : storefrontUrlFor(draft.draft);
  const displayUrl = domain
    ? storefrontDisplayUrlFromDomain(domain)
    : storefrontDisplayUrl(draft.draft);

  const status: StorefrontStatus =
    draft.draft.status === "live" ? "live" : "draft";

  const handlePublish = () => {
    if (!merchant) return;
    draft.setField("status", "live");
    draft.markCommitted();
    updateStorefrontConfig(
      { ...draft.draft, status: "live" },
      merchant.email
    );
    appendPublishLog({
      storefrontId: draft.draft.storefrontId,
      action: "published",
      at: Date.now(),
      actor: merchant.name,
    });
    setPublishOpen(false);
  };

  const handleUnpublish = () => {
    if (!merchant) return;
    draft.setField("status", "draft");
    draft.markCommitted();
    updateStorefrontConfig(
      { ...draft.draft, status: "draft" },
      merchant.email
    );
    appendPublishLog({
      storefrontId: draft.draft.storefrontId,
      action: "unpublished",
      at: Date.now(),
      actor: merchant.name,
    });
  };

  const handlePreviewAsCustomer = () => {
    window.open("/merchant/preview-store?interactive=1", "_blank", "noopener");
  };

  const handleUpgrade = () => {
    router.push("/merchant/billing");
  };

  const handleRequestSwitch = (
    toTemplateId: string,
    toCategory: MerchantTemplateCategory
  ) => {
    setSwitchRequest({ toTemplateId, toCategory });
  };

  const handleConfirmSwitch = () => {
    if (!switchRequest) return;
    const previousTemplateId = draft.draft.templateId;
    const previousCategory = draft.draft.templateCategory;
    draft.setField("templateId", switchRequest.toTemplateId);
    draft.setField("templateCategory", switchRequest.toCategory);
    templateSwitch.recordSwitch(previousTemplateId, previousCategory);
    setSwitchRequest(null);
  };

  const handleRevertSwitch = () => {
    if (!templateSwitch.buffer) return;
    draft.setField("templateId", templateSwitch.buffer.previousTemplateId);
    draft.setField(
      "templateCategory",
      templateSwitch.buffer.previousTemplateCategory
    );
    templateSwitch.consume();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-300">
            My Store
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-950 dark:text-white sm:text-3xl">
            Storefront
          </h1>
        </div>
        <SaveIndicator
          state={autosave.state}
          lastSavedAt={autosave.lastSavedAt}
          errorMessage={autosave.errorMessage}
        />
      </div>

      <StorefrontIdentityCard
        storeName={draft.draft.storeName}
        logo={draft.draft.logo}
        storeUrl={storeUrl}
        status={status}
        onPublish={() => setPublishOpen(true)}
        onUnpublish={handleUnpublish}
        onPreviewAsCustomer={handlePreviewAsCustomer}
      />

      {templateSwitch.canRevert && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center justify-between gap-3 rounded-lg border border-brand-200 bg-brand-50 px-4 py-2.5 dark:border-brand-800 dark:bg-brand-900/20"
        >
          <span className="text-sm text-brand-900 dark:text-brand-200">
            Template switched. Undo available for{" "}
            {templateSwitch.secondsLeft}s.
          </span>
          <button
            type="button"
            onClick={handleRevertSwitch}
            className="text-sm font-semibold text-brand-700 hover:underline dark:text-brand-300"
          >
            Undo
          </button>
        </div>
      )}

      <AtlasTabs
        tabs={TABS}
        value={tab}
        onChange={setTab}
        ariaLabel="Storefront settings"
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] lg:items-start">
        <div
          role="tabpanel"
          aria-label={TABS.find((t) => t.key === tab)?.label}
          className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
        >
          {tab === "branding" && (
            <BrandingPanel
              draft={draft.draft}
              setField={draft.setField}
              isDefault={draft.isDefault}
              resetToDefault={draft.resetToDefault}
            />
          )}
          {tab === "template" && (
            <TemplatePanel
              draft={draft.draft}
              setField={draft.setField}
              onRequestSwitch={handleRequestSwitch}
            />
          )}
          {tab === "sections" && (
            <SectionsPanel
              draft={draft.draft}
              setField={draft.setField}
              patch={draft.patch}
              isDefault={draft.isDefault}
              resetToDefault={draft.resetToDefault}
            />
          )}
          {tab === "appearance" && (
            <AppearancePanel
              draft={draft.draft}
              setField={draft.setField}
              availableThemes={availableThemes}
              planName={plan?.name ?? "current"}
              onUpgrade={handleUpgrade}
              isDefault={draft.isDefault}
              resetToDefault={draft.resetToDefault}
            />
          )}
          {tab === "shipping" && (
            <ShippingPanel storefrontId={draft.draft.storefrontId} />
          )}
          {tab === "seo" && (
            <SeoPanel
              draft={draft.draft}
              setField={draft.setField}
              isDefault={draft.isDefault}
              resetToDefault={draft.resetToDefault}
            />
          )}
          {tab === "domain" && (
            <DomainSection
              storefrontId={draft.draft.storefrontId}
              storefrontName={draft.draft.storeName}
              variant="merchant"
              ownerName={merchant?.name ?? "Store owner"}
              ownerEmail={merchant?.email ?? draft.draft.contactEmail}
              planOptions={{ customDomain: plan?.customDomain ?? false }}
              framed={false}
            />
          )}
          {tab === "settings" && (
            <SettingsPanel
              draft={draft.draft}
              setField={draft.setField}
              patch={draft.patch}
              isDefault={draft.isDefault}
              resetToDefault={draft.resetToDefault}
              planPaymentMethods={planPaymentMethods}
            />
          )}
        </div>

        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 lg:sticky lg:top-20">
          <PreviewToolbar
            mode={previewMode}
            onModeChange={setPreviewMode}
            onFullscreen={() => setFullscreenOpen(true)}
            subtitle={displayUrl}
          />
          <div className="bg-neutral-100 p-4 dark:bg-neutral-950">
            <MerchantStorefrontPreview
              store={draft.draft}
              mode={previewMode}
            />
          </div>
        </div>
      </div>

      <PublishHistory storefrontId={draft.draft.storefrontId} now={now} />

      <div className="flex items-center gap-2 text-[11px] text-neutral-400 dark:text-neutral-500">
        <AtlasIcon name="info" aria-hidden="true" className="h-3 w-3" />
        <span>
          Changes save automatically. You can close this page at any time.
        </span>
      </div>

      <PublishModal
        open={publishOpen}
        onClose={() => setPublishOpen(false)}
        onConfirm={handlePublish}
        config={draft.draft}
        storeUrl={storeUrl}
      />

      <TemplateSwitchModal
        open={switchRequest !== null}
        fromTemplateId={draft.draft.templateId}
        toTemplateId={switchRequest?.toTemplateId ?? null}
        onCancel={() => setSwitchRequest(null)}
        onConfirm={handleConfirmSwitch}
      />

      <PreviewFullscreen
        open={fullscreenOpen}
        onClose={() => setFullscreenOpen(false)}
        config={draft.draft}
        mode={previewMode}
        onModeChange={setPreviewMode}
      />
    </div>
  );
}