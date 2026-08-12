/**
 * Motion durations.
 */

export const motion = {
  instant: 75,
  fast: 150,
  normal: 250,
  slow: 400,
  slower: 700,
} as const;

export type Motion = typeof motion;