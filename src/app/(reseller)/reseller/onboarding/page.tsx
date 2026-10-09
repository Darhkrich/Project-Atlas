"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/atlas/button";
import { OnboardingShell } from "@/components/reseller/onboarding/onboarding-shell";
import { OnboardingProgress } from "@/components/reseller/onboarding/onboarding-progress";
import { OnboardingSuccess } from "@/components/reseller/onboarding/onboarding-success";
import { StepAccount } from "@/components/reseller/onboarding/step-account";
import { StepStore } from "@/components/reseller/onboarding/step-store";
import { StepReview } from "@/components/reseller/onboarding/step-review";
import { COPY, STEP_COPY } from "@/lib/reseller/onboarding/labels";
import { useOnboarding } from "@/lib/reseller/onboarding/use-onboarding";
import type { OnboardingMode } from "@/lib/reseller/onboarding/types";

function OnboardingPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode: OnboardingMode =
    searchParams.get("mode") === "invited" ? "invited" : "self_serve";

  const {
    step,
    stepIndex,
    steps,
    draft,
    errors,
    publishResult,
    loginResult,
    submitting,
    loggingIn,
    updateDraft,
    next,
    back,
    submit,
    login,
  } = useOnboarding(mode);

  const loginSucceeded = loginResult?.success === true;

  useEffect(() => {
    if (loginSucceeded) {
      router.push("/reseller/dashboard");
    }
  }, [loginSucceeded, router]);

  if (loginSucceeded) return null;

  if (publishResult?.success && publishResult.storefrontUrl) {
    return (
      <OnboardingSuccess
        storeName={draft.storeName.trim() || "Your storefront"}
        storefrontUrl={publishResult.storefrontUrl}
        onContinue={() => router.push("/reseller/storefront")}
      />
    );
  }

  const isLoginMode = step === "account" && draft.accountKind === "existing";
  const isLastStep = stepIndex === steps.length - 1;
  const stepCopy = STEP_COPY[step];

  const footer = (
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
      <Button
        variant="outline"
        onClick={back}
        disabled={stepIndex === 0 || isLoginMode}
        className="w-full sm:w-auto"
      >
        {COPY.back}
      </Button>
      {isLoginMode ? (
        <Button
          onClick={login}
          size="lg"
          loading={loggingIn}
          aria-busy={loggingIn}
          className="w-full sm:w-auto"
        >
          {COPY.logIn}
        </Button>
      ) : isLastStep ? (
        <Button
          onClick={submit}
          size="lg"
          loading={submitting}
          aria-busy={submitting}
          className="w-full sm:w-auto"
        >
          {COPY.launch}
        </Button>
      ) : (
        <Button onClick={next} size="lg" className="w-full sm:w-auto">
          {COPY.continue}
        </Button>
      )}
    </div>
  );

  return (
    <OnboardingShell
      stepTitle={stepCopy.title}
      stepSubtitle={stepCopy.subtitle}
      progress={
        <OnboardingProgress steps={steps} currentIndex={stepIndex} />
      }
      footer={footer}
    >
      {step === "account" ? (
        <StepAccount draft={draft} errors={errors} onChange={updateDraft} />
      ) : null}
      {step === "store" ? (
        <StepStore draft={draft} errors={errors} onChange={updateDraft} />
      ) : null}
      {step === "review" ? (
        <StepReview
          draft={draft}
          publishError={
            publishResult && !publishResult.success
              ? publishResult.errors.form ?? COPY.publishFailed
              : null
          }
        />
      ) : null}
    </OnboardingShell>
  );
}

export default function ResellerOnboardingPage() {
  return (
    <Suspense fallback={null}>
      <OnboardingPageInner />
    </Suspense>
  );
}