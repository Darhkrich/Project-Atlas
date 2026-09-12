/* eslint-disable react/no-unescaped-entities */
// components/admin/notifications/notification-create-modal.tsx
"use client";

import { useId, useMemo, useState } from "react";
import {
  PlatformNotification,
  NotificationAudience,
  NotificationChannel,
  NotificationSection,
  NotificationStatus,
} from "@/lib/admin/types/notification";
import { mockNotificationTemplates } from "@/lib/admin/mock/notifications";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Badge } from "@/components/admin/ui/badge";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { useFocusTrap } from "@/lib/admin/hooks/use-focus-trap";
import { NotificationPreview } from "./notification-preview";
import {
  ALL_AUDIENCES,
  ALL_CHANNELS,
  ALL_SECTIONS,
  AUDIENCE_DESCRIPTION,
  AUDIENCE_LABEL,
  CHANNEL_DESCRIPTION,
  CHANNEL_ICON,
  CHANNEL_LABEL,
  SECTION_LABEL,
  estimateRecipients,
  formatRecipientEstimate,
} from "@/lib/admin/notifications/constants";

interface CurrentAdmin {
  id: string;
  name: string;
  email: string;
}

interface NotificationCreateModalProps {
  onClose: () => void;
  onSave: (notification: PlatformNotification) => void;
  onSendTest?: (notification: PlatformNotification) => void;
  initialNotification?: PlatformNotification | null;
  currentAdmin: CurrentAdmin;
}

type Step = "compose" | "review";

const selectClass =
  "h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100";

