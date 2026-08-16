/**
 * Minimal classname merger.
 * Avoids dependency on clsx/tailwind-merge for foundation.
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}