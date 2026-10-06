/* eslint-disable react/no-unescaped-entities */
// components/admin/notifications/notification-preview.tsx
"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { AtlasIcon } from "@/components/atlas/icons";
import {
  CHANNEL_ICON,
  CHANNEL_LABEL,
} from "@/lib/admin/notifications/constants";
import {
  buildEmailPreview,
  buildInAppPreview,
  buildPushPreview,
  buildSmsPreview,
} from "@/lib/admin/notifications/preview";
import type { NotificationChannel } from "@/lib/admin/types/notification";

interface NotificationPreviewProps {
  title: string;
  message: string;
  channels: NotificationChannel[];
  className?: string;
}

export function NotificationPreview({
  title,
  message,
  channels,
  className,
}: NotificationPreviewProps) {
  const [activeChannel, setActiveChannel] = useState<NotificationChannel>(
    channels[0] ?? "in_app"
  );

  const effectiveChannel = channels.includes(activeChannel)
    ? activeChannel
    : channels[0] ?? "in_app";

  const preview = useMemo(() => {
    switch (effectiveChannel) {
      case "email":
        return { kind: "email" as const, data: buildEmailPreview({ title, message }) };
      case "sms":
        return { kind: "sms" as const, data: buildSmsPreview({ message }) };
      case "push":
        return { kind: "push" as const, data: buildPushPreview({ title, message }) };
      case "in_app":
      default:
        return { kind: "in_app" as const, data: buildInAppPreview({ title, message }) };
    }
  }, [effectiveChannel, title, message]);

  if (channels.length === 0) {
    return (
      <div className={cn("rounded-lg border border-dashed border-neutral-300 p-6 text-center dark:border-neutral-700", className)}>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Select at least one channel to see a preview.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap gap-1 rounded-md border border-neutral-200 bg-neutral-50 p-1 dark:border-neutral-800 dark:bg-neutral-900">
        {channels.map((channel) => {
          const isActive = channel === effectiveChannel;
          return (
            <button
              key={channel}
              type="button"
              onClick={() => setActiveChannel(channel)}
              aria-pressed={isActive}
              className={cn(
                "flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium transition-colors",
                isActive
                  ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-800 dark:text-neutral-100"
                  : "text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
              )}
            >
              <AtlasIcon
                name={CHANNEL_ICON[channel]}
                aria-hidden="true"
                className="h-3.5 w-3.5"
              />
              {CHANNEL_LABEL[channel]}
            </button>
          );
        })}
      </div>

      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900/60">
        {preview.kind === "email" && (
          <div className="rounded-md border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="border-b border-neutral-100 px-3 py-2 text-xs dark:border-neutral-800">
              <p className="font-medium text-neutral-800 dark:text-neutral-200">
                {preview.data.fromName} <span className="text-neutral-400">{"<"}{preview.data.fromAddress}{">"}</span>
              </p>
              <p className="text-neutral-500 dark:text-neutral-400">
                To: {preview.data.recipient}
              </p>
              <p className="mt-1 font-medium text-neutral-900 dark:text-neutral-100">
                {preview.data.subject || "(no subject)"}
              </p>
            </div>
            <div className="px-3 py-4 text-sm text-neutral-700 dark:text-neutral-300">
              <p className="whitespace-pre-wrap">{preview.data.body || "(empty message)"}</p>
            </div>
          </div>
        )}

        {preview.kind === "sms" && (
          <div className="mx-auto max-w-xs">
            <div className="rounded-2xl rounded-bl-sm bg-neutral-200 px-3 py-2 text-sm text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100">
              <p className="whitespace-pre-wrap">{preview.data.body || "(empty message)"}</p>
            </div>
            <p className="mt-1 text-[10px] text-neutral-500 dark:text-neutral-400">
              {preview.data.sender} \u00B7 {preview.data.charCount} characters \u00B7 {preview.data.segments} segment
              {preview.data.segments === 1 ? "" : "s"}
            </p>
            {preview.data.segments > 1 && (
              <p className="mt-0.5 text-[10px] text-warning-700 dark:text-warning-300">
                Sends as {preview.data.segments} SMS. Charges apply per segment.
              </p>
            )}
          </div>
        )}

        {preview.kind === "push" && (
          <div className="mx-auto max-w-xs rounded-xl bg-white p-3 shadow-sm dark:bg-neutral-800">
            <div className="flex items-start gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
                <AtlasIcon name="bell" aria-hidden="true" className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  {preview.data.appName} \u00B7 now
                </p>
                <p className="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  {preview.data.title || "(no title)"}
                </p>
                <p className="line-clamp-3 text-xs text-neutral-600 dark:text-neutral-400">
                  {preview.data.body || "(empty message)"}
                </p>
              </div>
            </div>
          </div>
        )}

        {preview.kind === "in_app" && (
          <div className="mx-auto max-w-xs rounded-lg border border-neutral-200 bg-white p-3 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
            <div className="flex items-start gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
                <AtlasIcon name="bell" aria-hidden="true" className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  {preview.data.title || "(no title)"}
                </p>
                <p className="mt-0.5 text-xs text-neutral-600 dark:text-neutral-400">
                  {preview.data.body || "(empty message)"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
        Sample data shown. {"{firstName}"} and {"{name}"} are replaced with the recipient's name at send time.
      </p>
    </div>
  );
}