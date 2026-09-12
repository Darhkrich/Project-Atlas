// components/admin/settings/tabs/communication-tabs.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Badge } from "@/components/admin/ui/badge";
import { SettingsField } from "@/components/admin/ui/settings-field";
import { NotificationPreview } from "@/components/admin/notifications/notification-preview";
import {
  AUTO_ASSIGN_RULE_OPTIONS,
} from "@/lib/admin/settings/constant";
import type {
  NotificationChannel,
  NotificationSettings,
  SupportSettings,
} from "@/lib/admin/types/settings";

const selectClass =
  "h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100";

interface NotificationsTabProps {
  value: NotificationSettings;
  onChange: (patch: Partial<NotificationSettings>) => void;
  onSendTest: (channel: NotificationChannel, content: string) => void;
}

export function NotificationsTab({
  value,
  onChange,
  onSendTest,
}: NotificationsTabProps) {
  const [testFeedback, setTestFeedback] = useState<string | null>(null);

  const triggerTest = (channel: NotificationChannel, content: string) => {
    onSendTest(channel, content);
    setTestFeedback(`Test ${channel} sent to your admin address.`);
    window.setTimeout(() => setTestFeedback(null), 3000);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Notification channels</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="flex items-start gap-3 rounded-md border border-neutral-200 p-3 dark:border-neutral-700">
            <input
              type="checkbox"
              checked={value.emailEnabled}
              onChange={(e) => onChange({ emailEnabled: e.target.checked })}
              className="mt-0.5 h-4 w-4"
            />
            <span>
              <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                Email notifications
              </span>
              <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                Transactional emails through the Atlas mailer.
              </span>
            </span>
          </label>

          <label className="flex items-start gap-3 rounded-md border border-neutral-200 p-3 dark:border-neutral-700">
            <input
              type="checkbox"
              checked={value.smsEnabled}
              onChange={(e) => onChange({ smsEnabled: e.target.checked })}
              className="mt-0.5 h-4 w-4"
            />
            <span>
              <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                SMS notifications
              </span>
              <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                Delivered through the SMS provider configured under Payment
                gateway.
              </span>
            </span>
          </label>

          <label className="flex items-start gap-3 rounded-md border border-neutral-200 p-3 dark:border-neutral-700">
            <input
              type="checkbox"
              checked={value.pushEnabled}
              onChange={(e) => onChange({ pushEnabled: e.target.checked })}
              className="mt-0.5 h-4 w-4"
            />
            <span>
              <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                Push notifications
              </span>
              <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                Delivered to the Atlas mobile app.
              </span>
            </span>
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order placed email</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_20rem]">
          <SettingsField
            label="Template"
            htmlFor="notif-email-order-placed"
            hint="Use {{orderId}}, {{customerName}}, {{amount}}, {{currency}} placeholders."
          >
            <textarea
              id="notif-email-order-placed"
              className="w-full rounded-md border border-neutral-300 p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              rows={4}
              value={value.emailTemplateOrderPlaced}
              onChange={(e) =>
                onChange({ emailTemplateOrderPlaced: e.target.value })
              }
            />
          </SettingsField>
          <aside>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Preview
            </p>
            <NotificationPreview
              title="Order confirmation"
              message={value.emailTemplateOrderPlaced
                .replace(/\{\{orderId\}\}/g, "ATX-928391")
                .replace(/\{\{customerName\}\}/g, "Ama")
                .replace(/\{\{amount\}\}/g, "20")
                .replace(/\{\{currency\}\}/g, "GHS")}
              channels={["email"]}
            />
          </aside>
        </CardContent>
        <CardContent className="pt-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              triggerTest("email", value.emailTemplateOrderPlaced)
            }
          >
            Send test email
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment failed email</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_20rem]">
          <SettingsField
            label="Template"
            htmlFor="notif-email-payment-failed"
            hint="Use {{orderId}}, {{customerName}}, {{amount}}, {{reason}} placeholders."
          >
            <textarea
              id="notif-email-payment-failed"
              className="w-full rounded-md border border-neutral-300 p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              rows={4}
              value={value.emailTemplatePaymentFailed}
              onChange={(e) =>
                onChange({ emailTemplatePaymentFailed: e.target.value })
              }
            />
          </SettingsField>
          <aside>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Preview
            </p>
            <NotificationPreview
              title="Payment failed"
              message={value.emailTemplatePaymentFailed
                .replace(/\{\{orderId\}\}/g, "ATX-928391")
                .replace(/\{\{customerName\}\}/g, "Ama")
                .replace(/\{\{amount\}\}/g, "20")
                .replace(/\{\{reason\}\}/g, "Insufficient funds")}
              channels={["email"]}
            />
          </aside>
        </CardContent>
        <CardContent className="pt-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              triggerTest("email", value.emailTemplatePaymentFailed)
            }
          >
            Send test email
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order placed SMS</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_20rem]">
          <SettingsField
            label="Template"
            htmlFor="notif-sms-order-placed"
            hint="Keep under 160 characters to avoid multi-segment charges."
          >
            <Input
              id="notif-sms-order-placed"
              value={value.smsTemplateOrderPlaced}
              onChange={(e) =>
                onChange({ smsTemplateOrderPlaced: e.target.value })
              }
            />
          </SettingsField>
          <aside>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Preview
            </p>
            <NotificationPreview
              title=""
              message={value.smsTemplateOrderPlaced.replace(
                /\{\{orderId\}\}/g,
                "ATX-928391"
              )}
              channels={["sms"]}
            />
          </aside>
        </CardContent>
        <CardContent className="pt-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              triggerTest("sms", value.smsTemplateOrderPlaced)
            }
          >
            Send test SMS
          </Button>
        </CardContent>
      </Card>

      {testFeedback && (
        <p
          role="status"
          aria-live="polite"
          className="text-xs text-success-700 dark:text-success-300"
        >
          {testFeedback}
        </p>
      )}
    </div>
  );
}

