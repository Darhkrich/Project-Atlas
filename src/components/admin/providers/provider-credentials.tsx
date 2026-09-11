"use client";

import { Provider } from "@/lib/admin/types/provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Button } from "@/components/admin/ui/button";
import { Badge } from "@/components/admin/ui/badge";

interface ProviderCredentialsProps {
  provider: Provider;
  onRotate?: () => void;
  onUpdate?: () => void;
}

export function ProviderCredentials({
  provider,
  onRotate,
  onUpdate,
}: ProviderCredentialsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Credentials</CardTitle>
        <Badge variant="warning">Sensitive</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2 rounded-md bg-neutral-50 p-3 dark:bg-neutral-900">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-500">API Key</span>
            <span className="font-mono text-xs">
              {provider.credentials.apiKey ? "••••••••••••••••••" : "Not set"}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-500">Secret</span>
            <span className="font-mono text-xs">
              {provider.credentials.secret ? "••••••••••••••••••" : "Not set"}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-500">Account ID</span>
            <span className="font-mono text-xs">
              {provider.credentials.accountId || "Not set"}
            </span>
          </div>
        </div>

        <p className="text-xs text-neutral-500">
          Credentials are stored securely and never displayed in plain text. Use
          rotate or update to change them.
        </p>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={onRotate}>
            Rotate Credentials
          </Button>
          <Button variant="outline" size="sm" onClick={onUpdate}>
            Update Credentials
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}