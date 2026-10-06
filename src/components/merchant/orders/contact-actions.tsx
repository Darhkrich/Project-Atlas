"use client";

import { AtlasIcon } from "@/components/atlas/icons";

interface ContactActionsProps {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

function normalisePhoneForWhatsApp(raw: string): string | null {
  const digits = raw.replace(/\D+/g, "");
  if (digits.length === 0) return null;
  if (digits.startsWith("233")) return digits;
  if (digits.startsWith("0")) return "233" + digits.slice(1);
  return digits;
}

export function ContactActions({
  customerName,
  customerEmail,
  customerPhone,
}: ContactActionsProps) {
  const whatsappNumber = normalisePhoneForWhatsApp(customerPhone);
  const trimmedPhone = customerPhone.trim();
  const hasPhone = trimmedPhone.length > 0 && trimmedPhone !== "N/A";

  const baseClass =
    "inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800";

  return (
    <div className="flex flex-wrap gap-2">
      {customerEmail && (
        <a
          href={"mailto:" + customerEmail}
          className={baseClass}
          aria-label={"Email " + customerName}
        >
          <AtlasIcon name="send" className="h-4 w-4" aria-hidden="true" />
          Email
        </a>
      )}

      {hasPhone && (
        <a
          href={"tel:" + trimmedPhone}
          className={baseClass}
          aria-label={"Call " + customerName}
        >
          <AtlasIcon name="phone" className="h-4 w-4" aria-hidden="true" />
          Call
        </a>
      )}

      {whatsappNumber && (
        <a
          href={"https://wa.me/" + whatsappNumber}
          target="_blank"
          rel="noopener noreferrer"
          className={baseClass}
          aria-label={"Message " + customerName + " on WhatsApp"}
        >
          <AtlasIcon
            name="message-square"
            className="h-4 w-4"
            aria-hidden="true"
          />
          WhatsApp
        </a>
      )}
    </div>
  );
}