interface SupportTabProps {
  value: SupportSettings;
  onChange: (patch: Partial<SupportSettings>) => void;
}

export function SupportTab({ value, onChange }: SupportTabProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Service level targets</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SettingsField
            label="Warning threshold (hours)"
            htmlFor="support-sla-warning"
            hint="Tickets approaching this age are flagged amber in the Support inbox."
          >
            <Input
              id="support-sla-warning"
              type="number"
              min={1}
              value={value.slaWarningHours}
              onChange={(e) =>
                onChange({ slaWarningHours: Number(e.target.value) })
              }
            />
          </SettingsField>
          <SettingsField
            label="Critical threshold (hours)"
            htmlFor="support-sla-critical"
            hint="Tickets past this age are flagged red. Must be higher than the warning threshold."
          >
            <Input
              id="support-sla-critical"
              type="number"
              min={value.slaWarningHours + 1}
              value={value.slaCriticalHours}
              onChange={(e) =>
                onChange({ slaCriticalHours: Number(e.target.value) })
              }
            />
          </SettingsField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assignment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-start gap-3 rounded-md border border-neutral-200 p-3 dark:border-neutral-700">
            <input
              type="checkbox"
              checked={value.autoAssign}
              onChange={(e) => onChange({ autoAssign: e.target.checked })}
              className="mt-0.5 h-4 w-4"
            />
            <span>
              <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                Auto-assign new tickets
              </span>
              <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                New conversations are routed to an admin in the matching
                queue when this is on.
              </span>
            </span>
          </label>

          <SettingsField
            label="Assignment rule"
            htmlFor="support-auto-assign-rule"
            hint={
              value.autoAssign
                ? "Round-robin distributes evenly. By user type routes to a specialist queue."
                : "Enable auto-assign to activate this rule."
            }
          >
            <select
              id="support-auto-assign-rule"
              className={selectClass}
              value={value.autoAssignRule}
              onChange={(e) =>
                onChange({
                  autoAssignRule: e.target.value as SupportSettings["autoAssignRule"],
                })
              }
              disabled={!value.autoAssign}
            >
              {AUTO_ASSIGN_RULE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </SettingsField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Live chat</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-start gap-3 rounded-md border border-neutral-200 p-3 dark:border-neutral-700">
            <input
              type="checkbox"
              checked={value.liveChatEnabled}
              onChange={(e) =>
                onChange({ liveChatEnabled: e.target.checked })
              }
              className="mt-0.5 h-4 w-4"
            />
            <span>
              <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                Enable live chat
              </span>
              <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                Show the live chat widget on customer-facing pages.
              </span>
            </span>
          </label>

          <SettingsField
            label="Operating hours"
            htmlFor="support-live-chat-hours"
            hint="Free text. Times are Ghana time. The widget shows as offline outside these hours."
          >
            <Input
              id="support-live-chat-hours"
              value={value.liveChatHours}
              onChange={(e) => onChange({ liveChatHours: e.target.value })}
              disabled={!value.liveChatEnabled}
            />
          </SettingsField>

          {value.slaCriticalHours <= value.slaWarningHours && (
            <p
              role="alert"
              className="rounded-md border border-danger-200 bg-danger-50 p-2 text-xs text-danger-800 dark:border-danger-800/60 dark:bg-danger-900/25 dark:text-danger-200"
            >
              Critical threshold must be higher than the warning threshold.
            </p>
          )}

          <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-400">
            <p className="font-medium text-neutral-800 dark:text-neutral-200">
              Current targets
            </p>
            <p className="mt-1 flex flex-wrap items-center gap-2">
              <Badge variant="warning" size="sm">
                Warning at {value.slaWarningHours}h
              </Badge>
              <Badge variant="danger" size="sm">
                Breach at {value.slaCriticalHours}h
              </Badge>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}