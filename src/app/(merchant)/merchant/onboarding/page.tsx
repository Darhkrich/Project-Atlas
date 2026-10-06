"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OnboardingShell } from "@/components/merchant/onboarding/OnboardingShell";
import { OnboardingPreview } from "@/components/merchant/onboarding/OnboardingPreview";
import StepAccount from "@/components/merchant/onboarding/StepAccount";
import StepBusiness from "@/components/merchant/onboarding/StepBusiness";
import StepStorefront from "@/components/merchant/onboarding/StepStorefront";
import StepSubscription from "@/components/merchant/onboarding/StepSubscription";
import StepPublish from "@/components/merchant/onboarding/StepPublish";
import { useOnboarding } from "@/lib/merchant/onboarding/use-onboarding";
import { validateAccountStep } from "@/lib/merchant/onboarding/validation";
import { buildPublishPlan } from "@/lib/merchant/onboarding/publish";
import { startOnboardingDraft } from "@/lib/merchant/onboarding/progress-mutations";
import { useStorefrontConfig } from "@/contexts/storefront-config-context";
import { useSubscription } from "@/contexts/subscription-context";
import { useAuth } from "@/contexts/auth-context";
import {
  MERCHANT_ONBOARDING_TOTAL_STEPS,
  stepIndex,
  type MerchantOnboardingStep,
} from "@/lib/merchant/onboarding/types";

const CONTINUE_LABELS: Record<MerchantOnboardingStep, string> = {
  account: "Continue to business",
  business: "Continue to storefront",
  storefront: "Continue to plan",
  plan: "Continue to review",
  publish: "Publish store",
};

export default function MerchantOnboardingPage() {
  const router = useRouter();
  const { draft, validity, actions } = useOnboarding();
  const { updateStorefrontConfig } = useStorefrontConfig();
  const { setCurrentPlan } = useSubscription();
  const { register, addRole, user } = useAuth();

  const [password, setPassword] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  useEffect(() => {
    if (!draft) {
      startOnboardingDraft();
    }
  }, [draft]);

  if (!draft) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <p className="text-sm text-neutral-500">Loading store setup.</p>
      </div>
    );
  }

  const currentIndex = stepIndex(draft.currentStep);
  const accountValidity = validateAccountStep(draft, password);
  const currentValidity =
    draft.currentStep === "account"
      ? accountValidity
      : validity[draft.currentStep];
  const isFinalStep = draft.currentStep === "publish";
  const canContinue = currentValidity.valid;

  const handleSubmit = () => {
    if (!canContinue) return;
    actions.next();
  };

  const handlePublish = () => {
    if (publishing) return;
    setPublishError(null);
    setPublishing(true);

    const result = buildPublishPlan({
      draft,
      password,
      currentUserEmail: user?.email ?? null,
    });

    if (!result.ok || !result.storefrontConfig || !result.planCode) {
      setPublishError(result.errors[0] ?? "Something went wrong. Try again.");
      setPublishing(false);
      return;
    }

    if (result.shouldRegister) {
      const registered = register(
        result.registerEmail,
        result.registerPassword,
        "merchant"
      );
      if (!registered) {
        setPublishError(
          "An account with this email already exists. Sign in and try again."
        );
        setPublishing(false);
        return;
      }
    } else {
      addRole(result.ownerEmail, "merchant");
    }

    updateStorefrontConfig(result.storefrontConfig, result.ownerEmail);
    setCurrentPlan(result.planCode);
    setPassword("");
    router.push("/merchant/dashboard");
  };

  const showPreview =
    draft.currentStep === "business" ||
    draft.currentStep === "storefront" ||
    draft.currentStep === "plan";

  return (
    <OnboardingShell
      currentStep={draft.currentStep}
      stepIndexLabel={
        "Step " + (currentIndex + 1) + " of " + MERCHANT_ONBOARDING_TOTAL_STEPS
      }
      canContinue={canContinue}
      continueLabel={CONTINUE_LABELS[draft.currentStep]}
      isFinalStep={isFinalStep}
      showBack={currentIndex > 0}
      onSubmit={handleSubmit}
      onBack={actions.back}
      preview={showPreview ? <OnboardingPreview draft={draft} /> : undefined}
    >
      {draft.currentStep === "account" && (
        <StepAccount
          draft={draft}
          password={password}
          errors={accountValidity.errors}
          onChange={actions.setField}
          onPasswordChange={setPassword}
        />
      )}
      {draft.currentStep === "business" && (
        <StepBusiness
          draft={draft}
          errors={currentValidity.errors}
          onChange={actions.setField}
        />
      )}
      {draft.currentStep === "storefront" && (
        <StepStorefront
          draft={draft}
          errors={currentValidity.errors}
          onBrandingChange={actions.setBranding}
          onTemplateChange={(id) => actions.setField("templateId", id)}
        />
      )}
      {draft.currentStep === "plan" && (
        <StepSubscription
          draft={draft}
          onPlanChange={(code) => actions.setField("planId", code)}
          onCycleChange={(cycle) => actions.setField("billingCycle", cycle)}
        />
      )}
      {draft.currentStep === "publish" && (
        <StepPublish
          draft={draft}
          publishing={publishing}
          error={publishError}
          onPublish={handlePublish}
        />
      )}
    </OnboardingShell>
  );
}