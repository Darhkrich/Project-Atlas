"use client";

import Link from "next/link";
import { AtlasIcon } from "@/components/atlas/icons";
import { useAuth } from "@/contexts/auth-context";

export function RoleUpgradePrompt({
  requiredRole,
  message,
}: {
  requiredRole: "reseller" | "merchant";
  message: string;
}) {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-warning-100 text-warning-600">
        <AtlasIcon name="alert" className="h-8 w-8" />
      </div>
      <h1 className="mt-6 text-2xl font-bold text-neutral-950">Account upgrade needed</h1>
      <p className="mt-2 text-neutral-600">{message}</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href={requiredRole === "merchant" ? "/merchant/onboarding" : "/reseller/onboarding"}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Start {requiredRole} onboarding
          <AtlasIcon name="arrow-right" className="h-4 w-4" />
        </Link>
        <button
          onClick={logout}
          className="rounded-xl border border-neutral-300 bg-white px-6 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
        >
          Log out
        </button>
      </div>
    </div>
  );
}