export function NotificationCreateModal({
  onClose,
  onSave,
  onSendTest,
  initialNotification,
  currentAdmin,
}: NotificationCreateModalProps) {
  const isEdit = Boolean(initialNotification);

  const [step, setStep] = useState<Step>("compose");
  const [title, setTitle] = useState(initialNotification?.title ?? "");
  const [message, setMessage] = useState(initialNotification?.message ?? "");
  const [audience, setAudience] = useState<NotificationAudience>(
    initialNotification?.audience ?? "all_users"
  );
  const [section, setSection] = useState<NotificationSection>(
    initialNotification?.targetSection ?? "all"
  );
  const [specificUserIds, setSpecificUserIds] = useState(
    initialNotification?.specificUserIds?.join(", ") ?? ""
  );
  const [channels, setChannels] = useState<NotificationChannel[]>(
    initialNotification?.channels ?? ["in_app"]
  );
  const [scheduledFor, setScheduledFor] = useState(
    initialNotification?.scheduledFor
      ? new Date(initialNotification.scheduledFor).toISOString().slice(0, 16)
      : ""
  );
  const [status, setStatus] = useState<NotificationStatus>(
    initialNotification?.status ?? "draft"
  );
  const [showTemplates, setShowTemplates] = useState(false);
  const [templateSearch, setTemplateSearch] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const [trapEnabled, setTrapEnabled] = useState(true);
  const trapRef = useFocusTrap<HTMLDivElement>(trapEnabled, onClose);
  const titleId = useId();

  const parsedUserIds = useMemo(
    () =>
      specificUserIds
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    [specificUserIds]
  );

  const estimated = useMemo(
    () =>
      estimateRecipients(
        audience,
        section,
        audience === "specific_user" ? parsedUserIds : undefined
      ),
    [audience, section, parsedUserIds]
  );

  const filteredTemplates = useMemo(() => {
    const q = templateSearch.trim().toLowerCase();
    if (!q) return mockNotificationTemplates;
    return mockNotificationTemplates.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.message.toLowerCase().includes(q)
    );
  }, [templateSearch]);

  const handleChannelToggle = (channel: NotificationChannel) => {
    setChannels((prev) =>
      prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel]
    );
  };

  const applyTemplate = (templateId: string) => {
    const template = mockNotificationTemplates.find((t) => t.id === templateId);
    if (!template) return;
    setTitle(template.title);
    setMessage(template.message);
    setAudience(template.audience);
    setSection(template.targetSection ?? "all");
    setChannels(template.channels);
    setShowTemplates(false);
    setTemplateSearch("");
  };

  const validate = (): string | null => {
    if (!title.trim()) return "Add a title before continuing.";
    if (!message.trim()) return "Add a message before continuing.";
    if (channels.length === 0) return "Select at least one channel.";
    if (audience === "specific_user" && parsedUserIds.length === 0) {
      return "Add at least one user ID for a specific-user notification.";
    }
    if (status === "scheduled" && !scheduledFor) {
      return "Set a schedule time or switch status to Draft.";
    }
    return null;
  };

  const buildNotification = (): PlatformNotification => {
    const nowIso = new Date().toISOString();
    const isSendNow = status === "sent";
    const isSchedule = status === "scheduled";

    return {
      id: initialNotification?.id ?? crypto.randomUUID(),
      title: title.trim(),
      message: message.trim(),
      audience,
      targetSection: section,
      specificUserIds:
        audience === "specific_user" ? parsedUserIds : undefined,
      channels,
      sentChannels: isSendNow ? channels : initialNotification?.sentChannels,
      scheduledFor:
        isSchedule && scheduledFor
          ? new Date(scheduledFor).toISOString()
          : initialNotification?.scheduledFor,
      sentAt: isSendNow ? nowIso : initialNotification?.sentAt,
      status,
      createdBy: initialNotification?.createdBy ?? currentAdmin.email,
      createdById: initialNotification?.createdById ?? currentAdmin.id,
      createdByName: initialNotification?.createdByName ?? currentAdmin.name,
      createdAt: initialNotification?.createdAt ?? nowIso,
      updatedAt: isEdit ? nowIso : undefined,
      estimatedRecipients: estimated,
    };
  };

  const handleSubmit = () => {
    const error = validate();
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError(null);

    if (status === "draft") {
      onSave(buildNotification());
      onClose();
      return;
    }

    setTrapEnabled(false);
    setStep("review");
  };

  const handleConfirmSend = () => {
    onSave(buildNotification());
    onClose();
  };

  const handleBack = () => {
    setStep("compose");
    setTrapEnabled(true);
  };

  const handleSendTest = () => {
    const error = validate();
    if (error) {
      setValidationError(error);
      return;
    }
    if (!onSendTest) return;
    const nowIso = new Date().toISOString();
    onSendTest({
      id: crypto.randomUUID(),
      title: title.trim(),
      message: message.trim(),
      audience: "specific_user",
      specificUserIds: [currentAdmin.id],
      channels: ["in_app"],
      sentChannels: ["in_app"],
      sentAt: nowIso,
      status: "sent",
      createdBy: currentAdmin.email,
      createdById: currentAdmin.id,
      createdByName: currentAdmin.name,
      createdAt: nowIso,
      estimatedRecipients: 1,
    });
  };

  const primaryLabel = !isEdit
    ? status === "draft"
      ? "Save draft"
      : "Review"
    : status === "draft"
    ? "Save draft"
    : "Review";

  return (
    <div
      ref={trapRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg bg-white shadow-xl dark:bg-neutral-900">
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800">
          <div>
            <h3 id={titleId} className="text-lg font-semibold">
              {step === "review"
                ? "Review before sending"
                : isEdit
                ? "Edit notification"
                : "Create notification"}
            </h3>
            {step === "review" && (
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                Confirm the details below. This action cannot be undone.
              </p>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>

        {step === "compose" ? (
          <div className="grid flex-1 grid-cols-1 gap-6 overflow-y-auto p-6 lg:grid-cols-[1fr_20rem]">
            <div className="space-y-4">
              {!isEdit && (
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    aria-expanded={showTemplates}
                    onClick={() => setShowTemplates((v) => !v)}
                  >
                    Load template
                  </Button>
                  {showTemplates && (
                    <div className="mt-2 rounded-md border border-neutral-200 dark:border-neutral-800">
                      <div className="border-b border-neutral-200 p-2 dark:border-neutral-800">
                        <Input
                          aria-label="Search templates"
                          placeholder="Search templates…"
                          className="h-8 text-xs"
                          value={templateSearch}
                          onChange={(e) => setTemplateSearch(e.target.value)}
                        />
                      </div>
                      <ul className="max-h-48 overflow-y-auto p-1">
                        {filteredTemplates.length === 0 ? (
                          <li className="px-3 py-3 text-xs text-neutral-500 dark:text-neutral-400">
                            No templates match.
                          </li>
                        ) : (
                          filteredTemplates.map((tpl) => (
                            <li key={tpl.id}>
                              <button
                                type="button"
                                onClick={() => applyTemplate(tpl.id)}
                                className="block w-full rounded p-2 text-left text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800"
                              >
                                <span className="block font-medium text-neutral-900 dark:text-neutral-100">
                                  {tpl.name}
                                </span>
                                <span className="mt-0.5 block truncate text-neutral-500 dark:text-neutral-400">
                                  {tpl.title}
                                </span>
                              </button>
                            </li>
                          ))
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <label className="block">
                <span className="text-sm font-medium">Title</span>
                <Input
                  className="mt-1"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. New MTN data bundles"
                  aria-invalid={validationError?.includes("title") ? true : undefined}
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium">Message</span>
                <textarea
                  className="mt-1 w-full rounded-md border border-neutral-300 p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Use {firstName} to personalize."
                  aria-invalid={validationError?.includes("message") ? true : undefined}
                />
                <span className="mt-1 block text-xs text-neutral-500 dark:text-neutral-400">
                  {"{firstName}"} or {"{name]"} is replaced with the recipient's name at send time.
                </span>
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium">Section</span>
                  <select
                    className={cn(selectClass, "mt-1")}
                    value={section}
                    onChange={(e) =>
                      setSection(e.target.value as NotificationSection)
                    }
                  >
                    {ALL_SECTIONS.map((s) => (
                      <option key={s} value={s}>
                        {SECTION_LABEL[s]}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-medium">Audience</span>
                  <select
                    className={cn(selectClass, "mt-1")}
                    value={audience}
                    onChange={(e) =>
                      setAudience(e.target.value as NotificationAudience)
                    }
                  >
                    {ALL_AUDIENCES.map((a) => (
                      <option key={a} value={a}>
                        {AUDIENCE_LABEL[a]}
                      </option>
                    ))}
                  </select>
                  <span className="mt-1 block text-xs text-neutral-500 dark:text-neutral-400">
                    {AUDIENCE_DESCRIPTION[audience]}
                  </span>
                </label>
              </div>

              {audience === "specific_user" && (
                <label className="block">
                  <span className="text-sm font-medium">
                    User IDs (comma-separated)
                  </span>
                  <Input
                    className="mt-1"
                    value={specificUserIds}
                    onChange={(e) => setSpecificUserIds(e.target.value)}
                    placeholder="CUST-001, RS-001"
                  />
                </label>
              )}

              <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-900/60">
                <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  Estimated recipients
                </p>
                <p className="mt-1 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  {formatRecipientEstimate(estimated)}
                </p>
                {section !== "all" && audience === "all_users" && (
                  <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                    Scoped to {SECTION_LABEL[section]}.
                  </p>
                )}
              </div>

              <fieldset>
                <legend className="text-sm font-medium">Channels</legend>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {ALL_CHANNELS.map((channel) => {
                    const isChecked = channels.includes(channel);
                    return (
                      <label
                        key={channel}
                        className={cn(
                          "flex cursor-pointer items-start gap-2 rounded-md border p-3 transition-colors",
                          isChecked
                            ? "border-brand-500 bg-brand-50 dark:border-brand-500 dark:bg-brand-900/30"
                            : "border-neutral-200 bg-white hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800"
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleChannelToggle(channel)}
                          className="mt-0.5 h-4 w-4"
                        />
                        <span className="flex-1">
                          <span className="flex items-center gap-1.5 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                            <AtlasIcon
                              name={CHANNEL_ICON[channel]}
                              className="h-4 w-4"
                            />
                            {CHANNEL_LABEL[channel]}
                          </span>
                          <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                            {CHANNEL_DESCRIPTION[channel]}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
                {validationError?.includes("channel") && (
                  <p className="mt-1 text-xs text-danger-600 dark:text-danger-400">
                    {validationError}
                  </p>
                )}
              </fieldset>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium">
                    Schedule for (optional)
                  </span>
                  <Input
                    className="mt-1"
                    type="datetime-local"
                    value={scheduledFor}
                    onChange={(e) => setScheduledFor(e.target.value)}
                  />
                  <span className="mt-1 block text-xs text-neutral-500 dark:text-neutral-400">
                    Ghana time (GMT+0)
                  </span>
                </label>

                <label className="block">
                  <span className="text-sm font-medium">Status</span>
                  <select
                    className={cn(selectClass, "mt-1")}
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as NotificationStatus)
                    }
                  >
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="sent">Send now</option>
                  </select>
                </label>
              </div>

              {validationError && !validationError.includes("channel") && (
                <p
                  role="alert"
                  className="rounded-md border border-danger-200 bg-danger-50 p-2 text-xs text-danger-800 dark:border-danger-800/60 dark:bg-danger-900/30 dark:text-danger-200"
                >
                  {validationError}
                </p>
              )}
            </div>

            <aside className="lg:sticky lg:top-0 lg:self-start">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                Preview
              </p>
              <NotificationPreview
                title={title}
                message={message}
                channels={channels}
              />
            </aside>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6">
            <dl className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  Title
                </dt>
                <dd className="mt-1 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {title}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  Message
                </dt>
                <dd className="mt-1 whitespace-pre-wrap text-sm text-neutral-700 dark:text-neutral-300">
                  {message}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  Audience
                </dt>
                <dd className="mt-1 text-sm text-neutral-900 dark:text-neutral-100">
                  {AUDIENCE_LABEL[audience]}
                </dd>
                {section !== "all" && (
                  <dd className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                    Scoped to {SECTION_LABEL[section]}
                  </dd>
                )}
              </div>

              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  Recipients
                </dt>
                <dd className="mt-1 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {formatRecipientEstimate(estimated)}
                </dd>
              </div>

              <div className="sm:col-span-2">
                <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  Channels
                </dt>
                <dd className="mt-1 flex flex-wrap gap-2">
                  {channels.map((c) => (
                    <Badge key={c} variant="brand" size="sm">
                      <AtlasIcon
                        name={CHANNEL_ICON[c]}
                        className="mr-1 h-3 w-3"
                      />
                      {CHANNEL_LABEL[c]}
                    </Badge>
                  ))}
                </dd>
              </div>

              {status === "scheduled" && scheduledFor && (
                <div className="sm:col-span-2">
                  <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                    Scheduled
                  </dt>
                  <dd className="mt-1 text-sm text-neutral-900 dark:text-neutral-100">
                    {new Date(scheduledFor).toLocaleString("en-GH", {
                      timeZone: "UTC",
                    })}{" "}
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      (Ghana time)
                    </span>
                  </dd>
                </div>
              )}
            </dl>

            <div className="mt-6 rounded-md border border-warning-200 bg-warning-50/70 p-3 text-xs text-warning-800 dark:border-warning-800/60 dark:bg-warning-900/20 dark:text-warning-200">
              {status === "sent"
                ? `This will immediately send to ${formatRecipientEstimate(estimated)} across ${channels.length} channel${channels.length === 1 ? "" : "s"}. This cannot be undone.`
                : `This will schedule the notification for the time shown above. You can cancel it before it sends.`}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 border-t border-neutral-200 px-6 py-4 dark:border-neutral-800">
          <div>
            {step === "compose" && onSendTest && (
              <Button variant="ghost" size="sm" onClick={handleSendTest}>
                Send test to myself
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {step === "review" ? (
              <>
                <Button variant="outline" size="sm" onClick={handleBack}>
                  Back
                </Button>
                <Button size="sm" onClick={handleConfirmSend}>
                  {status === "sent" ? "Send now" : "Schedule"}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={onClose}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSubmit}>
                  {primaryLabel}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}