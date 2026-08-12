/**
 * Shadow presets.
 */

export const shadows = {
  none: "none",

  sm: "0 1px 2px rgba(0,0,0,.05)",

  md: "0 4px 12px rgba(0,0,0,.08)",

  lg: "0 12px 32px rgba(0,0,0,.12)",

  xl: "0 24px 48px rgba(0,0,0,.18)",
} as const;

export type Shadows = typeof shadows;