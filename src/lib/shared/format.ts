const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function formatCurrency(value: number): string {
  if (!Number.isFinite(value)) return "GH\u20B5 0.00";
  return (
    "GH\u20B5 " +
    value.toLocaleString("en-GH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

export function formatCurrencyCompact(value: number): string {
  if (!Number.isFinite(value)) return "GH\u20B5 0";
  const abs = Math.abs(value);
  if (abs >= 1_000_000) {
    return "GH\u20B5 " + (value / 1_000_000).toFixed(1) + "M";
  }
  if (abs >= 1_000) {
    return "GH\u20B5 " + (value / 1_000).toFixed(1) + "K";
  }
  return "GH\u20B5 " + value.toLocaleString("en-GH");
}

export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return "0";
  return value.toLocaleString("en-GH");
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return (
    MONTHS_SHORT[d.getUTCMonth()] +
    " " +
    d.getUTCDate() +
    ", " +
    d.getUTCFullYear()
  );
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const hours = d.getUTCHours();
  const minutes = d.getUTCMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const h12 = hours % 12 === 0 ? 12 : hours % 12;
  return (
    MONTHS_SHORT[d.getUTCMonth()] +
    " " +
    d.getUTCDate() +
    ", " +
    d.getUTCFullYear() +
    ", " +
    h12 +
    ":" +
    minutes +
    " " +
    ampm
  );
}

export function formatAbsolute(iso: string): string {
  return formatDateTime(iso);
}

export function formatRelative(iso: string, nowMs: number): string {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return "unknown";
  const diff = nowMs - then;
  const seconds = Math.floor(diff / 1000);

  if (seconds < 45) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return minutes + (minutes === 1 ? " minute ago" : " minutes ago");
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return hours + (hours === 1 ? " hour ago" : " hours ago");
  }
  const days = Math.floor(hours / 24);
  if (days < 30) {
    return days + (days === 1 ? " day ago" : " days ago");
  }
  const months = Math.floor(days / 30);
  if (months < 12) {
    return months + (months === 1 ? " month ago" : " months ago");
  }
  const years = Math.floor(months / 12);
  return years + (years === 1 ? " year ago" : " years ago");
}

export function timeAgo(iso: string): string {
  return formatRelative(iso, Date.now());
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}