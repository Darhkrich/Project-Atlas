import Link from "next/link";
import { routes } from "@/lib/admin/routes";

export function RevenueNoteStrip() {
  return (
    <div
      role="note"
      className="rounded-md border border-info-200 bg-info-50 p-3 text-xs text-info-900 dark:border-info-800/60 dark:bg-info-900/20 dark:text-info-200"
    >
      <span className="font-medium">Platform flows.</span>{" "}
      Numbers on this page are gross platform volume across all streams,
      not Atlas net income. Atlas net income comes from withdrawal fees
      only.{" "}
      <Link
        href={routes.treasury ?? "/admin/treasury"}
        className="font-medium underline"
      >
        View Treasury
      </Link>
      .
    </div>
  );
}