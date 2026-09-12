// components/admin/settings/tabs/platform-tabs.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Input } from "@/components/admin/ui/input";
import { SettingsField } from "@/components/admin/ui/settings-field";
import {
  ALL_SECTIONS,
  BACKUP_FREQUENCY_OPTIONS,
  DATE_FORMAT_OPTIONS,
  LANGUAGE_OPTIONS,
  SECTION_LABEL,
  TIME_FORMAT_OPTIONS,
  WEEKDAY_OPTIONS,
} from "@/lib/admin/settings/constant";
import { ALL_CHANNELS, CHANNEL_LABEL } from "@/lib/admin/notifications/constants";
import type {
  AtlasSection,
  DataComplianceSettings,
  GeneralSettings,
  LocalizationSettings,
  NotificationChannel,
} from "@/lib/admin/types/settings";

const selectClass =
  "h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100";

interface GeneralTabProps {
  value: GeneralSettings;
  onChange: (patch: Partial<GeneralSettings>) => void;
}

export function GeneralTab({ value, onChange }: GeneralTabProps) {
  const handleCommissionChange = (section: AtlasSection, rate: number) => {
    onChange({
      commissionPerSection: { ...value.commissionPerSection, [section]: rate },
    });
  };

  const handleChannelToggle = (channel: NotificationChannel) => {
    const next = value.lowBalanceAlertChannels.includes(channel)
      ? value.lowBalanceAlertChannels.filter((c) => c !== channel)
      : [...value.lowBalanceAlertChannels, channel];
    onChange({ lowBalanceAlertChannels: next });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Platform identity</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SettingsField label="Platform name" htmlFor="general-platform-name">
            <Input
              id="general-platform-name"
              value={value.platformName}
              onChange={(e) => onChange({ platformName: e.target.value })}
            />
          </SettingsField>
          <SettingsField label="Support email" htmlFor="general-support-email">
            <Input
              id="general-support-email"
              type="email"
              value={value.supportEmail}
              onChange={(e) => onChange({ supportEmail: e.target.value })}
            />
          </SettingsField>
          <SettingsField label="Support phone" htmlFor="general-support-phone">
            <Input
              id="general-support-phone"
              value={value.supportPhone}
              onChange={(e) => onChange({ supportPhone: e.target.value })}
            />
          </SettingsField>
          <SettingsField label="Currency" htmlFor="general-currency">
            <Input
              id="general-currency"
              value={value.currency}
              onChange={(e) => onChange({ currency: e.target.value })}
            />
          </SettingsField>
          <SettingsField
            label="Timezone"
            htmlFor="general-timezone"
            hint="All timestamps in the admin centre render in this zone. Ghana is Africa/Accra."
          >
            <Input
              id="general-timezone"
              value={value.timezone}
              onChange={(e) => onChange({ timezone: e.target.value })}
            />
          </SettingsField>
          <SettingsField
            label="Environment"
            htmlFor="general-environment"
            hint="Shown as a badge on the page header. Set by deploy, not editable here."
          >
            <Input
              id="general-environment"
              value={value.environment}
              readOnly
              className="bg-neutral-50 dark:bg-neutral-900"
            />
          </SettingsField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Commission rates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingsField
            label="Default rate (%)"
            htmlFor="general-default-commission"
            hint="Applied to new products without a section-specific override."
          >
            <Input
              id="general-default-commission"
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={value.defaultCommissionRate}
              onChange={(e) =>
                onChange({ defaultCommissionRate: Number(e.target.value) })
              }
            />
          </SettingsField>

          <div>
            <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
              Per-section overrides
            </p>
            <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
              Atlas sections track commission separately. Set a rate per
              section when it differs from the default.
            </p>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              {ALL_SECTIONS.map((section) => (
                <SettingsField
                  key={section}
                  label={SECTION_LABEL[section]}
                  htmlFor={`general-commission-${section}`}
                >
                  <div className="relative">
                    <Input
                      id={`general-commission-${section}`}
                      type="number"
                      min={0}
                      max={100}
                      step={0.1}
                      value={value.commissionPerSection[section]}
                      onChange={(e) =>
                        handleCommissionChange(section, Number(e.target.value))
                      }
                    />
                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-neutral-400">
                      %
                    </span>
                  </div>
                </SettingsField>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Limits &amp; alerts</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SettingsField
            label="Daily transaction limit"
            htmlFor="general-tx-limit"
            hint={`In ${value.currency}. Applies per user.`}
          >
            <Input
              id="general-tx-limit"
              type="number"
              min={0}
              value={value.transactionLimitPerDay}
              onChange={(e) =>
                onChange({ transactionLimitPerDay: Number(e.target.value) })
              }
            />
          </SettingsField>
          <SettingsField
            label="Max withdrawal limit"
            htmlFor="general-max-withdrawal"
            hint={`In ${value.currency}. Applies per user per day.`}
          >
            <Input
              id="general-max-withdrawal"
              type="number"
              min={0}
              value={value.maxWithdrawalLimit}
              onChange={(e) =>
                onChange({ maxWithdrawalLimit: Number(e.target.value) })
              }
            />
          </SettingsField>
          <SettingsField
            label="Low balance threshold"
            htmlFor="general-low-balance"
            hint={`In ${value.currency}. Fires an alert when the platform wallet falls below this amount.`}
          >
            <Input
              id="general-low-balance"
              type="number"
              min={0}
              value={value.lowBalanceThreshold}
              onChange={(e) =>
                onChange({ lowBalanceThreshold: Number(e.target.value) })
              }
            />
          </SettingsField>

          <div className="md:col-span-2">
            <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
              Low balance alert channels
            </p>
            <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
              Where the low-balance alert is delivered.
            </p>
            <div className="mt-2 flex flex-wrap gap-3">
              {ALL_CHANNELS.map((channel) => (
                <label
                  key={channel}
                  className="flex items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={value.lowBalanceAlertChannels.includes(channel)}
                    onChange={() => handleChannelToggle(channel)}
                    className="h-4 w-4"
                  />
                  {CHANNEL_LABEL[channel]}
                </label>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface LocalizationTabProps {
  value: LocalizationSettings;
  onChange: (patch: Partial<LocalizationSettings>) => void;
}

export function LocalizationTab({ value, onChange }: LocalizationTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Localization</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SettingsField
          label="Default language"
          htmlFor="loc-language"
          hint="Applies to new accounts. Users can override."
        >
          <select
            id="loc-language"
            className={selectClass}
            value={value.defaultLanguage}
            onChange={(e) => onChange({ defaultLanguage: e.target.value })}
          >
            {LANGUAGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </SettingsField>

        <SettingsField label="Date format" htmlFor="loc-date">
          <select
            id="loc-date"
            className={selectClass}
            value={value.dateFormat}
            onChange={(e) => onChange({ dateFormat: e.target.value })}
          >
            {DATE_FORMAT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </SettingsField>

        <SettingsField label="Time format" htmlFor="loc-time">
          <select
            id="loc-time"
            className={selectClass}
            value={value.timeFormat}
            onChange={(e) => onChange({ timeFormat: e.target.value })}
          >
            {TIME_FORMAT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </SettingsField>
      </CardContent>
    </Card>
  );
}

interface ComplianceTabProps {
  value: DataComplianceSettings;
  onChange: (patch: Partial<DataComplianceSettings>) => void;
}

export function ComplianceTab({ value, onChange }: ComplianceTabProps) {
  const schedule = value.backupSchedule;

  const patchSchedule = (patch: Partial<typeof schedule>) => {
    onChange({ backupSchedule: { ...schedule, ...patch } });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Data retention</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SettingsField
            label="Audit log retention (days)"
            htmlFor="compliance-retention"
            hint="Older audit entries are permanently deleted after this window."
          >
            <Input
              id="compliance-retention"
              type="number"
              min={30}
              max={3650}
              value={value.auditLogRetentionDays}
              onChange={(e) =>
                onChange({ auditLogRetentionDays: Number(e.target.value) })
              }
            />
          </SettingsField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Backup schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <SettingsField label="Frequency" htmlFor="compliance-backup-frequency">
              <select
                id="compliance-backup-frequency"
                className={selectClass}
                value={schedule.frequency}
                onChange={(e) =>
                  patchSchedule({
                    frequency: e.target
                      .value as typeof schedule.frequency,
                  })
                }
              >
                {BACKUP_FREQUENCY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </SettingsField>

            {schedule.frequency === "weekly" && (
              <SettingsField label="Day of week" htmlFor="compliance-backup-day">
                <select
                  id="compliance-backup-day"
                  className={selectClass}
                  value={schedule.dayOfWeek ?? 0}
                  onChange={(e) =>
                    patchSchedule({ dayOfWeek: Number(e.target.value) })
                  }
                >
                  {WEEKDAY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </SettingsField>
            )}

            <SettingsField label="Hour (UTC)" htmlFor="compliance-backup-hour">
              <select
                id="compliance-backup-hour"
                className={selectClass}
                value={schedule.hour}
                onChange={(e) => patchSchedule({ hour: Number(e.target.value) })}
              >
                {Array.from({ length: 24 }).map((_, h) => (
                  <option key={h} value={h}>
                    {String(h).padStart(2, "0")}
                  </option>
                ))}
              </select>
            </SettingsField>

            <SettingsField
              label="Minute"
              htmlFor="compliance-backup-minute"
            >
              <select
                id="compliance-backup-minute"
                className={selectClass}
                value={schedule.minute}
                onChange={(e) =>
                  patchSchedule({ minute: Number(e.target.value) })
                }
              >
                {[0, 15, 30, 45].map((m) => (
                  <option key={m} value={m}>
                    {String(m).padStart(2, "0")}
                  </option>
                ))}
              </select>
            </SettingsField>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User data controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="flex items-start gap-3 rounded-md border border-neutral-200 p-3 dark:border-neutral-700">
            <input
              type="checkbox"
              checked={value.dataExportEnabled}
              onChange={(e) =>
                onChange({ dataExportEnabled: e.target.checked })
              }
              className="mt-0.5 h-4 w-4"
            />
            <span>
              <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                Allow users to export their data
              </span>
              <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                Users can request a copy of their account data from their
                dashboard.
              </span>
            </span>
          </label>

          <label className="flex items-start gap-3 rounded-md border border-neutral-200 p-3 dark:border-neutral-700">
            <input
              type="checkbox"
              checked={value.dataDeleteEnabled}
              onChange={(e) =>
                onChange({ dataDeleteEnabled: e.target.checked })
              }
              className="mt-0.5 h-4 w-4"
            />
            <span>
              <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                Allow users to delete their account
              </span>
              <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                Deletes personal data. Transaction records are retained for
                audit and regulatory purposes.
              </span>
            </span>
          </label>
        </CardContent>
      </Card>
    </div>
  );
}