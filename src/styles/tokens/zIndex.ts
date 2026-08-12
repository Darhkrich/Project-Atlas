/**
 * Central z-index scale.
 */

export const zIndex = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  overlay: 500,
  modal: 1000,
  toast: 1200,
  tooltip: 1400,
} as const;

export type ZIndex = typeof zIndex;