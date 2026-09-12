// components/admin/security/security-policy-summary.tsx
"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import type { SecurityPolicySummary as Policy } from "@/lib/admin/types/security";

interface SecurityPolicySummaryProps {
  policy: Policy;
}

export function SecurityPolicySummary({ policy }: SecurityPolicySummaryProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div>
          <CardTitle>Policy summary</CardTitle>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Read-only snapshot of the current security policy.
          </p>
        </div>
        <Link
          href="/admin/settings?tab=security"
          className="text-xs font-medium text-brand-700 hover:underline dark:text-brand-300"
        >
          Edit in Settings
        </Link>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs text-neutral-500 dark:text-neutral-400">
              Password minimum
            </dt>
            <dd className="mt-0.5 font-medium text-neutral-900 dark:text-neutral-100">
              {policy.passwordMinLength} characters
            </dd>
          </div>
          <div>
            <dt className="text-xs text-neutral-500 dark:text-neutral-400">
              Session timeout
            </dt>
            <dd className="mt-0.5 font-medium text-neutral-900 dark:text-neutral-100">
              {policy.sessionTimeoutMinutes} minutes
            </dd>
          </div>
          <div>
            <dt className="text-xs text-neutral-500 dark:text-neutral-400">
              Login attempts
            </dt>
            <dd className="mt-0.5 font-medium text-neutral-900 dark:text-neutral-100">
              {policy.maxLoginAttempts} before lockout
            </dd>
          </div>
          <div>
            <dt className="text-xs text-neutral-500 dark:text-neutral-400">
              Lockout duration
            </dt>
            <dd className="mt-0.5 font-medium text-neutral-900 dark:text-neutral-100">
              {policy.lockoutDurationMinutes} minutes
            </dd>
          </div>
          <div className="col-span-2">
            <dt className="text-xs text-neutral-500 dark:text-neutral-400">
              Two-factor authentication
            </dt>
            <dd className="mt-0.5">
              <Badge variant={policy.require2FA ? "success" : "warning"}>
                {policy.require2FA ? "Required for all admins" : "Not required"}
              </Badge>
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}