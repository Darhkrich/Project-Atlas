"use client";

import type { Provider } from "@/lib/admin/types/provider";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { AtlasIcon } from "@/components/atlas/icons";
import { Can, PERMISSIONS } from "@/lib/admin/rbac";
import { formatRelative } from "@/lib/admin/support/format";
import { formatDate } from "@/lib/admin/formatters";
import { useNow } from "@/lib/admin/hooks/use-now";
import {
  ENVIRONMENT_LABEL,
  ENVIRONMENT_VARIANT,
  PROVIDER_THRESHOLDS,
} from "@/lib/admin/providers/constants";
import { credentialRotationDue } from "@/lib/admin/providers/state";

interface ProviderCredentialsProps {
  provider: Provider;
  onRotate: () => void;
  onUpdate: () => void;
}

export function ProviderCredentials({
  provider,
  onRotate,
  onUpdate,
}: ProviderCredentialsProps) {
  const now = useNow();
  const { hasApiKey, hasSecret, accountId, lastRotatedAt } = provider.credentials;
  const rotationDue = credentialRotationDue(provider);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CardTitle>Credentials</CardTitle>
          <Badge variant={ENVIRONMENT_VARIANT[provider.environment]} size="sm">
            {ENVIRONMENT_LABEL[provider.environment]}
          </Badge>
        </div>
        <Can permission={PERMISSIONS.PROVIDERS_MANAGE}>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onUpdate}>
              <AtlasIcon
                name="lock"
                aria-hidden="true"
                className="mr-1 h-3.5 w-3.5"
              />
              Update
            </Button>
            <Button variant="outline" size="sm" onClick={onRotate}>
              <AtlasIcon
                name="shield"
                aria-hidden="true"
                className="mr-1 h-3.5 w-3.5"
              />
              Rotate
            </Button>
          </div>
        </Can>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2 rounded-md bg-neutral-50 p-3 dark:bg-neutral-900">
          <Row
            label="API key"
            value={hasApiKey ? "Stored" : "Not set"}
            good={hasApiKey}
          />
          <Row
            label="Secret"
            value={hasSecret ? "Stored" : "Not set"}
            good={hasSecret}
          />
          <Row
            label="Account ID"
            value={accountId || "Not set"}
            good={Boolean(accountId)}
            mono
          />
        </div>

        <div className="space-y-1 text-xs text-neutral-500 dark:text-neutral-400">
          <p>
            {lastRotatedAt
              ? `Last rotated ${formatRelative(lastRotatedAt, now)} (${formatDate(
                  lastRotatedAt
                )})`
              : "Never rotated"}
          </p>
          {rotationDue && (
            <p className="font-medium text-warning-600 dark:text-warning-400">
              Rotation overdue. Target cycle is{" "}
              {PROVIDER_THRESHOLDS.credentialRotationDueDays} days.
            </p>
          )}
        </div>

        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          API key and secret are write-only. Atlas stores presence, not values.
          Rotate to issue new keys or update to replace existing ones.
        </p>
      </CardContent>
    </Card>
  );
}

function Row({
  label,
  value,
  good,
  mono,
}: {
  label: string;
  value: string;
  good: boolean;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-neutral-500 dark:text-neutral-400">{label}</span>
      <span
        className={`flex items-center gap-1 ${
          mono ? "font-mono text-xs" : ""
        } ${good ? "text-neutral-900 dark:text-neutral-100" : "text-warning-600 dark:text-warning-400"}`}
      >
        {!good && (
          <AtlasIcon
            name="alert"
            aria-hidden="true"
            className="h-3.5 w-3.5"
          />
        )}
        {value}
      </span>
    </div>
  );
}