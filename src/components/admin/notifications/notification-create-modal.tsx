"use client";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useState, useEffect } from "react";
import {
  PlatformNotification,
  NotificationAudience,
  NotificationChannel,
  NotificationStatus,
  NotificationTemplate,
} from "@/lib/admin/types/notification";
import { mockNotificationTemplates } from "@/lib/admin/mock/notifications";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";

interface NotificationCreateModalProps {
  onClose: () => void;
  onSave: (notification: PlatformNotification) => void;
  initialNotification?: PlatformNotification | null; // if provided, edit mode
}

const audienceEstimatedCounts: Record<NotificationAudience, number> = {
  all_users: 25000,
  resellers: 342,
  customers: 12980,
  merchants: 156,
  specific_user: 1,
};

export function NotificationCreateModal({ onClose, onSave, initialNotification }: NotificationCreateModalProps) {
  const [title, setTitle] = useState(initialNotification?.title || "");
  const [message, setMessage] = useState(initialNotification?.message || "");
  const [audience, setAudience] = useState<NotificationAudience>(initialNotification?.audience || "all_users");
  const [specificUserIds, setSpecificUserIds] = useState(initialNotification?.specificUserIds?.join(", ") || "");
  const [channels, setChannels] = useState<NotificationChannel[]>(initialNotification?.channels || ["in_app"]);
  const [scheduledFor, setScheduledFor] = useState(initialNotification?.scheduledFor ? new Date(initialNotification.scheduledFor).toISOString().slice(0, 16) : "");
  const [status, setStatus] = useState<NotificationStatus>(initialNotification?.status || "draft");
  const [showTemplates, setShowTemplates] = useState(false);

  const isEdit = Boolean(initialNotification);

  const handleChannelToggle = (channel: NotificationChannel) => {
    setChannels(prev => prev.includes(channel) ? prev.filter(c => c !== channel) : [...prev, channel]);
  };

  const applyTemplate = (template: NotificationTemplate) => {
    setTitle(template.title);
    setMessage(template.message);
    setAudience(template.audience);
    setChannels(template.channels);
    setShowTemplates(false);
  };

  const handleSave = () => {
    const updatedNotification: PlatformNotification = {
      ...initialNotification,
      id: initialNotification?.id || `NTF-${Date.now()}`,
      title,
      message,
      audience,
      specificUserIds: audience === "specific_user" ? specificUserIds.split(",").map(s => s.trim()).filter(Boolean) : undefined,
      channels,
      scheduledFor: scheduledFor ? new Date(scheduledFor).toISOString() : undefined,
      status,
      createdBy: initialNotification?.createdBy || "admin@atlas.com",
      createdAt: initialNotification?.createdAt || new Date().toISOString(),
    };
    onSave(updatedNotification);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6 shadow-xl dark:bg-neutral-900">
        <h3 className="text-lg font-semibold">{isEdit ? "Edit Notification" : "Create Notification"}</h3>

        <div className="mt-4 space-y-4">
          {/* Template Library (only for create, not edit) */}
          {!isEdit && (
            <div>
              <Button variant="outline" size="sm" onClick={() => setShowTemplates(!showTemplates)}>
                Load Template
              </Button>
              {showTemplates && (
                <div className="mt-2 space-y-1">
                  {mockNotificationTemplates.map(tpl => (
                    <button
                      key={tpl.id}
                      className="block w-full text-left rounded bg-neutral-50 p-2 text-sm hover:bg-neutral-100 dark:bg-neutral-800"
                      onClick={() => applyTemplate(tpl)}
                    >
                      {tpl.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="text-sm">Title</label>
            <Input value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="text-sm">Message</label>
            <textarea
              className="mt-1 w-full rounded-md border border-neutral-300 p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
              rows={4}
              value={message}
              onChange={e => setMessage(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm">Audience</label>
            <select
              className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
              value={audience}
              onChange={e => setAudience(e.target.value as NotificationAudience)}
            >
              <option value="all_users">All Users</option>
              <option value="resellers">Resellers</option>
              <option value="customers">Customers</option>
              <option value="merchants">Merchants</option>
              <option value="specific_user">Specific Users</option>
            </select>
            <p className="mt-1 text-xs text-neutral-500">
              Estimated recipients: ~{audience === "specific_user" ? (specificUserIds ? specificUserIds.split(",").filter(Boolean).length : 0) : audienceEstimatedCounts[audience]}
            </p>
          </div>
          {audience === "specific_user" && (
            <div>
              <label className="text-sm">User IDs (comma separated)</label>
              <Input value={specificUserIds} onChange={e => setSpecificUserIds(e.target.value)} placeholder="CUST-001, RS-001" />
            </div>
          )}
          <div>
            <label className="text-sm">Channels</label>
            <div className="mt-2 flex flex-wrap gap-3">
              {(["in_app", "email", "sms", "push"] as NotificationChannel[]).map(channel => (
                <label key={channel} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={channels.includes(channel)}
                    onChange={() => handleChannelToggle(channel)}
                    className="h-4 w-4"
                  />
                  {channel}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm">Schedule For (optional)</label>
            <Input type="datetime-local" value={scheduledFor} onChange={e => setScheduledFor(e.target.value)} />
          </div>
          <div>
            <label className="text-sm">Status</label>
            <select
              className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
              value={status}
              onChange={e => setStatus(e.target.value as NotificationStatus)}
            >
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="sent">Send Now</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={handleSave}>{isEdit ? "Update" : "Save Notification"}</Button>
        </div>
      </div>
    </div>
  );
}