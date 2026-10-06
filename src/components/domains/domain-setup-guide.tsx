"use client";

import { useState } from "react";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";

interface DomainSetupGuideProps {
  variant: "empty" | "pending";
}

const EMPTY_STEPS: { title: string; body: string }[] = [
  {
    title: "Buy a domain",
    body: "Purchase a domain from any registrar. Pick something that matches your store name.",
  },
  {
    title: "Come back here",
    body: "Enter the domain in the field above and connect it to your storefront.",
  },
  {
    title: "Add the DNS record",
    body: "We show you a CNAME or TXT record. Add it at your registrar's DNS settings.",
  },
  {
    title: "Verify",
    body: "Once DNS has propagated, click Verify. Your storefront switches to your domain.",
  },
];

const PENDING_STEPS: { title: string; body: string }[] = [
  {
    title: "Log into your registrar",
    body: "Open the dashboard where you bought the domain. Look for DNS or Nameservers.",
  },
  {
    title: "Find your DNS settings",
    body: "Locate the section called DNS records, DNS management, or Zone editor.",
  },
  {
    title: "Add the record",
    body: "Create a new record with the exact type, name, and value shown above. Copy carefully.",
  },
  {
    title: "Wait for propagation",
    body: "DNS changes usually take a few minutes. Some registrars take up to 30.",
  },
  {
    title: "Come back and verify",
    body: "Return to this page and click Verify now. If it fails, wait a moment and retry.",
  },
];

export function DomainSetupGuide({ variant }: DomainSetupGuideProps) {
  const [open, setOpen] = useState(variant === "pending");
  const steps = variant === "pending" ? PENDING_STEPS : EMPTY_STEPS;
  const title =
    variant === "pending"
      ? "How to add the DNS record"
      : "How custom domains work";

  return (
    <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/60"
      >
        <span className="flex items-center gap-2">
          <AtlasIcon
            name="help-circle"
            aria-hidden="true"
            className="h-4 w-4 text-neutral-400"
          />
          <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            {title}
          </span>
        </span>
        <AtlasIcon
          name={open ? "chevron-up" : "chevron-down"}
          aria-hidden="true"
          className="h-4 w-4 text-neutral-400"
        />
      </button>
      {open && (
        <ol className="space-y-3 border-t border-neutral-200 px-4 py-4 dark:border-neutral-800">
          {steps.map((step, index) => (
            <li key={step.title} className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                  "bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200"
                )}
              >
                {index + 1}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                  {step.title}
                </p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-neutral-500 dark:text-neutral-400">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}