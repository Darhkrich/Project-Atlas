/**
 * Atlas Design System
 * -----------------------------------------
 * Central color palette.
 *
 * Every UI component must consume colors
 * from this file instead of hardcoding
 * hexadecimal values.
 */

export const colors = {
  transparent: "transparent",
  white: "#FFFFFF",
  black: "#000000",

  slate: {
    50: "#F8FAFC",
    100: "#F1F5F9",
    200: "#E2E8F0",
    300: "#CBD5E1",
    400: "#94A3B8",
    500: "#64748B",
    600: "#475569",
    700: "#334155",
    800: "#1E293B",
    900: "#0F172A",
    950: "#020617",
  },

  primary: {
    50: "#EEF2FF",
    100: "#E0E7FF",
    200: "#C7D2FE",
    300: "#A5B4FC",
    400: "#818CF8",
    500: "#6366F1",
    600: "#4F46E5",
    700: "#4338CA",
    800: "#3730A3",
    900: "#312E81",
  },

  success: {
    500: "#22C55E",
    600: "#16A34A",
  },

  warning: {
    500: "#F59E0B",
    600: "#D97706",
  },

  danger: {
    500: "#EF4444",
    600: "#DC2626",
  },

  info: {
    500: "#0EA5E9",
    600: "#0284C7",
  },
} as const;

export type Colors = typeof colors;