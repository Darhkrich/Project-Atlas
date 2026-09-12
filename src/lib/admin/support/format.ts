// lib/admin/support/format.ts

/**
 * Atlas admin time formatting.
 *
 * All absolute timestamps render in UTC. Rationale: Ghana is GMT+0 with
 * no DST, so UTC equals local time for our primary market — and a
 * distributed support team (Accra, London, remote) sees identical
 * numbers regardless of workstation timezone. This is deliberate; do
 * not "fix" it to local time.
 */

const PLACEHOLDER = "—";

export function formatAbsolute(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return PLACEHOLDER;

  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = d.getUTCFullYear();
  const hours = String(d.getUTCHours()).padStart(2, "0");
  const minutes = String(d.getUTCMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

export function formatRelative(iso: string, now: number | null): string {
  if (now === null) return formatAbsolute(iso);

  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return PLACEHOLDER;

  const diff = now - t;

  // Future or clock-skewed timestamps — fall back to absolute rather
  // than rendering "in -3m".
  if (diff < 0) return formatAbsolute(iso);

  const seconds = Math.floor(diff / 1000);
  if (seconds < 45) return "Just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;

  return formatAbsolute(iso);
}