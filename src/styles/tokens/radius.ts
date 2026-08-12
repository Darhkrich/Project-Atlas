/**
 * Atlas border radius tokens.
 */

export const radius = {
  none: 0,

  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  "2xl": 24,
  full: 9999,
} as const;

export type Radius = typeof radius;